const assert = require("assert");
const { until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Protected routes", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("redirects unauthenticated user from admin page to login", async () => {
    await driver.get("http://localhost:5173/admin");

    await driver.wait(until.urlContains("/login"), 10000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/login"));
  });
});