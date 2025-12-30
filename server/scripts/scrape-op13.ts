import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ScrapedCard {
  card_number: string;
  set_code: string;
  set_position: string;
  name: string;
  name_jp: string;
  card_type: 'MONSTER' | 'SPELL';
  frame_color: string;
  attribute?: string;
  monster_type?: string;
  monster_abilities?: string[];
  level?: number;
  atk?: string;
  def?: string | null;
  card_text?: string;
  rarity: string;
  tcg_legal: boolean;
  ocg_legal: boolean;
  ban_status: 'UNLIMITED' | 'LIMITED' | 'FORBIDDEN';
  language: 'JP';
  image_url?: string;
  traits?: string;
}

/**
 * Scrape OP-13 cards from Limitless TCG
 * URL: https://onepiece.limitlesstcg.com/cards/jp/OP13
 */
async function scrapeOP13Cards(): Promise<ScrapedCard[]> {
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log('📡 Navigating to Limitless TCG...');
    await page.goto('https://onepiece.limitlesstcg.com/cards/jp/OP13', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for card grid to load
    console.log('⏳ Waiting for card grid to load...');
    await page.waitForSelector('.card-search-grid', { timeout: 15000 }).catch(() => {
      console.log('⚠️  Card grid not found, waiting a bit longer...');
    });
    
    // Wait for cards to be rendered
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to set "All results" to show all 175 cards at once
    console.log('🔧 Setting cards per page to "All"...');
    try {
      const paginationChanged = await page.evaluate(() => {
        // Find select element for "Cards per page" - try multiple strategies
        const selects = Array.from(document.querySelectorAll('select'));
        
        for (const select of selects) {
          // Strategy 1: Check parent label
          const label = select.closest('label')?.textContent || '';
          const parentText = select.parentElement?.textContent || '';
          
          if (label.toLowerCase().includes('cards per page') || 
              label.toLowerCase().includes('per page') ||
              parentText.toLowerCase().includes('cards per page')) {
            const options = Array.from(select.options);
            // Try to find "All" option (could be "All results", "All", or empty value)
            const allOption = options.find(opt => {
              const text = opt.text.toLowerCase().trim();
              return text.includes('all') || text === '' || opt.value === 'all' || opt.value === '';
            });
            
            if (allOption) {
              select.value = allOption.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              select.dispatchEvent(new Event('input', { bubbles: true }));
              return true;
            }
          }
        }
        
        // Strategy 2: Try to find by nearby text
        for (const select of selects) {
          const nearbyText = select.parentElement?.parentElement?.textContent?.toLowerCase() || '';
          if (nearbyText.includes('cards per page') || nearbyText.includes('per page')) {
            const options = Array.from(select.options);
            const allOption = options.find(opt => {
              const text = opt.text.toLowerCase().trim();
              return text.includes('all') || text === '';
            });
            if (allOption) {
              select.value = allOption.value;
              select.dispatchEvent(new Event('change', { bubbles: true }));
              return true;
            }
          }
        }
        
        return false;
      });
      
      if (paginationChanged) {
        // Wait for cards to reload after changing pagination
        console.log('⏳ Waiting for all cards to load...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.log('⚠️  Could not find pagination selector, scrolling to load all cards...');
      }
      
      // Scroll incrementally to trigger lazy loading for all 175 cards (with retry logic)
      console.log('📜 Scrolling to load all lazy-loaded cards...');
      
      for (let retry = 1; retry <= 3; retry++) {
        console.log(`  🔄 Scroll attempt ${retry}/3...`);
        
        let previousCardCount = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 50; // Increased safety limit
        
        // Reset scroll position
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        while (scrollAttempts < maxScrollAttempts) {
          // Scroll down incrementally
          await page.evaluate(() => {
            const scrollAmount = window.innerHeight * 0.7; // Scroll 70% of viewport height
            window.scrollBy(0, scrollAmount);
          });
          
          // Wait for lazy loading
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check how many cards are currently loaded (count images, not just links)
          const currentCardCount = await page.evaluate(() => {
            const cardGrid = document.querySelector('.card-search-grid');
            if (!cardGrid) return 0;
            return cardGrid.querySelectorAll('img[src*="OP13"], img[data-src*="OP13"]').length;
          });
          
          if (scrollAttempts % 5 === 0) {
            console.log(`    📊 Cards loaded: ${currentCardCount}`);
          }
          
          // Check if we've scrolled to the bottom
          const isAtBottom = await page.evaluate(() => {
            return window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
          });
          
          // If at bottom and count stable, we're done with this retry
          if (isAtBottom && currentCardCount === previousCardCount && currentCardCount > 0) {
            console.log(`    ✅ Reached bottom with ${currentCardCount} cards`);
            break;
          }
          
          // If count stopped increasing for a while, we're done
          if (currentCardCount === previousCardCount && previousCardCount > 0 && scrollAttempts > 10) {
            console.log(`    ✅ Card count stabilized at ${currentCardCount}`);
            break;
          }
          
          previousCardCount = currentCardCount;
          scrollAttempts++;
        }
        
        // Final count check (count images, not just links)
        const finalCount = await page.evaluate(() => {
          const cardGrid = document.querySelector('.card-search-grid');
          if (!cardGrid) return 0;
          return cardGrid.querySelectorAll('img[src*="OP13"], img[data-src*="OP13"]').length;
        });
        
        console.log(`  📊 Final card count after attempt ${retry}: ${finalCount}`);
        
        // If we got 175 (or close to it), we're done
        if (finalCount >= 170) {
          console.log(`  ✅ Successfully loaded ${finalCount} cards!`);
          break;
        }
        
        // Wait a bit before next retry
        if (retry < 3) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      // Final scroll to ensure everything is loaded
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(resolve => setTimeout(resolve, 2000));
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log('⚠️  Error setting pagination:', error);
    }

    // Extract card data from card-search-grid
    console.log('🔍 Extracting card data from .card-search-grid...');
    
    const cards = await page.evaluate(() => {
      const cardGrid = document.querySelector('.card-search-grid');
      if (!cardGrid) {
        console.log('❌ Card grid not found!');
        return [];
      }

      // Find ALL card images (webp format) - these are the actual cards
      const cardImages = Array.from(cardGrid.querySelectorAll('img[src*="OP13"], img[data-src*="OP13"]')) as HTMLImageElement[];
      
      // Also check links that might have webp URLs in href
      const cardLinks = Array.from(cardGrid.querySelectorAll('a[href*="OP13"]')) as HTMLAnchorElement[];
      
      console.log(`Found ${cardImages.length} card images and ${cardLinks.length} card links in DOM`);
      
      const extractedCards: any[] = [];
      const seenCardNumbers = new Set<string>();

      // First, extract from images
      cardImages.forEach((img) => {
        try {
          // Extract card number from image src (webp URL): .../OP13-001_JP.webp -> OP13-001
          const imgSrc = img.src || img.getAttribute('data-src') || '';
          const cardMatch = imgSrc.match(/OP13-(\d+)/);
          
          if (!cardMatch) {
            return; // Skip if no card number found in image URL
          }
          
          const cardNum = cardMatch[1].padStart(3, '0');
          const cardNumber = `OP13-${cardNum}`;
          
          // Skip duplicates (same card number)
          if (seenCardNumbers.has(cardNumber)) {
            return;
          }
          seenCardNumbers.add(cardNumber);
          
          // The image src is the webp URL - use it directly
          const imageUrl = imgSrc;
          
          // Extract name from image alt text
          const imageAlt = img.alt || '';
          let nameJp = imageAlt.replace(/OP13-?\d+/i, '').trim();
          if (!nameJp || nameJp.length < 2) {
            nameJp = `Card ${cardNum}`; // Fallback
          }
          
          extractedCards.push({
            card_number: cardNumber,
            set_code: 'OP13',
            set_position: cardNum,
            name: nameJp,
            name_jp: nameJp,
            card_type: 'MONSTER', // Will be enriched from detail page
            frame_color: 'NORMAL',
            rarity: 'COMMON', // Will be enriched from detail page
            tcg_legal: false,
            ocg_legal: true,
            ban_status: 'UNLIMITED',
            language: 'JP',
            image_url: imageUrl,
          });
        } catch (err) {
          console.error(`Error extracting card from image:`, err);
        }
      });

      // Also check links for cards we might have missed (links with webp URLs or card detail pages)
      cardLinks.forEach((link) => {
        try {
          const href = link.href.split('?')[0]; // Remove query params
          const cardMatch = href.match(/OP13-(\d+)/);
          
          if (!cardMatch) {
            return;
          }
          
          const cardNum = cardMatch[1].padStart(3, '0');
          const cardNumber = `OP13-${cardNum}`;
          
          // Skip if we already have this card
          if (seenCardNumbers.has(cardNumber)) {
            return;
          }
          
          seenCardNumbers.add(cardNumber);
          
          // Try to find image in the link
          const imgEl = link.querySelector('img') as HTMLImageElement;
          const imageUrl = imgEl?.src || imgEl?.getAttribute('data-src') || '';
          
          // If no image found, construct webp URL from card number
          const finalImageUrl = imageUrl || `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP13/OP13-${cardNum}_JP.webp`;
          
          extractedCards.push({
            card_number: cardNumber,
            set_code: 'OP13',
            set_position: cardNum,
            name: `Card ${cardNum}`,
            name_jp: `Card ${cardNum}`,
            card_type: 'MONSTER',
            frame_color: 'NORMAL',
            rarity: 'COMMON',
            tcg_legal: false,
            ocg_legal: true,
            ban_status: 'UNLIMITED',
            language: 'JP',
            image_url: finalImageUrl,
          });
        } catch (err) {
          console.error(`Error extracting card from link:`, err);
        }
      });

      console.log(`Extracted ${extractedCards.length} unique cards (from ${cardImages.length} images)`);
      return extractedCards;
    });

    const extractedCount = (cards as ScrapedCard[]).length;
    console.log(`✅ Extracted ${extractedCount} cards from page`);
    
    if (extractedCount < 175) {
      console.log(`⚠️  WARNING: Expected 175 cards, but only extracted ${extractedCount}.`);
      console.log(`    Some cards may not have loaded or have different image URL patterns.`);
    }
    
    // Now enrich cards by visiting individual card pages
    console.log('\n🔍 Enriching card data by visiting individual pages...');
    const enrichedCards = await enrichCardDetails(browser, cards as ScrapedCard[]);
    
    return enrichedCards;

  } finally {
    await browser.close();
  }
}

/**
 * Visit individual card pages to get full details
 */
async function enrichCardDetails(browser: any, cards: ScrapedCard[]): Promise<ScrapedCard[]> {
  const enrichedCards: ScrapedCard[] = [];
  const batchSize = 5; // Process 5 cards at a time
  
  for (let i = 0; i < cards.length; i += batchSize) {
    const batch = cards.slice(i, i + batchSize);
    console.log(`  📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cards.length / batchSize)} (cards ${i + 1}-${Math.min(i + batchSize, cards.length)})...`);
    
    const batchPromises = batch.map(async (card) => {
      const page = await browser.newPage();
      try {
        // Visit base card page (without ?v=1 for alternate art)
        const cardUrl = `https://onepiece.limitlesstcg.com/cards/jp/${card.card_number}`;
        await page.goto(cardUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        
        // Extract card details from the page
        const details = await page.evaluate(() => {
          // Get card name from h1 (format: "モンキー・Ｄ・ルフィ OP13-001")
          const h1Element = document.querySelector('h1') as HTMLElement;
          const fullTitle = h1Element?.textContent?.trim() || '';
          
          // Extract Japanese name (everything before the card number)
          const nameJp = fullTitle.replace(/\s*OP\d+-\d+\s*$/, '').trim();
          
          // Get all text content to parse
          const bodyText = document.body.textContent || '';
          
          // Get card type info (format: "Leader • Red/Green • 4 Life")
          // Look for pattern: "Leader/Character/Event/Stage • Colors • Number Life/Cost"
          const typeLineMatch = bodyText.match(/(Leader|Character|Event|Stage|Don!!?)\s*•\s*([^•]+?)\s*•\s*(\d+)\s*(Life|Cost)/);
          
          let cardType: 'MONSTER' | 'SPELL' = 'MONSTER';
          let monsterType = 'Character';
          let attribute: string | undefined = undefined;
          let level: number | undefined = undefined;
          
          if (typeLineMatch) {
            const typeStr = typeLineMatch[1].trim();
            const colors = typeLineMatch[2].trim();
            const lifeOrCost = parseInt(typeLineMatch[3]);
            
            if (typeStr === 'Leader') {
              cardType = 'MONSTER';
              monsterType = 'Leader';
              level = lifeOrCost; // Life for Leader
            } else if (typeStr === 'Character') {
              cardType = 'MONSTER';
              monsterType = 'Character';
              level = lifeOrCost; // Cost for Character
            } else if (typeStr === 'Event' || typeStr === 'Stage' || typeStr.includes('Don')) {
              cardType = 'SPELL';
              level = lifeOrCost;
            }
            
            // Parse colors as attribute (One Piece uses colors: Red, Green, Blue, Purple, Black, Yellow)
            // Map to closest Attribute enum values
            if (colors.includes('Red')) attribute = 'FIRE';
            else if (colors.includes('Blue')) attribute = 'WATER';
            else if (colors.includes('Green')) attribute = 'EARTH';
            else if (colors.includes('Purple')) attribute = 'DARK';
            else if (colors.includes('Black')) attribute = 'DARK';
            else if (colors.includes('Yellow')) attribute = 'LIGHT';
          }
          
          // Get Power value (format: "5000 Power • Strike")
          const powerMatch = bodyText.match(/(\d+|\?)\s*Power/);
          const atk = powerMatch ? powerMatch[1] : undefined;
          
          // Get card text/ability - look for Japanese text with 【】brackets
          // This appears after the power line and before traits
          let cardText = '';
          const h1Index = bodyText.indexOf(fullTitle);
          const powerIndex = bodyText.indexOf('Power');
          const traitsIndex = bodyText.indexOf('Block') || bodyText.indexOf('Tournament');
          
          if (powerIndex > 0 && traitsIndex > powerIndex) {
            const textSection = bodyText.substring(powerIndex, traitsIndex);
            // Extract text with 【】brackets (Japanese card effects)
            const textMatch = textSection.match(/【[^】]*】[^】]*/);
            if (textMatch) {
              cardText = textMatch[0].trim();
            }
          }
          
          // Get traits (format: "超新星/麦わらの一味") - appears before "Block"
          let traits = '';
          const blockIndex = bodyText.indexOf('Block');
          if (blockIndex > 0) {
            const sectionBeforeBlock = bodyText.substring(Math.max(0, blockIndex - 100), blockIndex);
            // Look for Japanese text (contains katakana/hiragana/kanji) before "Block"
            const traitsMatch = sectionBeforeBlock.match(/([^\s]+(?:\/[^\s]+)*)\s*Block/);
            if (traitsMatch) {
              traits = traitsMatch[1].trim();
            }
          }
          
          return {
            name_jp: nameJp,
            name: nameJp, // For now, use JP name as both (can be updated later with English)
            card_type: cardType,
            monster_type: monsterType,
            attribute: attribute,
            level: level,
            atk: atk,
            card_text: cardText,
            traits: traits,
          };
        });
        
        // Merge scraped data with enriched details
        return {
          ...card,
          name: details.name || card.name,
          name_jp: details.name_jp || card.name_jp,
          card_type: details.card_type || card.card_type,
          monster_type: details.monster_type || card.monster_type,
          attribute: details.attribute || card.attribute,
          level: details.level || card.level,
          atk: details.atk || card.atk,
          card_text: details.card_text || card.card_text,
          // Store traits in monster_abilities (split by /)
          monster_abilities: details.traits ? details.traits.split('/').map(t => t.trim()).filter(t => t) : card.monster_abilities,
        };
      } catch (error: any) {
        console.log(`    ⚠️  Error enriching ${card.card_number}: ${error.message}`);
        return card; // Return original if enrichment fails
      } finally {
        await page.close();
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    enrichedCards.push(...batchResults);
  }
  
  console.log(`  ✅ Enriched ${enrichedCards.length} cards`);
  return enrichedCards;
}

/**
 * Map One Piece card data to our schema
 */
function mapCardData(scraped: ScrapedCard): Partial<ScrapedCard> {
  // Determine card type based on name/type
  let cardType: 'MONSTER' | 'SPELL' = 'MONSTER';
  let monsterType = 'Character';
  let frameColor = 'NORMAL';

  // Check if it's a Leader (usually in name or special designation)
  if (scraped.name_jp.includes('リーダー') || scraped.name.toLowerCase().includes('leader')) {
    monsterType = 'Leader';
    frameColor = 'EFFECT';
  }

  // Check if it's an Event card
  if (scraped.name_jp.includes('イベント') || scraped.name.toLowerCase().includes('event')) {
    cardType = 'SPELL';
  }

  // Map rarity
  const rarityMap: Record<string, string> = {
    'COMMON': 'COMMON',
    'UNCOMMON': 'RARE',
    'RARE': 'SUPER_RARE',
    'SUPER_RARE': 'ULTRA_RARE',
    'SECRET_RARE': 'SECRET_RARE',
    'TREASURE_RARE': 'SECRET_RARE',
  };

  const mappedRarity = rarityMap[scraped.rarity] || 'COMMON';

  return {
    ...scraped,
    card_type: cardType,
    monster_type: monsterType,
    frame_color: frameColor,
    rarity: mappedRarity,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting OP-13 card scraper...\n');

  try {
    // Get OP-13 pack
    const op13Pack = await prisma.pack.findUnique({
      where: { set_code: 'OP13' },
    });

    if (!op13Pack) {
      console.error('❌ OP-13 pack not found! Run seed first.');
      process.exit(1);
    }

    console.log(`📦 Found pack: ${op13Pack.title} (${op13Pack.set_code})\n`);

    // Scrape cards
    const scrapedCards = await scrapeOP13Cards();

    if (scrapedCards.length === 0) {
      console.error('❌ No cards scraped! The website structure may have changed.');
      console.log('💡 Tip: Check the website manually and update the scraper selectors.');
      process.exit(1);
    }

    console.log(`\n📊 Scraped ${scrapedCards.length} cards\n`);

    // Map and save cards
    console.log('💾 Saving cards to database...\n');
    let saved = 0;
    let skipped = 0;

    for (const scraped of scrapedCards) {
      try {
        const mapped = mapCardData(scraped);
        
        // Remove traits field (not in schema) before saving
        const { traits, ...cardData } = mapped as any;
        
        const card = await prisma.card.upsert({
          where: { card_number: mapped.card_number! },
          update: {
            name: mapped.name,
            name_jp: mapped.name_jp,
            card_type: mapped.card_type,
            frame_color: mapped.frame_color,
            monster_type: mapped.monster_type,
            rarity: mapped.rarity as any,
            image_url: mapped.image_url,
            attribute: mapped.attribute,
            level: mapped.level,
            atk: mapped.atk,
            card_text: mapped.card_text,
            monster_abilities: mapped.monster_abilities || [],
          },
          create: {
            ...cardData,
            pack_id: op13Pack.id,
            // Ensure monster_abilities is an array
            monster_abilities: cardData.monster_abilities || [],
          } as any,
        });

        saved++;
        if (saved % 10 === 0) {
          console.log(`  ✅ Saved ${saved}/${scrapedCards.length} cards...`);
        }
      } catch (error: any) {
        console.error(`  ❌ Error saving ${scraped.card_number}: ${error.message}`);
        skipped++;
      }
    }

    // Update pack total
    const totalCards = await prisma.card.count({
      where: { pack_id: op13Pack.id },
    });

    await prisma.pack.update({
      where: { id: op13Pack.id },
      data: { total_cards: totalCards },
    });

    console.log('\n✅ Scraping completed!');
    console.log(`📊 Total cards in database: ${totalCards}`);
    console.log(`✅ Saved: ${saved}`);
    console.log(`⚠️  Skipped: ${skipped}\n`);

    if (totalCards < 175) {
      console.log(`⚠️  Note: Expected 175 cards, but only ${totalCards} are in database.`);
      console.log('   You may need to manually add missing cards or update the scraper.\n');
    }

    // Save scraped data to JSON file for backup
    const outputPath = path.join(__dirname, '../../examples/op13-scraped.json');
    fs.writeFileSync(outputPath, JSON.stringify(scrapedCards, null, 2));
    console.log(`💾 Backup saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
