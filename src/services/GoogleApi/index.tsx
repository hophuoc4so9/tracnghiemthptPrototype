import { GoogleGenerativeAI } from "@google/generative-ai";
const configValue: string = import.meta.env.VITE_GEMINI_API_KEY || "default_api_key";
const genAI = new GoogleGenerativeAI(configValue);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Utility function to extract content from the response
const extractContent = (response: any): string => {
  return response?.candidates?.[0]?.content?.parts?.[0]?.text || "No content available";
};

export const gemini = async (prompt: string) => {
  try {
    const result = await model.generateContent(prompt);

    // Use the utility function to extract content
    const content = extractContent(result.response);
    console.log("contentgemini", content);
    return content;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    return "An error occurred while processing your request.";
  }
};

