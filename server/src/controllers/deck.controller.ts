import { Request, Response } from 'express';
import { PrismaClient, DeckZone } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/decks
 * Get all decks for the current user
 */
export const getMyDecks = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const decks = await prisma.deck.findMany({
      where: { user_id: req.user.id },
      orderBy: { updated_at: 'desc' },
      include: {
        _count: { select: { cards: true } },
      },
    });

    res.json({ decks });
  } catch (error) {
    console.error('Get decks error:', error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
};

/**
 * GET /api/decks/:id
 * Get a single deck with cards
 */
export const getDeckById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const deck = await prisma.deck.findFirst({
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
                attribute: true,
                level: true,
                rank: true,
                link_rating: true,
                atk: true,
                def: true,
                rarity: true,
                image_url_small: true,
                pack: { select: { title: true, set_code: true } },
              },
            },
          },
        },
        _count: { select: { cards: true } },
      },
    });

    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    // Organize cards by zone
    const organizedDeck = {
      ...deck,
      main: deck.cards.filter(c => c.zone === 'MAIN'),
      extra: deck.cards.filter(c => c.zone === 'EXTRA'),
      side: deck.cards.filter(c => c.zone === 'SIDE'),
    };

    res.json({ deck: organizedDeck });
  } catch (error) {
    console.error('Get deck error:', error);
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
};

/**
 * POST /api/decks
 * Create a new deck
 */
export const createDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { name, description, format, is_public } = req.body;

    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    // Check for duplicate name
    const existing = await prisma.deck.findFirst({
      where: { user_id: req.user.id, name },
    });

    if (existing) {
      res.status(409).json({ error: 'Deck with this name already exists' });
      return;
    }

    const deck = await prisma.deck.create({
      data: {
        user_id: req.user.id,
        name,
        description,
        format,
        is_public: is_public || false,
      },
    });

    res.status(201).json({ message: 'Deck created', deck });
  } catch (error) {
    console.error('Create deck error:', error);
    res.status(500).json({ error: 'Failed to create deck' });
  }
};

/**
 * PUT /api/decks/:id
 * Update a deck
 */
export const updateDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { name, description, format, is_public } = req.body;

    // Check if deck exists and belongs to user
    const existing = await prisma.deck.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    // Check for duplicate name if changing
    if (name && name !== existing.name) {
      const duplicate = await prisma.deck.findFirst({
        where: { user_id: req.user.id, name, NOT: { id } },
      });
      if (duplicate) {
        res.status(409).json({ error: 'Deck with this name already exists' });
        return;
      }
    }

    const deck = await prisma.deck.update({
      where: { id },
      data: { name, description, format, is_public },
    });

    res.json({ message: 'Deck updated', deck });
  } catch (error) {
    console.error('Update deck error:', error);
    res.status(500).json({ error: 'Failed to update deck' });
  }
};

/**
 * DELETE /api/decks/:id
 * Delete a deck
 */
export const deleteDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    // Check if deck exists and belongs to user
    const existing = await prisma.deck.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    await prisma.deck.delete({ where: { id } });

    res.json({ message: 'Deck deleted' });
  } catch (error) {
    console.error('Delete deck error:', error);
    res.status(500).json({ error: 'Failed to delete deck' });
  }
};

/**
 * POST /api/decks/:id/cards
 * Add a card to a deck
 */
export const addCardToDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { card_id, quantity = 1, zone = 'MAIN' } = req.body;

    if (!card_id) {
      res.status(400).json({ error: 'card_id is required' });
      return;
    }

    // Validate zone
    if (!['MAIN', 'EXTRA', 'SIDE'].includes(zone)) {
      res.status(400).json({ error: 'zone must be MAIN, EXTRA, or SIDE' });
      return;
    }

    // Check if deck exists and belongs to user
    const deck = await prisma.deck.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    // Check if card exists
    const card = await prisma.card.findUnique({ where: { id: card_id } });
    if (!card) {
      res.status(400).json({ error: 'Card not found' });
      return;
    }

    // Check card limits (max 3 copies per card in entire deck)
    const existingCards = await prisma.deckCard.findMany({
      where: { deck_id: id, card_id },
    });
    const totalQuantity = existingCards.reduce((sum, c) => sum + c.quantity, 0);
    
    if (totalQuantity + quantity > 3) {
      res.status(400).json({ error: 'Cannot have more than 3 copies of a card in a deck' });
      return;
    }

    // Find existing entry in same zone
    const existingEntry = await prisma.deckCard.findFirst({
      where: { deck_id: id, card_id, zone: zone as DeckZone },
    });

    if (existingEntry) {
      // Update quantity
      const updated = await prisma.deckCard.update({
        where: { id: existingEntry.id },
        data: { quantity: existingEntry.quantity + quantity },
        include: { card: true },
      });
      res.json({ message: 'Card quantity updated', deckCard: updated });
    } else {
      // Create new entry
      const deckCard = await prisma.deckCard.create({
        data: {
          deck_id: id,
          card_id,
          quantity,
          zone: zone as DeckZone,
        },
        include: { card: true },
      });
      res.status(201).json({ message: 'Card added to deck', deckCard });
    }
  } catch (error) {
    console.error('Add card to deck error:', error);
    res.status(500).json({ error: 'Failed to add card to deck' });
  }
};

/**
 * DELETE /api/decks/:id/cards/:cardId
 * Remove a card from a deck
 */
export const removeCardFromDeck = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id, cardId } = req.params;
    const { zone, quantity } = req.query;

    // Check if deck exists and belongs to user
    const deck = await prisma.deck.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }

    // Find deck card entry
    const where: any = { deck_id: id, card_id: cardId };
    if (zone) where.zone = zone as DeckZone;

    const deckCard = await prisma.deckCard.findFirst({ where });

    if (!deckCard) {
      res.status(404).json({ error: 'Card not in deck' });
      return;
    }

    const removeQty = quantity ? parseInt(quantity as string) : deckCard.quantity;

    if (removeQty >= deckCard.quantity) {
      // Remove entirely
      await prisma.deckCard.delete({ where: { id: deckCard.id } });
      res.json({ message: 'Card removed from deck' });
    } else {
      // Reduce quantity
      const updated = await prisma.deckCard.update({
        where: { id: deckCard.id },
        data: { quantity: deckCard.quantity - removeQty },
      });
      res.json({ message: 'Card quantity updated', deckCard: updated });
    }
  } catch (error) {
    console.error('Remove card from deck error:', error);
    res.status(500).json({ error: 'Failed to remove card from deck' });
  }
};

