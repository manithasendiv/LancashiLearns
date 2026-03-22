const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Invalid login flow", function () {
  this.timeout(30000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("shows error for invalid credentials", async () => {
    await driver.get("http://localhost:5173/login");

    const emailInput = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-email']")),
      10000
    );
    await emailInput.clear();
    await emailInput.sendKeys("wronguser@gmail.com");

    const passwordInput = await driver.findElement(
      By.css("[data-testid='login-password']")
    );
    await passwordInput.clear();
    await passwordInput.sendKeys("wrongpassword123");

    const submitBtn = await driver.findElement(
      By.css("[data-testid='login-submit']")
    );
    await submitBtn.click();

    const errorBox = await driver.wait(
      until.elementLocated(By.css("[data-testid='login-error']")),
      10000
    );

    const errorText = await errorBox.getText();
    assert.ok(errorText.length > 0);
  });
});