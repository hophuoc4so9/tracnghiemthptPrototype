import axios from "axios";

export const request = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 50000,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
  withCredentials: true, // Include this if you need to send cookies with requests
});