import "dotenv/config";
import fetch from "node-fetch";
import * as fs from "fs";

let pageToken = "";
let videoList = []

do {
  const response = await fetch(
    "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&pageToken=" +
      pageToken +
      "&playlistId=" +
      process.env.UPLOADS_PLAYLIST +
      "&key=" +
      process.env.API_KEY
  );
  const data = await response.json();
  pageToken = data["nextPageToken"];

  videoList  = [...videoList, ...data["items"]
    .map((item) => {
      const { snippet } = item;
      const { title, description } = snippet;
      return { title, description };
    })
    .filter(
      (item) =>
        item.title.toLowerCase().includes(" review") &&
        !item.title.toLowerCase().includes("y u no")
    )];
} while (pageToken != "" && pageToken != null);

fs.writeFile("output3.json", JSON.stringify(videoList), (err) => {
  if (err != null) {
    console.log(err);
  }
});
// console.log(data);
