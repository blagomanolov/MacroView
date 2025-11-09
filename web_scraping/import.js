const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create a range helper
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

    const downloadPath = path.resolve('./downloads_import');

    if (fs.existsSync(downloadPath)) {
        fs.rmSync(downloadPath, { recursive: true, force: true });
    }
    fs.mkdirSync(downloadPath, { recursive: true });

    // "AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS",
    //     "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", 

    // const country_codes = [
    //     "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES",
    //     "BIH", "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR", "CAN", "CPV", "CYM",
    //     "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV",
    //     "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST",
    //     "SWZ", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", "GEO", "DEU",
    //     "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD",
    //     "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM",
    //     "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO",
    //     "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ",
    //     "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM",
    //     "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", "NIU", "NFK", "MKD", "MNP", "NOR", "OMN",
    //     "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU",
    //     "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", "WSM", "SMR", "STP", "SAU",
    //     "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP",
    //     "LKA", "SDN", "SUR", "SJM", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL",
    //     "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY",
    //     "UZB", "VUT", "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"
    // ];
    // NEXT IS : CMR
    const country_codes = ["AGO"]


    const years = range(2005, 2022);

    const products = [
        "01-05_Animal",
        "06-15_Vegetable",
        "16-24_FoodProd",
        "25-26_Minerals",
        "27-27_Fuels",
        "28-38_Chemicals",
        "39-40_PlastiRub",
        "41-43_HidesSkin",
        "44-49_Wood",
        "50-63_TextCloth",
        "64-67_Footwear",
        "68-71_StoneGlas",
        "72-83_Metals",
        "84-85_MachElec",
        "86-89_Transport",
        "90-99_Miscellan",
        "Total"
    ];

    // Generate URLs for every combination of country, year, and product
    const urls = country_codes.flatMap(country_code =>
        years.flatMap(year =>
            products.map(product_code =>
            ({
                url: `https://wits.worldbank.org/CountryProfile/en/Country/${country_code}/Year/${year}/TradeFlow/Import/Partner/by-country/Product/${product_code}`,
                fileName: `${country_code}_${year}_${product_code}.xlsx`
            })
            )
        )
    );

    const page = await browser.newPage();

    for (let idx = 0; idx < urls.length; idx++) {
        const { url, fileName } = urls[idx];
        await downloadFile(page, url, downloadPath, fileName);
        await delay(1000);
    }

    await browser.close();
    console.log("All files downloaded and renamed successfully!");
})();
