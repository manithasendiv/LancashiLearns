const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Dashboard modules visibility", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("shows module cards after student login", async () => {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manitha20030809@gmail.com");
    await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
    await driver.findElement(By.css("[data-testid='login-submit']")).click();

    await driver.wait(until.urlContains("/dashboard"), 10000);
    await driver.wait(until.elementsLocated(By.css("[data-testid='module-card']")), 10000);

    const modules = await driver.findElements(By.css("[data-testid='module-card']"));
    assert.ok(modules.length > 0, "Expected at least one module card on dashboard");
  });
});