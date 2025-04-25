import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const generateQuizzes = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating learning path.";
  }
};


// import { openai } from '../config/openai'; // or however you’ve configured it

// export const generateQuizzes = async (prompt: string): Promise<string> => {
//     const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//     });
//     return completion.choices[0].message.content!;
// };
