# Importing One Piece OP-13 Cards

This guide helps you import cards from One Piece Card Game - OP13 "Carrying on His Will" set.

## Current Status

✅ Pack created: OP13 "Carrying on His Will" (Japanese)
✅ Sample cards: 3 leader cards added as examples
📝 **175 cards total** - You'll need to add the remaining cards

## How to Add More Cards

### Option 1: Bulk Import via API (Recommended)

1. **Login as admin** to get a token:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin"}'
   ```
   
   Copy the `token` from the response.

2. **Get your pack ID**:
   ```bash
   curl http://localhost:3001/api/packs
   ```
   
   Find the OP13 pack and copy its `id`.

3. **Prepare card data** in JSON format (see example below)

4. **Bulk import**:
   ```bash
   curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json" \
     -d '{
       "pack_id": "YOUR_PACK_ID",
       "cards": [
         {
           "card_number": "OP13-004",
           "name": "Sabo",
           "name_jp": "サボ",
           "card_type": "MONSTER",
           "frame_color": "EFFECT",
           "attribute": "FIRE",
           "monster_type": "Leader",
           "monster_abilities": ["Leader"],
           "level": 5,
           "atk": "5000",
           "rarity": "SECRET_RARE",
           "language": "JP"
         }
       ]
     }'
   ```

### Option 2: Create JSON File for Bulk Import

Create a file `op13-cards.json`:

```json
{
  "pack_id": "YOUR_PACK_ID_HERE",
  "cards": [
    {
      "card_number": "OP13-001",
      "set_code": "OP13",
      "set_position": "001",
      "name": "Monkey D. Luffy",
      "name_jp": "モンキー・D・ルフィ",
      "card_type": "MONSTER",
      "frame_color": "EFFECT",
      "attribute": "FIRE",
      "monster_type": "Leader",
      "monster_abilities": ["Leader"],
      "level": 4,
      "atk": "5000",
      "card_text": "DON!!×1 【相手のアタック時】...",
      "rarity": "SECRET_RARE",
      "language": "JP",
      "tcg_legal": false,
      "ocg_legal": true,
      "ban_status": "UNLIMITED"
    }
  ]
}
```

Then upload via file:
```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@op13-cards.json" \
  -F "pack_id=YOUR_PACK_ID"
```

## One Piece Card Mapping

Since our schema was designed for Yu-Gi-Oh, here's how One Piece cards map:

| One Piece | Our Schema Field | Notes |
|-----------|------------------|-------|
| Leader | `card_type: MONSTER`, `monster_type: "Leader"` | Leaders stored as MONSTER type |
| Character | `card_type: MONSTER`, `monster_type: "Character"` | Regular characters |
| Event | `card_type: SPELL`, `spell_type: NORMAL` | Event cards |
| Don!! | `card_type: MONSTER`, `monster_type: "Don"` | Don!! cards |
| Cost | `level` | Card cost stored in level field |
| Power | `atk` | Attack/Power value |
| Life | `level` (for Leaders) | Leader life stored in level |
| Type (Red/Green/etc.) | `attribute` | FIRE/RED, WATER/BLUE, etc. |
| Traits | `monster_abilities` array | Character traits/affiliations |

## Required Fields for One Piece Cards

```typescript
{
  card_number: string;      // e.g., "OP13-001"
  set_code: string;         // "OP13"
  set_position: string;     // "001"
  name: string;             // English name (if available)
  name_jp: string;          // Japanese name
  card_type: "MONSTER" | "SPELL";
  frame_color: string;      // EFFECT, NORMAL, etc.
  attribute?: string;       // FIRE, WATER, EARTH, WIND, etc.
  monster_type?: string;    // "Leader", "Character", "Don"
  level?: number;           // Cost (Characters) or Life (Leaders)
  atk?: string;             // Power value
  rarity: string;           // SECRET_RARE, ULTRA_RARE, etc.
  language: "JP";           // Japanese version
  pack_id: string;          // UUID of OP13 pack
}
```

## Data Source

Cards can be found at: https://onepiece.limitlesstcg.com/cards/jp/OP13

**Note:** You'll need to manually extract card data from the website or use a web scraper script. The website doesn't provide a public API for bulk data export.

## Quick Reference: OP-13 Set Info

- **Set Code:** OP13
- **Title:** Carrying on His Will
- **Japanese Title:** 意志を継ぐもの
- **Release Date:** November 7, 2025
- **Total Cards:** 175
- **Language:** Japanese (JP)
- **Set Type:** Booster Pack

## Next Steps

1. ✅ Pack is created
2. ✅ Sample cards added (3 leaders)
3. 📝 Add remaining 172 cards via bulk import
4. 📝 Add card images (upload to Supabase Storage, store URLs)
5. 📝 Add pricing data (from TCGPlayer/Cardmarket)

