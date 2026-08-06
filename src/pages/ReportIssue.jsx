import React, { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "Low",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // simulate submit (you can replace with API later)
    setTimeout(() => setSubmitted(false), 3000);

    setFormData({
      title: "",
      description: "",
      severity: "Low",
    });
  };

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      severity: "Low",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
            <ExclamationCircleIcon className="h-7 w-7 mr-2 text-blue-600" />
            Report a Privacy Issue
          </h1>
          <p className="text-gray-600 mt-2 text-center md:text-left">
            If you&apos;ve noticed any suspicious activity, data misuse, or privacy
            concern, please share the details below so we can investigate.
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 text-green-800 shadow-sm">
            <CheckCircleIcon className="h-6 w-6" />
            <span className="text-sm md:text-base">
              Your issue has been submitted successfully. Thank you for helping us
              improve privacy and security.
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Personal data visible to other users"
              />
              <p className="text-xs text-gray-500 mt-1">
                Give a short, clear name to your issue.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe what happened, where you saw it, and any steps to reproduce the issue (avoid sharing passwords or full IDs)."
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity <span className="text-red-500">*</span>
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Use <span className="font-semibold">High</span> if sensitive data is
                exposed or many users are affected.
              </p>
            </div>

            {/* Info / Note box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start">
                <ExclamationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Before you submit:
                  </p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Don&apos;t include passwords, OTPs, or full ID numbers.</li>
                    <li>• Describe only what is necessary to understand the issue.</li>
                    <li>• Our team will review reports and may contact you for more details.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm md:text-base hover:bg-gray-50 transition"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm md:text-base shadow-md transition"
              >
                🚀 Submit Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
