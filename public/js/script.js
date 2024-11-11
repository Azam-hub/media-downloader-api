const app_url = "http://localhost:3000/";

// Function to create and place an image in the document
// function createAndPlaceImage(imageUrl) {
//     // Create a new img element
//     const img = document.createElement('img');
    
//     // Set the src attribute to the provided image URL
//     img.src = imageUrl;

//     // Optionally, set additional attributes like alt text or CSS styles
//     img.alt = 'Image from JavaScript';
//     img.style.width = '300px'; // example width
//     img.style.height = 'auto'; // maintain aspect ratio

//     // Append the img element to the document body (or another container element)
//     document.body.appendChild(img);
// }

$("form").submit(async function (e) {
    e.preventDefault();

    let form = $(this)[0]
    let toDownloadUrl = $(form).find(".url").val()

    if (toDownloadUrl == "") {
        console.log("Please enter Link");
    } else {
        console.log(toDownloadUrl);
        
        let apiUrl;        
        if (form.id == "img-form") {
            apiUrl = `${app_url}image-download?url=${toDownloadUrl}`
            // console.log("api url definde");
        } else {
            apiUrl = `${app_url}video-download?url=${toDownloadUrl}`
        }

        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            // Check if the response is JSON (e.g., when there’s an error message)
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {

                const jsonResponse = await response.json();
                console.log(jsonResponse);
                
                if (form.id == "img-form") {
                    let html = "";
                    if (jsonResponse.data.thumb && jsonResponse.data.images) {
                        for (let i = 0; i < jsonResponse.data.thumb.length; i++) {
                            // createAndPlaceImage(jsonResponse.data.thumb[i])
                            let thumbnail = jsonResponse.data.thumb[i]
                            let link = jsonResponse.data.images[i]
                            html += `
                            <div class="box">
                                <img src="${thumbnail}" alt="">
                                <a href="${link}">Download</a>
                            </div>
                            `;
                        }
                    } else if (jsonResponse.data.high && jsonResponse.data.low) {
                        html += `
                            <div class="box">
                                <h3>High Quality</h3>
                                <img src="${jsonResponse.data.high}" alt="">
                                <a href="${jsonResponse.data.high}" download="download-image.jpg" class="forced-download">Download</a>
                            </div>
                            <div class="box">
                                <h3>Low Quality</h3>
                                <img src="${jsonResponse.data.high}" alt="">
                                <a href="${jsonResponse.data.high}" download="download-image.jpg" class="forced-download">Download</a>
                            </div>
                            `;
                    }
                    $("#image-preview").html(html)
                } else {
                    let html = "";
                    if (jsonResponse.data.thumb && jsonResponse.data.images) {
                        for (let i = 0; i < jsonResponse.data.thumb.length; i++) {
                            // createAndPlaceImage(jsonResponse.data.thumb[i])
                            let thumbnail = jsonResponse.data.thumb[i]
                            let link = jsonResponse.data.images[i]
                            html += `
                            <div class="box">
                                <img src="${thumbnail}" alt="">
                                <a href="${link}">Download</a>
                            </div>
                            `;
                        }
                    } else if (jsonResponse.data.high && jsonResponse.data.low) {
                        html += `
                            <div class="box">
                                <h3>High Quality</h3>
                                <a href="${jsonResponse.data.high}" download="video.mp4" class="forced-download-video">Download</a>
                            </div>
                            <div class="box">
                                <h3>Low Quality</h3>
                                <a href="${jsonResponse.data.low}" download="video.mp4" class="forced-download-video">Download</a>
                            </div>
                            `;
                    }
                    $("#video-preview").html(html)
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
            }
        } catch (error) {
            console.error('Error during download:', error);
            alert('Failed to download image');
        }
    }
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
