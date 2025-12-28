import { Request, Response } from 'express';
import { PrismaClient, Condition, Language } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/collections
 * Get all collections for the current user
 */
export const getMyCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const collections = await prisma.collection.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: 'desc' },
      include: {
        _count: { select: { cards: true } },
      },
    });

    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

/**
 * GET /api/collections/:id
 * Get a single collection with cards
 */
export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const collection = await prisma.collection.findFirst({
      where: {
        id,
        OR: [
          { user_id: req.user.id },
          { is_public: true },
        ],
      },
      include: {
        cards: {
          include: {
            card: {
              select: {
                id: true,
                card_number: true,
                name: true,
                card_type: true,
                frame_color: true,
                rarity: true,
                image_url_small: true,
                prices: true,
                pack: { select: { title: true, set_code: true } },
              },
            },
          },
          orderBy: { added_at: 'desc' },
        },
        _count: { select: { cards: true } },
      },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    res.json({ collection });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};

/**
 * POST /api/collections
 * Create a new collection
 */
export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, description, is_public } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    // Check for duplicate name
    const existing = await prisma.collection.findFirst({
      where: { user_id: req.user.id, name },
    });

    if (existing) {
      res.status(409).json({ error: 'Collection with this name already exists' });
      return;
    }

    const collection = await prisma.collection.create({
      data: {
        user_id: req.user.id,
        name,
        description,
        is_public: is_public || false,
      },
    });

    res.status(201).json({ message: 'Collection created', collection });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

/**
 * PUT /api/collections/:id
 * Update a collection
 */
export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { name, description, is_public } = req.body;

    // Check if collection exists and belongs to user
    const existing = await prisma.collection.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Check for duplicate name if changing
    if (name && name !== existing.name) {
      const duplicate = await prisma.collection.findFirst({
        where: { user_id: req.user.id, name, NOT: { id } },
      });
      if (duplicate) {
        res.status(409).json({ error: 'Collection with this name already exists' });
        return;
      }
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: { name, description, is_public },
    });

    res.json({ message: 'Collection updated', collection });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'Failed to update collection' });
  }
};

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Check if collection exists and belongs to user
    const existing = await prisma.collection.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    await prisma.collection.delete({ where: { id } });

    res.json({ message: 'Collection deleted' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'Failed to delete collection' });
  }
};

/**
 * POST /api/collections/:id/cards
 * Add a card to a collection
 */
export const addCardToCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { 
      card_id, 
      quantity = 1, 
      condition = 'NEAR_MINT', 
      language = 'EN',
      is_first_edition = false,
      purchase_price,
      purchase_currency,
      notes,
    } = req.body;

    if (!card_id) {
      res.status(400).json({ error: 'card_id is required' });
      return;
    }

    // Check if collection exists and belongs to user
    const collection = await prisma.collection.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Check if card exists
    const card = await prisma.card.findUnique({ where: { id: card_id } });
    if (!card) {
      res.status(400).json({ error: 'Card not found' });
      return;
    }

    // Try to find existing entry with same condition/language/edition
    const existingEntry = await prisma.collectionCard.findFirst({
      where: {
        collection_id: id,
        card_id,
        condition: condition as Condition,
        language: language as Language,
        is_first_edition,
      },
    });

    if (existingEntry) {
      // Update quantity
      const updated = await prisma.collectionCard.update({
        where: { id: existingEntry.id },
        data: { quantity: existingEntry.quantity + quantity },
        include: { card: true },
      });
      res.json({ message: 'Card quantity updated', collectionCard: updated });
    } else {
      // Create new entry
      const collectionCard = await prisma.collectionCard.create({
        data: {
          collection_id: id,
          card_id,
          quantity,
          condition: condition as Condition,
          language: language as Language,
          is_first_edition,
          purchase_price,
          purchase_currency,
          notes,
        },
        include: { card: true },
      });
      res.status(201).json({ message: 'Card added to collection', collectionCard });
    }
  } catch (error) {
    console.error('Add card to collection error:', error);
    res.status(500).json({ error: 'Failed to add card to collection' });
  }
};

/**
 * DELETE /api/collections/:id/cards/:cardId
 * Remove a card from a collection
 */
export const removeCardFromCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id, cardId } = req.params;
    const { quantity } = req.query;

    // Check if collection exists and belongs to user
    const collection = await prisma.collection.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!collection) {
      res.status(404).json({ error: 'Collection not found' });
      return;
    }

    // Find collection card entry
    const collectionCard = await prisma.collectionCard.findFirst({
      where: { collection_id: id, card_id: cardId },
    });

    if (!collectionCard) {
      res.status(404).json({ error: 'Card not in collection' });
      return;
    }

    const removeQty = quantity ? parseInt(quantity as string) : collectionCard.quantity;

    if (removeQty >= collectionCard.quantity) {
      // Remove entirely
      await prisma.collectionCard.delete({ where: { id: collectionCard.id } });
      res.json({ message: 'Card removed from collection' });
    } else {
      // Reduce quantity
      const updated = await prisma.collectionCard.update({
        where: { id: collectionCard.id },
        data: { quantity: collectionCard.quantity - removeQty },
      });
      res.json({ message: 'Card quantity updated', collectionCard: updated });
    }
  } catch (error) {
    console.error('Remove card from collection error:', error);
    res.status(500).json({ error: 'Failed to remove card from collection' });
  }
};

