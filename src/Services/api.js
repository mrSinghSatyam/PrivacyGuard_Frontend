// Frontend/src/Services/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,          // set true if you start using cookies/sessions
  timeout: 10000,
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function logAudit(action, actor = "User") {
  try {
    await api.post("/audit", { actor, action });
  } catch (err) {
    console.error("Failed to log audit event:", err.response?.data || err.message);
  }
}
