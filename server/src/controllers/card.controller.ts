import { Request, Response } from 'express';
import { PrismaClient, CardType, FrameColor, Attribute, Rarity, BanStatus, Language } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/cards
 * Get all cards with filters (public)
 */
export const getAllCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      card_type,
      frame_color,
      attribute,
      rarity,
      ban_status,
      pack_id,
      set_code,
      language,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { card_number: { contains: search as string, mode: 'insensitive' } },
        { card_text: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (card_type) where.card_type = card_type as CardType;
    if (frame_color) where.frame_color = frame_color as FrameColor;
    if (attribute) where.attribute = attribute as Attribute;
    if (rarity) where.rarity = rarity as Rarity;
    if (ban_status) where.ban_status = ban_status as BanStatus;
    if (pack_id) where.pack_id = pack_id as string;
    if (set_code) where.set_code = set_code as string;
    if (language) where.language = language as Language;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
        orderBy: [{ set_code: 'asc' }, { set_position: 'asc' }],
        include: {
          pack: { select: { id: true, title: true, set_code: true } },
        },
      }),
      prisma.card.count({ where }),
    ]);

    res.json({ cards, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

/**
 * GET /api/cards/search
 * Quick search cards by name (public)
 */
export const searchCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, limit = '20' } = req.query;

    if (!q || (q as string).length < 2) {
      res.status(400).json({ error: 'Search query must be at least 2 characters' });
      return;
    }

    const cards = await prisma.card.findMany({
      where: {
        OR: [
          { name: { contains: q as string, mode: 'insensitive' } },
          { card_number: { contains: q as string, mode: 'insensitive' } },
        ],
      },
      take: Math.min(parseInt(limit as string), 50),
      select: {
        id: true,
        card_number: true,
        name: true,
        card_type: true,
        frame_color: true,
        rarity: true,
        image_url_small: true,
        pack: { select: { title: true, set_code: true } },
      },
    });

    res.json({ cards });
  } catch (error) {
    console.error('Search cards error:', error);
    res.status(500).json({ error: 'Failed to search cards' });
  }
};

/**
 * GET /api/cards/:id
 * Get a single card by ID (public)
 */
export const getCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const card = await prisma.card.findUnique({
      where: { id },
      include: {
        pack: { select: { id: true, title: true, set_code: true, release_date: true } },
      },
    });

    if (!card) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    res.json({ card });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
};

/**
 * POST /api/admin/cards
 * Create a new card (admin only)
 */
export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      card_number,
      set_code,
      set_position,
      konami_id,
      name,
      name_jp,
      name_cn,
      name_kor,
      language,
      card_type,
      frame_color,
      attribute,
      monster_type,
      monster_abilities,
      level,
      rank,
      link_rating,
      link_arrows,
      pendulum_scale,
      atk,
      def,
      spell_type,
      trap_type,
      card_text,
      pendulum_effect,
      rarity,
      image_url,
      image_url_small,
      image_url_high,
      image_blurhash,
      tcg_legal,
      ocg_legal,
      ban_status,
      prices,
      pack_id,
    } = req.body;

    // Validate required fields
    if (!card_number || !name || !card_type || !frame_color || !pack_id) {
      res.status(400).json({ 
        error: 'card_number, name, card_type, frame_color, and pack_id are required' 
      });
      return;
    }

    // Check if card_number already exists
    const existingCard = await prisma.card.findUnique({ where: { card_number } });
    if (existingCard) {
      res.status(409).json({ error: 'Card with this card_number already exists' });
      return;
    }

    // Check if pack exists
    const pack = await prisma.pack.findUnique({ where: { id: pack_id } });
    if (!pack) {
      res.status(400).json({ error: 'Pack not found' });
      return;
    }

    const card = await prisma.card.create({
      data: {
        card_number,
        set_code: set_code || pack.set_code,
        set_position: set_position || card_number.split('-').pop() || '001',
        konami_id,
        name,
        name_jp,
        name_cn,
        name_kor,
        language: language || 'EN',
        card_type,
        frame_color,
        attribute,
        monster_type,
        monster_abilities: monster_abilities || [],
        level,
        rank,
        link_rating,
        link_arrows: link_arrows || [],
        pendulum_scale,
        atk,
        def,
        spell_type,
        trap_type,
        card_text,
        pendulum_effect,
        rarity: rarity || 'COMMON',
        image_url,
        image_url_small,
        image_url_high,
        image_blurhash,
        tcg_legal: tcg_legal ?? true,
        ocg_legal: ocg_legal ?? true,
        ban_status: ban_status || 'UNLIMITED',
        prices,
        pack_id,
      },
      include: {
        pack: { select: { id: true, title: true, set_code: true } },
      },
    });

    // Update pack card count
    await prisma.pack.update({
      where: { id: pack_id },
      data: { total_cards: { increment: 1 } },
    });

    res.status(201).json({ message: 'Card created', card });
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

