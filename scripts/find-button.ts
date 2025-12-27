import { chromium } from '@playwright/test';

async function findButtonWithoutLabel() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    
    const buttonInfo = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const problematic: any[] = [];
        
        buttons.forEach((btn, idx) => {
            const hasText = btn.textContent?.trim();
            const hasAriaLabel = btn.getAttribute('aria-label');
            const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
            const hasTitle = btn.getAttribute('title');
            
            if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
                problematic.push({
                    index: idx + 1,
                    html: btn.outerHTML.substring(0, 200),
                    parent: btn.parentElement?.tagName,
                    className: btn.className
                });
            }
        });
        
        return problematic;
    });
    
    await browser.close();
    
    console.log('🔍 Buttons without accessible labels:\n');
    if (buttonInfo.length === 0) {
        console.log('✅ All buttons have proper labels!');
    } else {
        buttonInfo.forEach(btn => {
            console.log(`Button #${btn.index}:`);
            console.log(`  HTML: ${btn.html}`);
            console.log(`  Parent: ${btn.parent}`);
            console.log(`  Class: ${btn.className}\n`);
        });
    }
}

findButtonWithoutLabel().catch(console.error);
