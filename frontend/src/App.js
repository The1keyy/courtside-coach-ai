// frontend/src/App.js

import React, { useState } from "react";
import axios from "axios";
import defaultCourt from "./assets/default_court.png"; // Make sure this file exists

function App() {
  const [courtB64, setCourtB64]       = useState("");
  const [videoB64, setVideoB64]       = useState("");
  const [transcript, setTranscript]   = useState("");
  const [quarter, setQuarter]         = useState("Full Game");
  const [category, setCategory]       = useState("High School");
  const [result, setResult]           = useState("");
  const [loading, setLoading]         = useState(false);

  // Convert uploaded file (image or video) to Base64
  const fileToBase64 = (file, setter) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  // Load a transcript .txt file as plain text
  const fileToText = (file, setter) => {
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!videoB64 && !transcript.trim()) {
      alert("Either upload a game video (auto-transcribe) or paste/choose a transcript.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        court_b64: courtB64,
        video_b64: videoB64,
        transcript,
        quarter,
        category,
      };
      const { data } = await axios.post(
        "http://localhost:5000/analyze",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      setResult(data.result || "");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ——— Header ——— */}
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-4">
            Courtside Coach AI
          </h1>
          <p className="text-lg text-gray-600">
            Upload a court diagram (or choose default), or a game video (auto-transcribe). Then pick quarter & court type.
          </p>
        </header>

        {/* ——— Form Container ——— */}
        <div className="space-y-8">
          {/* 1. Court Details (Card) */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              1. Court Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Court Type */}
              <div>
                <label className="block mb-2 text-gray-600 font-medium">
                  Court Type 
                  <span className="text-sm text-gray-500 ml-1">
                    (Default diagram appears once you pick)
                  </span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (!courtB64) {
                      setCourtB64(defaultCourt);
                    }
                  }}
                >
                  <option>High School</option>
                  <option>College</option>
                  <option>Professional</option>
                </select>
              </div>

              {/* Quarter */}
              <div>
                <label className="block mb-2 text-gray-600 font-medium">
                  Quarter 
                  <span className="text-sm text-gray-500 ml-1">
                    (Filter transcript)
                  </span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
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
            </div>
          </section>

          {/* 2. Upload (Optional) Court Diagram or Game Video */}
          <section className="bg-gray-50 rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              2. Upload (Optional) Court Diagram or (Optional) Game Video
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              • Court diagram is optional—once you pick a court type, a default map appears.<br/>
              • Upload a game video (MP4) and Whisper will auto-fill transcript below.<br/>
              • Otherwise, paste or upload transcript in next section.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Court Diagram Uploader */}
              <div className="flex flex-col">
                <label className="block mb-2 text-gray-600 font-medium">
                  Court Diagram (PNG/JPG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="mb-4"
                  onChange={(e) => {
                    if (e.target.files.length) {
                      fileToBase64(e.target.files[0], setCourtB64);
                      setVideoB64("");
                    }
                  }}
                />
                {/* Only show court image if courtB64 is set */}
                {courtB64 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={courtB64}
                      alt="Court Preview"
                      className="w-full h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Game Video Uploader */}
              <div className="flex flex-col">
                <label className="block mb-2 text-gray-600 font-medium">
                  Game Video (MP4)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="mb-4"
                  onChange={(e) => {
                    if (e.target.files.length) {
                      fileToBase64(e.target.files[0], setVideoB64);
                      setCourtB64(""); // hide court until next selection
                    }
                  }}
                />
                {videoB64 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <video
                      src={videoB64}
                      controls
                      className="w-full h-48 object-contain"
                    ></video>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Play-by-Play Transcript */}
          <section className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              3. Play-by-Play Transcript
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              • Paste the play-by-play here OR upload a .txt file below.<br/>
              • If you uploaded a video, Whisper will auto-populate this field.
            </p>

            {/* Transcript File Uploader */}
            <div className="mb-4">
              <label className="block mb-2 text-gray-600 font-medium">
                Transcript File (TXT)
              </label>
              <input
                type="file"
                accept=".txt"
                className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                onChange={(e) => {
                  if (e.target.files.length) {
                    fileToText(e.target.files[0], setTranscript);
                  }
                }}
              />
            </div>

            <textarea
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
              placeholder="e.g. Q1 12:00 Jump Ball, Q1 11:50 Player A makes 3PT..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            ></textarea>
          </section>

          {/* 4. Analyze Button */}
          <section className="bg-gray-50 rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full md:w-auto px-8 py-3 text-white font-semibold rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transform transition-transform duration-150 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-1"
              }`}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Analyzing…</span>
                </span>
              ) : (
                "Analyze Game"
              )}
            </button>
            <p className="mt-4 md:mt-0 text-sm text-gray-500 md:ml-6">
              (We’ll identify the top momentum-shifting 3-pointer and mark it on the court.)<br/>
              (Audio/video is optional—ensure either video upload or a transcript.)
            </p>
          </section>

          {/* 5. Coach’s Insight */}
          {result && (
            <section className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                4. Coach’s Insight
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-800">{result}</p>
              </div>
            </section>
          )}
        </div>

        {/* ——— Footer ——— */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          © 2025 Keyshawn Jeannot —{" "}
          <a
            href="https://github.com/The1keyy/courtside-coach-ai"
            className="underline hover:text-blue-700"
          >
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
