const assert = require("assert");
const { By, until } = require("selenium-webdriver");
const { buildDriver } = require("../../selenium/driver.cjs");

describe("Notebook save", function () {
  this.timeout(45000);

  let driver;

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it("saves notebook content and keeps it after refresh", async () => {
    const noteText = `Test note ${Date.now()}`;

    await driver.get("http://localhost:5173/login");

    await driver.wait(until.elementLocated(By.css("[data-testid='login-email']")), 10000);
    await driver.findElement(By.css("[data-testid='login-email']")).sendKeys("manitha20030809@gmail.com");

    await driver.findElement(By.css("[data-testid='login-password']")).sendKeys(".Ms501931");
    await driver.findElement(By.css("[data-testid='login-submit']")).click();

    await driver.wait(until.urlContains("/dashboard"), 10000);

    const moduleCard = await driver.wait(
      until.elementLocated(By.css("[data-testid='module-card']")),
      10000
    );
    await driver.wait(until.elementIsVisible(moduleCard), 10000);
    await moduleCard.click();

    await driver.wait(until.urlContains("/modules/"), 10000);
    
    const moduleMaterialCard = await driver.wait(
      until.elementLocated(By.css("[data-testid='module-material-button']")),
      10000
    );
    await driver.wait(until.elementIsVisible(moduleMaterialCard), 10000);
    await moduleMaterialCard.click();

    const editor = await driver.wait(
      until.elementLocated(By.css("[data-testid='notebook-editor']")),
      10000
    );
    await driver.wait(until.elementIsVisible(editor), 10000);

    await editor.clear();
    await editor.sendKeys(noteText);

    const saveButton = await driver.wait(
      until.elementLocated(By.css("[data-testid='notebook-save']")),
      10000
    );
    await driver.wait(until.elementIsVisible(saveButton), 10000);
    await saveButton.click();

    await driver.sleep(2000);
    await driver.navigate().refresh();

    const editorAfterRefresh = await driver.wait(
      until.elementLocated(By.css("[data-testid='notebook-editor']")),
      10000
    );
    await driver.wait(until.elementIsVisible(editorAfterRefresh), 10000);

    await driver.wait(async () => {
      const value = await editorAfterRefresh.getAttribute("value");
      const text = await editorAfterRefresh.getText();
      return (
        (value && value.includes(noteText)) ||
        (text && text.includes(noteText))
      );
    }, 10000);

    const savedValue = await editorAfterRefresh.getAttribute("value");
    const savedText = await editorAfterRefresh.getText();

    assert.ok(
      (savedValue && savedValue.includes(noteText)) ||
        (savedText && savedText.includes(noteText)),
      "Saved note should still exist after refresh"
    );
  });
});