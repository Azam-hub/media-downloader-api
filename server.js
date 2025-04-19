// server.js
require("dotenv").config(); // Load environment variables
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { default: axios } = require('axios');

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const JavaScriptObfuscator = require('javascript-obfuscator');

const { downloadImage } = require('./puppeteerDownloader');

const { alldown, ytdown, ndown, instagram, tikdown, twitterdown, fbdown, fbdown2, threads } = require("nayan-videos-downloader");

const app = express();


/* -------------------------- Request limiter to limit request per IP -------------------------- */
// Create a rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 100,            // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true, // Include rate limit info in response headers
    legacyHeaders: false,  // Disable the X-RateLimit-* headers
});

// Apply rate limiter to all routes
app.use(limiter);


/* ----------------------- Configuring Cors -------------------------- */

// List of allowed origins (your frontend URL)

// const allowedOrigins = ["http://localhost:3000/"];
// const allowedOrigins = [process.env.FRONTEND_DOMAIN];

const allowedOrigins = process.env.FRONTEND_DOMAINS.split(",");

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Reject the request
        }
    },
    methods: 'GET,POST', // Allow only specific HTTP methods
    allowedHeaders: 'Content-Type,Authorization', // Allow only specific headers
};

app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));



/* ----------------------- Securing routes through Key -------------------------- */
const verifyApiKey = (req, res, next) => {
    const apiKey = req.headers["authorization"];
    const validApiKey = `Bearer ${process.env.API_KEY}`; // API_KEY stored in .env

    if (apiKey !== validApiKey) {
        return res.status(403).json({ error: "Forbidden: Invalid or missing API Key" });
    }

    next();  // API key is valid, move to the route handler
};

app.get('/obfuscator', (req, res) => {
    // return res.status(400).json({ error: 'URL  is required' });
    // Read the original JavaScript file
    const code = fs.readFileSync('public/js/script.js', 'utf-8');

    // Obfuscate the JavaScript code
    const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: true,  // Makes control flow more complex
        controlFlowFlatteningThreshold: 1, // Optional: increase to make the code more obfuscated
        stringArray: true, // Convert string literals to encoded strings
        stringArrayThreshold: 0.75, // Percentage of strings to obfuscate
    }).getObfuscatedCode();

    // Write the obfuscated code to a new file
    fs.writeFileSync('public/js/obfuscated-script.js', obfuscatedCode);
});



/* ------------ Handling routes pages START --------------- */

app.set('view engine', 'ejs');
app.set('views', './public/views');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home'); // Render home.ejs
});

app.get("/youtube", (req, res) => {
    res.render('youtube')
})

app.get("/facebook", (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'facebook.html'));
    res.render('facebook')
})

app.get("/instagram", (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'instagram.html'));
    res.render('instagram')
})

app.get("/tiktok", (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'tiktok.html'));
    res.render('tiktok')
})

/* ------------ Handling routes pages END --------------- */



// --------- Dummy (testing) ------------
// app.get('/insta-download', async (req,res) => {
//     const {url, platform} = req.query;

//     if (!url) {
//         return res.status(400).json({ error: 'insta URL parameter is required' });
//     }
//     console.log(url)


//     // --------------------- ONly instagram downloader --------------------------
//     // const link = "https://www.instagram.com/p/DCIxmeWzvZ3/?utm_source=ig_web_copy_link" //past video link
//     // instagram(link).then(data => {
//     //     console.log(data)
//     // });

//     // --------------------- All downloader --------------------------
//     alldown(url).then(data => {
//         console.log(data)
//     res.json(URL)
//     });
//     // let URL = await fbdown(url)
    

//     // -------------------------------------

//     // FB Video with quality and mp3
//     // const key = "Nayan"
//     // const cookie = "61564835831481"
//     // let URL = await fbdown(url, cookie, key)


//     // Youtube mp3 thumbnail
//     // let URL = await ytdown(url)
    

//     // Insta
//     // let URL = await instagram(url)


//     // Twitter HD (720p) SD (480p)
//     // let URL = await twitterdown(url)
//     /* 
//     Response like
//     {
//         "developer": "MOHAMMAD NAYAN",
//         "devfb": "https://www.facebook.com/profile.php?id=100000959749712",
//         "devwp": "wa.me/+8801615298449",
//         "status": true,
//         "data": {
//             "HD": "https://video.twimg.com/ext_tw_video/1743351351898181632/pu/vid/avc1/810x720/gKWI2KEyLdRMQBFa.mp4?tag=12",
//             "SD": "https://video.twimg.com/ext_tw_video/1743351351898181632/pu/vid/avc1/404x360/dtDrE8AqyxXhoRhO.mp4?tag=12"
//         }
//     }
//     */

