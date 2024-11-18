const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda'); // This helps Puppeteer work on Heroku

// Function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateHomeReport(address, name, email, phone) {
    const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath,  // Use chromium executable for Heroku
        headless: chromium.headless,  // Ensures headless mode on Heroku
        args: chromium.args,  // Chromium args necessary for Heroku
        defaultViewport: null,
        ignoreHTTPSErrors: true,  // Ignore SSL errors
    });

    const page = await browser.newPage();

    try {
        console.log('Navigating to the login page...');
        // Step 1: Go to the NarrPR login page
        await page.goto(process.env.NARRPR_URL, { waitUntil: 'networkidle2' });

        console.log('Logging in...');
        // Step 2: Log in
        await page.type('#SignInEmail', process.env.EMAIL);
        await page.type('#SignInPassword', process.env.PASSWORD);
        await page.click('#SignInBtn');
        await page.waitForNavigation();

        console.log('Searching for address...');
        // Step 3: Input the address and press Enter
        await page.waitForSelector('input[name="searchInputBox"]');
        await page.type('input[name="searchInputBox"]', address);
        await delay(500);
        await page.keyboard.press('Enter');
        await delay(3000);

        console.log('Creating report...');
        // Click the "Create Report" button
        await page.waitForSelector('.button.page-tool-btn.is-primary');
        await page.click('.button.page-tool-btn.is-primary');

        console.log('Selecting report options...');
        // Step 4: Check the "Mini Property Report" radio button
        await page.waitForSelector('input[type="radio"][id="mat-radio-28-input"]');
        await page.click('input[type="radio"][id="mat-radio-28-input"]');
        await delay(1500);

        // Step 4.1: Check the additional checkbox
        try {
            await page.waitForSelector('#mat-mdc-checkbox-41-input', { visible: true, timeout: 60000 });
            await page.click('#mat-mdc-checkbox-41-input');
        } catch (error) {
            console.error("Failed to find the checkbox: ", error);
        }
        await delay(1500);

        console.log('Filling report details...');
        // Step 4.2: Input the recipient's name
        await page.waitForSelector('input[aria-label="Recipient Name"]');
        await page.type('input[aria-label="Recipient Name"]', name);
        await delay(1500);

        // Step 4.3: Auto-fill the message body with personalized content
        await page.waitForSelector('textarea[aria-label="Email message"]');
        await page.type('textarea[aria-label="Email message"]', `Hello ${name},

I thought you would be interested in this property at ${address}.

Best,
Dylan Sievering
Choice Residential Real Estate`);
        await delay(1500);

        // Step 4.4: Input the email address in the email input field
        await page.waitForSelector('input[formcontrolname="deliveryRecipientEmails"]');
        await page.type('input[formcontrolname="deliveryRecipientEmails"]', email);
        await delay(1500);

        console.log('Running report...');
        // Step 4.5: Click the "Run Report" button
        await page.waitForSelector('input[type="submit"].button.is-primary.run-report');
        await page.click('input[type="submit"].button.is-primary.run-report');

        // Add a 5-second buffer after clicking the button
        await delay(5000);

    } catch (error) {
        console.error("An error occurred during the automation process:", error.stack);
    } finally {
        await browser.close();
    }
}

module.exports = { generateHomeReport };
