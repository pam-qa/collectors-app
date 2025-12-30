# Puppeteer Installation for Scraping Scripts

The scraping scripts (`scrape-op13.ts`, etc.) require Puppeteer, which is not included in production dependencies.

## To Use Scraping Scripts Locally:

1. Install Puppeteer as a dev dependency:
   ```bash
   npm install --save-dev puppeteer
   ```

2. Or install it globally:
   ```bash
   npm install -g puppeteer
   ```

3. Then run the scraping script:
   ```bash
   npm run scrape:op13
   ```

## Why Puppeteer is Optional:

- Puppeteer downloads Chromium (~300MB) which is not needed for production
- Railway builds time out when trying to install Puppeteer system packages
- Scraping scripts are only used for local development/data import

## Note:

If you see errors about Puppeteer not being found when running scraping scripts, install it first using the command above.

