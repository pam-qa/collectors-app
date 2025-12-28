import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/wishlist
 * Get current user's wishlist
 */
export const getMyWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { user_id: req.user.id },
      orderBy: { added_at: 'desc' },
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
            prices_updated: true,
            pack: { select: { title: true, set_code: true } },
          },
        },
      },
    });

    res.json({ wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

/**
 * POST /api/wishlist
 * Add a card to wishlist
 */
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { 
      card_id, 
      price_alert_enabled = false, 
      price_alert_threshold, 
      price_alert_source 
    } = req.body;

    if (!card_id) {
      res.status(400).json({ error: 'card_id is required' });
      return;
    }

    // Check if card exists
    const card = await prisma.card.findUnique({ where: { id: card_id } });
    if (!card) {
      res.status(400).json({ error: 'Card not found' });
      return;
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: { user_id: req.user.id, card_id },
    });

    if (existing) {
      res.status(409).json({ error: 'Card already in wishlist' });
      return;
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        user_id: req.user.id,
        card_id,
        price_alert_enabled,
        price_alert_threshold,
        price_alert_source,
      },
      include: {
        card: {
          select: {
            id: true,
            card_number: true,
            name: true,
            rarity: true,
            image_url_small: true,
          },
        },
      },
    });

    res.status(201).json({ message: 'Card added to wishlist', wishlistItem });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

/**
 * PUT /api/wishlist/:cardId
 * Update wishlist item (price alerts)
 */
export const updateWishlistItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { cardId } = req.params;
    const { price_alert_enabled, price_alert_threshold, price_alert_source } = req.body;

    const existing = await prisma.wishlist.findFirst({
      where: { user_id: req.user.id, card_id: cardId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Card not in wishlist' });
      return;
    }

    const updated = await prisma.wishlist.update({
      where: { id: existing.id },
      data: {
        price_alert_enabled,
        price_alert_threshold,
        price_alert_source,
      },
      include: { card: true },
    });

    res.json({ message: 'Wishlist item updated', wishlistItem: updated });
  } catch (error) {
    console.error('Update wishlist error:', error);
    res.status(500).json({ error: 'Failed to update wishlist item' });
  }
};

/**
 * DELETE /api/wishlist/:cardId
 * Remove a card from wishlist
 */
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { cardId } = req.params;

    const existing = await prisma.wishlist.findFirst({
      where: { user_id: req.user.id, card_id: cardId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Card not in wishlist' });
      return;
    }

    await prisma.wishlist.delete({ where: { id: existing.id } });

    res.json({ message: 'Card removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

