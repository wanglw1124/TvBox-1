const puppeteer = require("puppeteer");
const { Compile } = require("@package-tool/html-parsing");

let browser = null;
let browserTimer = null;

const destroyBowser = () => {
  browserTimer = setTimeout(() => {
    browser && browser.close();
  }, 3000);
};

const requestHtml = async (url, xpath) => {
  clearTimeout(browserTimer);
  try {
    if (!browser) {
      browser = await puppeteer.launch();
    }

    const page = await browser.newPage();
    await page.goto(url);

    if (xpath) {
      await page.waitForXPath(xpath);
    }

    let html = await page.content();

    destroyBowser();

    return html;
  } catch (error) {
    destroyBowser();
    return null;
  }
};

const request = () => {};

const htmlAnalysis = (html, rule) => {
  return Compile(html, rule);
};

module.exports = {
  requestHtml,
  htmlAnalysis,
  request,
};
