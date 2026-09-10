/**
 * Image Optimization Script
 * Optimizes logo.png using sharp library
 * Run: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_LOGO = path.join(__dirname, '..', 'src', 'logo.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'src');

async function optimizeImages() {
    try {
        console.log('🎨 Starting image optimization...\n');

        // Check if input file exists
        if (!fs.existsSync(INPUT_LOGO)) {
            console.error('❌ Error: src/logo.png not found!');
            process.exit(1);
        }

        // Get original file size
        const originalStats = fs.statSync(INPUT_LOGO);
        const originalSize = (originalStats.size / 1024).toFixed(2);
        console.log(`📊 Original size: ${originalSize} KB\n`);

        // 1. Optimize PNG (backup original first)
        console.log('1️⃣ Creating optimized PNG...');
        const backupPath = path.join(OUTPUT_DIR, 'logo-original-backup.png');
        fs.copyFileSync(INPUT_LOGO, backupPath);
        console.log(`   ✅ Backup saved: logo-original-backup.png`);

        const optimizedPngPath = path.join(OUTPUT_DIR, 'logo-optimized.png');
        await sharp(INPUT_LOGO)
            .png({
                quality: 85,
                compressionLevel: 9,
                effort: 10
            })
            .toFile(optimizedPngPath);

        const optimizedPngStats = fs.statSync(optimizedPngPath);
        const optimizedPngSize = (optimizedPngStats.size / 1024).toFixed(2);
        const pngReduction = ((1 - optimizedPngStats.size / originalStats.size) * 100).toFixed(1);
        console.log(`   ✅ Optimized PNG: ${optimizedPngSize} KB (${pngReduction}% reduction)\n`);

        // 2. Create WebP version (high quality)
        console.log('2️⃣ Creating WebP version...');
        const webpPath = path.join(OUTPUT_DIR, 'logo.webp');
        await sharp(INPUT_LOGO)
            .webp({ quality: 85, effort: 6 })
            .toFile(webpPath);

        const webpStats = fs.statSync(webpPath);
        const webpSize = (webpStats.size / 1024).toFixed(2);
        const webpReduction = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
        console.log(`   ✅ WebP created: ${webpSize} KB (${webpReduction}% reduction)\n`);

        // 3. Create responsive sizes (WebP)
        console.log('3️⃣ Creating responsive sizes...');

        const sizes = [
            { name: 'logo-sm.webp', width: 128, height: 128 },
            { name: 'logo-md.webp', width: 256, height: 256 },
            { name: 'logo-lg.webp', width: 512, height: 512 }
        ];

        for (const size of sizes) {
            const outputPath = path.join(OUTPUT_DIR, size.name);
            await sharp(INPUT_LOGO)
                .resize(size.width, size.height, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .webp({ quality: 85 })
                .toFile(outputPath);

            const stats = fs.statSync(outputPath);
            const sizeKB = (stats.size / 1024).toFixed(2);
            console.log(`   ✅ ${size.name}: ${sizeKB} KB`);
        }

        console.log('\n🎉 Optimization complete!\n');
        console.log('📊 Summary:');
        console.log(`   Original PNG: ${originalSize} KB`);
        console.log(`   Optimized PNG: ${optimizedPngSize} KB (-${pngReduction}%)`);
        console.log(`   WebP: ${webpSize} KB (-${webpReduction}%)`);
        console.log('\n💡 Next steps:');
        console.log('   1. Review logo-optimized.png quality');
        console.log('   2. If satisfied, replace src/logo.png with logo-optimized.png');
        console.log('   3. Update code to use WebP with PNG fallback');

    } catch (error) {
        console.error('❌ Error during optimization:', error.message);
        process.exit(1);
    }
}

// Run optimization
optimizeImages();
