import React, { useState } from "react";
import axios from "axios";

function App() {
  const [courtB64, setCourtB64] = useState("");
  const [transcript, setTranscript] = useState("");
  const [quarter, setQuarter] = useState("Full Game");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert an uploaded file to Base64 and store it
  const fileToBase64 = (file, setter) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!courtB64 || !transcript.trim()) {
      alert("Please upload a court image and enter a transcript.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/analyze",
        {
          court_b64: courtB64,
          transcript: transcript,
          quarter: quarter,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setResult(response.data.result || "");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Courtside Coach AI
        </h1>

        {/* Quarter selector */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Quarter:</label>
          <select
            className="w-full p-2 border rounded"
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
          >
            <option>Full Game</option>
            <option>Q1</option>
            <option>Q2</option>
            <option>Q3</option>
            <option>Q4</option>
          </select>
        </div>

        {/* Court diagram uploader */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Upload Court Diagram:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files.length) {
                fileToBase64(e.target.files[0], setCourtB64);
              }
            }}
          />
          {courtB64 && (
            <img
              src={courtB64}
              alt="Court Preview"
              className="mt-2 w-full max-w-sm border rounded"
            />
          )}
        </div>

        {/* Transcript textarea */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Paste Play‐by‐Play Transcript:
          </label>
          <textarea
            className="w-full p-2 border rounded"
            rows="5"
            placeholder="Paste the full play‐by‐play here…"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          ></textarea>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded shadow ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing…" : "Analyze Game"}
        </button>

        {/* Display result */}
        {result && (
          <div className="mt-6 bg-gray-50 p-4 rounded border">
            <h2 className="text-xl font-semibold mb-2">
              Coach’s Insight:
            </h2>
            <p className="whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
