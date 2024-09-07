const { Builder, By, until, error } = require('selenium-webdriver')
const fs = require('fs')
const path = require('path')

const handleAlert = async (driver) => {
    try {
        let alert = await driver.switchTo().alert()
        await alert.accept()
        await driver.sleep(2000)
    } catch (e) {
        if (e instanceof error.NoSuchAlertError) {
        } else {
            throw e
        }
    }
}

const functionalTest = async () => {
    const driver = await new Builder().forBrowser('chrome').build()
    const screenshotPath = path.resolve(__dirname, 'output-screenshot.png')

    try {
        await driver.manage().window().setRect({ width: 1920, height: 1080 })

        await driver.get('https://demo.dealsdray.com/')

        await driver.findElement(By.name('username')).sendKeys('prexo.mis@dealsdray.com')
        await driver.findElement(By.name('password')).sendKeys('prexo.mis@dealsdray.com')
        await driver.findElement(By.css('button[type="submit"]')).click()

        await driver.wait(until.urlIs('https://demo.dealsdray.com/mis/dashboard'), 15000)

        await driver.get('https://demo.dealsdray.com/mis/orders/bulk-import')
        await driver.sleep(3000)

        const fileInput = await driver.findElement(By.css('input[type="file"]'))
        const filePath = path.resolve(__dirname, 'demo-data.xlsx')
        await fileInput.sendKeys(filePath)

        await driver.wait(until.elementLocated(By.css('.css-6aomwy')), 10000)
        await driver.executeScript("document.querySelector('.css-6aomwy').click()")

        await driver.wait(until.elementLocated(By.css('.css-6aomwy')), 10000)
        await driver.executeScript("document.querySelector('.css-6aomwy').click()")

        await driver.sleep(3000)

        await handleAlert(driver)

        try {
            const screenshot = await driver.takeScreenshot()
            fs.writeFileSync(screenshotPath, screenshot, 'base64')
        } catch (screenshotError) {
            console.error('Error taking screenshot after handling alert:', screenshotError)
        }

    } catch (err) {
        if (err instanceof error.UnexpectedAlertOpenError) {
            try {
                await handleAlert(driver)

                try {
                    const screenshot = await driver.takeScreenshot()
                    fs.writeFileSync(screenshotPath, screenshot, 'base64')
                    console.log(`Screenshot saved to ${screenshotPath} after handling alert.`)
                } catch (screenshotError) {
                    console.error('Unable to take screenshot after handling alert:', screenshotError.message)
                }
            } catch (innerErr) {
                console.error('Error handling alert:', innerErr)
            }
        } else {
            console.error('Something went wrong', err)
        }
    } finally {
        await driver.quit()
    }
}

functionalTest()