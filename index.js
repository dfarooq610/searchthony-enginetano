import "dotenv/config";
import fetch from "node-fetch";
import * as fs from "fs";

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
  let videoMetadata = { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url };
  // extract score from description
  const scoreRegex = /[^\n]\w*\/10/ ///1*.\/10/
  const scores = scoreRegex.exec(description)
  if (!scores || scores.length > 2) {
    return { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url };
  }

  // extract favTracks
  const favTracksRegex = /FAV TRACKS:(.*)(\\n)?/
  const favTracks = favTracksRegex.exec(description)
  !favTracks ? videoMetadata["favTracks"] = null : videoMetadata["favTracks"] = favTracks[1].trim()
  if (!favTracks) {
    console.log("FOUND A REVIEW WITH NO OR MULTIPLE FAV TRACKS: " + title + " " + favTracks + `https://www.youtube.com/watch?v=${videoId}`)
  }

  const leastFavTracksRegex = /LEAST FAV TRACK:(.*)(\\n)?/
  const leastFavTracks = leastFavTracksRegex.exec(description)
  !leastFavTracks ? videoMetadata["leastFavTrack"] = null : videoMetadata["leastFavTrack"] = leastFavTracks[1].trim()
  if (!leastFavTracks) {
    console.log("FOUND A REVIEW WITH NO OR MULTIPLE LFAV TRACKS: " + title + " " + leastFavTracks + `https://www.youtube.com/watch?v=${videoId}`)
    // return { title, description, videoPublishedAt, videoURL: `https://www.youtube.com/watch?v=${videoId}`, thumbnailURL: url, score: scores[0].trim(), favTracks: favTracks[1] };
  }

  return videoMetadata;
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

fs.writeFile("output3.json", JSON.stringify(videoList), (err) => {
  if (err != null) {
    console.log(err);
  }
});