//     // tiktok mp3 thumbnail
//     // let URL = await tikdown(url)
//     // console.log(URL)




//     // const url = "link" // past url
//     // let URL = await threads(url)

//     // let URL = await ndown(url)

//     // console.log(URL)
//     // res.json(URL)

// });


/* --------------------------- Downloader for media START ---------------------- */

app.get('/image-download', verifyApiKey, async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    try {

        let lib_res;
        if (url.includes("instagr")) {
            lib_res = await instagram(url)
        } else if (url.includes("pinterest")) {
            lib_res = "pinterest"
        } else {
            lib_res = await alldown(url)                
        }

        // --------------------- All downloader from library --------------------------
        // const lib_res = await alldown(url)
        console.log(lib_res);
        
        
        if (
            (lib_res.status == true && lib_res.data.title == "Facebook" && lib_res.data.low == undefined && lib_res.data.high == undefined) || 
            (lib_res.status == false) || (lib_res == "pinterest")
        ) 
        {

            const savePath = path.join(__dirname, 'downloads', 'downloaded_image.jpg');
            try {
                await downloadImage(url, savePath);
                // res.download(savePath);

                // Send the file to the client and then delete it from the server
                res.download(savePath, 'downloaded_image.jpg', (err) => {
                    if (err) {
                        console.error('Error during download:', err);
                        res.status(500).send('Could not download the file.');
                    } else {
                        // Delete the file after sending it to the client
                        fs.unlink(savePath, (unlinkErr) => {
                            if (unlinkErr) {
                                console.error('Error deleting file:', unlinkErr);
                            } else {
                                console.log('File deleted successfully after download.');
                                // return res.status(200).json({ msg: 'Image has been downloaded' })  
                            }
                        });
                    }
                });

            } catch (error) {
                res.status(500).json({ error: 'Failed to download image' });
            }
        } else if (lib_res.status == true) {
            return res.status(200).json({ msg: 'Image has been downloaded', data: lib_res.data })   
        } else {
            return res.status(500).json({ msg: 'Failed to download image' })   
        }
    } catch (lib_err) {
        res.status(500).json({ error: 'Failed to download image' });
    }


});

