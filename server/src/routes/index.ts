import { Router } from 'express';

import authRoutes from './auth.routes';
import packRoutes from './pack.routes';
import cardRoutes from './card.routes';
import collectionRoutes from './collection.routes';
import deckRoutes from './deck.routes';
import wishlistRoutes from './wishlist.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/packs', packRoutes);
router.use('/cards', cardRoutes);
router.use('/collections', collectionRoutes);
router.use('/decks', deckRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);

// Also mount /me from auth routes at root level
import { getMe, updateMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);

export default router;

