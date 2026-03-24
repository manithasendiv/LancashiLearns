const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Material completion tracking", function () {
  this.timeout(45000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("marks a material as complete and keeps the state", async () => {
    await driver.get("http://localhost:5173/login");

    await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manitha20030809@gmail.com");
    await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
    await driver.findElement(By.css("[data-testid='login-submit']")).click();

    await driver.wait(until.urlContains("/dashboard"), 10000);
    await driver.findElement(By.css("[data-testid='module-card']")).click();

    await driver.wait(until.urlContains("/modules/"), 10000);
    await driver.wait(until.elementLocated(By.css("[data-testid='material-complete-toggle']")), 10000);

    const toggle = await driver.findElement(By.css("[data-testid='material-complete-toggle']"));
    await toggle.click();

    await driver.sleep(1500);
    await driver.navigate().refresh();

    await driver.wait(until.elementLocated(By.css("[data-testid='material-complete-toggle']")), 10000);
    const toggleAfterRefresh = await driver.findElement(By.css("[data-testid='material-complete-toggle']"));

    const checked =
      (await toggleAfterRefresh.getAttribute("checked")) !== null ||
      (await toggleAfterRefresh.isSelected());

    assert.ok(checked, "Material should remain marked as complete");
  });
});