app.get('/video-download', verifyApiKey, async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {

        // --------------------- All downloader from library --------------------------
        let lib_res;
        
        // console.log(url)

        let platform;
        if (url.includes("facebook.com") || url.includes("fb.com")) {
            // FB Video with quality and mp3

            // --------------------------------------------------
            // const key = "Nayan"
            // const cookie = "61564835831481"
            // lib_res = await fbdown(url, cookie, key)
            // --------------------------------------------------

            lib_res = await ndown(url)
            platform = "facebook";

            /* 
            {
                "developer": "MOHAMMAD NAYAN",
                "devfb": "https://www.facebook.com/profile.php?id=100000959749712",
                "devwp": "wa.me/+8801615298449",
                "status": true,
                "data": [
                    {
                    "resolution": "720p (HD)",
                    "thumbnail": "https://scontent-ber1-1.xx.fbcdn.net/v/t15.5256-10/455997076_526100303098605_425933060385813249_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=50ce42&_nc_ohc=nwUJvebXBP0Q7kNvgGkt5fE&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&_nc_gid=ADXqOZ-Tmk-UsOS20jHSfMa&oh=00_AYBui0k8yOZuIBsKUJpv2QzCw-7BcnqIkUT8a8RuA4UcJg&oe=673AF6E4",
                    "url": "https://d.rapidcdn.app/d?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3ZpZGVvLWJlcjEtMS54eC5mYmNkbi5uZXQvbzEvdi90Mi9mMi9tNjkvQVFNcEx0MmtwMktzOHg0Z1JnQjc1NDJtYTBaTnZFVzU4cHlpd3lZZ1BCcU9FRGpJRDFXUURNQmRqbnhEWlhFempOdDdiSjNlSXpRRTRuSkhzM3kxZkx6ei5tcDQ_ZWZnPWV5SjRjSFpmWVhOelpYUmZhV1FpT2pjMU9UazJNRFkxT1RRM05qSTNOaXdpZG1WdVkyOWtaVjkwWVdjaU9pSjRjSFpmY0hKdlozSmxjM05wZG1VdVJrRkRSVUpQVDBzdUxrTXpMamd5TUM1a1lYTm9YMmd5TmpRdFltRnphV010WjJWdU1sODNNakJ3SW4wJl9uY19odD12aWRlby1iZXIxLTEueHguZmJjZG4ubmV0Jl9uY19jYXQ9MTAzJnN0cmV4dD0xJnZzPTgxNWQwMGQ1YmQ2Yjk2NmImX25jX3ZzPUhCa3NGUUlZT25CaGMzTjBhSEp2ZFdkb1gyVjJaWEp6ZEc5eVpTOUhRVFJWVEVKMWRtOWphM1pGTUc5SFFVeGtOV2hxV2pKaVYzTXlZbTFrYWtGQlFVWVZBQUxJQVFBVkFoZzZjR0Z6YzNSb2NtOTFaMmhmWlhabGNuTjBiM0psTDBkTmVFVktRblpCTUZKNmJGZFFNR05CVG5FNVQzcExhUzB4Y3psaWNrWnhRVUZCUmhVQ0FzZ0JBQ2dBR0FBYkFvZ0hkWE5sWDI5cGJBRXhFbkJ5YjJkeVpYTnphWFpsWDNKbFkybHdaUUV4RlFBQUp1ajh0WkxFeTlrQ0ZRSW9Ba016TEJkQWV4cW43NTJ5TFJnWlpHRnphRjlvTWpZMExXSmhjMmxqTFdkbGJqSmZOekl3Y0JFQWRRSUEmY2NiPTktNCZvaD0wMF9BWUFxdTc3UHozNjgwZHJSU1hmYkJCTHFkVDQtME9EQ241VmlOYjZidERtWHh3Jm9lPTY3MzcyQ0NFJl9uY19zaWQ9MWQ1NzZkJmRsPTEiLCJmaWxlbmFtZSI6IlNuYXBzYXZlLmFwcF9BUU1wTHQya3AyS3M4eDRnUmdCNzU0Mm1hMFpOdkVXNThweWl3eVlnUEJxT0VEaklEMVdRRE1CZGpueERaWEV6ak50N2JKM2VJelFFNG5KSHMzeTFmTHp6Lm1wNCJ9.RqrlCNLUfUzt6PBwlooJ6iY3iErFoac3QTjGrUIyIDc&dl=1",
                    "shouldRender": false
                    },
                    {
                    "resolution": "360p (SD)",
                    "thumbnail": "https://scontent-ber1-1.xx.fbcdn.net/v/t15.5256-10/455997076_526100303098605_425933060385813249_n.jpg?_nc_cat=1&ccb=1-7&_nc_sid=50ce42&_nc_ohc=nwUJvebXBP0Q7kNvgGkt5fE&_nc_zt=23&_nc_ht=scontent-ber1-1.xx&_nc_gid=ADXqOZ-Tmk-UsOS20jHSfMa&oh=00_AYBui0k8yOZuIBsKUJpv2QzCw-7BcnqIkUT8a8RuA4UcJg&oe=673AF6E4",
                    "url": "https://d.rapidcdn.app/d?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3ZpZGVvLWJlcjEtMS54eC5mYmNkbi5uZXQvbzEvdi90Mi9mMi9tNjkvQVFNUkdsV1AyMmYwWHhTcTdlbFN4YW9vUlhQVExPb0xPQlZ2NmpOb3BMZkZudzR2TXZXcDZncHRJeXVacWNPbXE3cTVyNDdxU0ZLVVNuTTZuOFNySzhhNS5tcDQ_c3RyZXh0PTEmX25jX2NhdD0xMDImX25jX3NpZD04YmY4ZmUmX25jX2h0PXZpZGVvLWJlcjEtMS54eC5mYmNkbi5uZXQmX25jX29oYz1saHhqUmZsV0s3TVE3a052Z0gyNXdpcCZlZmc9ZXlKMlpXNWpiMlJsWDNSaFp5STZJbmh3ZGw5d2NtOW5jbVZ6YzJsMlpTNUdRVU5GUWs5UFN5NHVRek11TkRFd0xuTjJaVjl6WkNJc0luaHdkbDloYzNObGRGOXBaQ0k2TnpVNU9UWXdOalU1TkRjMk1qYzJMQ0oxY214blpXNWZjMjkxY21ObElqb2lkM2QzSW4wJTNEJmNjYj05LTQmX25jX3p0PTI4Jm9oPTAwX0FZQU1Bd1lfajFqb0ZzcGZ3QmdwLThmcUdwRnBxclhrN1ZEY3JsSTdxd2JFaWcmb2U9NjczQUY1REQmZGw9MSIsImZpbGVuYW1lIjoiU25hcHNhdmUuYXBwX0FRTVJHbFdQMjJmMFh4U3E3ZWxTeGFvb1JYUFRMT29MT0JWdjZqTm9wTGZGbnc0dk12V3A2Z3B0SXl1WnFjT21xN3E1cjQ3cVNGS1VTbk02bjhTcks4YTUubXA0In0.sw-KoWn9tlMrv0YTqderZBZpjwhJU11_tZlVButQlDI&dl=1",
                    "shouldRender": false
                    }
                ]
            }
            */

        } else if (url.includes("instagram.com") || url.includes("instagr.am")) {
            // Insta
            lib_res = await instagram(url)
            platform = "instagram";

            /* 
            {
                developer: 'MOHAMMAD NAYAN',
                devfb: 'https://www.facebook.com/profile.php?id=100000959749712',
                devwp: 'wa.me/+8801615298449',
                status: true,
                data: {
                    thumb: [
                    'https://d.rapidcdn.app/d?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3Njb250ZW50LXdhdzItMS5jZG5pbnN0YWdyYW0uY29tL3YvdDUxLjI5MzUwLTE1LzQ2NTU1NzE1MF85MTA5MjEwNzcxMjgzNTFfNzIzODM0MzE1MzIxMDI1NTM2MV9uLmpwZz9zdHA9ZHN0LWpwZ19lMTUmX25jX2h0PXNjb250ZW50LXdhdzItMS5jZG5pbnN0YWdyYW0uY29tJl9uY19jYXQ9MTExJl9uY19vaGM9Q2VtVEZpcFBCU0lRN2tOdmdIc0s5c1MmX25jX2dpZD00ZDkyNmQ5ZDE5YzU0MzcwYjQyMjQ4MjgyY2I4MDRiNSZlZG09QVBzMTdDVUJBQUFBJmNjYj03LTUmb2g9MDBfQVlCRW8zTnNVSUI4RlhSSmE5VUtKTzFnQ1diNlRxRHJaOTJIN2oyX2xFRm1KZyZvZT02NzNCMTNBOCZfbmNfc2lkPTEwZDEzYiIsImZpbGVuYW1lIjoiU25hcHNhdmUuYXBwXzQ2NTU1NzE1MF85MTA5MjEwNzcxMjgzNTFfNzIzODM0MzE1MzIxMDI1NTM2MV9uLmpwZyJ9.medv6xPqVOUxXIKcHOMHp9KZ8XSHVcJwht8rB7uEp6A'    
                    ],
                    video: [
                    'https://d.rapidcdn.app/d?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL3Njb250ZW50LXdhdzItMi5jZG5pbnN0YWdyYW0uY29tL28xL3YvdDE2L2YxL204Ni82NTQzQThFNzlFQTFFRDY4RTU1MDY1QkUwQjg2OTI4Q192aWRlb19kYXNoaW5pdC5tcDQ_c3RwPWRzdC1tcDQmZWZnPWV5SnhaVjluY205MWNITWlPaUpiWENKcFoxOTNaV0pmWkdWc2FYWmxjbmxmZG5SelgyOTBabHdpWFNJc0luWmxibU52WkdWZmRHRm5Jam9pZG5SelgzWnZaRjkxY214blpXNHVZMnhwY0hNdVl6SXVOekl3TG1KaGMyVnNhVzVsSW4wJl9uY19jYXQ9MTAzJnZzPTEwNjQ1MzU2OTE2MzU5MjdfMzU0NTY4ODQzNCZfbmNfdnM9SEJrc0ZRSVlVbWxuWDNod2RsOXlaV1ZzYzE5d1pYSnRZVzVsYm5SZmMzSmZjSEp2WkM4Mk5UUXpRVGhGTnpsRlFURkZSRFk0UlRVMU1EWTFRa1V3UWpnMk9USTRRMTkyYVdSbGIxOWtZWE5vYVc1cGRDNXRjRFFWQUFMSUFRQVZBaGc2Y0dGemMzUm9jbTkxWjJoZlpYWmxjbk4wYjNKbEwwZE5laTExUW5OSFlVbGpTMk5YVVVWQlNGbGFZVXhWYTBGVlVsQmljVjlGUVVGQlJoVUNBc2dCQUNnQUdBQWJBQlVBQUNiNDBxQ2p2ZU9LUUJVQ0tBSkRNeXdYUUZHaUhLd0lNU2NZRW1SaGMyaGZZbUZ6Wld4cGJtVmZNVjkyTVJFQWRmNEhBQSUzRCUzRCZjY2I9OS00Jm9oPTAwX0FZQTBKNkJqOHdSNjh6Nlh1QUZNYUIxdEdVREQxTzBTdmJEenl2cWRkYktMT2cmb2U9NjczNzAyMUImX25jX3NpZD0xMGQxM2IiLCJmaWxlbmFtZSI6IlNuYXBzYXZlLmFwcF82NTQzQThFNzlFQTFFRDY4RTU1MDY1QkUwQjg2OTI4Q192aWRlb19kYXNoaW5pdC5tcDQifQ._c5U9NG5-tSxO8CfFQ_lrfCLDQtKXZ5vlaMeOFhzjHw&dl=1'
                    ],
                    images: []
                }
            }
            */

        } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
            // Youtube mp3 thumbnail
            lib_res = await ytdown(url)
            platform = "youtube";

            /* 
            {
                developer: 'MOHAMMAD NAYAN',
                devfb: 'https://www.facebook.com/profile.php?id=100000959749712',
                devwp: 'wa.me/+8801615298449',
                status: true,
                data: {
                    title: 'Kaffara Episode 53 - [Eng Sub] - Ali Ansari - Laiba Khan - Zoya Nasir - 18th September 2024',
                    thumb: 'https://i4.ytimg.com/vi/IxjD0LR1Br0/mqdefault.jpg',
                    video: 'https://rr6---sn-uxax4vopj5qx-q0n6.googlevideo.com/videoplayback?expire=1731560885&ei=VTE1Z_D3EeXLi9oP5oSc4Qg&ip=176.1.225.138&id=o-ADJe-_y_5qbH-GwLLwD923Rhmi_SpO6IUxNcjTE8Bp2p&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1731539285%2C&mh=Cs&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5edn6k&ms=au%2Crdu&mv=m&mvi=6&pl=18&rms=au%2Cau&initcwndbps=1453750&bui=AQn3pFT4wPl7YqzPhWYcUfNsMAEhzEUl2M4VCexb1_6ttsNrby6RfPw3Q_XIv7Ry-9cPcNRwKm368c1t&spc=qtApAZNEdOHn6EL8xeF9OD1k6PYANdlypUooB0Mjz9Pgi5Ve26TY&vprv=1&svpuc=1&mime=video%2Fmp4&ns=c6FTVCcgX3THWxg6wLSC2kgQ&rqh=1&gir=yes&clen=120756401&ratebypass=yes&dur=1940.282&lmt=1727722228073276&mt=1731538624&fvip=3&fexp=51299154%2C51312688%2C51326932&c=WEB&sefc=1&txp=5538434&n=m9MJEguMPIw5yQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAPkE-taHeZYPURIHHOctS-IilKPgUt2Bieh-OKoY5mMrAiEAxFrYioIcs2fB_kFGyDwlGmoJuZDw7IcgewHBoTCirYY%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgN-hbHW7FzwSav4-3gjQs6UsJTqV388hnkbI98b448X4CIQCwxP5_6WKDm0poxGFBFySrGB77PZFGx3JiJW2nG2oy4A%3D%3D',
                    video_hd: 'https://rr6---sn-uxax4vopj5qx-q0n6.googlevideo.com/videoplayback?expire=1731560885&ei=VTE1Z_D3EeXLi9oP5oSc4Qg&ip=176.1.225.138&id=o-ADJe-_y_5qbH-GwLLwD923Rhmi_SpO6IUxNcjTE8Bp2p&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1731539285%2C&mh=Cs&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5edn6k&ms=au%2Crdu&mv=m&mvi=6&pl=18&rms=au%2Cau&initcwndbps=1453750&bui=AQn3pFT4wPl7YqzPhWYcUfNsMAEhzEUl2M4VCexb1_6ttsNrby6RfPw3Q_XIv7Ry-9cPcNRwKm368c1t&spc=qtApAZNEdOHn6EL8xeF9OD1k6PYANdlypUooB0Mjz9Pgi5Ve26TY&vprv=1&svpuc=1&mime=video%2Fmp4&ns=c6FTVCcgX3THWxg6wLSC2kgQ&rqh=1&gir=yes&clen=120756401&ratebypass=yes&dur=1940.282&lmt=1727722228073276&mt=1731538624&fvip=3&fexp=51299154%2C51312688%2C51326932&c=WEB&sefc=1&txp=5538434&n=m9MJEguMPIw5yQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAPkE-taHeZYPURIHHOctS-IilKPgUt2Bieh-OKoY5mMrAiEAxFrYioIcs2fB_kFGyDwlGmoJuZDw7IcgewHBoTCirYY%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgN-hbHW7FzwSav4-3gjQs6UsJTqV388hnkbI98b448X4CIQCwxP5_6WKDm0poxGFBFySrGB77PZFGx3JiJW2nG2oy4A%3D%3D',
                    audio: 'https://rr6---sn-uxax4vopj5qx-q0n6.googlevideo.com/videoplayback?expire=1731560885&ei=VTE1Z_D3EeXLi9oP5oSc4Qg&ip=176.1.225.138&id=o-ADJe-_y_5qbH-GwLLwD923Rhmi_SpO6IUxNcjTE8Bp2p&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1731539285%2C&mh=Cs&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5edn6k&ms=au%2Crdu&mv=m&mvi=6&pl=18&rms=au%2Cau&initcwndbps=1453750&bui=AQn3pFTyfslzzXncAHR6oJ0BYtWY9UXZI-gX0iSWwmhlF4qomU4hH75BYcuumiqisqc9iTyBYisxM8hE&spc=qtApAZNHdOHn6EL8xeF9OD1k6PYANdlypUooB0Mjz9Pgi5Vu3g&vprv=1&svpuc=1&xtags=drc%3D1&mime=audio%2Fmp4&ns=5KYZdBhi8snOaMs3okqyu_4Q&rqh=1&gir=yes&clen=31402546&dur=1940.282&lmt=1727714759812677&mt=1731538624&fvip=3&keepalive=yes&fexp=51299154%2C51312688%2C51326932&c=WEB&sefc=1&txp=5532434&n=KyFa-CTq_0QbVQ&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cxtags%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAJ50FWLeId71YT-SCkJA3nwD4B4qJQoIC8wCNmXaYpdpAiA2ssdUITcibr-ZBhkFfeaWttiXTSbLUNQqDDH8JStWCw%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRQIgN-hbHW7FzwSav4-3gjQs6UsJTqV388hnkbI98b448X4CIQCwxP5_6WKDm0poxGFBFySrGB77PZFGx3JiJW2nG2oy4A%3D%3D',
                    quality: '360p/720p',
                    channel: 'Not available',
                    desc: 'Thanks for watching Har Pal Geo. Please click here https://bit.ly/3rCBCYN to Subscribe and hit the bell icon to enjoy Top Pakistani Dramas and satisfy all your entertainment needs. Do you know Har Pal Geo is now available in the US? Share the News. Spread the word.\n' +
                    '
                }
                }
            */

        } else if (url.includes("twitter.com")) {
            // Twitter HD (720p) SD (480p)
            lib_res = await twitterdown(url)
            platform = "twitter";

            /* 
            Response like
            {
                "developer": "MOHAMMAD NAYAN",
                "devfb": "https://www.facebook.com/profile.php?id=100000959749712",
                "devwp": "wa.me/+8801615298449",
                "status": true,
                "data": {
                    "HD": "https://video.twimg.com/ext_tw_video/1743351351898181632/pu/vid/avc1/810x720/gKWI2KEyLdRMQBFa.mp4?tag=12",
                    "SD": "https://video.twimg.com/ext_tw_video/1743351351898181632/pu/vid/avc1/404x360/dtDrE8AqyxXhoRhO.mp4?tag=12"
                }
            }
            */

        } else if (url.includes("tiktok.com")) {
            // tiktok mp3 thumbnail
            lib_res = await tikdown(url)
            platform = "tiktok";

            /* 
            {
                developer: 'MOHAMMAD NAYAN',
                devfb: 'https://www.facebook.com/profile.php?id=100000959749712',
                devwp: 'wa.me/+8801615298449',
                status: true,
                data: {
                    author: {
                    id: '6544200040427033615',
                    unique_id: 'minahilmalik727',
                    nickname: 'minahil malik',
                    avatar: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/bf053ee9bbbbe810181e91733f02a33b~tplv-tiktokx-cropcenter:300:300.jpeg?dr=14577&nonce=93954&refresh_token=5463d31390d7619ced5492c85365b2bf&x-expires=1731628800&x-signature=0Wg4vGpNq79wHmEmhLQ%2BKkE1Ly8%3D&idc=maliva&ps=13740610&shcp=d05b14bd&shp=45126217&t=4d5b0474'
                    },
                    view: 665409,
                    comment: 12233,
                    play: 15513233,
                    share: 12312,
                    download: 34452,
                    duration: 40,
                    title: '',
                    video: 'https://v16m-default.akamaized.net/7532db0ed7720acdc0ef3f3aeb53a73c/67359964/video/tos/maliva/tos-maliva-ve-0068c799-us/o4A0AFKhzi8DGCAQIziBwAfrEdkUwin2BpIyGI/?a=0&bti=OTg7QGo5QHM6OjZALTAzYCMvcCMxNDNg&ch=0&cr=0&dr=0&er=0&lr=all&net=0&cd=0%7C0%7C0%7C0&cv=1&br=1404&bt=702&cs=0&ds=6&ft=XE5bCqT0majPD12wJmBJ3wUOx5EcMeF~O5&mime_type=video_mp4&qs=4&rc=Nzo4ODVoOTw3PDozNjxmOEBpamR2Z2o5cnM0djMzZzczNEAuMDFfYTQ2NjQxX19fX2I2YSNpYGgwMmRjLzFgLS1kMS9zcw%3D%3D&vvpl=1&l=20241114003123241A6C5D6765BF03EDAA&btag=e00088000',
                    audio: 'https://sf16-ies-music-va.tiktokcdn.com/obj/ies-music-ttp-dup-us/7424205973356628779.mp3',
                    images: undefined
                }
                }
            */

        } else {
            lib_res = await alldown(url)
            platform = "different";
        }
        
        console.log(lib_res);
        
        if (lib_res.status == true) {
            return res.status(200).json({ msg: 'Video has been downloaded', platform: platform, data: lib_res.data })   
        } else {
            return res.status(500).json({ error: 'Failed to download video', msg: lib_res.msg, err: lib_res.error,  })   
        }
    } catch (lib_err) {
        res.status(500).json({ error: 'Failed to download video' });
    }
})

