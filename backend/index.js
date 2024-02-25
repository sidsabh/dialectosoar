import yce from 'youtube-caption-extractor';
import express from 'express';
const PORT = process.env.PORT || 3001;
const app = express();
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// model= "gpt-3.5-turbo";
let model= "gpt-4";

dotenv.config();
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
    const { title, allSubtitles, targetLanguage, sourceLanguage } = req.body;
    const prompt = `
    From the provided subtitles in ${sourceLanguage}, identify key vocabulary words and translate them into ${targetLanguage}. Please format your response with each vocabulary word followed by its translation, on separate lines, like this: "<vocabulary word> : <translated meaning>". Focus on extracting and translating words that are essential to the context of the subtitles.

    Subtitles:\n\n${allSubtitles}
    `;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: model,
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
    
    const prompt = `
      Create a multiple-choice comprehension question in ${targetLanguage} based on the subtitles from a ${sourceLanguage} video titled "${title}". The question should focus on testing the viewer's understanding and vocabulary related to the content of these subtitles. 

      Include:
      - One question labeled as "QUESTION:".
      - Four answer choices, each labeled as "ANSWER_CHOICE_<LETTER>" (A, B, C, D).
      - Indicate the correct answer with "CORRECT_ANSWER:" followed by the letter of the correct choice.

      Use both the original script from ${sourceLanguage} and provide a transliteration into ${targetLanguage} for each part of the question and answers. The content for your question should only be derived from the following subtitles section: ${currSubtitles}. 

      Ensure that the question and all answer choices are presented in ${targetLanguage}, resulting in a total of six lines: one for the question, four for the answer choices, and one indicating the correct answer. This task aims to assess the student's comprehension and vocabulary skills in ${sourceLanguage}, utilizing ${targetLanguage}'s syntax where applicable.
      `;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: model,
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
    // Destructure the data from req.body instead of req.query
    const { currSubtitles, writtenSubtitles, targetLanguage, sourceLanguage } = req.body;

    const prompt = `
    A user has transcribed or translated subtitles from a video in ${sourceLanguage} into either ${targetLanguage} or ${sourceLanguage}. Their submission is based on the original subtitles: ${currSubtitles}, and their version is: ${writtenSubtitles}. 

    Please evaluate their submission for comprehension (if translated into ${targetLanguage}) or accuracy (if transcribed in ${sourceLanguage}). Use a lenient grading approach, allowing for a "PASS" if the submission broadly captures the meaning, especially prioritizing the accuracy of later parts of the context. 

    Return a single verdict: "PASS" if the user's understanding or transcription is generally correct, or "FAIL" if it significantly deviates from the original content.
    `;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: model,
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