/**
 * PUT /api/admin/cards/:id
 * Update a card (admin only)
 */
export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if card exists
    const existingCard = await prisma.card.findUnique({ where: { id } });
    if (!existingCard) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    // If changing card_number, check for conflicts
    if (updateData.card_number && updateData.card_number !== existingCard.card_number) {
      const conflictCard = await prisma.card.findUnique({ 
        where: { card_number: updateData.card_number } 
      });
      if (conflictCard) {
        res.status(409).json({ error: 'Card with this card_number already exists' });
        return;
      }
    }

    // If changing pack_id, verify pack exists
    if (updateData.pack_id && updateData.pack_id !== existingCard.pack_id) {
      const pack = await prisma.pack.findUnique({ where: { id: updateData.pack_id } });
      if (!pack) {
        res.status(400).json({ error: 'Pack not found' });
        return;
      }
    }

    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: {
        pack: { select: { id: true, title: true, set_code: true } },
      },
    });

    res.json({ message: 'Card updated', card });
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Failed to update card' });
  }
};

/**
 * DELETE /api/admin/cards/:id
 * Delete a card (admin only)
 */
export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if card exists
    const existingCard = await prisma.card.findUnique({ where: { id } });
    if (!existingCard) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    await prisma.card.delete({ where: { id } });

    // Decrement pack card count
    await prisma.pack.update({
      where: { id: existingCard.pack_id },
      data: { total_cards: { decrement: 1 } },
    });

    res.json({ message: 'Card deleted' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

/**
 * POST /api/admin/cards/bulk-import
 * Bulk import cards (admin only)
 */
export const bulkImportCards = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cards, pack_id } = req.body;

    if (!Array.isArray(cards) || cards.length === 0) {
      res.status(400).json({ error: 'cards array is required' });
      return;
    }

    if (!pack_id) {
      res.status(400).json({ error: 'pack_id is required' });
      return;
    }

    // Verify pack exists
    const pack = await prisma.pack.findUnique({ where: { id: pack_id } });
    if (!pack) {
      res.status(400).json({ error: 'Pack not found' });
      return;
    }

    // Process cards
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    for (const cardData of cards) {
      try {
        // Check if card already exists
        const existing = await prisma.card.findUnique({ 
          where: { card_number: cardData.card_number } 
        });
        
        if (existing) {
          results.skipped++;
          continue;
        }

        await prisma.card.create({
          data: {
            ...cardData,
            set_code: cardData.set_code || pack.set_code,
            pack_id,
          },
        });
        results.created++;
      } catch (err: any) {
        results.errors.push(`${cardData.card_number}: ${err.message}`);
      }
    }

    // Update pack card count
    await prisma.pack.update({
      where: { id: pack_id },
      data: { total_cards: { increment: results.created } },
    });

    res.json({ 
      message: 'Bulk import completed', 
      results,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import cards' });
  }
};

