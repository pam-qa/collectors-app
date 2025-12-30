# Scraping Scripts

Scripts for scraping card data from external sources.

## OP-13 Scraper

**Note:** The `scrape-op13.ts` script is a template and needs implementation.

### Why Manual Scraping is Needed

The Limitless TCG website (https://onepiece.limitlesstcg.com) doesn't provide a public API. To get all 175 cards, you have a few options:

### Option 1: Browser Extension (Easiest)

1. Install **Web Scraper** or **Data Miner** Chrome extension
2. Visit: https://onepiece.limitlesstcg.com/cards/jp/OP13
3. Configure the scraper to extract:
   - Card number (OP13-001, etc.)
   - Name (English & Japanese)
   - Rarity
   - Cost/Power
   - Type (Leader/Character/Event)
   - Image URLs
4. Export as CSV/JSON
5. Convert to our schema format
6. Bulk import via API

### Option 2: Puppeteer Script (Advanced)

Create a script using Puppeteer to:
- Navigate to the page
- Wait for dynamic content to load
- Extract card data from DOM
- Convert to our schema format
- Generate JSON file

### Option 3: Manual Entry (Slow but Accurate)

1. Visit the website
2. Copy card details one by one
3. Add via Prisma Studio or API
4. Most accurate but time-consuming

### Current Status

✅ Pack structure ready (OP13)
✅ Sample cards added (3 leaders)
📝 Remaining 172 cards need to be added
📝 Card images need to be uploaded to storage

