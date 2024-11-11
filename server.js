// server.js
const express = require('express');
const { downloadImage } = require('./puppeteerDownloader');
const path = require('path');
const fs = require('fs');
const https = require('https');


// const { ndown } = require("nayan-media-downloader")
const {alldown} = require("nayan-media-downloader");
// const { twitterdown } = require("nayan-media-downloader")
const {instagram} = require("nayan-media-downloader");




const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/image-download', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {

        let lib_res;
        if (url.includes("instagr")) {
            lib_res = await instagram(url)
        } else {
            lib_res = await alldown(url)
        }

        // --------------------- All downloader from library --------------------------
        // const lib_res = await alldown(url)
        console.log(lib_res);
        
        
        if (
            (lib_res.status == true && lib_res.data.title == "Facebook" && lib_res.data.low == undefined && lib_res.data.high == undefined) || 
            (lib_res.status == false && lib_res.error == "Unsupported URL")
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


    // const savePath = path.join(__dirname, 'downloads', 'downloaded_image.jpg');
    // try {
    //     await downloadImage(url, savePath);
    //     // res.download(savePath);

    //     // Send the file to the client and then delete it from the server
    //     res.download(savePath, 'downloaded_image.jpg', (err) => {
    //         if (err) {
    //             console.error('Error during download:', err);
    //             res.status(500).send('Could not download the file.');
    //         } else {
    //             // Delete the file after sending it to the client
    //             fs.unlink(savePath, (unlinkErr) => {
    //                 if (unlinkErr) {
    //                     console.error('Error deleting file:', unlinkErr);
    //                 } else {
    //                     console.log('File deleted successfully after download.');
    //                 }
    //             });
    //         }
    //     });

    // } catch (error) {
    //     res.status(500).json({ error: 'Failed to download image' });
    // }
});

app.get('/video-download', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {

        // --------------------- All downloader from library --------------------------
        // const lib_res = await alldown(url)
        let lib_res;
        if (url.includes("instagr")) {
            lib_res = await instagram(url)
        } else {
            lib_res = await alldown(url)
        }
        
        if (lib_res.status == true) {
            return res.status(200).json({ msg: 'Video has been downloaded', data: lib_res.data })   
        } else {
            return res.status(500).json({ msg: 'Failed to download video' })   
        }
    } catch (lib_err) {
        res.status(500).json({ error: 'Failed to download video' });
    }
})


app.get('/insta-download', async (req,res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: 'insta URL parameter is required' });
    }
    console.log(url)


    // --------------------- ONly instagram downloader --------------------------
    // const link = "https://www.instagram.com/p/DCIxmeWzvZ3/?utm_source=ig_web_copy_link" //past video link
    // instagram(link).then(data => {
    //     console.log(data)
    // });

    // --------------------- All downloader --------------------------
    alldown(url).then(data => {
        console.log(data)
    });

});


app.get('/forced-download-image', (req, res) => {
    const { url } = req.query;
    
    https.get(url, (imageRes) => {
        res.setHeader('Content-Disposition', 'attachment; filename="downloaded_image.jpg"');
        imageRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching the image:', err);
        res.status(500).send('Failed to download image.');
    });
});

// app.get('/forced-download-video', (req, res) => {
//     // const videoUrl = 'https://your-video-url.com/video.mp4';
//     const { url } = req.query;
    

//     https.get(url, (videoRes) => {
//         res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
//         res.setHeader('Content-Type', 'video/mp4');
//         videoRes.pipe(res);
//     }).on('error', (err) => {
//         console.error('Error fetching the video:', err);
//         res.status(500).send('Failed to download video.');
//     });
// });

app.get('/download-video', (req, res) => {
    const {url} = req.query;
    

    https.get(url, (videoRes) => {
        // Set the appropriate headers for video content
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Content-Type', 'video/mp4');
        
        // Pipe the video stream to the response
        videoRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching the video:', err);
        res.status(500).send('Failed to download video.');
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




// Workiung

// const savePath = path.join(__dirname, 'downloads', 'downloaded_image.jpg');
// try {
//     await downloadImage(url, savePath);
//     // res.download(savePath);

//     // Send the file to the client and then delete it from the server
//     res.download(savePath, 'downloaded_image.jpg', (err) => {
//         if (err) {
//             console.error('Error during download:', err);
//             res.status(500).send('Could not download the file.');
//         } else {
//             // Delete the file after sending it to the client
//             fs.unlink(savePath, (unlinkErr) => {
//                 if (unlinkErr) {
//                     console.error('Error deleting file:', unlinkErr);
//                 } else {
//                     console.log('File deleted successfully after download.');
//                 }
//             });
//         }
//     });

// } catch (error) {
//     res.status(500).json({ error: 'Failed to download image' });
// }

// and 

// alldown(url).then(data => {
//     console.log(data)
// });