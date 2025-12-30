import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const storageBucket = process.env.STORAGE_BUCKET || 'card-images';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Local directory for temporary image storage
const tempImageDir = path.join(__dirname, '../../temp/images');
const downloadedDir = path.join(tempImageDir, 'downloaded');
const processedDir = path.join(tempImageDir, 'processed');

/**
 * Download an image from a URL
 */
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        if (response.headers.location) {
          return downloadImage(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
        }
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath); // Delete the file on error
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

/**
 * Upload image to Supabase Storage
 */
async function uploadToSupabase(localPath: string, remotePath: string): Promise<string> {
  const fileBuffer = fs.readFileSync(localPath);
  
  const { data, error } = await supabase.storage
    .from(storageBucket)
    .upload(remotePath, fileBuffer, {
      contentType: 'image/webp',
      upsert: true, // Overwrite if exists
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(storageBucket)
    .getPublicUrl(remotePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL');
  }

  return urlData.publicUrl;
}

/**
 * Check if URL is from third-party CDN
 */
function isThirdPartyUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('limitlesstcg.nyc3.cdn.digitaloceanspaces.com');
}

/**
 * Extract card number from URL to create folder structure
 */
function getImagePath(cardNumber: string, size: 'standard' | 'small' | 'high' = 'standard'): string {
  // Structure: OP13/OP13-001_standard.webp
  const setCode = cardNumber.split('-')[0];
  const filename = size === 'standard' 
    ? `${cardNumber}_JP.webp`
    : size === 'small'
    ? `${cardNumber}_JP_small.webp`
    : `${cardNumber}_JP_high.webp`;
  
  return `${setCode}/${filename}`;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image download and upload process...\n');

  try {
    // Create temp directories
    if (!fs.existsSync(downloadedDir)) {
      fs.mkdirSync(downloadedDir, { recursive: true });
    }
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Get all cards with third-party image URLs
    console.log('📋 Fetching cards with third-party image URLs...\n');
    const cards = await prisma.card.findMany({
      where: {
        image_url: {
          not: null,
        },
      },
      select: {
        id: true,
        card_number: true,
        image_url: true,
        image_url_small: true,
        image_url_high: true,
      },
    });

    // Filter to only cards with third-party URLs
    const cardsToProcess = cards.filter(card => 
      isThirdPartyUrl(card.image_url) || 
      isThirdPartyUrl(card.image_url_small) || 
      isThirdPartyUrl(card.image_url_high)
    );

    if (cardsToProcess.length === 0) {
      console.log('✅ No cards with third-party image URLs found!');
      console.log('   All images are already using your storage.\n');
      return;
    }

    console.log(`📊 Found ${cardsToProcess.length} cards to process\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ cardNumber: string; error: string }> = [];

    // Process cards in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < cardsToProcess.length; i += batchSize) {
      const batch = cardsToProcess.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (card) => {
        try {
          console.log(`📥 Processing ${card.card_number}...`);

          const imagePath = getImagePath(card.card_number);
          const localPath = path.join(downloadedDir, `${card.card_number}.webp`);
          
          // Download image if it exists and is third-party
          if (card.image_url && isThirdPartyUrl(card.image_url)) {
            // Download
            await downloadImage(card.image_url, localPath);
            console.log(`  📥 Downloaded ${card.card_number}`);
            
            // Upload to Supabase
            const remotePath = imagePath;
            const publicUrl = await uploadToSupabase(localPath, remotePath);
            console.log(`  ⬆️  Uploaded ${card.card_number} to Supabase`);
            
            // Update database with new URLs
            await prisma.card.update({
              where: { id: card.id },
              data: { 
                image_url: publicUrl,
                // For now, use the same URL for small. You can resize images later if needed
                image_url_small: publicUrl, // TODO: Create thumbnail version
              },
            });

            console.log(`  ✅ ${card.card_number}: Database updated`);
            
            // Move to processed folder
            const processedPath = path.join(processedDir, `${card.card_number}.webp`);
            if (fs.existsSync(localPath)) {
              fs.renameSync(localPath, processedPath);
            }
            
            successCount++;
          } else {
            console.log(`  ⏭️  ${card.card_number}: Already using own storage or no image URL`);
          }

        } catch (error: any) {
          console.error(`  ❌ ${card.card_number}: ${error.message}`);
          errorCount++;
          errors.push({
            cardNumber: card.card_number,
            error: error.message,
          });
        }
      }));

      // Small delay between batches
      if (i + batchSize < cardsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n✅ Image processing completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  Errors encountered:`);
      errors.forEach(e => {
        console.log(`   - ${e.cardNumber}: ${e.error}`);
      });
    }

    console.log(`\n💾 Downloaded images are in: ${downloadedDir}`);
    console.log(`💾 Processed images are in: ${processedDir}`);
    console.log('\n💡 You can delete the temp/images folder after verifying everything works.\n');

  } catch (error) {
    console.error('❌ Process failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

