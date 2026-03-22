const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Admin login flow", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("logs in as admin and redirects to admin dashboard", async () => {
    await driver.get("http://localhost:5173/login");

    const emailInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-email']")),
      10000
    );
    await driver.wait(until.elementIsVisible(emailInput), 5000);
    await emailInput.clear();
    await emailInput.sendKeys("manithasendiv03@gmail.com");

    const passwordInput = await driver.findElement(
      By.css("[data-testid='login-password']")
    );
    await passwordInput.clear();
    await passwordInput.sendKeys(".Ms501931");

    const submitBtn = await driver.findElement(
      By.css("[data-testid='login-submit']")
    );
    await submitBtn.click();

    await driver.wait(until.urlContains("/admin"), 10000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/admin"));
  });
});