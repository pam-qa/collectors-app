import { Router } from 'express';
import { getAllPacks, getPackById } from '../controllers/pack.controller';

const router = Router();

// Public routes
router.get('/', getAllPacks);
router.get('/:id', getPackById);

export default router;

