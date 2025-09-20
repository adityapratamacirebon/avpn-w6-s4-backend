import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";
import text from "body-parser";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
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
    model: geminiModels.text,
    contents: [
      {
        role: "user",
        parts: [{ text: message }],
      },
    ],
  });

  res.status(200).json({
    reply: response.text,
  });
});
// route 2 - generate dari image -----------------------------------
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Tidak ada file gambar yang diunggah." });
    }

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ message: "Prompt tidak ada atau formatnya tidak sesuai." });
    }

    const imagePart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    };

    const response = await ai.models.generateContent({
      model: geminiModels.image,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, imagePart],
        },
      ],
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});
// route 3 - generate dari document -----------------------
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ message: "Tidak ada file dokumen yang diunggah." });
      }

      if (!prompt || typeof prompt !== "string") {
        return res
          .status(400)
          .json({ message: "Prompt tidak ada atau formatnya tidak sesuai." });
      }

      const documentPart = {
        inlineData: {
          data: file.buffer.toString("base64"),
          mimeType: file.mimetype,
        },
      };

      const response = await ai.models.generateContent({
        model: geminiModels.document,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, documentPart],
          },
        ],
      });

      res.status(200).json({ reply: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
  }
);
// route 4 - generate dari audio ---------------------------------------
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ message: "Tidak ada file audio yang diunggah." });
    }

    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ message: "Prompt tidak ada atau formatnya tidak sesuai." });
    }

    const audioPart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype,
      },
    };

    const response = await ai.models.generateContent({
      model: geminiModels.audio,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, audioPart],
        },
      ],
    });

    res.status(200).json({ reply: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});
//panggil app nya di sini
const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
