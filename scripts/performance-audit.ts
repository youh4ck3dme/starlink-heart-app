import { chromium } from '@playwright/test';

async function runPerformanceAudit() {
    console.log('🚀 Starting Performance Audit...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate and collect metrics
    const startTime = Date.now();
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    // Get Performance metrics
    const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
            domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
            loadComplete: perf.loadEventEnd - perf.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            domInteractive: perf.domInteractive,
            transferSize: perf.transferSize,
        };
    });
    
    // Check accessibility basics
    const accessibilityIssues = await page.evaluate(() => {
        const issues = [];
        // Check for alt text on images
        const imgsWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imgsWithoutAlt.length > 0) {
            issues.push(`${imgsWithoutAlt.length} images missing alt text`);
        }
        
        // Check for aria-labels on buttons
        const buttonsWithoutLabel = document.querySelectorAll('button:not([aria-label]):not(:has(> *))');
        if (buttonsWithoutLabel.length > 0) {
            issues.push(`${buttonsWithoutLabel.length} buttons missing labels`);
        }
        
        return issues;
    });
    
    await browser.close();
    
    // Print results
    console.log('📊 PERFORMANCE METRICS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Total Load Time: ${loadTime}ms`);
    console.log(`🎨 First Paint: ${Math.round(metrics.firstPaint)}ms`);
    console.log(`📄 First Contentful Paint: ${Math.round(metrics.firstContentfulPaint)}ms`);
    console.log(`⚡ DOM Interactive: ${Math.round(metrics.domInteractive)}ms`);
    console.log(`📦 Transfer Size: ${(metrics.transferSize / 1024).toFixed(2)} KB`);
    console.log(`✅ DOM Content Loaded: ${Math.round(metrics.domContentLoaded)}ms`);
    console.log(`🏁 Load Complete: ${Math.round(metrics.loadComplete)}ms`);
    
    console.log('\n♿ ACCESSIBILITY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (accessibilityIssues.length === 0) {
        console.log('✅ No basic accessibility issues found');
    } else {
        accessibilityIssues.forEach(issue => console.log(`⚠️  ${issue}`));
    }
    
    console.log('\n📈 PERFORMANCE SCORE ESTIMATE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Simple scoring based on metrics
    let perfScore = 100;
    if (metrics.firstContentfulPaint > 1800) perfScore -= 20;
    else if (metrics.firstContentfulPaint > 1000) perfScore -= 10;
    
    if (loadTime > 3000) perfScore -= 20;
    else if (loadTime > 2000) perfScore -= 10;
    
    console.log(`🎯 Estimated Performance: ${perfScore}/100`);
    console.log(`🎯 Estimated Accessibility: ${accessibilityIssues.length === 0 ? '95+' : '80-90'}/100`);
}

runPerformanceAudit().catch(console.error);
