#!/usr/bin/env node
/**
 * Quick Test Runner - Fixsy App
 * يفحص الموقع بشكل سريع ويطلع تقرير
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Fixsy App Testing...\n');

const tests = {
    passed: [],
    failed: [],
    warnings: []
};

// 1. Check Build
console.log('📦 [1/5] Building the app...');
const buildProcess = spawn('npm', ['run', 'build'], { shell: true });

buildProcess.stdout.on('data', (data) => {
    // Silent - only show errors
});

buildProcess.stderr.on('data', (data) => {
    console.error(`Build Error: ${data}`);
    tests.failed.push('Build failed');
});

buildProcess.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Build successful\n');
        tests.passed.push('Build');

        // 2. Check for TypeScript errors
        checkTypeScript();

    } else {
        console.log('❌ Build failed\n');
        tests.failed.push('Build');
    }
});

function checkTypeScript() {
    console.log('📝 [2/5] Checking TypeScript...');
    const tscProcess = spawn('npx', ['tsc', '--noEmit'], { shell: true });

    let hasErrors = false;

    tscProcess.stderr.on('data', (data) => {
        hasErrors = true;
        console.error(`TypeScript Error: ${data}`);
    });

    tscProcess.on('close', (code) => {
        if (code === 0 && !hasErrors) {
            console.log('✅ No TypeScript errors\n');
            tests.passed.push('TypeScript');
        } else {
            console.log('⚠️ TypeScript warnings found\n');
            tests.warnings.push('TypeScript has warnings');
        }

        // 3. Check CSS
        checkCSS();
    });
}

function checkCSS() {
    console.log('🎨 [3/5] Checking CSS files...');

    const cssFiles = [
        'src/App.css',
        'src/index.css',
        'src/components/ChatWindow.css',
        'src/pages/JobMarket.css',
        'src/pages/UserBookings.css'
    ];

    let allExist = true;

    cssFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            console.log(`❌ Missing: ${file}`);
            allExist = false;
            tests.failed.push(`CSS file: ${file}`);
        }
    });

    if (allExist) {
        console.log('✅ All critical CSS files exist\n');
        tests.passed.push('CSS Files');
    }

    // 4. Check Environment Variables
    checkEnvVars();
}

function checkEnvVars() {
    console.log('🔐 [4/5] Checking environment variables...');

    const envExample = '.env.example';
    const envLocal = '.env.local';

    if (!fs.existsSync(envExample) && !fs.existsSync(envLocal) && !fs.existsSync('.env')) {
        console.log('⚠️ No .env file found\n');
        tests.warnings.push('Environment variables not configured');
    } else {
        console.log('✅ Environment configuration found\n');
        tests.passed.push('Environment Variables');
    }

    // 5. Check File Structure
    checkFileStructure();
}

function checkFileStructure() {
    console.log('📁 [5/5] Checking file structure...');

    const criticalDirs = [
        'src/components',
        'src/pages',
        'src/services',
        'src/hooks',
        'src/context',
        'src/utils'
    ];

    let allExist = true;

    criticalDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            console.log(`❌ Missing directory: ${dir}`);
            allExist = false;
            tests.failed.push(`Directory: ${dir}`);
        }
    });

    if (allExist) {
        console.log('✅ All critical directories exist\n');
        tests.passed.push('File Structure');
    }

    // Generate Report
    generateReport();
}

function generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST REPORT');
    console.log('='.repeat(50) + '\n');

    console.log(`✅ Passed: ${tests.passed.length}`);
    tests.passed.forEach(test => console.log(`   - ${test}`));

    console.log(`\n⚠️ Warnings: ${tests.warnings.length}`);
    tests.warnings.forEach(test => console.log(`   - ${test}`));

    console.log(`\n❌ Failed: ${tests.failed.length}`);
    tests.failed.forEach(test => console.log(`   - ${test}`));

    console.log('\n' + '='.repeat(50));

    const totalTests = tests.passed.length + tests.warnings.length + tests.failed.length;
    const passRate = ((tests.passed.length / totalTests) * 100).toFixed(1);

    console.log(`\n📈 Pass Rate: ${passRate}%`);

    if (tests.failed.length === 0) {
        console.log('\n🎉 All critical tests passed! Ready for deployment!');
    } else {
        console.log('\n⚠️ Some tests failed. Please fix the issues before deployment.');
    }

    // Save report to file
    const reportPath = path.join(__dirname, 'test-report.txt');
    const reportContent = `
Fixsy App - Test Report
Generated: ${new Date().toLocaleString()}

✅ Passed (${tests.passed.length}):
${tests.passed.map(t => `  - ${t}`).join('\n')}

⚠️ Warnings (${tests.warnings.length}):
${tests.warnings.map(t => `  - ${t}`).join('\n')}

❌ Failed (${tests.failed.length}):
${tests.failed.map(t => `  - ${t}`).join('\n')}

Pass Rate: ${passRate}%
  `;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`\n💾 Report saved to: ${reportPath}`);
}
