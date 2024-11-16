const app_url = "http://localhost:3000/";



if ($("#element").length != 0) {
    var typed = new Typed('#element', {
        strings: ['Facebook', 'Instagram', 'YouTube', 'Twitter', 'TikTok', 'Pinterest', 'Likee', "All Social Media"],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1500,
        smartBackspace: false, 
    });
    
}

$(document).on("click", ".bars", function () {
    console.log($("header").css("height"));

    if ($("header").css("height") == "56px") {
        $("header").css("height", "fit-content")
    } else {
        $("header").css("height", "56px")
    }
    
})

function checkImageLoad(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = url;                         // Start loading the image
        img.onload = () => resolve(true);      // Image loaded successfully
        img.onerror = () => resolve(false);    // Image failed to load
    });
}

async function checkImagesAndReorder(thumbArray, maxRetries = 2) {
    const retryCount = {};  // Track retry attempts per URL

    for (let i = 0; i < thumbArray.length; i++) {
        const url = thumbArray[i];
        
        const isLoaded = await checkImageLoad(url);
        if (!isLoaded) {
            // Initialize or increment retry count for this URL
            retryCount[url] = (retryCount[url] || 0) + 1;

            if (retryCount[url] <= maxRetries) {
                // Move the failed URL to the end of the array
                thumbArray.push(...thumbArray.splice(i, 1));
                i--; // Adjust index to recheck the new image at current position
            } else {
                console.warn(`Image at ${url} failed to load after ${maxRetries} retries.`);
            }
        }
    }
    return thumbArray;
}

