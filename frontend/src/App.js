// frontend/src/App.js

import React, { useState } from "react";
import axios from "axios";

function App() {
  const [courtB64, setCourtB64]       = useState("");
  const [videoB64, setVideoB64]       = useState("");
  const [transcript, setTranscript]   = useState("");
  const [quarter, setQuarter]         = useState("Full Game");
  const [category, setCategory]       = useState("High School Court");
  const [result, setResult]           = useState("");
  const [loading, setLoading]         = useState(false);

  // Convert uploaded file (image or video) to Base64
  const fileToBase64 = (file, setter) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if ((!courtB64 && !videoB64) || !transcript.trim()) {
      alert("Upload a court image or video AND enter/paste a transcript.");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Courtside Coach AI
          </h1>
          <p className="mt-2 text-gray-600">
            Upload a court diagram or video, choose your settings, and get the
            biggest momentum-shifting 3-pointer.
          </p>
        </header>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-200">
          {/* 1. Court Details */}
          <section className="p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              1. Court Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Court Type */}
              <div>
                <label className="block mb-1 text-gray-600 font-medium">
                  Court Type
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-400 focus:border-blue-400"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>High School</option>
                  <option>College</option>
                  <option>Professional</option>
                </select>
              </div>
              {/* Quarter */}
              <div>
                <label className="block mb-1 text-gray-600 font-medium">
                  Quarter
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-400 focus:border-blue-400"
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

          {/* 2. Upload Image or Video */}
          <section className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              2. Upload Image or Video
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Uploader */}
              <div className="flex flex-col">
                <label className="block mb-1 text-gray-600 font-medium">
                  Court Diagram (PNG, JPG)
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
                {courtB64 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={courtB64}
                      alt="Court Preview"
                      className="w-full object-contain"
                    />
                  </div>
                )}
              </div>
              {/* Video Uploader */}
              <div className="flex flex-col">
                <label className="block mb-1 text-gray-600 font-medium">
                  Game Video (MP4)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="mb-4"
                  onChange={(e) => {
                    if (e.target.files.length) {
                      fileToBase64(e.target.files[0], setVideoB64);
                      setCourtB64("");
                    }
                  }}
                />
                {videoB64 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <video
                      src={videoB64}
                      controls
                      className="w-full object-contain"
                    ></video>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 3. Transcript */}
          <section className="p-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              3. Play-by-Play Transcript
            </h2>
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400 resize-none"
              placeholder="Paste the full play-by-play here, or upload a video above to auto-transcribe."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            ></textarea>
          </section>

          {/* 4. Analyze Button */}
          <section className="p-6 bg-gray-50 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`px-8 py-3 text-white font-semibold rounded-full shadow-lg transform transition-transform duration-150 ${
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
          </section>

          {/* 5. Coach’s Insight */}
          {result && (
            <section className="p-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                4. Coach’s Insight
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-800">{result}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
