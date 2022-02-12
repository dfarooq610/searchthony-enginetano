import "dotenv/config";
import fetch from "node-fetch";
import * as fs from "fs";

const response = await fetch(
  "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&pageToken=EAAaBlBUOkNESQ&playlistId=" +
    process.env.UPLOADS_PLAYLIST +
    "&key=" +
    process.env.API_KEY
);
const data = await response.json();

const videoList = data["items"]
  .map((item) => {
    const { snippet } = item;
    const { title, description } = snippet;
    return { title, description };
  })
  .filter((item) => item.title.toLowerCase().includes(" review"));

console.log(data);
fs.writeFile("output2.json", JSON.stringify(videoList), (err) => {
  console.log(err);
});
