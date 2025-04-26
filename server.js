const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = 3500;

const genai = require('@google/genai');
const { GoogleGenAI, createUserContent, createPartFromUri } = genai;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Default route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


// Default route to serve the main page
app.get('/hihi', async (req, res) => {
  const myfile = await ai.files.upload({
    file: "assets/Dr.Hear kanye & elon OG.mp3",
    // file: "assets/sound.mp3",
    // file: "assets/uneasy_sound.mp3",
    config: { mimeType: "audio/mp3" },
  });
  // console.log("myfile: ", myfile);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      // "With given audio clip, provide all of the information about the audio and its frequency and find for any peak points if possible. Give us a detailed explanation why you can't do it.",
      "With given audio clip, analyze each 5 seconds interval. Provide analysis on each range and evaluate whether the range would be conceived unpleasant to human. Analyze not only the main sound, but also the background noise. Then explain the reason with detail. At the end, provide an overall audio quality",
      // "guess which animal made this sound",
    ]),
  });

  res.type('text/plain');
  res.send(response.text);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});