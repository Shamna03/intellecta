import { Request, Response } from "express";
import Assessment from "../models/assessmentModel";
import CustomError from "../utils/customError";

interface AuthRequest extends Request {
  user?: { _id: string };
}

export const generateSyllabus = async (req: AuthRequest, res: Response) => {
    const  userId  = req.user?._id;
    const userAssessment = await Assessment.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!userAssessment || !userAssessment.aiResponse) {
      throw new CustomError("Learning path not found for this user", 404);
    }

    const { aiResponse,strengths, weaknesses } = userAssessment;
    const aiPrompt = `
      Generate a structured syllabus tailored to the user's needs.
      
      Learning Path: ${JSON.stringify(aiResponse)}
      Strengths: ${JSON.stringify(strengths)}
      Weaknesses: ${JSON.stringify(weaknesses)}

      Ensure the syllabus:
- Aligns lessons with corresponding modules.
- Addresses the user's weaknesses by reinforcing difficult topics.
- Enhances strengths by introducing advanced concepts.
- Includes interactive elements (projects, challenges, quizzes).
      
      Format the response as JSON with:
     {
    "modules": [{ "name": "Module Name", "description": "Short Description" }],
    "lessons": [{ "title": "Lesson Title", "module": "Module Name", "description": "Short Summary", "estimated_time_minutes": X }],
    "interactive_elements": [{ "title": "Activity Name", "module": "Module Name", "type": "quiz/project/challenge", "description": "Brief Explanation" }],
    "resources": ["List of URLs"]
  }
      
      Return **only valid JSON**, without explanations or extra text.
    `;
    const aiFeedback = aiPrompt;

    const syllabus = extractCompleteSyllabus(aiResponse);

    if (!syllabus) {
      throw new CustomError("Failed to extract valid syllabus from AI response", 500);
    }
    res.json({
      status: 'success',
      message: "Syllabus generated successfully",
      syllabus: Array.isArray(syllabus) ? syllabus : [syllabus],
    });
};

function extractCompleteSyllabus(response: any) {
  try {
    if (Array.isArray(response) && response[0]?.generated_text) {
      const generatedText = response[0].generated_text;
      const lastJsonStartIndex = generatedText.lastIndexOf('{\n');
      
      if (lastJsonStartIndex !== -1) {
        const jsonSubstring = generatedText.substring(lastJsonStartIndex);
        try {
          return JSON.parse(jsonSubstring);
        } catch (e) {
          console.error("Error parsing last JSON section:", e);
        }
      }
      const jsonMatches = [...generatedText.matchAll(/(\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\})/g)];
      if (jsonMatches.length > 0) {
        const lastMatch = jsonMatches[jsonMatches.length - 1][0];
        try {
          const parsed = JSON.parse(lastMatch);
          if (parsed.modules && parsed.lessons) {
            return parsed;
          }
        } catch (e) {
          console.log("Could not parse last JSON match");
        }
        for (let i = jsonMatches.length - 1; i >= 0; i--) {
          try {
            const match = jsonMatches[i][0];
            const parsed = JSON.parse(match);
            if (parsed.modules && parsed.lessons) {
              return parsed;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
    if (typeof response === 'object' && response !== null) {
      if (response.modules && response.lessons) {
        return response;
      }
    }
    
    console.error("Could not extract valid syllabus JSON");
    return null;
  } catch (error) {
    console.error("Error in syllabus extraction:", error);
    return null;
  }
}

