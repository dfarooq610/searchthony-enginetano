require("dotenv").config();
const { google } = require("googleapis");
const youtube = google.youtube({
  version: "v3",
  auth: process.env.API_KEY,
});

const getVideos = async () => {
  return await youtube.search.list(
    {
      part: "snippet",
      channelId: "UCt7fwAhXDy3oNFTAzF2o8Pw",
      order: "date",
      maxResults: 3715,
    },
    function (err, data) {
      if (err) {
        console.error("Error: " + err);
      }
      return data.request.responseURL;
    }
  );
  //   const res = await fetch(resLink.request.responseURL, {
  //     method: "GET",
  //   });
  //   console.log(resLink);
};

getVideos().then((data) => {
  console.log(data);
});
//getChannel()
