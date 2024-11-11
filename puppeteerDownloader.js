// puppeteerDownloader.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function downloadImage(url, savePath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        const contentType = await page.evaluate(() => document.contentType);
        
        if (contentType && contentType.startsWith('image')) {
            // This is a direct image URL
            const buffer = await page.screenshot(); // Capture image as buffer
            fs.writeFileSync(savePath, buffer);
        } else {
            // This is a webpage URL (like Instagram)
            const imgUrl = await page.evaluate(() => {
                // Customize for specific websites
                const imgElement = document.querySelector('img'); // Adjust as needed
                return imgElement ? imgElement.src : null;
            });

            if (imgUrl) {
                const imgPage = await browser.newPage();
                await imgPage.goto(imgUrl, { waitUntil: 'networkidle2' });
                const buffer = await imgPage.screenshot();
                fs.writeFileSync(savePath, buffer);
            } else {
                console.error("No image found on this page.");
            }
        }

        // ----------------------- Check if image is downloaded on server or not in "downloads" folder ---------------------------------
        // const stats = fs.statSync(savePath);
        // if (stats.size > 0) {
        //     console.log('Image downloaded successfully with size:', stats.size);
        // } else {
        //     console.log('File created but is empty.');
        // }


    } catch (error) {
        console.error('Error fetching image:', error);
    } finally {
        await browser.close();
    }
}


// async function downloadImage(url) {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     try {
//         await page.goto(url, { waitUntil: 'networkidle2' });
//         const contentType = await page.evaluate(() => document.contentType);

//         let buffer;

//         if (contentType && contentType.startsWith('image')) {
//             // If the URL is a direct image link
//             buffer = await page.screenshot();
//         } else {
//             // If the URL is a webpage (like Instagram)
//             const imgUrl = await page.evaluate(() => {
//                 const imgElement = document.querySelector('img'); // Adjust selector if needed
//                 return imgElement ? imgElement.src : null;
//             });

//             if (imgUrl) {
//                 const imgPage = await browser.newPage();
//                 await imgPage.goto(imgUrl, { waitUntil: 'networkidle2' });
//                 buffer = await imgPage.screenshot();
//                 await imgPage.close();
//             } else {
//                 throw new Error("No image found on this page.");
//             }
//         }

//         return buffer; // Return the buffer instead of saving it
//     } catch (error) {
//         console.error('Error fetching image:', error);
//         throw error;
//     } finally {
//         await browser.close();
//     }
// }


module.exports = { downloadImage };