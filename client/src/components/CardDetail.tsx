import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { cardsApi } from '../services/api';
import PriceComparison from './PriceComparison';
import type { Card } from '../types';

// Lazy load PriceHistoryChart since it might be heavy
const PriceHistoryChart = lazy(() => import('./PriceHistoryChart'));

export default function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'EN' | 'JP'>('EN');

  const loadCard = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const cardData = await cardsApi.getById(id);
      setCard(cardData);
    } catch (error) {
      console.error('Failed to load card:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // Memoize display name calculation
  const displayName = useMemo(() => {
    if (!card) return '';
    return selectedLanguage === 'JP' && card.name_jp ? card.name_jp : card.name;
  }, [card, selectedLanguage]);

  if (loading) {
    return <div className="loading">Loading card...</div>;
  }

  if (!card) {
    return <div className="error">Card not found</div>;
  }

  return (
    <div className="card-detail">
      <div className="card-detail-layout">
        {/* Left: Card Image */}
        <div className="card-detail-image">
          <div className="card-image-large">
            {card.image_url ? (
              <img 
                src={card.image_url} 
                alt={displayName}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="card-placeholder-large">No Image Available</div>
            )}
          </div>
        </div>

        {/* Center: Card Details */}
        <div className="card-detail-info">
          <div className="card-detail-header">
            <h1>{displayName} {card.card_number}</h1>
            
            {/* Card Type, Attribute, Level/Cost for One Piece */}
            <div className="card-type-line">
              {card.monster_type && (
                <span className="card-type">{card.monster_type}</span>
              )}
              {card.attribute && (
                <span className="card-attribute"> • {card.attribute}</span>
              )}
              {card.level && (
                <span className="card-level"> • {card.level} {card.monster_type === 'Leader' ? 'Life' : 'Cost'}</span>
              )}
            </div>

            {/* Power for One Piece cards */}
            {card.atk && (
              <div className="card-power">
                {card.atk} Power
                {card.monster_abilities && card.monster_abilities.some((a: string) => a.includes('Strike')) && (
                  <span> • Strike</span>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="language-selector">
              <button 
                className={selectedLanguage === 'EN' ? 'active' : ''}
                onClick={() => setSelectedLanguage('EN')}
              >
                English
              </button>
              <button 
                className={selectedLanguage === 'JP' ? 'active' : ''}
                onClick={() => setSelectedLanguage('JP')}
              >
                Japanese
              </button>
            </div>
          </div>

          {/* Card Text */}
          {card.card_text && (
            <div className="card-text">
              <p>{card.card_text}</p>
            </div>
          )}

          {/* Traits (monster_abilities) */}
          {card.monster_abilities && card.monster_abilities.length > 0 && (
            <div className="card-traits">
              {card.monster_abilities.join(' / ')}
            </div>
          )}

          {/* Pack and Block Info */}
          {card.pack && (
            <div className="card-pack-info">
              <div className="pack-info-row">
                <strong>Block:</strong> 4
              </div>
              <div className="pack-info-row">
                <strong>Pack:</strong> {card.pack.title} ({card.pack.set_code})
              </div>
              <div className="pack-info-row">
                <strong>Tournament Status:</strong> <span className="status-legal">{card.ban_status === 'UNLIMITED' ? 'Legal' : card.ban_status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Price Comparison */}
        <div className="card-detail-price">
          {card.prices && (
            <PriceComparison card={card} prices={card.prices} />
          )}
        </div>
      </div>

      {/* Price History Chart */}
      {card.prices && (
        <div className="price-history-section">
          <h2>Price History</h2>
          <Suspense fallback={<div className="loading">Loading price history...</div>}>
            <PriceHistoryChart cardId={card.id} />
          </Suspense>
        </div>
      )}

      {/* Buy This Card Section */}
      {card.prices && (
        <div className="buy-section">
          <h2>Buy This Card</h2>
          <div className="buy-buttons">
            {card.prices.tcgplayer && (
              <a 
                href={`https://www.tcgplayer.com/search/yugioh/product?productName=${encodeURIComponent(card.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-button"
              >
                <span>⚡</span>
                Buy on TCGplayer ${card.prices.tcgplayer.market?.toFixed(2) || 'N/A'}
              </a>
            )}
            {card.prices.cardmarket && (
              <a 
                href={`https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString=${encodeURIComponent(card.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="buy-button"
              >
                <span>📄</span>
                Buy on Cardmarket €{card.prices.cardmarket.averagePrice?.toFixed(2) || 'N/A'}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

