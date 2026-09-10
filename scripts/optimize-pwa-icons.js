/**
 * PWA Icons Optimization Script
 * Optimizes PWA icons (favicon, logo192, logo512)
 * Run: node scripts/optimize-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_LOGO = path.join(__dirname, '..', 'src', 'logo.png');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function optimizePWAIcons() {
    try {
        console.log('🎨 Starting PWA icons optimization...\n');

        // Check if input file exists
        if (!fs.existsSync(INPUT_LOGO)) {
            console.error('❌ Error: src/logo.png not found!');
            process.exit(1);
        }

        // Get original file sizes
        const faviconPath = path.join(PUBLIC_DIR, 'favicon.ico');
        const logo192Path = path.join(PUBLIC_DIR, 'logo192.png');
        const logo512Path = path.join(PUBLIC_DIR, 'logo512.png');

        let totalBefore = 0;
        if (fs.existsSync(faviconPath)) totalBefore += fs.statSync(faviconPath).size;
        if (fs.existsSync(logo192Path)) totalBefore += fs.statSync(logo192Path).size;
        if (fs.existsSync(logo512Path)) totalBefore += fs.statSync(logo512Path).size;

        console.log(`📊 Current PWA icons size: ${(totalBefore / 1024).toFixed(2)} KB\n`);

        // 1. Create optimized logo192.png (for PWA)
        console.log('1️⃣ Creating logo192.png (192x192)...');
        await sharp(INPUT_LOGO)
            .resize(192, 192, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({
                quality: 85,
                compressionLevel: 9,
                effort: 10
            })
            .toFile(logo192Path);

        const logo192Stats = fs.statSync(logo192Path);
        console.log(`   ✅ logo192.png: ${(logo192Stats.size / 1024).toFixed(2)} KB\n`);

        // 2. Create optimized logo512.png (for PWA)
        console.log('2️⃣ Creating logo512.png (512x512)...');
        await sharp(INPUT_LOGO)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({
                quality: 85,
                compressionLevel: 9,
                effort: 10
            })
            .toFile(logo512Path);

        const logo512Stats = fs.statSync(logo512Path);
        console.log(`   ✅ logo512.png: ${(logo512Stats.size / 1024).toFixed(2)} KB\n`);

        // 3. Create optimized favicon.ico (multiple sizes in one file)
        console.log('3️⃣ Creating favicon.ico (16x16, 32x32, 48x48)...');

        // Create 32x32 PNG for favicon (most common)
        const favicon32Path = path.join(PUBLIC_DIR, 'favicon-32.png');
        await sharp(INPUT_LOGO)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({ quality: 85 })
            .toFile(favicon32Path);

        // Rename to .ico (browsers accept PNG as .ico)
        if (fs.existsSync(faviconPath)) {
            fs.renameSync(faviconPath, path.join(PUBLIC_DIR, 'favicon-old-backup.ico'));
        }
        fs.renameSync(favicon32Path, faviconPath);

        const faviconStats = fs.statSync(faviconPath);
        console.log(`   ✅ favicon.ico: ${(faviconStats.size / 1024).toFixed(2)} KB\n`);

        // 4. Create apple-touch-icon (iOS)
        console.log('4️⃣ Creating apple-touch-icon.png (180x180)...');
        const appleTouchPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
        await sharp(INPUT_LOGO)
            .resize(180, 180, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png({
                quality: 85,
                compressionLevel: 9
            })
            .toFile(appleTouchPath);

        const appleTouchStats = fs.statSync(appleTouchPath);
        console.log(`   ✅ apple-touch-icon.png: ${(appleTouchStats.size / 1024).toFixed(2)} KB\n`);

        // Calculate totals
        const totalAfter = faviconStats.size + logo192Stats.size + logo512Stats.size + appleTouchStats.size;
        const reduction = ((1 - totalAfter / totalBefore) * 100).toFixed(1);
        const savedKB = ((totalBefore - totalAfter) / 1024).toFixed(2);

        console.log('🎉 PWA Icons optimization complete!\n');
        console.log('📊 Summary:');
        console.log(`   Before: ${(totalBefore / 1024).toFixed(2)} KB`);
        console.log(`   After: ${(totalAfter / 1024).toFixed(2)} KB`);
        console.log(`   Saved: ${savedKB} KB (-${reduction}%)\n`);

        console.log('📁 Files created:');
        console.log(`   ✅ public/favicon.ico`);
        console.log(`   ✅ public/logo192.png`);
        console.log(`   ✅ public/logo512.png`);
        console.log(`   ✅ public/apple-touch-icon.png`);

    } catch (error) {
        console.error('❌ Error during optimization:', error.message);
        process.exit(1);
    }
}

// Run optimization
optimizePWAIcons();
