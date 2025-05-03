// import Groq from "groq-sdk";
import { gemini } from "../GoogleApi";


const configValue: string = import.meta.env.VITE_GROQ_API_KEY || "default_api_key";

// const groq = new Groq({ apiKey: configValue, dangerouslyAllowBrowser: true });
const configValue2: string =
  import.meta.env.VITE_MYMEMORY_API_KEY || "default_api_key";

export async function translateEnglishToVietnamese(text: string): Promise<string> {
  
  let url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=en|vi`;
  
  if (configValue !== "default_api_key") {
    url += `&key=${configValue2}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.responseData?.translatedText ||
      "Không thể dịch từ tiếng Anh sang tiếng Việt";
  } catch (error) {
    console.error("Lỗi khi dịch:", error);
    return "Không thể dịch từ tiếng Anh sang tiếng Việt";
  }
}

// export async function translateEnglishToVietnamese(text: string) {
//   const translationCompletion = await groq.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: `Dịch "${text}" từ Anh sang Việt`,
//       },
//     ],
//     model: "llama-3.3-70b-versatile",
//   });
//   return translationCompletion.choices[0]?.message?.content || "Không thể dịch từ tiếng Anh sang tiếng Việt";
// }


export async function explainInVietnamese(text: string) {
  // const explanationCompletion = await groq.chat.completions.create({
  //   messages: [
  //     {
  //       role: "user",
  //       content: `Giải thích đáp án của câu hỏi về ngữ pháp và nghĩa mà không cần dịch lại câu hỏi:\n"${text}"`,
  //     },
  //   ],
  //   model: "llama-3.3-70b-versatile",
  // });
  const explanationCompletion = gemini(`Giải thích đáp án của câu hỏi về ngữ pháp và nghĩa mà không cần dịch lại câu hỏi:\n"${text}"`);
  return explanationCompletion || "Không thể giải thích từ tiếng Anh sang tiếng Việt";
}
