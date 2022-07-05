const puppeteer = require('puppeteer');
const { createCursor } = require("ghost-cursor");
const { scrollPageToBottom } = require('puppeteer-autoscroll-down');
const { scrollPageToTop } = require('puppeteer-autoscroll-down');
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
       // args: ["--disable-dev-shm-usage","--user-data-dir=./.chrome","--start-fullscreen","--kiosk","--disable-session-crashed-bubble","--noerrdialogs","--no-default-browser-check","--useAutomationExtension","--disable-infobars","--ignore-certificate-errors","--start-maximized","--enable-automation","--no-sandbox", "--disabled-setupid-sandbox", "--enable-font-antialiasing","--font-render-hinting=none","--disable-gpu","--force-color-profile=srgb","--window-size=1664,936","--hide-scrollbars","--high-dpi-support=1","--force-device-scale-factor=1"],
       args: ["--disable-dev-shm-usage","--user-data-dir=./.chrome","--start-fullscreen","--kiosk","--disable-session-crashed-bubble","--noerrdialogs","--no-default-browser-check","--useAutomationExtension","--disable-infobars","--ignore-certificate-errors","--start-maximized","--enable-automation","--no-sandbox", "--disabled-setupid-sandbox", "--enable-font-antialiasing","--font-render-hinting=none","--disable-gpu","--force-color-profile=srgb","--window-size=1664,936","--hide-scrollbars","--disable-font-subpixel-positioning"],
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
    console.log("Set page Viewport");
    await page.setViewport({ width: 1664, height: 936 });
    console.log("define a timeout variable for 70 seconds");
    const timeout = 70000;
    console.log("set default timeout on page");
    page.setDefaultTimeout(timeout);
    console.log("Pause for 5 seconds");
    await page.waitForTimeout(5000);

