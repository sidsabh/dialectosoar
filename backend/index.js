// server/index.js
const yce = require('youtube-caption-extractor');
const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
require('dotenv').config()



const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



app.use(cors());
app.use(express.json());


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
    // Destructure the data from req.body instead of req.query
    const { title, description, subtitles, targetLanguage, sourceLanguage } = req.body;
    
    const prompt = `Create a multiple choice question for comprehension in ${targetLanguage} about this ${sourceLanguage} video titled ${title} with description ${description}. Label your lines as follows. "QUESTION: <question>", "ANSWER_CHOICE_<LETTER>": <answer_choice>", and "CORRECT_ANSWER": <correct_answer>. Here are the subtitles for the video:\n\n${subtitles}. Make the question and answer choices as natural as possible on the last line of the subtitles.`;

    const response = await openai.complete({
      model: "gpt-3.5-turbo-16k-0613",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });
    
    console.log(response);


    // Extract the question and answer choices from the response
    const output = response.data.choices[0].text.trim();
    const question = output.match(/QUESTION: (.*)/)[1];
    const answerChoices = output.match(/ANSWER_CHOICE_[A-D]: (.*)/g).map((match) => match.split(': ')[1]);
    const correctAnswerIndex = answerChoices.findIndex((choice) => choice === output.match(/CORRECT_ANSWER: (.*)/)[1]);

    res.status(200).json({ question, answerChoices, correctAnswerIndex });

    // res.status(200).json({ question: 'What is the capital of France?', answers: ['Paris', 'London', 'New York', 'Berlin'], correctAnswerIndex: 0 });

  }catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('ERROR making request to OpenAI API:', error.response.data, 'Status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: error.message });
  }
});

  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});