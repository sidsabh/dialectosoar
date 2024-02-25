// server/index.js
const yce = require('youtube-caption-extractor');
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

//lets now do something for open ai api:
const axios = require('axios');



app.get("/video-data", async (req, res) => {
  const { videoID, lang } = req.query;
  try {
    const subtitles = await yce.getSubtitles({ videoID, lang }); // call this if you only need the subtitles
    const videoDetails = await yce.getVideoDetails({ videoID, lang }); // call this if you need the video title and description, along with the subtitles
    res.status(200).json({ subtitles, videoDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post('/generate-question', async (req, res) => {
  try {
    // const title = req.body.title;
    // const description = req.body.description;
    // const subtitles = req.body.subtitles;
    // const targetLanguage = req.body.targetLanguage;
    // const sourceLanguage = req.body.sourceLanguage;
    const { title, description, subtitles, targetLanguage, sourceLanguage } = req.query;
    
    // PROMPT
    const prompt = `Create a multiple choice question for comprehension in ${targetLanguage} about this ${sourceLanguage} video titled ${title} with description ${description}. Label your lines as follows. "QUESTION: <question>", "ANSWER_CHOICE": <answer_choice>", and "CORRECT_ANSWER": <correct_answer>. For example, if you had one question and four answer choices, you would print those five lines then one more line for the correct answer. Here is 
    the subtitles for the video:\n\n${subtitles}.`;

    // print everything
    console.log('title:', title);
    console.log('description:', description);
    console.log('subtitles:', subtitles);
    console.log('targetLanguage:', targetLanguage);
    console.log('sourceLanguage:', sourceLanguage);
    console.log('prompt:', prompt);

    // // return 200
    res.status(200).json({ question: 'What is the capital of France?', answers: ['Paris', 'London', 'New York', 'Berlin'], correctAnswerIndex: 0 });

  } catch (error) {
    console.error('ERROR making request to OpenAI API:', error.message);
    res.status(500).json({ error: error.message });
  }
});


  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});