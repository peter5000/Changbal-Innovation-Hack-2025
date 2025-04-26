// Moved to the frontend directory for better structure
export {};

import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri,
} from "../node_modules/@google/genai";

const ai = new GoogleGenAI({ apiKey: "GOOGLE_API_KEY" });

async function main() {
  const myfile = await ai.files.upload({
    file: "C:\Users\chans\Documents\project\hackathon\Dr-Hear\assets\Dr.Hear kanye & elon OG.mp3",
    config: { mimeType: "audio/mp3" },
  });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      "Describe this audio clip",
    ]),
  });
  console.log(response.text);
}

// Event listener for file input
document.getElementById('audioInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log('File selected:', file.name);
    await main();
  }
});
