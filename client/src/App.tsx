import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>TCG Collection Manager</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/cards">Cards</a>
          <a href="/collections">Collections</a>
          <a href="/decks">Decks</a>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 TCG Collection Manager</p>
      </footer>
    </div>
  );
}

// Placeholder pages - to be replaced with actual components
function HomePage() {
  return (
    <div className="page">
      <h2>Welcome to TCG Collection Manager</h2>
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
  return (
    <div className="page">
      <h2>Cards</h2>
      <p>Browse and search cards. (Coming in Phase 1)</p>
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

