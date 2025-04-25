"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizzes = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const generateQuizzes = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = yield model.generateContent(prompt);
        return result.response.text();
    }
    catch (error) {
        console.error("Gemini Error:", error);
        return "Error generating learning path.";
    }
});
exports.generateQuizzes = generateQuizzes;
// import { openai } from '../config/openai'; // or however you’ve configured it
// export const generateQuizzes = async (prompt: string): Promise<string> => {
//     const completion = await openai.chat.completions.create({
//         model: "gpt-4",
//         messages: [{ role: "user", content: prompt }],
//         temperature: 0.7,
//     });
//     return completion.choices[0].message.content!;
// };
