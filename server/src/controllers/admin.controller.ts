import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/admin/dashboard
 * Get admin dashboard stats
 */
export const getDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      userCount,
      packCount,
      cardCount,
      collectionCount,
      deckCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pack.count(),
      prisma.card.count(),
      prisma.collection.count(),
      prisma.deck.count(),
    ]);

    // Recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, username: true, email: true, role: true, created_at: true },
    });

    const recentPacks = await prisma.pack.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: { id: true, set_code: true, title: true, created_at: true },
    });

    res.json({
      stats: {
        users: userCount,
        packs: packCount,
        cards: cardCount,
        collections: collectionCount,
        decks: deckCount,
      },
      recent: {
        users: recentUsers,
        packs: recentPacks,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * GET /api/admin/users
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, limit = '50', offset = '0' } = req.query;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role as Role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              collections: true,
              decks: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Update a user's role
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      res.status(400).json({ error: 'Valid role is required (ADMIN or USER)' });
      return;
    }

    // Prevent changing own role
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, email: true, role: true },
    });

    res.json({ message: 'User role updated', user: updated });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate/deactivate a user
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ error: 'is_active must be a boolean' });
      return;
    }

    // Prevent deactivating self
    if (req.user?.id === id && !is_active) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { is_active },
      select: { id: true, username: true, email: true, is_active: true },
    });

    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}`, user: updated });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user?.id === id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

