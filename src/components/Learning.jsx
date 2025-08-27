import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/learning.css";

const Learning = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questionLimit, setQuestionLimit] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch available topics from backend
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/topics");
        setTopics(res.data.map(t => t.topic));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch random questions based on selected topic
  const fetchQuestions = async () => {
    if (!selectedTopic) {
      setMessage("Please select a topic first.");
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/user/quiz", {
        params: { topic: selectedTopic, limit: questionLimit }
      });
      setQuestions(res.data);
      setMessage(`Fetched ${res.data.length} question(s)`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch questions.");
    }
  };

  return (
    <div className="learning-container">
      <h2>Learning Module</h2>

      {/* Topic selection */}
      <div className="topic-selection">
        <label>Select Topic: </label>
        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
          <option value="">--Choose Topic--</option>
          {topics.map((topic, i) => (
            <option key={i} value={topic}>{topic}</option>
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

      {/* <p className="message">{message}</p> */}

      {/* Display questions */}
      <div className="questions-list">
        {questions.map((q) => (
          <div key={q._id} className="question-card">
            <p className="question-text">{q.questionText}</p>
            <ul className="options-list">
              {q.options.map((opt, idx) => (
                <li key={idx}>{opt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Learning;
