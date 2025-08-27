const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mammoth = require("mammoth"); // For DOCX parsing

const Question = require("./models/questions");
const PdfLibrary = require("./models/pdfLibary");

const app = express();
app.use(express.json());

// ===== Enable CORS =====
app.use(cors({
  origin: "http://localhost:5174", // frontend
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

// ===== File Upload Middleware =====
app.use(fileUpload());

// ===== Connect to MongoDB =====
mongoose.connect("mongodb://127.0.0.1:27017/Vayrex", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error(err));

// ===== Admin Upload Route =====
app.post("/admin/upload", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.files.file;
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    const filePath = path.join(uploadDir, file.name);
    await file.mv(filePath);

    let textContent = "";

    // ===== PDF Parsing =====
    if (file.name.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text;
    }

    // ===== DOCX Parsing =====
    if (file.name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value;
    }

    // ===== Split into questions intelligently =====
    // Using numbering or "Q#" pattern
    const questionRegex = /(?:\d+\.|Q\d+:)\s+(.+?)(?=\d+\.|Q\d+:|$)/gs;
    const matches = textContent.matchAll(questionRegex);

    const questionsArray = [];
    for (const match of matches) {
      const questionText = match[1].trim();
      if (questionText) {
        questionsArray.push({
          topic,
          questionText,
          sourceFile: file.name
        });
      }
    }

    // ===== Store in database =====
    if (questionsArray.length === 0) {
      return res.status(400).json({ message: "No valid questions found in file" });
    }

    await Question.insertMany(questionsArray);
    await PdfLibrary.create({
      fileName: file.name,
      topic,
      numberOfQuestions: questionsArray.length
    });

    res.json({
      success: true,
      message: "Upload successful!",
      questionsAdded: questionsArray.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== Get Unique Topics =====
app.get("/topics", async (req, res) => {
  try {
    const topics = await PdfLibrary.find().distinct("topic");
    res.json(topics.map((t) => ({ topic: t })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Get Random Questions for Users =====
app.get("/user/quiz", async (req, res) => {
  try {
    const { topic, limit } = req.query;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const count = parseInt(limit) || 5;
    const questions = await Question.aggregate([
      { $match: { topic } },
      { $sample: { size: count } }
    ]);

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Start Server =====
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
