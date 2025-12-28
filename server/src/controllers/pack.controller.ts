import { Request, Response } from 'express';
import { PrismaClient, SetType, Language } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/packs
 * Get all packs (public)
 */
export const getAllPacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { language, set_type, search, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    
    if (language) {
      where.language = language as Language;
    }
    if (set_type) {
      where.set_type = set_type as SetType;
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { set_code: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [packs, total] = await Promise.all([
      prisma.pack.findMany({
        where,
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
        orderBy: { release_date: 'desc' },
        include: {
          _count: { select: { cards: true } },
        },
      }),
      prisma.pack.count({ where }),
    ]);

    res.json({ packs, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error) {
    console.error('Get packs error:', error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
};

/**
 * GET /api/packs/:id
 * Get a single pack by ID (public)
 */
export const getPackById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const pack = await prisma.pack.findUnique({
      where: { id },
      include: {
        _count: { select: { cards: true } },
      },
    });

    if (!pack) {
      res.status(404).json({ error: 'Pack not found' });
      return;
    }

    res.json({ pack });
  } catch (error) {
    console.error('Get pack error:', error);
    res.status(500).json({ error: 'Failed to fetch pack' });
  }
};

/**
 * POST /api/admin/packs
 * Create a new pack (admin only)
 */
export const createPack = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      set_code,
      title,
      title_jp,
      title_cn,
      title_kor,
      language,
      release_date,
      set_type,
      total_cards,
      cover_image,
      cover_image_small,
      cover_blurhash,
    } = req.body;

    // Validate required fields
    if (!set_code || !title) {
      res.status(400).json({ error: 'set_code and title are required' });
      return;
    }

    // Check if set_code already exists
    const existingPack = await prisma.pack.findUnique({ where: { set_code } });
    if (existingPack) {
      res.status(409).json({ error: 'Pack with this set_code already exists' });
      return;
    }

    const pack = await prisma.pack.create({
      data: {
        set_code,
        title,
        title_jp,
        title_cn,
        title_kor,
        language: language || 'EN',
        release_date: release_date ? new Date(release_date) : null,
        set_type: set_type || 'BOOSTER',
        total_cards: total_cards || 0,
        cover_image,
        cover_image_small,
        cover_blurhash,
      },
    });

    res.status(201).json({ message: 'Pack created', pack });
  } catch (error) {
    console.error('Create pack error:', error);
    res.status(500).json({ error: 'Failed to create pack' });
  }
};

/**
 * PUT /api/admin/packs/:id
 * Update a pack (admin only)
 */
export const updatePack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      set_code,
      title,
      title_jp,
      title_cn,
      title_kor,
      language,
      release_date,
      set_type,
      total_cards,
      cover_image,
      cover_image_small,
      cover_blurhash,
    } = req.body;

    // Check if pack exists
    const existingPack = await prisma.pack.findUnique({ where: { id } });
    if (!existingPack) {
      res.status(404).json({ error: 'Pack not found' });
      return;
    }

    // If changing set_code, check for conflicts
    if (set_code && set_code !== existingPack.set_code) {
      const conflictPack = await prisma.pack.findUnique({ where: { set_code } });
      if (conflictPack) {
        res.status(409).json({ error: 'Pack with this set_code already exists' });
        return;
      }
    }

    const pack = await prisma.pack.update({
      where: { id },
      data: {
        set_code,
        title,
        title_jp,
        title_cn,
        title_kor,
        language,
        release_date: release_date ? new Date(release_date) : undefined,
        set_type,
        total_cards,
        cover_image,
        cover_image_small,
        cover_blurhash,
      },
    });

    res.json({ message: 'Pack updated', pack });
  } catch (error) {
    console.error('Update pack error:', error);
    res.status(500).json({ error: 'Failed to update pack' });
  }
};

/**
 * DELETE /api/admin/packs/:id
 * Delete a pack (admin only)
 */
export const deletePack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if pack exists
    const existingPack = await prisma.pack.findUnique({
      where: { id },
      include: { _count: { select: { cards: true } } },
    });

    if (!existingPack) {
      res.status(404).json({ error: 'Pack not found' });
      return;
    }

    // Prevent deletion if pack has cards
    if (existingPack._count.cards > 0) {
      res.status(400).json({ 
        error: `Cannot delete pack with ${existingPack._count.cards} cards. Delete cards first.` 
      });
      return;
    }

    await prisma.pack.delete({ where: { id } });

    res.json({ message: 'Pack deleted' });
  } catch (error) {
    console.error('Delete pack error:', error);
    res.status(500).json({ error: 'Failed to delete pack' });
  }
};

