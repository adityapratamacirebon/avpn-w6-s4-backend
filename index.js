import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";
import text from "body-parser";

const app = express();
const upload = multer;
const ai = new GoogleGenAI({});

// Inisialisasi model AI
const geminiModels = {
  text: "gemini-2.5-flash-lite",
  image: "gemini-2.5-flash",
  audio: "gemini-2.5-flash",
  document: "gemini-2.5-flash-lite",
};

app.use(cors()); // use() ---> panggil / bikin middleware
//app.use(cors() => {}); // pakai bikin middleware sendiri

app.use(express.json()); //untuk memperblehkan kita menggunakan "Content-Type: application/ json" di header

//inisialisasi route .get(), .post(), .put(), patch, delete --->> umum dipakai
//options() ---> lebih jarang ke preflight (untuk CORS umumnya)

app.post("/generate-text", async (req, res) => {
  // handle bagaimana request diterima oleh user
  const { message } = req.body || {};

  if (!message || typeof message !== "string") {
    res
      .status(400)
      .json({ message: "Pesan tidak ada atau format-nya tidak sesuai." });
    return; // keluar lebih awal dari handler
  }

  const response = await ai.models.generateContent({
    contents: message,
    model: geminiModels.text,
  });

  res.status(200).json({
    reply: response.text,
  });
});
//panggil app nya di sini
const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
