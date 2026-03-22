const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Login empty validation", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("does not login when fields are empty", async () => {
    await driver.get("http://localhost:5173/login");

    const submitBtn = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-submit']")),
      10000
    );
    await submitBtn.click();

    await driver.sleep(1500);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/login"));
  });
});