const { Builder } = require("selenium-webdriver");
require("chromedriver");

async function buildDriver() {
  return await new Builder().forBrowser("chrome").build();
}

module.exports = { buildDriver };