//    const { autoScroll,waitForSelectors, scrollIntoViewIfNeeded, waitForConnected, waitForInViewport, waitForSelector, waitForElement, querySelectorsAll, querySelectorAll, waitForFunction } = require("./puppeteer-functions.mjs");
    async function waitForSelectors(selectors, frame, options) {
      for (const selector of selectors) {
        try {
          return await waitForSelector(selector, frame, options);
        } catch (err) {
          console.error(err);
        }
      }
      throw new Error('Could not find element for selectors: ' + JSON.stringify(selectors));
    }

    async function scrollIntoViewIfNeeded(element, timeout) {
      await waitForConnected(element, timeout);
      const isInViewport = await element.isIntersectingViewport({threshold: 0});
      if (isInViewport) {
        return;
      }
      await element.evaluate(element => {
        element.scrollIntoView({
          block: 'center',
          inline: 'center',
          behavior: 'smooth',
        });
      });
      await waitForInViewport(element, timeout);
    }

    async function waitForConnected(element, timeout) {
      await waitForFunction(async () => {
        return await element.getProperty('isConnected');
      }, timeout);
    }

    async function waitForInViewport(element, timeout) {
      await waitForFunction(async () => {
        return await element.isIntersectingViewport({threshold: 0});
      }, timeout);
    }

    async function waitForSelector(selector, frame, options) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to waitForSelector');
      }
      let element = null;
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (element) {
          element = await element.waitForSelector(part, options);
        } else {
          element = await frame.waitForSelector(part, options);
        }
        if (!element) {
          throw new Error('Could not find element: ' + selector.join('>>'));
        }
        if (i < selector.length - 1) {
          element = (await element.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
        }
      }
      if (!element) {
        throw new Error('Could not find element: ' + selector.join('|'));
      }
      return element;
    }

    async function waitForElement(step, frame, timeout) {
      const count = step.count || 1;
      const operator = step.operator || '>=';
      const comp = {
        '==': (a, b) => a === b,
        '>=': (a, b) => a >= b,
        '<=': (a, b) => a <= b,
      };
      const compFn = comp[operator];
      await waitForFunction(async () => {
        const elements = await querySelectorsAll(step.selectors, frame);
        return compFn(elements.length, count);
      }, timeout);
    }

    async function querySelectorsAll(selectors, frame) {
      for (const selector of selectors) {
        const result = await querySelectorAll(selector, frame);
        if (result.length) {
          return result;
        }
      }
      return [];
    }

    async function querySelectorAll(selector, frame) {
      if (!Array.isArray(selector)) {
        selector = [selector];
      }
      if (!selector.length) {
        throw new Error('Empty selector provided to querySelectorAll');
      }
      let elements = [];
      for (let i = 0; i < selector.length; i++) {
        const part = selector[i];
        if (i === 0) {
          elements = await frame.$$(part);
        } else {
          const tmpElements = elements;
          elements = [];
          for (const el of tmpElements) {
            elements.push(...(await el.$$(part)));
          }
        }
        if (elements.length === 0) {
          return [];
        }
        if (i < selector.length - 1) {
          const tmpElements = [];
          for (const el of elements) {
            const newEl = (await el.evaluateHandle(el => el.shadowRoot ? el.shadowRoot : el)).asElement();
            if (newEl) {
              tmpElements.push(newEl);
            }
          }
          elements = tmpElements;
        }
      }
      return elements;
    }

    async function waitForFunction(fn, timeout) {
      let isActive = true;
      setTimeout(() => {
        isActive = false;
      }, timeout);
      while (isActive) {
        const result = await fn();
        if (result) {
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      throw new Error('Timed out');
    }

    async function autoScroll(page){
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    {
        console.log("Set Viewport to 936p");
        const targetPage = page;
        await targetPage.setViewport({"width":1664,"height":936})
    }
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
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
    {
        console.log("Click Next after entering email address");
        const targetPage = page;
        await targetPage.waitForTimeout(500);
        const element = await waitForSelectors([["aria/Next"],["#idSIButton9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
        await waitTillHTMLRendered(targetPage);
    }
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
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
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
    {
        console.log("Click Sign In - DUO Approval");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Sign in"],["#idSIButton9"]], targetPage, { timeout, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
        // await targetPage.waitForTimeout(5000);
    }
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
    {
        console.log("Click Yes to continue");
        console.log("Wait for DUO approval");
        const targetPage = page;
        const element = await waitForSelectors([["aria/Yes"],["#idSIButton9"]], targetPage, { timeout: 120000, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
        await cursor.click(element);
        console.log("Pausing for 8 seconds");
        await page.waitForTimeout(8000);
/*
        const bottomPosition = await scrollPageToBottom(targetPage, {
          size: 500,
          delay: 250
        });
        const topPosition = await scrollPageToTop(targetPage, {
          size: 500,
          delay: 250
        });
        await autoScroll(targetPage);
*/
    }
    {
        console.log("Scroll Down");
        const targetPage = page;
        const element = await waitForSelectors([['body > vs-stellar-root > vs-stellar-home-container > vs-stellar-home > div > div > vs-stellar-footer > div']], targetPage, { timeout: 120000, visible: true });
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
        await scrollIntoViewIfNeeded(element, timeout);
        console.log("Pausing for 1 seconds");
        await page.waitForTimeout(1000);
    }
    {
        console.log("Scroll Up");
        const targetPage = page;
        const element = await waitForSelectors([['body > vs-stellar-root > vs-stellar-home-container > vs-stellar-home > div > div > div.page-header > h2']], targetPage, { timeout: 120000, visible: true });
        await scrollIntoViewIfNeeded(element, timeout);
    }
/*
const scrollPage = async (page) => {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      let interval;
      const reachedBottom = () =>
        document.scrollingElement.scrollTop + window.innerHeight >=
        document.scrollingElement.scrollHeight;
      const scroll = async () => {
        document.scrollingElement.scrollTop += window.innerHeight / 2;
        if (reachedBottom()) {
          clearInterval(interval);
          document.scrollingElement.scrollTop = 0;
          resolve();
        }
      };
      interval = setInterval(scroll, 100);
    });
  });
};


   const selector = 'body > vs-stellar-root > vs-stellar-home-container > vs-stellar-home > div > div > vs-stellar-footer > div';

    // scroll selector into view
    await page.evaluate(selector => {
        const element = document.querySelector(selector);
        if ( element ) {
            element.scrollTop = element.offsetHeight;
            console.error(`Scrolled to selector ${selector}`);
        } else {
            console.error(`cannot find selector ${selector}`);
        }
    }, selector);

*/

    console.log("Pausing for 12 seconds");
    await page.waitForTimeout(12000);
    console.log("Closing the browser");
    await browser.close();
    console.log("exit puppeteer script");
    process.exit(0);
})();

