/**
 * Playwright test runner for minimal_event_test.html
 * Captures console output and test results
 */

import { chromium } from 'playwright';

async function runTest() {
    console.log('🚀 Starting Playwright browser test...\n');

    const browser = await chromium.launch({
        headless: true
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        const text = msg.text();
        consoleMessages.push(text);
        console.log(`[${msg.type()}] ${text}`);
    });

    // Collect errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
        console.error(`❌ Page error: ${error.message}`);
    });

    try {
        // Navigate to test page
        console.log('📄 Loading http://localhost:8080/minimal_event_test.html\n');
        await page.goto('http://localhost:8080/minimal_event_test.html', {
            waitUntil: 'networkidle',
            timeout: 10000
        });

        // Wait for test to complete (looking for SUCCESS or FAILURE message)
        console.log('\n⏳ Waiting for test to complete...\n');
        await page.waitForFunction(
            () => {
                const log = document.getElementById('log');
                const text = log?.textContent || '';
                return text.includes('SUCCESS') || text.includes('FAILURE');
            },
            { timeout: 10000 }
        );

        // Get final test result
        const logContent = await page.textContent('#log');

        console.log('\n' + '='.repeat(70));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(70));

        if (logContent.includes('✅ SUCCESS')) {
            console.log('✅ TEST PASSED: Insert event was fired!');
        } else if (logContent.includes('❌ FAILURE')) {
            console.log('❌ TEST FAILED: Insert event was NOT fired');
        }

        // Check table count
        const tableCountMatch = logContent.match(/Table count after reducer: (\d+)/);
        if (tableCountMatch) {
            const count = parseInt(tableCountMatch[1]);
            console.log(`📊 Table count: ${count}`);
            if (count > 0) {
                console.log('✅ Row was inserted into client cache');
            } else {
                console.log('❌ Row NOT in client cache');
            }
        }

        console.log('='.repeat(70));

        if (errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            errors.forEach(err => console.log(`  - ${err}`));
        }

        // Return success/failure
        const success = logContent.includes('✅ SUCCESS');
        await browser.close();

        process.exit(success ? 0 : 1);

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        await browser.close();
        process.exit(1);
    }
}

runTest();
