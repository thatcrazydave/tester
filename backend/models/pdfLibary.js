const mongoose = require("mongoose");

const pdfLibrarySchema = new mongoose.Schema({
  fileName: { type: String, required: true },   // Name of uploaded PDF/DOCX
  topic: { type: String, required: true },      // Topic of the uploaded file
  numberOfQuestions: { type: Number },          // Total questions in this file
  uploadedAt: { type: Date, default: Date.now } // Timestamp
});

module.exports = mongoose.model("PdfLibrary", pdfLibrarySchema);
