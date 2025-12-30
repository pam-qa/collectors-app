# Scraping Scripts

Scripts for scraping card data from external sources.

## Prerequisites

**Puppeteer is required for scraping scripts but is NOT included in package.json.**

This is because Puppeteer downloads Chromium (~300MB) which would cause Railway builds to timeout. Scraping scripts are only used for local development/data import.

### To Use Scraping Scripts Locally:

Install Puppeteer without saving it to package.json (recommended):

```bash
cd server
npm install puppeteer --no-save
```

This installs Puppeteer in `node_modules` (which is gitignored) but **doesn't modify package.json or package-lock.json**, so it won't be committed or deployed.

Then run the scraping scripts:

```bash
npm run scrape:op13
```

**Note:** Puppeteer is intentionally not in package.json to prevent Railway from detecting it during builds (which causes timeouts). Using `--no-save` keeps it completely local.

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

