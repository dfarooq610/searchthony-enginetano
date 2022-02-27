import "dotenv/config";
import fetch from "node-fetch";
import * as fs from "fs";


let successfulScores = 0;

const isAlbumReview = item => {
  let { title } = item["snippet"];
  title = title.toLowerCase()

  return title.includes(" review") &&
    !title.includes("y u no") &&
    !title.includes(" track") &&
    !title.includes("movie review") && 
    !/[0-9] Reviews:/g.test(title);

  
}

const extractVideoMetadata = item => {
  const { snippet, contentDetails } = item;
  const { title, description, thumbnails } = snippet;
  const { videoId, videoPublishedAt } = contentDetails;
  const { url } = thumbnails["high"] ? thumbnails["high"] : thumbnails["default"];
  const videoMetadata = { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url };
  // extract score from description
  const scoreRegex = /1*.\/10/
  const scores = scoreRegex.exec(description)
  if (!scores || scores.length > 2) {
    console.log("FOUND A REVIEW WITH MULTIPLE OR NO SCORES: " + title + " " + scores + " " + `https://www.youtube.com/watch?v=${videoId}`)
    return { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url };
  }
  successfulScores += 1;
  return { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url, score: scores[0] };
}

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

  videoList = [...videoList, ...data["items"]
    .filter(isAlbumReview)
    .map(extractVideoMetadata)];
} while (pageToken !== "" && pageToken !== undefined);

console.info(`Successfully Scraped Scores: ${videoList.length - successfulScores} / ${videoList.length}`)
fs.writeFile("output3.json", JSON.stringify(videoList), (err) => {
  if (err != null) {
    console.log(err);
  }
});
