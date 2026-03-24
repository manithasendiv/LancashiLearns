const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Module lesson navigation", function () {
  this.timeout(40000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("opens a module and displays a selected material", async () => {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manitha20030809@gmail.com");
    await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
    await driver.findElement(By.css("[data-testid='login-submit']")).click();

    await driver.wait(until.urlContains("/dashboard"), 10000);
    await driver.wait(until.elementLocated(By.css("[data-testid='module-card']")), 10000);

    const firstModule = await driver.findElement(By.css("[data-testid='module-card']"));
    await firstModule.click();

    await driver.wait(until.urlContains("/modules/"), 10000);
    await driver.wait(until.elementLocated(By.css("[data-testid='material-item']")), 10000);

    const firstMaterial = await driver.findElement(By.css("[data-testid='material-item']"));
    await firstMaterial.click();

    await driver.wait(until.elementLocated(By.css("[data-testid='material-viewer']")), 10000);

    const viewer = await driver.findElement(By.css("[data-testid='material-viewer']"));
    assert.ok(await viewer.isDisplayed(), "Material viewer should be visible");
  });
});