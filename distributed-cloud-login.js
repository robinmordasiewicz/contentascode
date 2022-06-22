const puppeteer = require('puppeteer');
const { createCursor } = require("ghost-cursor");

const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");
const {installMouseHelper} = require('./install-mouse-helper.js');

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};

var USERNAME=(process.argv.slice(2))[0];
if ( !USERNAME ) {
    throw "Please provide a username as the first argument";
}

var PASSWORD=(process.argv.slice(3))[0];
if ( !PASSWORD ) {
    throw "Please provide a password as the second argument";
}

(async () => {
    console.log("Start the Browser");
    const browser = await puppeteer.launch({
       //args: ["--disable-dev-shm-usage","--user-data-dir=./.chrome","--start-fullscreen","--kiosk","--disable-session-crashed-bubble","--noerrdialogs","--no-default-browser-check","--useAutomationExtension","--disable-infobars","--ignore-certificate-errors","--start-maximized","--enable-automation","--no-sandbox", "--disabled-setupid-sandbox", "--enable-font-antialiasing","--font-render-hinting=none","--disable-gpu","--force-color-profile=srgb","--window-size=1920,1080"],
       args: ["--disable-dev-shm-usage","--user-data-dir=./.chrome","--start-fullscreen","--kiosk","--disable-session-crashed-bubble","--noerrdialogs","--no-default-browser-check","--useAutomationExtension","--disable-infobars","--ignore-certificate-errors","--start-maximized","--enable-automation","--no-sandbox", "--disabled-setupid-sandbox", "--enable-font-antialiasing","--font-render-hinting=none","--disable-gpu","--force-color-profile=srgb"],
      //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      //executablePath: '/opt/google/chrome-unstable/google-chrome-unstable',
      slowMo: 0,
      //ignoreDefaultArgs: ["--enable-automation","--enable-blink-features=IdleDetection"],
      ignoreDefaultArgs: ["--enable-automation"],
      ignoreHTTPSErrors: true,
      headless : false
    });

    console.log("Get a page handler");
    //const context = await browser.createIncognitoBrowserContext();
    //const page = await context.newPage();
    const page = await browser.newPage();
    console.log("Set the user agent");
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36");
    const cursor = createCursor(page);
    console.log("Install mouse helper");
    await installMouseHelper(page);
//    console.log("Set page Viewport");
//    await page.setViewport({ width: 1920, height: 1080 });
    console.log("define a timeout variable for 70 seconds");
    const timeout = 70000;
    console.log("set default timeout on page");
    page.setDefaultTimeout(timeout);
    console.log("Pause for 10 seconds");
    await page.waitForTimeout(10000);

    const { waitForSelectors, scrollIntoViewIfNeeded, waitForConnected, waitForInViewport, waitForSelector, waitForElement, querySelectorsAll, querySelectorAll, waitForFunction } = require("./puppeteer-functions.mjs");

//    {
//        console.log("Set Viewport to 1080p");
//        const targetPage = page;
//        await targetPage.setViewport({"width":1920,"height":1080})
//    }
    {
        console.log("Goto login URL");
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        await targetPage.goto("https://f5-amer-ent.console.ves.volterra.io/", {waitUntil: 'networkidle0'});
        await waitTillHTMLRendered(targetPage);
        await Promise.all(promises);
    }

    {
        // Click Sign in with Azure
        console.log("Click Sign in");
        const targetPage = page;
        const promises = [];
        promises.push(targetPage.waitForNavigation());
        const element = await waitForSelectors([["aria/Sign in with Azure","aria/[role=\"generic\"]"],["#new-zocial-azure-oidc > span"]], targetPage, { timeout: 20000, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
        //await waitTillHTMLRendered(targetPage);
        // await targetPage.waitForTimeout(2000);
        await Promise.all(promises);
    }
    {
        console.log("Enter email address in login form");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Enter your email, phone, or Skype."],["#i0116"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type(USERNAME, {delay: 30});
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, USERNAME);
        }
    }
    {
        console.log("Click Next after entering email address");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Next"],["#idSIButton9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await targetPage.waitForTimeout(500);
        await cursor.click(element);
        await waitTillHTMLRendered(targetPage);
    }
    {
        console.log("Enter password into form");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Enter the password for r.mordasiewicz@f5.com"],["#i0118"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        const type = await element.evaluate(el => el.type);
        if (["textarea","select-one","text","url","tel","search","password","number","email"].includes(type)) {
          await element.type(PASSWORD, {delay: 35});
        } else {
          await element.focus();
          await element.evaluate((el, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }, PASSWORD);
        }
    }
    {
        console.log("Click Sign In - DUO Approval");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Sign in"],["#idSIButton9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
        // await targetPage.waitForTimeout(5000);
    }
    {
        console.log("Click Yes to continue");
        console.log("Wait for DUO approval");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Yes"],["#idSIButton9"]], targetPage, { timeout: 120000, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
    }

    console.log("Pausing for 10 seconds");
    await page.waitForTimeout(10000);
    console.log("Closing the browser");
    await browser.close();
    console.log("exit puppeteer script");
    process.exit(0);
})();

