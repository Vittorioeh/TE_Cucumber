import { expect } from "chai";
import { Builder, By, until } from "selenium-webdriver";
import { When, Then, Given, setDefaultTimeout } from "@cucumber/cucumber";

setDefaultTimeout(30000);

let driver;

// Step Pertama
Given("the user is on the login page", async function () {
    driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://www.saucedemo.com/");
    await driver.wait(until.elementLocated(By.id("login-button")), 10000);
});

// Skenario: Gagal Login 
When("the user enters an invalid username and password", async function () {
    await driver.findElement(By.id("user-name")).sendKeys("invalid_user");
    await driver.findElement(By.id("password")).sendKeys("wrong_password");
});

When("the user clicks the login button", async function () {
    await driver.findElement(By.id("login-button")).click();
});

Then("the user should see a failed message", async function () {
    const errorMessage = await driver
        .wait(until.elementLocated(By.css('[data-test="error"]')), 5000)
        .getText();
    expect(errorMessage).to.include("Username and password do not match");
    await driver.quit();
});

// Skenario: Menambahkan Item ke Keranjang
Given("the user is on the item page", async function () {
    await driver.findElement(By.id("user-name")).sendKeys("standard_user");
    await driver.findElement(By.id("password")).sendKeys("secret_sauce");
    await driver.findElement(By.id("login-button")).click();
    await driver.wait(until.elementLocated(By.className("inventory_list")), 5000);
});

When("the user add item to the cart", async function () {
    await driver.findElement(By.id("add-to-cart-sauce-labs-backpack")).click();
});

Then("item should be seen in the item page", async function () {
    const cartBadge = await driver.findElement(By.className("shopping_cart_badge")).getText();
    expect(cartBadge).to.equal("1");
    await driver.quit();
});

// Skenario: Menghapus Item dari Keranjang
When("the user remove item to the cart", async function () {
    await driver.findElement(By.id("remove-sauce-labs-backpack")).click();
});

Then("item shouldn't be seen in the item page", async function () {
    const cartBadge = await driver.findElements(By.className("shopping_cart_badge"));
    expect(cartBadge.length).to.equal(0);
    await driver.quit();
});

// Skenario: Proses Checkout
When("the user proceeds to checkout", async function () {
    await driver.wait(until.elementLocated(By.css('.shopping_cart_link')), 10000).click();
    await driver.wait(until.elementLocated(By.id('checkout')), 10000).click();
    // Wait for checkout form to be visible
    await driver.wait(until.elementLocated(By.id('first-name')), 15000);
});
  
When("the user fills checkout information", async function () {
    try {
      // Menunggu tiap field bisa berinteraksi
      const firstName = await driver.wait(until.elementLocated(By.id('first-name')), 15000);
      await firstName.sendKeys("John");
      
      await driver.wait(until.elementLocated(By.id('last-name')), 5000).sendKeys("Doe");
      await driver.wait(until.elementLocated(By.id('postal-code')), 5000).sendKeys("12345");
      
      // Scroll ke Continue Button
      const continueBtn = await driver.wait(until.elementLocated(By.id('continue')), 5000);
      await driver.executeScript("arguments[0].scrollIntoView(true);", continueBtn);
      await continueBtn.click();
    } catch (error) {
      // Ambil screenshot dari error yg ada
      const screenshot = await driver.takeScreenshot();
      fs.writeFileSync('checkout-error.png', screenshot, 'base64');
      throw error;
    }
});

When("the user completes the checkout", async function () {
    // menambah waktu tunggu hingga button dapat di klik
    await driver.wait(until.elementLocated(By.id('finish')), 10000);
    await driver.findElement(By.id('finish')).click();
});

Then("the user should see the checkout complete page", async function () {
    const completeHeader = await driver
      .wait(until.elementLocated(By.className("complete-header")), 5000)
      .getText();
    expect(completeHeader.trim().toUpperCase()).to.equal("THANK YOU FOR YOUR ORDER!");
    await driver.quit();
});

// Skenario: Sorting Item
When("the user sorts items by price low to high", async function () {
    // Menunggu sort dropdown dapat digunakan
    const sortDropdown = await driver.wait(
      until.elementLocated(By.className("product_sort_container")),
      10000
    );
    
    // Memilih Opsi "Price (low to high)" dari text yg terlihat
    await sortDropdown.click();
    await driver.findElement(By.xpath("//option[contains(text(),'Price (low to high)')]")).click();
    
    // Menunggu Proses Sorting
    await driver.sleep(2000);
});
  
Then("the items should be displayed in ascending price order", async function () {
    // Mendapatkan semua elemen harga
    const priceElements = await driver.findElements(By.className("inventory_item_price"));
    const prices = [];
    
    // ekstraksi dan konversi harga
    for (const element of priceElements) {
      const priceText = await element.getText();
      prices.push(parseFloat(priceText.replace('$', '')));
    }
    
    // verifikasi sorting
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i] > prices[i + 1]) {
        throw new Error(`Prices not properly sorted: ${prices[i]} > ${prices[i + 1]} at position ${i}`);
      }
    }
    
    await driver.quit();
});