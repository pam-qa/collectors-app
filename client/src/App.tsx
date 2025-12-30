import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import SearchBar from './components/SearchBar';
import CardGrid from './components/CardGrid';
import CardDetail from './components/CardDetail';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="iCollect" className="logo-image" />
          </Link>
          <nav>
            <Link to="/cards">Cards</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/decks">Decks</Link>
          </nav>
        </div>
        <SearchBar />
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/cards/:id" element={<CardDetail />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 iCollect</p>
      </footer>
    </div>
  );
}

// Placeholder pages - to be replaced with actual components
function HomePage() {
  return (
    <div className="page">
      <h2>Welcome to iCollect</h2>
      <p>Manage your trading card collection with multi-source price tracking.</p>
      <div className="features">
        <div className="feature">
          <h3>Track Collections</h3>
          <p>Organize your cards by set, rarity, and condition.</p>
        </div>
        <div className="feature">
          <h3>Build Decks</h3>
          <p>Create and manage your deck builds.</p>
        </div>
        <div className="feature">
          <h3>Price Tracking</h3>
          <p>Monitor prices from TCGPlayer, Cardmarket, and Yuyu-tei.</p>
        </div>
      </div>
    </div>
  );
}

function CardsPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || undefined;
  const packId = searchParams.get('pack') || undefined;

  return (
    <div className="page">
      <CardGrid packId={packId} searchQuery={searchQuery} />
    </div>
  );
}

function CollectionsPage() {
  return (
    <div className="page">
      <h2>Collections</h2>
      <p>Manage your card collections. (Coming in Phase 1)</p>
    </div>
  );
}

function DecksPage() {
  return (
    <div className="page">
      <h2>Decks</h2>
      <p>Build and manage your decks. (Coming in Phase 1)</p>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="page">
      <h2>Login</h2>
      <p>Authentication coming in Phase 1.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="page">
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default App;

