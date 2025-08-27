import React, { useState } from "react";
import axios from "axios";
import "../styles/admin.css";

const AdminUpload = () => {
  const [file, setFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleTopicChange = (e) => setTopic(e.target.value);

  const handleUpload = async () => {
    if (!file || !topic) {
      setMessage("Please select a file and enter a topic.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("topic", topic);

    try {
      const res = await axios.post("http://localhost:5000/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage(`Upload successful! ${res.data.questionsAdded} questions added.`);
      setFile(null);
      setTopic("");
    } catch (err) {
      console.error(err);
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div className="admin-upload">
      <h2>Admin Upload</h2>

      <input
        type="text"
        placeholder="Enter topic for this file"
        value={topic}
        onChange={handleTopicChange}
      />

      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />

      <button onClick={handleUpload}>Upload</button>

      {message && <p className={message.includes("failed") ? "error" : ""}>{message}</p>}
    </div>
  );
};

export default AdminUpload;
