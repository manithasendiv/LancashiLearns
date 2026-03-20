const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Login flow", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("logs in and redirects to dashboard", async () => {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manithasendiv03@gmail.com");
    await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
    await driver.findElement(By.css("[data-testid='login-submit']")).click();

    await driver.wait(until.urlContains("/admin"), 10000);

    const currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes("/admin"));
  });
});