import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error("GEMINI_API_KEY is required in production");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export function getModel() {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
}
