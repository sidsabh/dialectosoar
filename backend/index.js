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

app.post('/extract-subtitles', async (req, res) => {
  try {
    const { title, currSubtitles, targetLanguage, sourceLanguage } = req.body;
    const prompt = `Extract the vocabulary words in the ${sourceLanguage} language and give their translated meanings in the ${targetLanguage} language from these subtitles: \n\n ${currSubtitles}. Each line should follow format <vocabulary word> : <translated meaning> each on a new line.`;
    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 500,
      temperature: 0.7,
    });

    //so for the response, we are gonna end up putting the vocabulary word and their translated meaning into a dictionary.
    //using firebase firestore to store the data. so package the data accordingly:
    // const output = response.choices[0].message.content.trim();
    const output = response.choices[0].message.content.trim();
    const vocabMatches = output.match(/(.*) : (.*)/g);
    let vocab = {};
    vocabMatches.forEach((match) => {
      const [word, meaning] = match.split(' : ');
      vocab[word] = meaning;
    });

    res.status(200).json(vocab);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/generate-question', async (req, res) => {
  try {
    // Destructure the data from req.body instead of req.query
    const { title, currSubtitles, targetLanguage, sourceLanguage } = req.body;
    
    const prompt = `Create a multiple choice question with 4 choices for comprehension about lines spoken in this ${sourceLanguage} video titled ${title}. Label your lines as follows. "QUESTION: <question>", "ANSWER_CHOICE_<LETTER>": <answer_choice>", and "CORRECT_ANSWER": <correct_answer_letter>. Make the question and answer choices test the student's comprehension and vocabulary in ${sourceLanguage}. Use both the ${sourceLanguage}'s script and its transliteration into ${targetLanguage}. Here are the last few lines from the video in subtitles for you to create questions from; you must use words only from this section and you can use syntax in ${targetLanguage}: ${currSubtitles}`;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.7,
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


app.post('/check-writing', async (req, res) => {
  try {
    console.log("CALLED");
    // Destructure the data from req.body instead of req.query
    const { currSubtitles, writtenSubtitles, targetLanguage, sourceLanguage } = req.body;

    console.log(currSubtitles, writtenSubtitles, targetLanguage, sourceLanguage);
    
    const prompt = `I have a user entering the subtitles they heard for a video in ${sourceLanguage}. They will enter what they understand the subtitles to be in ${targetLanguage} or ${sourceLanguage}. The subtitles are: ${currSubtitles}. The user has entered: ${writtenSubtitles}. Can you give them a pass or fail on their understanding of the subtitles? If they wrote the subtitles in ${targetLanguage}, then you should grade them on their understanding of the subtitles. If they wrote the subtitles in ${sourceLanguage}, then you should grade them on the accuracy of their scribing with a nice margin of error. Only return one line with either "PASS" or "FAIL".`;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 1000,
      temperature: 0.7,
    });

    let answer = {
      "result": response.choices[0].message.content.trim() || "PASS"
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