import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

export const getAiTutorResponse = async (userResponses: any): Promise<string[]> => {
    try {
        const response = await axios.post(
            MODEL_URL,
            {
                inputs: `Assess this user's learning level and suggest a personalized learning path: ${JSON.stringify(userResponses)}`,
            },
            {
                headers: {
                    Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error generating questions:", error);
        throw new Error("Failed to generate questions");
    }
};
