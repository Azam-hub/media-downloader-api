const express = require('express');

const app = express();
const port = 3000;

const { ndown } = require("nayan-videos-downloader")
ndown("https://www.instagram.com/p/DIMJDQ1ojed/?utm_source=ig_web_copy_link").then((data) => {
  console.log(data)
})
// console.log(URL)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
