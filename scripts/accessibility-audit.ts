import { chromium } from '@playwright/test';

async function runAccessibilityAudit() {
    console.log('🔍 Starting Comprehensive Accessibility Audit...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    
    // Comprehensive accessibility checks
    const issues = await page.evaluate(() => {
        const problems: string[] = [];
        
        // 1. Check for buttons without accessible names
        const buttons = document.querySelectorAll('button');
        buttons.forEach((btn, idx) => {
            const hasText = btn.textContent?.trim();
            const hasAriaLabel = btn.getAttribute('aria-label');
            const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
            const hasTitle = btn.getAttribute('title');
            
            if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
                problems.push(`Button #${idx + 1} has no accessible name`);
            }
        });
        
        // 2. Check for images without alt text
        const images = document.querySelectorAll('img');
        images.forEach((img, idx) => {
            if (!img.getAttribute('alt')) {
                problems.push(`Image #${idx + 1} (${img.src.split('/').pop()}) missing alt text`);
            }
        });
        
        // 3. Check for form inputs without labels
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach((input, idx) => {
            const id = input.getAttribute('id');
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledBy = input.getAttribute('aria-labelledby');
            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
            
            if (!ariaLabel && !ariaLabelledBy && !hasLabel) {
                const type = input.getAttribute('type') || input.tagName.toLowerCase();
                problems.push(`${type} input #${idx + 1} has no associated label`);
            }
        });
        
        // 4. Check for missing ARIA landmarks
        const hasMain = document.querySelector('main, [role="main"]');
        const hasNav = document.querySelector('nav, [role="navigation"]');
        const hasHeader = document.querySelector('header, [role="banner"]');
        
        if (!hasMain) problems.push('Missing <main> landmark');
        if (!hasNav) problems.push('Missing <nav> landmark');
        if (!hasHeader) problems.push('Missing <header> landmark');
        
        // 5. Check for links without accessible names
        const links = document.querySelectorAll('a');
        links.forEach((link, idx) => {
            const hasText = link.textContent?.trim();
            const hasAriaLabel = link.getAttribute('aria-label');
            
            if (!hasText && !hasAriaLabel) {
                problems.push(`Link #${idx + 1} has no accessible name`);
            }
        });
        
        // 6. Check for headings hierarchy
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const h1Count = headings.filter(h => h.tagName === 'H1').length;
        
        if (h1Count === 0) problems.push('No <h1> heading found on page');
        if (h1Count > 1) problems.push(`Multiple <h1> headings found (${h1Count})`);
        
        return problems;
    });
    
    await browser.close();
    
    // Print results
    console.log('📋 ACCESSIBILITY ISSUES FOUND');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (issues.length === 0) {
        console.log('✅ No accessibility issues found!');
    } else {
        console.log(`Found ${issues.length} issues:\n`);
        issues.forEach((issue, idx) => {
            console.log(`${idx + 1}. ⚠️  ${issue}`);
        });
    }
    
    console.log('\n📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total Issues: ${issues.length}`);
    console.log(`Estimated Impact: ${issues.length > 10 ? 'High' : issues.length > 5 ? 'Medium' : 'Low'}`);
    
    return issues;
}

runAccessibilityAudit().catch(console.error);