$("form").submit(async function (e) {
    e.preventDefault();

    // Showing preview div
    if ($("#preview").hasClass("hidden")) {
        $("#preview").removeClass("hidden")
    }
    
    // send to preview div
    const targetDiv = document.getElementById("preview");
    targetDiv.scrollIntoView({ behavior: "smooth" });

    // Set loading at preview
    $("#preview").html(`<div class="flex flex-col items-center gap-5">
                        <img src="../src/loading_3.gif" class="w-24" alt="Loading GIF">
                        Please wait. It may take some time to fetch...
                    </div>`)

    
    let form = $(this)[0]

    // Button loading handle (Showing)
    $(form).find(".loading-gif").removeClass("hidden")
    $(form).find(".loading-gif").addClass("inline")
    // GEt url to download
    let toDownloadUrl = $(form).find(".url").val()

    // Checking if url is empty or not
    if (toDownloadUrl == "") {
        console.log("Please enter Link");
    } else {
        console.log(toDownloadUrl);
        
        // Setting api URL
        let apiUrl;        
        if (form.id == "img-form") {
            apiUrl = `${app_url}image-download?url=${toDownloadUrl}`
            // console.log("api url definde");
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                // Button loading handle (hiding)
                $(form).find(".loading-gif").removeClass("inline")
                $(form).find(".loading-gif").addClass("hidden")
    
        
                // Check if the response is JSON (e.g., when there’s an error message)
                const contentType = response.headers.get('content-type');
                
                // if response is in json rather than a download 
                if (contentType && contentType.includes('application/json')) {
    
                    const jsonResponse = await response.json();
    
                    console.log(jsonResponse);
                    
                    let html = "";
    
                    // if response is of instagram 
                    if (jsonResponse.data.thumb) {
                        
                        checkImagesAndReorder(jsonResponse.data.thumb).then((reorderedArray) => {
                            
    
                            if (jsonResponse.data.images.length > 0 && jsonResponse.data.video.length > 0) {
        
                                for (let i = 0; i < jsonResponse.data.images.length; i++) {
                                    // let thumbnail = jsonResponse.data.thumb[i]
                                    let thumbnail = reorderedArray[i]
                                    let img_link = jsonResponse.data.images[i]
                                    html += `
                                    <div class="box">
                                        <img src="${thumbnail}" alt="">
                                        <a href="${img_link}">Download</a>
                                    </div>
                                    `;
                                }
        
        
                                for (let i = 0; i < jsonResponse.data.video.length; i++) {
                                    // let thumbnail = jsonResponse.data.thumb[i]
                                    let video_link = jsonResponse.data.video[i]
                                    html += `
                                    <div class="box">
                                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                                        <a href="${video_link}">Download</a>
                                    </div>
                                    `;
                                }
        
        
                            } else if (jsonResponse.data.images.length > 0) {
                                
                                for (let i = 0; i < reorderedArray.length; i++) {
                                    // let thumbnail = jsonResponse.data.thumb[i]
                                    let thumbnail = reorderedArray[i]
                                    let link = jsonResponse.data.images[i]
                                    html += `
                                    <div class="box">
                                        <img src="${thumbnail}" alt="">
                                        <a href="${link}">Download</a>
                                    </div>
                                    `;
                                }
                            } else if (jsonResponse.data.video.length > 0) {
                                for (let i = 0; i < reorderedArray.length; i++) {
                                    // let thumbnail = jsonResponse.data.thumb[i]
                                    let thumbnail = reorderedArray[i]
                                    let link = jsonResponse.data.video[i]
                                    html += `
                                    <div class="box">
                                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                                        <img src="${thumbnail}" alt="">
                                        <a href="${link}">Download</a>
                                    </div>
                                    `;
                                }
                            }
                            $("#preview").html(html)
    
                        });
                    
                    // if response if any social media except instagram
                    } else if (jsonResponse.data.high && jsonResponse.data.low) {
    
                        html += `
                            <div class="box">
                                <h3 class="text-2xl font-bold mb-4">High Quality</h3>
                                <img src="${jsonResponse.data.high}" alt="">
                                <a href="${jsonResponse.data.high}" ${form.id == "img-form" ? 'class="forced-download"' : 'download="video.mp4"'}>Download</a>
                            </div>
                            <div class="box">
                                <h3 class="text-2xl font-bold mb-4">Low Quality</h3>
                                <img src="${jsonResponse.data.high}" alt="">
                                <a href="${jsonResponse.data.high}" ${form.id == "img-form" ? 'class="forced-download"' : 'download="video.mp4"'}>Download</a>
                            </div>
                            `;

                        $("#preview").html(html)
                        
                    } else {
                        console.log(jsonResponse);
                        // alert("Unable to handle response")
                        html += `<div class="flex flex-col items-center gap-5 bg-red-100 py-5 px-8 rounded-lg">
                            <i class="fa-solid fa-circle-exclamation text-5xl text-red-500"></i>
                            <p>Unable to handle response. Please <a href="#" class="text-blue-500 underline">Report Here</a> so that we can resolve issue ASAP</p>
                        </div>`

                        $("#preview").html(html)
    
                    }
                    
                } else {
                    // Otherwise, handle the response as a file download
                    const blob = await response.blob();
                    
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'downloaded_image.jpg';
                    link.style.display = 'none';
        
                    document.body.appendChild(link);
                    link.click();
        
                    URL.revokeObjectURL(link.href);
                    document.body.removeChild(link);
    
                    $("#preview").html(`<div class="flex flex-col items-center gap-5 bg-green-100 py-5 px-10 rounded-lg">
                            <i class="fa-solid fa-circle-check text-5xl text-green-500"></i>
                            <p>File will be downloading soon.</p>
                        </div>`)
                }
                
                
                
            } catch (error) {
                console.log('Error during download:', error);
                // alert('Failed to download image');
                $("#preview").html(`<div class="flex flex-col items-center gap-5 bg-red-100 py-5 px-8 rounded-lg">
                            <i class="fa-solid fa-circle-exclamation text-5xl text-red-500"></i>
                            <p>Failed to download image. Please <a href="#" class="text-blue-500 underline">Report Here</a> so that we can resolve issue ASAP</p>
                        </div>`)
            }
        } else {

            apiUrl = `${app_url}video-download?url=${toDownloadUrl}`
            
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                // Button loading handle (hiding)
                $(form).find(".loading-gif").removeClass("inline")
                $(form).find(".loading-gif").addClass("hidden")
    
        
                const jsonResponse = await response.json();

                console.log(jsonResponse);
                
                let html = "";

                if (jsonResponse.platform == "facebook") {
                    html += `
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                        <img src="${jsonResponse.data[0].thumbnail}" alt="">`

                        jsonResponse.data.forEach(element => {
                            html += `<a href="${element.url}">Download ${element.resolution}</a>`
                        });
                    `</div>`
                } else if (jsonResponse.platform == "instagram") {
                    
                    checkImagesAndReorder(jsonResponse.data.thumb).then((reorderedArray) => {
                            
    
                        if (jsonResponse.data.images.length > 0 && jsonResponse.data.video.length > 0) {
    
                            for (let i = 0; i < jsonResponse.data.images.length; i++) {
                                // let thumbnail = jsonResponse.data.thumb[i]
                                let thumbnail = reorderedArray[i]
                                let img_link = jsonResponse.data.images[i]
                                html += `
                                <div class="box">
                                    <h3 class="text-2xl font-bold mb-4">Download Image</h3>
                                    <img src="${thumbnail}" alt="">
                                    <a href="${img_link}">Download</a>
                                </div>
                                `;
                            }
    
    
                            for (let i = 0; i < jsonResponse.data.video.length; i++) {
                                // let thumbnail = jsonResponse.data.thumb[i]
                                let video_link = jsonResponse.data.video[i]
                                html += `
                                <div class="box">
                                    <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                                    <a href="${video_link}">Download</a>
                                </div>
                                `;
                            }
    
    
                        } else if (jsonResponse.data.images.length > 0) {
                            
                            for (let i = 0; i < reorderedArray.length; i++) {
                                // let thumbnail = jsonResponse.data.thumb[i]
                                let thumbnail = reorderedArray[i]
                                let link = jsonResponse.data.images[i]
                                html += `
                                <div class="box">
                                    <img src="${thumbnail}" alt="">
                                    <a href="${link}">Download</a>
                                </div>
                                `;
                            }
                        } else if (jsonResponse.data.video.length > 0) {
                            for (let i = 0; i < reorderedArray.length; i++) {
                                // let thumbnail = jsonResponse.data.thumb[i]
                                let thumbnail = reorderedArray[i]
                                let link = jsonResponse.data.video[i]
                                html += `
                                <div class="box">
                                    <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                                    <img src="${thumbnail}" alt="">
                                    <a href="${link}">Download</a>
                                </div>
                                `;
                            }
                        }
                        $("#preview").html(html)

                    });

                } else if (jsonResponse.platform == "youtube") {
                    html += `
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                        <img src="${jsonResponse.data.thumb}" alt="">
                        <p class="my-2 text-sm text-center">${jsonResponse.data.title}</p>
                        <a href="${jsonResponse.data.video_hd}" class="yt-element yt-video">Download 720p</a>
                        <a href="${jsonResponse.data.video}" class="yt-element yt-video">Download 480p</a>
                        <a href="${jsonResponse.data.audio}" class="yt-element yt-audio">Download mp3</a>
                    </div>
                    <div class="yt-media-container box !basis-[50%] !hidden">
                        <h3 class="text-2xl font-bold mb-4">Download</h3>
                        <div></div>
                    </div>
                    `
                } else if (jsonResponse.platform == "twitter") {
                    html += `
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                        <a href="${jsonResponse.data.HD}">Download High Quality</a>
                        <a href="${jsonResponse.data.SD}">Download Normal Quality</a>
                    </div>`
                } else if (jsonResponse.platform == "tiktok") {
                    html += `
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">Download Video</h3>
                        <img src="${jsonResponse.data.author.avatar}" alt="">
                        <p class="my-2 text-sm text-center">${jsonResponse.data.title}</p>
                        <a href="${jsonResponse.data.video}">Download Video (mp4)</a>
                        <a href="${jsonResponse.data.audio}">Download Audio (mp3)</a>
                    </div>`
                } else if (jsonResponse.platform == "different") {
                    
                    html += `
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">High Quality</h3>
                        <img src="${jsonResponse.data.high}" alt="">
                        <a href="${jsonResponse.data.high}" ${form.id == "img-form" ? 'class="forced-download"' : 'download="video.mp4"'}>Download</a>
                    </div>
                    <div class="box">
                        <h3 class="text-2xl font-bold mb-4">Low Quality</h3>
                        <img src="${jsonResponse.data.high}" alt="">
                        <a href="${jsonResponse.data.high}" ${form.id == "img-form" ? 'class="forced-download"' : 'download="video.mp4"'}>Download</a>
                    </div>
                    `;
                }


                // if thumb is present then upper condition will render grid in preview
                // if (!jsonResponse.data.thumb) {
                //     $("#preview").html(html)
                // }
                $("#preview").html(html)
                
                
                
                
            } catch (error) {
                console.log('Error during download:', error);
                // alert('Failed to download image');
                $("#preview").html(`<div class="flex flex-col items-center gap-5 bg-red-100 py-5 px-8 rounded-lg">
                            <i class="fa-solid fa-circle-exclamation text-5xl text-red-500"></i>
                            <p>Failed to download video. Please <a href="#" class="text-blue-500 underline">Report Here</a> so that we can resolve issue ASAP</p>
                        </div>`)
            }
        }

    }
})


$(document).on("click", ".yt-element", async function (e) {
    e.preventDefault()
    const mediaUrl = $(this).attr('href'); // Get the URL from the clicked anchor's href

    // Create a media element (audio or video) based on the file type
    let mediaElement;
    if ($(this).hasClass("yt-audio")) {
        mediaElement = $('<audio>', {
            src: mediaUrl,
            controls: true
        });
    } else {
        mediaElement = $('<video>', {
            src: mediaUrl,
            controls: true
        });
    }

    // Clear the previous media and append the new media element to the container
    // $('.yt-media-container').html(`<div class="flex flex-col items-center border">
    $('.yt-media-container').removeClass("!hidden");
    $('.yt-media-container div').html(mediaElement);

    // Play the media (auto-play)
    mediaElement[0].play();
})


$(document).on("click", ".forced-download", async function (e) {
    e.preventDefault()
    let imageUrl = $(this).attr("href")
    window.location.href = `${app_url}forced-download-image?url=${imageUrl}`;
})

// $(document).on("click", ".forced-download-video", async function (e) {
//     e.preventDefault()
//     let videoUrl = $(this).attr("href")
//     window.location.href = `${app_url}download-video?url=${videoUrl}`;
// })
