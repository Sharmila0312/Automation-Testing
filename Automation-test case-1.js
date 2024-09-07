const { Builder } = require('selenium-webdriver')
const fs = require('fs')
const path = require('path')

const devices = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Desktop', width: 1366, height: 768 },
    { name: 'Desktop', width: 1536, height: 864 },
    { name: 'Mobile', width: 360, height: 640 },
    { name: 'Mobile', width: 414, height: 896 },
    { name: 'Mobile', width: 375, height: 667 }
]

const browsers = ['chrome', 'firefox']

const createDriver = (browserName) => {
    return new Builder().forBrowser(browserName).build()
}

const captureFullPageScreenshot = async (driver, url, device, folderPath) => {
    await driver.get(url)

    await driver.manage().window().setRect({ width: device.width, height: device.height })

    const fullPageHeight = await driver.executeScript('return document.body.scrollHeight')
    await driver.manage().window().setRect({ width: device.width, height: fullPageHeight })

    const screenshot = await driver.takeScreenshot()
    const fileName = `${url.replace(/[^\w]/g, '_')}-${Date.now()}.png`
    fs.writeFileSync(path.join(folderPath, fileName), screenshot, 'base64')
}

const createFolderStructure = (browserName, device) => {
    const folderPath = path.join(__dirname, 'screenshots', browserName, device.name, `${device.width}x${device.height}`)
    fs.mkdirSync(folderPath, { recursive: true })
    return folderPath
}

const runScreenshotTests = async (urls) => {
    for (let browserName of browsers) {
        for (let device of devices) {
            let driver = await createDriver(browserName)

            try {
                for (let url of urls) {
                    const folderPath = createFolderStructure(browserName, device)
                    await captureFullPageScreenshot(driver, url, device, folderPath)
                }
            } catch (error) {
                console.error(`Error in ${browserName} on device ${device.name}:`, error)
            } finally {
                await driver.quit()
            }
        }
    }
}

const urls = [
    "https://www.getcalley.com/",
    "https://www.getcalley.com/calley-lifetime-offer/",
    "https://www.getcalley.com/see-a-demo/",
    "https://www.getcalley.com/calley-teams-features/",
    "https://www.getcalley.com/calley-pro-features/"
]

runScreenshotTests(urls)