# Bulk Card Upload Guide

This guide explains how to upload multiple cards to the database at once.

## Methods

There are **3 ways** to bulk upload cards:

1. **JSON Array in Request Body** (API call)
2. **JSON File Upload** (via file upload)
3. **CSV File Upload** (via file upload)

---

## Method 1: JSON Array in Request Body

Send a POST request with JSON body:

```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pack_id": "PACK_UUID_HERE",
    "cards": [
      {
        "card_number": "LOB-EN004",
        "name": "Dark Magician Girl",
        "card_type": "MONSTER",
        "frame_color": "EFFECT",
        "attribute": "DARK",
        "monster_type": "Spellcaster",
        "level": 6,
        "atk": "2000",
        "def": "1700",
        "card_text": "Gains 300 ATK for every \"Dark Magician\" or \"Magician of Black Chaos\" in the GY.",
        "rarity": "SUPER_RARE",
        "language": "EN"
      },
      {
        "card_number": "LOB-EN005",
        "name": "Summoned Skull",
        "card_type": "MONSTER",
        "frame_color": "NORMAL",
        "attribute": "DARK",
        "monster_type": "Fiend",
        "level": 6,
        "atk": "2500",
        "def": "1200",
        "rarity": "ULTRA_RARE",
        "language": "EN"
      }
    ]
  }'
```

---

## Method 2: JSON File Upload

Create a JSON file with your cards:

**`cards.json`:**
```json
{
  "pack_id": "PACK_UUID_HERE",
  "cards": [
    {
      "card_number": "LOB-EN004",
      "name": "Dark Magician Girl",
      "card_type": "MONSTER",
      "frame_color": "EFFECT",
      "attribute": "DARK",
      "monster_type": "Spellcaster",
      "level": 6,
      "atk": "2000",
      "def": "1700",
      "card_text": "Gains 300 ATK for every \"Dark Magician\" or \"Magician of Black Chaos\" in the GY.",
      "rarity": "SUPER_RARE",
      "language": "EN"
    },
    {
      "card_number": "LOB-EN005",
      "name": "Summoned Skull",
      "card_type": "MONSTER",
      "frame_color": "NORMAL",
      "attribute": "DARK",
      "monster_type": "Fiend",
      "level": 6,
      "atk": "2500",
      "def": "1200",
      "rarity": "ULTRA_RARE",
      "language": "EN"
    }
  ]
}
```

Or just an array:
```json
[
  {
    "card_number": "LOB-EN004",
    "name": "Dark Magician Girl",
    ...
  }
]
```

**Upload via curl:**
```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@cards.json" \
  -F "pack_id=PACK_UUID_HERE"
```

**Upload via Postman/Thunder Client:**
- Method: `POST`
- URL: `http://localhost:3001/api/admin/cards/bulk-import`
- Headers: `Authorization: Bearer YOUR_ADMIN_TOKEN`
- Body: `form-data`
  - Key: `file`, Type: `File`, Value: Select `cards.json`
  - Key: `pack_id`, Type: `Text`, Value: `PACK_UUID_HERE`

---

## Method 3: CSV File Upload

Create a CSV file with headers matching card fields:

**`cards.csv`:**
```csv
card_number,name,card_type,frame_color,attribute,monster_type,level,atk,def,card_text,rarity,language
LOB-EN004,"Dark Magician Girl",MONSTER,EFFECT,DARK,Spellcaster,6,2000,1700,"Gains 300 ATK for every ""Dark Magician"" or ""Magician of Black Chaos"" in the GY.",SUPER_RARE,EN
LOB-EN005,"Summoned Skull",MONSTER,NORMAL,DARK,Fiend,6,2500,1200,,ULTRA_RARE,EN
LOB-EN006,Exodia the Forbidden One,MONSTER,NORMAL,DARK,Spellcaster,3,1000,1000,"If you have ""Right Leg of the Forbidden One"", ""Left Leg of the Forbidden One"", ""Right Arm of the Forbidden One"", and ""Left Arm of the Forbidden One"" in addition to this card in your hand, you win the Duel.",SECRET_RARE,EN
```

