import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/learning.css";

const Learning = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Fetch available topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/topics");
        setTopics(res.data.map((t) => t.topic));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch questions
  const fetchQuestions = async () => {
    if (!selectedTopic) {
      setMessage("Please select a topic first.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/user/quiz", {
        params: { topic: selectedTopic, limit: questionLimit },
      });
      setQuestions(res.data);
      setMessage(`Fetched ${res.data.length} question(s)`);
      setSelectedAnswers({});
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch questions.");
    }
  };

  // Handle option click
  const handleAnswer = (questionId, selectedIndex) => {
    const question = questions.find((q) => q._id === questionId);

    // Convert correctAnswer letter (A,B,C,D) to index
    const correctIndex =
      typeof question.correctAnswer === "string"
        ? question.correctAnswer.toUpperCase().charCodeAt(0) - 65
        : question.correctAnswer; // if it's already a number

    const isCorrect = selectedIndex === correctIndex;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedIndex, isCorrect },
    }));
  };

  return (
    <div className="learning-container">
      <h2>Learning Module</h2>

      {/* Topic selection */}
      <div className="topic-selection">
        <label>Select Topic: </label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">--Choose Topic--</option>
          {topics.map((topic, i) => (
            <option key={i} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        <label>Number of Questions: </label>
        <input
          type="number"
          min="1"
          value={questionLimit}
          onChange={(e) => setQuestionLimit(e.target.value)}
        />

        <button onClick={fetchQuestions}>Start Quiz</button>
      </div>

      <p className="message">{message}</p>

      {/* Questions */}
      <div className="questions-list">
        {questions.map((q) => (
          <div key={q._id} className="question-card">
            <p className="question-text">{q.questionText}</p>
            <ul className="options-list">
              {q.options.map((opt, idx) => {
                const selected = selectedAnswers[q._id]?.selectedIndex === idx;
                const isCorrect = selectedAnswers[q._id]?.isCorrect;

                let optionClass = "";
                if (selected) {
                  optionClass = isCorrect ? "correct" : "incorrect";
                }

                return (
                  <li
                    key={idx}
                    className={`option ${optionClass}`}
                    onClick={() => handleAnswer(q._id, idx)}
                  >
                    {opt}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learning;
