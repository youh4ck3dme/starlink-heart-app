#!/usr/bin/env node
/**
 * Icon Generator Script
 * Generates all required icons for PWA, browsers, iOS, and Android
 * 
 * Usage: npm run icons:generate
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Config
const SOURCE_IMAGE = join(__dirname, '../src/assets/image.png');
const OUTPUT_DIR = join(__dirname, '../public/icons');
const THEME_COLOR = '#0b1226';
const BG_COLOR = '#eaf3ff';

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🎨 Starting icon generation...\n');

/**
 * Generate favicon sizes
 */
async function generateFavicons() {
  console.log('📱 Generating favicons...');
  
  const sizes = [16, 32, 48];
  
  for (const size of sizes) {
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: BG_COLOR })
      .png()
      .toFile(join(OUTPUT_DIR, `favicon-${size}x${size}.png`));
    console.log(`  ✓ favicon-${size}x${size}.png`);
  }
  
  // Generate multi-size favicon.ico (using 32x32 as base)
  await sharp(SOURCE_IMAGE)
    .resize(32, 32, { fit: 'contain', background: BG_COLOR })
    .png()
    .toFile(join(OUTPUT_DIR, 'favicon.ico'));
  console.log('  ✓ favicon.ico');
}

/**
 * Generate PWA icons (maskable + any)
 */
async function generatePWAIcons() {
  console.log('\n🌐 Generating PWA icons...');
  
  const sizes = [192, 512];
  
  for (const size of sizes) {
    // ANY purpose - no padding
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: 'transparent' })
      .png()
      .toFile(join(OUTPUT_DIR, `icon-${size}x${size}.png`));
    console.log(`  ✓ icon-${size}x${size}.png (any)`);
    
    // MASKABLE purpose - 15% padding for safe zone
    const paddedSize = Math.round(size * 0.7); // 70% of target size
    await sharp(SOURCE_IMAGE)
      .resize(paddedSize, paddedSize, { fit: 'contain', background: 'transparent' })
      .extend({
        top: Math.round((size - paddedSize) / 2),
        bottom: Math.round((size - paddedSize) / 2),
        left: Math.round((size - paddedSize) / 2),
        right: Math.round((size - paddedSize) / 2),
        background: BG_COLOR
      })
      .png()
      .toFile(join(OUTPUT_DIR, `icon-${size}x${size}-maskable.png`));
    console.log(`  ✓ icon-${size}x${size}-maskable.png (maskable)`);
  }
}

/**
 * Generate Apple Touch Icons
 */
async function generateAppleIcons() {
  console.log('\n🍎 Generating Apple touch icons...');
  
  const appleSizes = [180, 167, 152];
  
  for (const size of appleSizes) {
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: BG_COLOR })
      .png()
      .toFile(join(OUTPUT_DIR, `apple-touch-icon-${size}x${size}.png`));
    console.log(`  ✓ apple-touch-icon-${size}x${size}.png`);
  }
  
  // Default apple-touch-icon
  await sharp(SOURCE_IMAGE)
    .resize(180, 180, { fit: 'contain', background: BG_COLOR })
    .png()
    .toFile(join(OUTPUT_DIR, 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png (180x180)');
}

/**
 * Generate Play Store assets (reference sizes)
 */
async function generatePlayStoreAssets() {
  console.log('\n🤖 Generating Play Store reference assets...');
  
  // App icon 512x512 (required for Play Store)
  await sharp(SOURCE_IMAGE)
    .resize(512, 512, { fit: 'contain', background: BG_COLOR })
    .png()
    .toFile(join(OUTPUT_DIR, 'playstore-icon-512x512.png'));
  console.log('  ✓ playstore-icon-512x512.png');
  
  console.log('\n📝 For Play Store, you also need:');
  console.log('   - Feature graphic: 1024x500 (create manually)');
  console.log('   - Screenshots: 2-8 images (create from app)');
}

/**
 * Main execution
 */
async function main() {
  try {
    if (!existsSync(SOURCE_IMAGE)) {
      console.error(`❌ Source image not found: ${SOURCE_IMAGE}`);
      process.exit(1);
    }
    
    await generateFavicons();
    await generatePWAIcons();
    await generateAppleIcons();
    await generatePlayStoreAssets();
    
    console.log('\n✅ All icons generated successfully!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

main();
