/**
 * Shared TypeScript types for the TCG Collection App
 */

// ===== User Types =====
export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ===== Card Types =====
export type CardType = 'MONSTER' | 'SPELL' | 'TRAP';

export type FrameColor =
  | 'NORMAL'
  | 'EFFECT'
  | 'RITUAL'
  | 'FUSION'
  | 'SYNCHRO'
  | 'XYZ'
  | 'PENDULUM'
  | 'LINK'
  | 'TOKEN'
  | 'SPELL'
  | 'TRAP';

export type Attribute = 'DARK' | 'LIGHT' | 'EARTH' | 'WATER' | 'FIRE' | 'WIND' | 'DIVINE';

export type SpellType = 'NORMAL' | 'CONTINUOUS' | 'EQUIP' | 'QUICK_PLAY' | 'FIELD' | 'RITUAL';

export type TrapType = 'NORMAL' | 'CONTINUOUS' | 'COUNTER';

export type Rarity =
  | 'COMMON'
  | 'RARE'
  | 'SUPER_RARE'
  | 'ULTRA_RARE'
  | 'SECRET_RARE'
  | 'ULTIMATE_RARE'
  | 'GHOST_RARE'
  | 'STARLIGHT_RARE'
  | 'PRISMATIC_SECRET_RARE'
  | 'GOLD_RARE'
  | 'PLATINUM_RARE'
  | 'COLLECTORS_RARE'
  | 'QUARTER_CENTURY_SECRET';

export type BanStatus = 'UNLIMITED' | 'SEMI_LIMITED' | 'LIMITED' | 'FORBIDDEN';

export type Language = 'EN' | 'JP' | 'CN' | 'KOR';

export interface Card {
  id: string;
  card_number: string;
  set_code: string;
  set_position: string;
  konami_id?: string;
  name: string;
  name_jp?: string;
  name_cn?: string;
  name_kor?: string;
  language: Language;
  card_type: CardType;
  frame_color: FrameColor;
  attribute?: Attribute;
  monster_type?: string;
  monster_abilities: string[];
  level?: number;
  rank?: number;
  link_rating?: number;
  link_arrows: string[];
  pendulum_scale?: number;
  atk?: string;
  def?: string;
  spell_type?: SpellType;
  trap_type?: TrapType;
  card_text?: string;
  pendulum_effect?: string;
  rarity: Rarity;
  
  // Images (CDN URLs)
  image_url?: string;        // Standard resolution
  image_url_small?: string;  // Thumbnail
  image_url_high?: string;   // High-res for zoom
  image_blurhash?: string;   // Blur placeholder for instant loading
  
  tcg_legal: boolean;
  ocg_legal: boolean;
  ban_status: BanStatus;
  prices?: CardPrices;
  prices_updated?: string;
  pack_id: string;
  pack?: Pack;  // Pack relation when included
  created_at: string;
  updated_at: string;
}

export interface CardPrices {
  tcgplayer?: PriceData;
  cardmarket?: PriceData;
  yuyutei?: PriceData;
}

export interface PriceData {
  low?: number;
  mid?: number;
  high?: number;
  market?: number;
  averagePrice?: number;  // Cardmarket average price
  lowPrice?: number;      // Cardmarket low price
  listings?: number;      // Number of listings
  currency: string;
  updated_at: string;
}

// ===== Pack Types =====
export type SetType =
  | 'BOOSTER'
  | 'STRUCTURE_DECK'
  | 'STARTER_DECK'
  | 'SPECIAL_EDITION'
  | 'TIN'
  | 'PROMO'
  | 'DUELIST_PACK'
  | 'LEGENDARY_COLLECTION';

export interface Pack {
  id: string;
  set_code: string;
  title: string;
  title_jp?: string;
  title_cn?: string;
  title_kor?: string;
  language: Language;
  release_date?: string;
  set_type: SetType;
  total_cards: number;
  
  // Cover Images (CDN URLs)
  cover_image?: string;        // Standard cover
  cover_image_small?: string;  // Thumbnail
  cover_blurhash?: string;     // Blur placeholder
  
  created_at: string;
  updated_at: string;
}

// ===== Collection Types =====
export type Condition =
  | 'MINT'
  | 'NEAR_MINT'
  | 'LIGHTLY_PLAYED'
  | 'MODERATELY_PLAYED'
  | 'HEAVILY_PLAYED'
  | 'DAMAGED';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  cards?: CollectionCard[];
}

export interface CollectionCard {
  id: string;
  collection_id: string;
  card_id: string;
  card?: Card;
  quantity: number;
  condition: Condition;
  language: Language;
  is_first_edition: boolean;
  purchase_price?: number;
  purchase_currency?: string;
  notes?: string;
  added_at: string;
}

// ===== Deck Types =====
export type DeckZone = 'MAIN' | 'EXTRA' | 'SIDE';

export interface Deck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  format?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  cards?: DeckCard[];
}

export interface DeckCard {
  id: string;
  deck_id: string;
  card_id: string;
  card?: Card;
  quantity: number;
  zone: DeckZone;
}

// ===== Wishlist Types =====
export interface WishlistItem {
  id: string;
  user_id: string;
  card_id: string;
  card?: Card;
  price_alert_enabled: boolean;
  price_alert_threshold?: number;
  price_alert_source?: string;
  added_at: string;
}

// ===== API Response Types =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