**Upload via curl:**
```bash
curl -X POST http://localhost:3001/api/admin/cards/bulk-import \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@cards.csv" \
  -F "pack_id=PACK_UUID_HERE"
```

---

## Required Fields

Every card must have:

- `card_number` (unique identifier, e.g., "LOB-EN001")
- `name` (card name)
- `card_type` (`MONSTER`, `SPELL`, `TRAP`)
- `frame_color` (see enums below)

---

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `set_code` | string | Auto-filled from pack if not provided |
| `set_position` | string | Auto-generated from card_number if not provided |
| `konami_id` | string | 8-digit Konami ID |
| `name_jp`, `name_cn`, `name_kor` | string | Alternative names |
| `language` | enum | `EN`, `JP`, `CN`, `KOR` (default: `EN`) |
| `attribute` | enum | `DARK`, `LIGHT`, `EARTH`, `WATER`, `FIRE`, `WIND`, `DIVINE` |
| `monster_type` | string | Dragon, Spellcaster, Fiend, etc. |
| `monster_abilities` | array | `["Effect", "Tuner", "Flip"]` |
| `level` | number | 1-12 |
| `rank` | number | Xyz rank |
| `link_rating` | number | Link monster rating |
| `link_arrows` | array | `["Top", "Bottom-Left"]` |
| `pendulum_scale` | number | 1-13 |
| `atk` | string | Attack (can be "?" or number) |
| `def` | string | Defense (can be "?" or null for Link) |
| `spell_type` | enum | `NORMAL`, `CONTINUOUS`, `EQUIP`, `QUICK_PLAY`, `FIELD`, `RITUAL` |
| `trap_type` | enum | `NORMAL`, `CONTINUOUS`, `COUNTER` |
| `card_text` | string | Card effect text |
| `pendulum_effect` | string | Pendulum effect text |
| `rarity` | enum | See below |
| `image_url` | string | CDN URL for standard image |
| `image_url_small` | string | CDN URL for thumbnail |
| `image_url_high` | string | CDN URL for high-res image |
| `image_blurhash` | string | Blurhash placeholder |
| `tcg_legal` | boolean | TCG legality (default: `true`) |
| `ocg_legal` | boolean | OCG legality (default: `true`) |
| `ban_status` | enum | `UNLIMITED`, `SEMI_LIMITED`, `LIMITED`, `FORBIDDEN` |
| `prices` | object | `{ tcgplayer: {...}, cardmarket: {...} }` |

---

## Enums Reference

### CardType
`MONSTER`, `SPELL`, `TRAP`

### FrameColor
`NORMAL`, `EFFECT`, `RITUAL`, `FUSION`, `SYNCHRO`, `XYZ`, `PENDULUM`, `LINK`, `TOKEN`, `SPELL`, `TRAP`

### Rarity
`COMMON`, `RARE`, `SUPER_RARE`, `ULTRA_RARE`, `SECRET_RARE`, `ULTIMATE_RARE`, `GHOST_RARE`, `STARLIGHT_RARE`, `PRISMATIC_SECRET_RARE`, `GOLD_RARE`, `PLATINUM_RARE`, `COLLECTORS_RARE`, `QUARTER_CENTURY_SECRET`

---

## Response Format

Success response:
```json
{
  "message": "Bulk import completed",
  "results": {
    "created": 45,
    "skipped": 2,
    "errors": []
  },
  "summary": {
    "total": 47,
    "created": 45,
    "skipped": 2,
    "errors": 0
  }
}
```

Error response:
```json
{
  "error": "cards array is required or upload a JSON/CSV file"
}
```

---

## Tips

1. **Batch Size**: The API processes cards in batches of 50 for optimal performance
2. **Duplicates**: Cards with existing `card_number` are automatically skipped
3. **Validation**: All cards are validated before import starts
4. **Transaction**: Uses database transactions for atomicity
5. **File Size Limit**: Maximum 10MB per file

---

## Example: Complete JSON File

See `examples/cards-bulk-import.json` for a complete example.

---

## Example: Complete CSV File

See `examples/cards-bulk-import.csv` for a complete example.

