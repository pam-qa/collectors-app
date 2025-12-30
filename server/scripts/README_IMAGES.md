# Image Download and Upload Script

This script downloads card images from third-party CDNs and uploads them to your own Supabase Storage.

## Prerequisites

1. **Supabase Storage Setup**:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Go to **Storage** → Create a new bucket named `card-images`
   - Make the bucket **public** (so images can be accessed via URLs)
   - Copy your Supabase URL and Service Key

2. **Environment Variables**:
   Add these to your `server/.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key-here
   STORAGE_BUCKET=card-images
   ```

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

## Usage

```bash
npm run images:download
```

## What It Does

1. **Finds cards** with third-party image URLs (currently detects Limitless TCG CDN)
2. **Downloads images** from the third-party CDN to a local temp folder
3. **Uploads images** to your Supabase Storage bucket
4. **Updates database** with new Supabase Storage URLs
5. **Organizes images** in folders by set code (e.g., `OP13/OP13-001_JP.webp`)

## Storage Structure

Images are organized in Supabase Storage like this:
```
card-images/
  ├── OP13/
  │   ├── OP13-001_JP.webp
  │   ├── OP13-002_JP.webp
  │   └── ...
  └── [other sets]/
```

## Temporary Files

Downloaded images are saved temporarily in:
- `temp/images/downloaded/` - Images being processed
- `temp/images/processed/` - Successfully processed images

You can safely delete the `temp/images` folder after verifying everything works.

## Notes

- The script processes images in batches of 5 to avoid overwhelming servers
- Only cards with third-party URLs are processed (skips cards already using your storage)
- For now, both `image_url` and `image_url_small` use the same image
- You can later add image resizing to create thumbnails for `image_url_small`