/* --------------------------- Downloader for media END ---------------------- */



/* --------------------------- Make sure that video or image will be download instead open in browser ---------------------- */

app.get('/forced-download-image', (req, res) => {
    const { url } = req.query;
    
    https.get(url, (imageRes) => {
        res.setHeader('Content-Disposition', 'attachment; filename="downloaded_image.jpg"');
        imageRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching the image:', err);
        // res.status(500).send('Failed to download image.');
        res.status(500).json({ msg: 'Failed to download image' })   
    });
});

app.get('/forced-download-video', async (req, res) => {
    // const { url } = req.query
    // if (!url) {
    //     return res.status(400).json({ error: 'URL parameter is required' });
    // }
    // const decodedUrl = decodeURIComponent(url);
    
    // try {
    //     // Fetch the video stream from the remote server
    //     const response = await axios.get(decodedUrl, { responseType: 'stream' });

    //     // Set headers to force download
    //     res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    //     res.setHeader('Content-Type', 'video/mp4');

    //     // Pipe the video stream to the response
    //     response.data.pipe(res);
    // } catch (error) {
    //     console.error('Error downloading video:', error);
    //     res.status(500).send('An error occurred while downloading the video.');
    // }

    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter are required' });
    }
    const decodedUrl = decodeURIComponent(url);

    try {
        // Fetch the video stream from the remote server
        const response = await axios.get(decodedUrl, { responseType: 'stream' });

        // Set headers to force download
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');

        // Pipe the video stream to the response
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('An error occurred while downloading the video.');
    }
});

app.get('/forced-download-audio', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Parameter are required' });
    }
    const decodedUrl = decodeURIComponent(url);

    try {
        // Fetch the video stream from the remote server
        const response = await axios.get(decodedUrl, { responseType: 'stream' });

        // Set headers to force download
        res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
        res.setHeader('Content-Type', 'audio/mpeg');


        // Pipe the video stream to the response
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).send('An error occurred while downloading the video.');
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


