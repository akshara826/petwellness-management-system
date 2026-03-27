import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, "")
  : "http://localhost:8080/api";

const API = axios.create({
  baseURL,
  headers: {
    Accept: "application/json, text/plain, */*",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
