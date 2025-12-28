import { Router } from 'express';
import { 
  getMyWishlist, 
  addToWishlist, 
  updateWishlistItem,
  removeFromWishlist,
} from '../controllers/wishlist.controller';
import { authenticate, requireUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, requireUser);

router.get('/', getMyWishlist);
router.post('/', addToWishlist);
router.put('/:cardId', updateWishlistItem);
router.delete('/:cardId', removeFromWishlist);

export default router;

