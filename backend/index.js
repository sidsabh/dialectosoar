// server/index.js
// const yce = require('youtube-caption-extractor');
import yce from 'youtube-caption-extractor';

// const express = require("express");
import express from 'express';

const PORT = process.env.PORT || 3001;
const app = express();
// const cors = require("cors");
import cors from 'cors';
// require('dotenv').config()
import dotenv from 'dotenv';
dotenv.config();



import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
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
  console.log("CALLED");
  try {
    // Destructure the data from req.body instead of req.query
    const { title, description, subtitles, targetLanguage, sourceLanguage } = req.body;
    
    const prompt = `Create a multiple choice question for comprehension in ${targetLanguage} about this ${sourceLanguage} video titled ${title} with description ${description}. Label your lines as follows. "QUESTION: <question>", "ANSWER_CHOICE_<LETTER>": <answer_choice>", and "CORRECT_ANSWER": <correct_answer_letter>. Here are the subtitles for the video:\n\n${subtitles}. Make the question and answer choices as natural as possible on the last line of the subtitles.`;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 500,
      temperature: 0.8,
    });

    // // Assuming the response structure matches the SDK's expected format
    const output = response.choices[0].message.content.trim();
    const questionMatch = output.match(/QUESTION: (.*)/);
    const answerChoicesMatches = output.match(/ANSWER_CHOICE_[A-D]: (.*)/g);
    const correctAnswerMatch = output.match(/CORRECT_ANSWER: (.*)/);

    if (!questionMatch || !answerChoicesMatches || !correctAnswerMatch) {
      throw new Error("Failed to parse the output.");
    }

    const question = questionMatch[1];
    const answers = answerChoicesMatches.map((match) => match.split(': ')[1]);
    const correctAnswer = correctAnswerMatch[1];
    const correctAnswerIndex = correctAnswer.charCodeAt(0) - 65;

    let answer = {
      "question": question || "What is the capital of France?",
      "answers": answers || ['Paris', 'London', 'New York', 'Berlin'],
      "correctAnswerIndex": correctAnswerIndex || 0
    };


    res.status(200).json(answer);

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