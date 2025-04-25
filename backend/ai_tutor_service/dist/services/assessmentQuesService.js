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
exports.evaluateAssessmentService = exports.getAssessmentQuesService = void 0;
const questionModel_1 = __importDefault(require("../models/questionModel"));
const userLevel_1 = require("../utils/userLevel");
const customError_1 = __importDefault(require("../utils/customError"));
const assessmentModel_1 = __importDefault(require("../models/assessmentModel"));
const userConsumer_1 = require("../consumers/userConsumer");
const rabbitmqPublish_1 = require("../utils/rabbitmq/rabbitmqPublish");
const geminiService_1 = require("../utils/geminiService");
const getAssessmentQuesService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("user id", userId);
    console.log("entering to the service");
    if (!userId) {
        throw new customError_1.default("Unauthorized: No user ID found", 401);
    }
    yield (0, rabbitmqPublish_1.publishToQueue)("user_id", userId);
    let userData = (yield (0, userConsumer_1.getSpecificUserData)(userId));
    if (!userData) {
        throw new customError_1.default("User data not found. Try again later.", 400);
    }
    if (userData instanceof Map) {
        userData = Object.fromEntries(userData);
    }
    const age = userData.age;
    const level = (0, userLevel_1.determineUserLevel)(age);
    const questions = yield questionModel_1.default.find({ difficulty: level }).limit(15).lean();
    console.log("questions", questions);
    return { userId, age, level, questions };
});
exports.getAssessmentQuesService = getAssessmentQuesService;
const evaluateAssessmentService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = id;
    console.log("consolling userId: ", userId);
    const { answers } = data;
    console.log("ffff", data);
    if (!userId || !answers || !Array.isArray(answers)) {
        throw new customError_1.default("Invalid input data", 400);
    }
    const questionIds = answers.map(a => a._id);
    const questions = yield questionModel_1.default.find({ _id: { $in: questionIds } });
    let correctCount = 0;
    let subjectScores = {};
    questions.forEach(question => {
        if (!subjectScores[question.subject]) {
            subjectScores[question.subject] = 0;
        }
    });
    answers.forEach(userAnswer => {
        const question = questions.find(q => q._id.toString() === userAnswer._id);
        if (question && question.correctAnswer === userAnswer.selectedOption) {
            correctCount++;
            subjectScores[question.subject] += 1;
        }
    });
    const totalQuestions = questions.length;
    const scorePercentage = (correctCount / totalQuestions) * 100;
    const allSubjects = Object.keys(subjectScores);
    const strengthThreshold = 2;
    let strengths = allSubjects.filter(subj => subjectScores[subj] >= strengthThreshold);
    let weaknesses = allSubjects.filter(subj => subjectScores[subj] < strengthThreshold);
    const assessmentResult = {
        userId,
        totalQuestions,
        correctCount,
        scorePercentage,
        strengths,
        weaknesses,
        subjectScores
    };
    const prompt = `
    Create a personalized learning roadmap for a student aged 5-18 based on the assessment results:
    ${JSON.stringify(assessmentResult)}
    
    Generate a JSON with:
    {
        "learningPaths": [
            {
                "subject": "Science/Coding/Math/History/English",
                "currentLevel": "beginner/intermediate/advanced",
                "learningGoals": [
                    "Primary learning objective",
                    "Secondary learning objective"
                ],
                "resources": [
                    {
                        "type": "course/video/project",
                        "title": "Resource name",
                        "difficulty": "beginner/intermediate/advanced",
                        "link": "platform-resource-link"
                    }
                ]
            }
        ],
        "nextSteps": [
            "First learning recommendation",
            "Follow-up recommendation"
        ],
        "motivationalNote": "Encouraging message for the student"
    }
    
    Key Requirements:
    - Personalized and engaging
    - Practical learning resources
    - Clear, actionable learning path
    `;
    const aiResponse = yield (0, geminiService_1.generateLearningPath)(prompt);
    let parsedAiResponse;
    try {
        const cleanedResponse = aiResponse
            .replace(/```json?/g, '')
            .replace(/```/g, '')
            .trim();
        parsedAiResponse = JSON.parse(cleanedResponse);
        if (!Array.isArray(parsedAiResponse.learningPaths) || parsedAiResponse.learningPaths.length === 0) {
            throw new Error('No learning paths found');
        }
    }
    catch (error) {
        console.error('Failed to parse AI response:', error);
        throw new customError_1.default('Invalid AI response format', 500);
    }
    const savedAssessment = new assessmentModel_1.default({
        userId,
        totalQuestions,
        correctCount,
        scorePercentage,
        strengths,
        weaknesses,
        subjectScores,
        aiResponse: parsedAiResponse,
    });
    yield savedAssessment.save();
    return { assessmentResult: savedAssessment };
});
exports.evaluateAssessmentService = evaluateAssessmentService;
