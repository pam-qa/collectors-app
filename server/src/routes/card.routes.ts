import { Router } from 'express';
import { getAllCards, getCardById, searchCards } from '../controllers/card.controller';

const router = Router();

// Public routes
router.get('/', getAllCards);
router.get('/search', searchCards);
router.get('/:id', getCardById);

export default router;

