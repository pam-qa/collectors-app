import { Router } from 'express';
import { 
  getMyCollections, 
  getCollectionById, 
  createCollection, 
  updateCollection, 
  deleteCollection,
  addCardToCollection,
  removeCardFromCollection,
} from '../controllers/collection.controller';
import { authenticate, requireUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, requireUser);

router.get('/', getMyCollections);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/cards', addCardToCollection);
router.delete('/:id/cards/:cardId', removeCardFromCollection);

export default router;

