// server/index.js
import { getSubtitles, getVideoDetails } from 'youtube-caption-extractor';
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();

app.get("/video-data", async (req, res) => {
  const { videoID, lang } = req.query;

  try {
    const subtitles = await getSubtitles({ videoID, lang }); // call this if you only need the subtitles
    const videoDetails = await getVideoDetails({ videoID, lang }); // call this if you need the video title and description, along with the subtitles
    res.status(200).json({ subtitles, videoDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});