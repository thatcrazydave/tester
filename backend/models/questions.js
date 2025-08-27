const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  topic: { type: String, required: true },       // Subject or topic of the question
  questionText: { type: String, required: true },// Full text of the question
  options: [{ type: String }],                  // Optional array of possible answers
  correctAnswer: { type: String },              // Optional correct answer
  sourceFile: { type: String },                 // Name of PDF/DOCX file
  createdAt: { type: Date, default: Date.now }  // Timestamp
});

module.exports = mongoose.model("Question", questionSchema);
