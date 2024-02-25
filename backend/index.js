// server/index.js
const yce = require('youtube-caption-extractor');
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
app.use(cors());

//lets now do something for open ai api:
const axios = require('axios');

//TODO: encrypt this
const openAiKey = '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';




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
    const videoDetails = req.body.videoDetails;
    const videoTranscript = videoDetails.subtitles.map(subtitle => subtitle.text);
    const combinedText = videoTranscript.join(' ');
    const seconds = req.body.seconds;

    const targetLanguage = req.body.targetLanguage;
    const sourceLanguage = req.body.sourceLanguage;
    // Generate a prompt for GPT-3
    const prompt = `Create a comprehension multiple choice question in ${targetLanguage} about this ${sourceLanguage} the video titled ${videoDetails.title} with description ${videoDetails.description}. We want the question to only cover content up to ${seconds}. Put the correct answer after.:\n\n${combinedText}`;

    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: prompt,
        max_tokens: 150, // Adjust as needed
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`,
        },
      }
    );


    //ok from the question, we need to extract the question and the answer choices.
    //the answer choices will be individual lines starting with A), B), C) and D).
    //so extract it via the first occurences of those:
    const generatedQuestion = response.data.choices[0].text;
    const answerChoices = generatedQuestion.match(/A\).+|B\).+|C\).+|D\).+/g);

    console.log(answerChoices);

    res.json({ question: generatedQuestion, answers: answerChoices });
  } catch (error) {
    console.error('Error making request to OpenAI API:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});