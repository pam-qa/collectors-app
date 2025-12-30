import { Router, Request } from 'express';
import multer from 'multer';
import { authenticate, requireAdmin } from '../middleware/auth';

// Admin controllers
import { 
  getDashboard, 
  getAllUsers, 
  updateUserRole, 
  updateUserStatus,
  deleteUser,
} from '../controllers/admin.controller';

// Pack admin operations
import { 
  createPack, 
  updatePack, 
  deletePack,
} from '../controllers/pack.controller';

// Card admin operations
import { 
  createCard, 
  updateCard, 
  deleteCard,
  bulkImportCards,
} from '../controllers/card.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticate, requireAdmin);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept JSON and CSV files
    if (file.mimetype === 'application/json' || 
        file.mimetype === 'text/csv' ||
        file.originalname.endsWith('.json') ||
        file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'));
    }
  },
});

// Dashboard
router.get('/dashboard', getDashboard);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Pack management
router.post('/packs', createPack);
router.put('/packs/:id', updatePack);
router.delete('/packs/:id', deletePack);

// Card management
router.post('/cards', createCard);
router.put('/cards/:id', updateCard);
router.delete('/cards/:id', deleteCard);
router.post('/cards/bulk-import', upload.single('file'), bulkImportCards);

export default router;

