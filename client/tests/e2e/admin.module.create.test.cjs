const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Admin module creation", function () {
  this.timeout(45000);

  let driver;

  before(async () => {
    driver = await buildDriver();
});

after(async () => {
  if (driver) await driver.quit();
});

it("creates a new module from the admin panel", async () => {

  await driver.get("http://localhost:5173/login");

  await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manithasendiv03@gmail.com");
  await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
  await driver.findElement(By.css("[data-testid='login-submit']")).click();

  await driver.wait(until.urlContains("/admin"), 10000);
  await driver.get("http://localhost:5173/admin/modules");

  await driver.wait(until.elementLocated(By.css("[data-testid='add-module-button']")), 10000);
  await driver.findElement(By.css("[data-testid='add-module-button']")).click();

  const moduleCode = "CS999";

  await driver.findElement(By.css("[data-testid='module-code']")).sendKeys(moduleCode);
  await driver.findElement(By.css("[data-testid='module-title']")).sendKeys("Test Module");
  await driver.findElement(By.css("[data-testid='module-description']")).sendKeys("Test description");
  await driver.findElement(By.css("[data-testid='module-year']")).sendKeys("1");
  await driver.findElement(By.css("[data-testid='module-semester']")).sendKeys("1");
  await driver.findElement(By.css("[data-testid='add-module-button']")).click();

  await driver.wait(async () => {
    const bodyText = await driver.findElement(By.tagName("body")).getText();
    return bodyText.includes(moduleCode);
  }, 10000);

  const bodyText = await driver.findElement(By.tagName("body")).getText();
  assert.ok(bodyText.includes(moduleCode), "Created module should appear in the admin list");
  assert.ok(bodyText.includes("CS999"), "Created module should appear in the admin list");
});
});