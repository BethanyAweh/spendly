import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Load Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test route (open in browser)
app.get("/", (req, res) => {
  res.send("Spendly Gemini backend is running ✅");
});

// Receipt analysis route
app.post("/api/analyze-receipt", async (req, res) => {
  try {
    const { receiptText } = req.body;

    if (!receiptText) {
      return res.status(400).json({ error: "receiptText is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash" // ✅ works with billing
    });

    const prompt = `
Extract items and prices from this receipt text.
Return JSON like:
[
 { "item": "Eggs", "price": 2.19 }
]
Receipt:
${receiptText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    res.json({ data: response });

  } catch (err) {
    console.error("🔥 Gemini error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
