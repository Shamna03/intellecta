import axios from "axios";
import AssessmentQuestion from "../models/questionModel";
import { determineUserLevel } from "../utils/userLevel";
import CustomError from "../utils/customError";
import { getAiTutorResponse } from "../utils/huggingFaceService";
import { Document } from "mongoose";

interface QuestionDocument extends Document {
    _id: string;
    subject: string;
    correctAnswer: string;
}

export const getAssessmentQuesService = async (userId?: string) => {
    if (!userId) {
        throw new CustomError("Unauthorized: No user ID found", 401);
    }

    const userServiceUrl = `${process.env.USER_SERVICE_URL}/${userId}`;
    const userResponse = await axios.get(userServiceUrl);

    if (userResponse.status !== 200) {
        throw new CustomError("Failed to fetch user details", 400);
    }

    const { age } = userResponse.data.data.user;
    const level = determineUserLevel(age);

    const questions = await AssessmentQuestion.find({ difficulty: level }).limit(10).lean();

    return { userId, age, level, questions };
};

export const evaluateAssessmentService = async( data: any) => {
    const { userId, answers } = data;
    if (!userId || !answers || !Array.isArray(answers)) {
        throw new CustomError("Invalid input data" , 400);
    }
    const questionIds = answers.map(a => a._id);
    const questions: QuestionDocument[] = await AssessmentQuestion.find({ _id: { $in: questionIds } });

    let correctCount = 0;
    let totalQuestions = questions.length;
    let subjectScores: Record<string, number> = {};

    answers.forEach(userAnswer => {
        const question = questions.find(q => q._id.toString() === userAnswer._id);
        if (question) {
            const isCorrect = question.correctAnswer === userAnswer.selectedOption;
            if (isCorrect) correctCount++;
            subjectScores[question.subject] = (subjectScores[question.subject] || 0) + (isCorrect ? 1 : 0);
        }
    });
    const scorePercentage = (correctCount / totalQuestions) * 100;
    let strengths = Object.keys(subjectScores).filter(subj => subjectScores[subj] >= 2);
    let weaknesses = Object.keys(subjectScores).filter(subj => subjectScores[subj] < 2);
    const assessmentResult = {
        userId,
        totalQuestions,
        correctCount,
        scorePercentage,
        strengths,
        weaknesses
    };
    const aiFeedback = await getAiTutorResponse(assessmentResult);
    return { assessmentResult, aiFeedback };

}