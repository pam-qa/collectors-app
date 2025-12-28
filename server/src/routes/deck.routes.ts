import { Router } from 'express';
import { 
  getMyDecks, 
  getDeckById, 
  createDeck, 
  updateDeck, 
  deleteDeck,
  addCardToDeck,
  removeCardFromDeck,
} from '../controllers/deck.controller';
import { authenticate, requireUser } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, requireUser);

router.get('/', getMyDecks);
router.get('/:id', getDeckById);
router.post('/', createDeck);
router.put('/:id', updateDeck);
router.delete('/:id', deleteDeck);
router.post('/:id/cards', addCardToDeck);
router.delete('/:id/cards/:cardId', removeCardFromDeck);

export default router;

