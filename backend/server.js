const express = require("express");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const mammoth = require("mammoth");

const Question = require("./models/questions");
const PdfLibrary = require("./models/pdfLibary");

const app = express();
app.use(express.json());

// ===== CORS =====
const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ===== File Upload Middleware =====
app.use(fileUpload());

// ===== MongoDB =====
mongoose
  .connect("mongodb://127.0.0.1:27017/Vayrex", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// ===== Helpers =====
function normalizeText(text) {
  if (!text) return "";
  let t = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u00A0/g, " ");
  t = t.replace(/(?<!\n)([ \t]*)([A-E])[\.\)]\s/g, "\n$2. ");
  t = t.replace(/(?<!\n)Answer:\s*/gi, "\nAnswer: ");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t;
}

function parseQuestionsFromText(text, topic, sourceFile) {
  const letterToIndex = { A: 0, B: 1, C: 2, D: 3, E: 4 };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions = [];
  let current = null;

  const isQuestionStart = (line) => /^\d+\.\s+/.test(line) || /^Q\d+:\s+/i.test(line);
  const stripQuestionNumber = (line) => line.replace(/^\d+\.\s*|^Q\d+:\s*/i, "").trim();
  const isOption = (line) => /^[A-E][\.\)\-]\s+/i.test(line);
  const stripOptionLabel = (line) => line.replace(/^[A-E][\.\)\-]\s+/i, "").trim();
  const isAnswer = (line) => /^Answer:\s*/i.test(line);
  const extractAnswerIndex = (line) => {
    const letter = (line.match(/^Answer:\s*([A-E])/i)?.[1] || "").toUpperCase();
    return letterToIndex[letter] ?? null;
  };

  for (const raw of lines) {
    if (isQuestionStart(raw)) {
      if (current) questions.push(current);

      let questionText = stripQuestionNumber(raw);
      let difficulty = "Medium"; // default

      const diffMatch = questionText.match(/\[Difficulty:\s*(Easy|Medium|Hard)\]/i);
      if (diffMatch) {
        difficulty = diffMatch[1];
        questionText = questionText.replace(/\[Difficulty:\s*(Easy|Medium|Hard)\]/i, "").trim();
      }

      current = {
        topic,
        questionText,
        options: [],
        correctAnswer: null,
        difficulty,
        sourceFile,
      };
      continue;
    }

    if (!current) {
      current = { topic, questionText: raw, options: [], correctAnswer: null, difficulty: "Medium", sourceFile };
      continue;
    }

    if (isOption(raw)) {
      current.options.push(stripOptionLabel(raw));
      continue;
    }

    if (isAnswer(raw)) {
      current.correctAnswer = extractAnswerIndex(raw);
      continue;
    }

    if (current.options.length === 0) {
      current.questionText = (current.questionText + " " + raw).trim();
    } else {
      const last = current.options.length - 1;
      if (last >= 0) {
        current.options[last] = (current.options[last] + " " + raw).trim();
      }
    }
  }

  if (current) questions.push(current);

  return questions
    .map((q) => ({
      ...q,
      options: Array.from(new Set(q.options.map((o) => o.trim()).filter((o) => o.length > 0))),
      questionText: q.questionText.trim(),
    }))
    .filter((q) => q.questionText.length > 0 && q.correctAnswer !== null);
}

// ===== Upload Route =====
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

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      textContent = pdfData.text || "";
    } else if (file.name.toLowerCase().endsWith(".docx")) {
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value || "";
    } else {
      return res.status(400).json({ message: "Unsupported file type. Use .pdf or .docx" });
    }

    const normalized = normalizeText(textContent);
    const questionsArray = parseQuestionsFromText(normalized, topic, file.name);

    if (questionsArray.length === 0) {
      return res.status(400).json({ message: "No valid questions found in file" });
    }

    await Question.insertMany(questionsArray);

    await PdfLibrary.create({
      fileName: file.name,
      topic,
      numberOfQuestions: questionsArray.length,
    });

    res.json({
      success: true,
      message: "Upload successful!",
      questionsAdded: questionsArray.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===== Check Answer =====
app.post("/user/check-answer", async (req, res) => {
  try {
    const { questionId, selectedIndex } = req.body;

    if (!questionId || selectedIndex === undefined) {
      return res.status(400).json({ error: "Missing questionId or selectedIndex" });
    }

    const question = await Question.findById(questionId).lean();
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const isCorrect = Number(selectedIndex) === Number(question.correctAnswer);

    return res.json({ correct: isCorrect });
  } catch (error) {
    console.error("Error checking answer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Get Topics =====
app.get("/topics", async (req, res) => {
  try {
    const topics = await PdfLibrary.find().distinct("topic");
    res.json(topics.map((t) => ({ topic: t })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Get Questions =====
app.get("/user/quiz", async (req, res) => {
  try {
    const { topic, limit } = req.query;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const count = parseInt(limit) || 5;
    const questions = await Question.aggregate([
      { $match: { topic } },
      { $sample: { size: count } },
      { $project: { correctAnswer: 0, difficulty: 0 } },
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
