import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { cardsApi } from '../services/api';
import type { Card } from '../types';

interface CardGridProps {
  packId?: string;
  searchQuery?: string;
}

// Helper functions - must be defined before CardItem uses them
function getLowestPrice(prices: any): string {
  if (!prices) return '0.00';
  
  const priceList: number[] = [];
  
  if (prices.tcgplayer?.market) priceList.push(prices.tcgplayer.market);
  if (prices.tcgplayer?.low) priceList.push(prices.tcgplayer.low);
  if (prices.cardmarket?.averagePrice) priceList.push(prices.cardmarket.averagePrice);
  if (prices.cardmarket?.lowPrice) priceList.push(prices.cardmarket.lowPrice);
  if (prices.yuyutei?.price) priceList.push(prices.yuyutei.price);
  
  if (priceList.length === 0) return '0.00';
  
  const lowest = Math.min(...priceList);
  return lowest.toFixed(2);
}

function getListingsCount(prices: any): string {
  if (!prices) return '0';
  
  let count = 0;
  if (prices.tcgplayer?.listings) count += prices.tcgplayer.listings;
  if (prices.cardmarket?.listings) count += prices.cardmarket.listings;
  
  if (count === 0) return '0';
  return count.toString();
}

// Memoized card item component
const CardItem = memo(({ card }: { card: Card }) => {
  const lowestPrice = useMemo(() => getLowestPrice(card.prices), [card.prices]);
  const listingsCount = useMemo(() => getListingsCount(card.prices), [card.prices]);

  return (
    <Link to={`/cards/${card.id}`} className="card-item">
      <div className="card-image-wrapper">
        {card.image_url_small ? (
          <img 
            src={card.image_url_small} 
            alt={card.name}
            className="card-image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="card-placeholder">No Image</div>
        )}
      </div>
      <div className="card-info">
        <div className="card-number">{card.card_number}</div>
        <div className="card-name">{card.name}</div>
        {card.prices ? (
          <>
            <div className="card-price">${lowestPrice}</div>
            <div className="card-listings">{listingsCount} listings</div>
          </>
        ) : (
          <div className="card-price-muted">No price data</div>
        )}
      </div>
    </Link>
  );
});

CardItem.displayName = 'CardItem';

export default function CardGrid({ packId, searchQuery }: CardGridProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    show: 'all',
    display: 'images',
    sort: 'set_release',
    language: 'JP', // Default to JP since One Piece cards are Japanese
    perPage: '50', // Default to 50 instead of 'all' for better performance
  });

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        limit: filters.perPage === 'all' ? 1000 : 1000, // Load more for client-side filtering/sorting
      };
      
      // Only add language filter if one is selected
      if (filters.language) {
        params.language = filters.language;
      }
      
      if (packId) params.pack_id = packId;
      if (searchQuery) params.search = searchQuery;

      const response = await cardsApi.getAll(params);
      setCards(response.cards || []);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  }, [packId, searchQuery, filters.language]);

  // Sort and filter cards based on filter settings
  const sortedAndFilteredCards = useMemo(() => {
    let filtered = [...cards];

    // Apply sort
    filtered.sort((a, b) => {
      switch (filters.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder: any = {
            'COMMON': 1,
            'UNCOMMON': 2,
            'RARE': 3,
            'SUPER_RARE': 4,
            'ULTRA_RARE': 5,
            'SECRET_RARE': 6,
            'ULTIMATE_RARE': 7,
            'GHOST_RARE': 8,
            'PRISMATIC_SECRET_RARE': 9,
            'STARFOIL_RARE': 10,
          };
          return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0);
        case 'price':
          const priceA = parseFloat(getLowestPrice(a.prices));
          const priceB = parseFloat(getLowestPrice(b.prices));
          return priceB - priceA; // Descending
        case 'set_release':
        default:
          // Sort by set_code then set_position
          if (a.set_code !== b.set_code) {
            return a.set_code.localeCompare(b.set_code);
          }
          const posA = parseInt(a.set_position) || 0;
          const posB = parseInt(b.set_position) || 0;
          return posA - posB;
      }
    });

    // Apply perPage limit
    if (filters.perPage !== 'all') {
      const limit = parseInt(filters.perPage);
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [cards, filters.sort, filters.perPage]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  if (loading) {
    return <div className="loading">Loading cards...</div>;
  }

  return (
    <div className="card-grid-container">
      {/* Filter Bar */}
      <div className="filter-bar">
        <select value={filters.show} onChange={(e) => setFilters({ ...filters, show: e.target.value })}>
          <option value="all">All prints</option>
          <option value="first">First edition only</option>
        </select>
        <select value={filters.display} onChange={(e) => setFilters({ ...filters, display: e.target.value })}>
          <option value="images">Images</option>
          <option value="list">List</option>
        </select>
        <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
          <option value="set_release">Set Release</option>
          <option value="name">Name</option>
          <option value="rarity">Rarity</option>
          <option value="price">Price</option>
        </select>
        <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })}>
          <option value="">All Languages</option>
          <option value="EN">English</option>
          <option value="JP">Japanese</option>
          <option value="CN">Chinese</option>
          <option value="KOR">Korean</option>
        </select>
        <select value={filters.perPage} onChange={(e) => setFilters({ ...filters, perPage: e.target.value })}>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
          <option value="all">All results</option>
        </select>
      </div>

      {/* Card Grid or List */}
      {filters.display === 'images' ? (
        <div className="card-grid">
          {sortedAndFilteredCards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="card-list">
          {sortedAndFilteredCards.map((card) => (
            <div key={card.id} className="card-list-item">
              <Link to={`/cards/${card.id}`} className="card-list-link">
                <div className="card-list-number">{card.card_number}</div>
                <div className="card-list-name">{card.name}</div>
                <div className="card-list-rarity">{card.rarity}</div>
                {card.prices && (
                  <div className="card-list-price">${getLowestPrice(card.prices)}</div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}

      {sortedAndFilteredCards.length === 0 && !loading && (
        <div className="no-cards">No cards found</div>
      )}
    </div>
  );
}


