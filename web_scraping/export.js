const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

async function downloadFile(page, url, downloadPath, newFileName) {
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    await page.goto(url, { waitUntil: 'load' });
    console.log(`🔗 Navigated to: ${url}`);

    await page.waitForSelector('#DataDownload', { timeout: 15000 });
    await page.click('#DataDownload');

    await page.waitForSelector('ul#dropDownFileFormat li.excel a', { timeout: 15000 });
    await page.click('ul#dropDownFileFormat li.excel a');

    console.log(`✅ Triggered download for: ${newFileName}`);

    const fileName = await waitForDownload(downloadPath, '.xlsx');
    fs.renameSync(path.join(downloadPath, fileName), path.join(downloadPath, newFileName));
    console.log(`📁 Downloaded and renamed to: ${newFileName}`);
}

const waitForDownload = async (dir, ext) => {
    let filename;
    while (!filename) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const files = fs.readdirSync(dir);
        const downloading = files.some(f => f.endsWith('.crdownload'));
        const completedFiles = files.filter(f => f.endsWith(ext));

        if (!downloading && completedFiles.length > 0) {
            filename = completedFiles
                .map(f => ({
                    name: f,
                    time: fs.statSync(path.join(dir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)[0].name;
        }
    }
    return filename;
};

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // ✅ Use the shared volume folder inside the container
    const downloadPath = '/downloads-export';

    // Clean up contents but keep the folder (because it's a mounted volume)
    if (fs.existsSync(downloadPath)) {
        const files = fs.readdirSync(downloadPath);
        for (const file of files) {
            const filePath = path.join(downloadPath, file);
            try {
                fs.rmSync(filePath, { recursive: true, force: true });
            } catch (err) {
                console.warn(`⚠️ Could not delete ${filePath}: ${err.message}`);
            }
        }
    } else {
        fs.mkdirSync(downloadPath, { recursive: true });
    }


    const country_codes = ["AFG"];
    const years = range(2005, 2022);

    const products = [
        "01-05_Animal", "06-15_Vegetable", "16-24_FoodProd",
        "25-26_Minerals", "27-27_Fuels", "28-38_Chemicals",
        "39-40_PlastiRub", "41-43_HidesSkin", "44-49_Wood",
        "50-63_TextCloth", "64-67_Footwear", "68-71_StoneGlas",
        "72-83_Metals", "84-85_MachElec", "86-89_Transport",
        "90-99_Miscellan", "Total"
    ];

    const urls = country_codes.flatMap(country_code =>
        years.flatMap(year =>
            products.map(product_code => ({
                url: `https://wits.worldbank.org/CountryProfile/en/Country/${country_code}/Year/${year}/TradeFlow/Export/Partner/by-country/Product/${product_code}`,
                fileName: `${country_code}_${year}_${product_code}.xlsx`
            }))
        )
    );

    const page = await browser.newPage();

    for (let idx = 0; idx < urls.length; idx++) {
        const { url, fileName } = urls[idx];
        await downloadFile(page, url, downloadPath, fileName);
        await delay(1000);
    }

    await browser.close();
    console.log("✅ All files downloaded and saved to /downloads-export!");
})();
