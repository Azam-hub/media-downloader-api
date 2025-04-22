let url = "https://media-downloader-api-production.up.railway.app/video-download?url=https://www.instagram.com/p/DIMJDQ1ojed/?utm_source=ig_web_copy_link";

fetch(url, {
    method: 'GET', // or 'POST', 'PUT', etc.
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 5af3bdd420956019b8b5c7b41b01c1183c58c453ba4bab7fa01991f15786b6d3'
    }
  })
    .then(response => response.json())
    .then(data => console.log(data))


// request from localhost:3000