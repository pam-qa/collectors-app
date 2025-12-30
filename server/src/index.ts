import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

// Import routes
import routes from './routes';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({ 
    message: 'iCollect API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login with username/email and password',
        'POST /api/auth/register': 'Register a new user',
      },
      user: {
        'GET /api/me': 'Get current user profile',
        'PUT /api/me': 'Update current user profile',
      },
      cards: {
        'GET /api/cards': 'Get all cards with filters',
        'GET /api/cards/search': 'Quick search cards',
        'GET /api/cards/:id': 'Get card by ID',
      },
      packs: {
        'GET /api/packs': 'Get all packs',
        'GET /api/packs/:id': 'Get pack by ID',
      },
      collections: {
        'GET /api/collections': 'Get user collections',
        'POST /api/collections': 'Create collection',
        'GET /api/collections/:id': 'Get collection with cards',
        'PUT /api/collections/:id': 'Update collection',
        'DELETE /api/collections/:id': 'Delete collection',
        'POST /api/collections/:id/cards': 'Add card to collection',
        'DELETE /api/collections/:id/cards/:cardId': 'Remove card from collection',
      },
      decks: {
        'GET /api/decks': 'Get user decks',
        'POST /api/decks': 'Create deck',
        'GET /api/decks/:id': 'Get deck with cards',
        'PUT /api/decks/:id': 'Update deck',
        'DELETE /api/decks/:id': 'Delete deck',
        'POST /api/decks/:id/cards': 'Add card to deck',
        'DELETE /api/decks/:id/cards/:cardId': 'Remove card from deck',
      },
      wishlist: {
        'GET /api/wishlist': 'Get user wishlist',
        'POST /api/wishlist': 'Add card to wishlist',
        'PUT /api/wishlist/:cardId': 'Update wishlist item',
        'DELETE /api/wishlist/:cardId': 'Remove from wishlist',
      },
      admin: {
        'GET /api/admin/dashboard': 'Admin dashboard stats',
        'GET /api/admin/users': 'Get all users',
        'PUT /api/admin/users/:id/role': 'Update user role',
        'PUT /api/admin/users/:id/status': 'Activate/deactivate user',
        'DELETE /api/admin/users/:id': 'Delete user',
        'POST /api/admin/packs': 'Create pack',
        'PUT /api/admin/packs/:id': 'Update pack',
        'DELETE /api/admin/packs/:id': 'Delete pack',
        'POST /api/admin/cards': 'Create card',
        'PUT /api/admin/cards/:id': 'Update card',
        'DELETE /api/admin/cards/:id': 'Delete card',
        'POST /api/admin/cards/bulk-import': 'Bulk import cards',
      },
    }
  });
});

// Mount API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API documentation at http://localhost:${PORT}/api`);
});

export default app;
