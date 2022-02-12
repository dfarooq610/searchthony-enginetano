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
    .map(item => {
      const { snippet, contentDetails } = item;
      const { title, description, thumbnails } = snippet;
      const { videoId, videoPublishedAt } = contentDetails;
      const { url } = thumbnails["high"] ? thumbnails["high"] : thumbnails["default"];

      return { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url};
    })
    .filter(
      item =>
        item.title.toLowerCase().includes(" review") &&
        !item.title.toLowerCase().includes("y u no") && 
        !item.title.toLowerCase().includes("track")
    )];
} while (pageToken !== "" && pageToken !== undefined);

fs.writeFile("output3.json", JSON.stringify(videoList), (err) => {
  if (err != null) {
    console.log(err);
  }
});
