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
exports.evaluateAssessment = exports.getAssessmentQuestions = void 0;
const assessmentQuesService_1 = require("../services/assessmentQuesService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getAssessmentQuestions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("getAssessmentQuestions");
    console.log("req", req.user);
    const { userId, age, level, questions } = yield (0, assessmentQuesService_1.getAssessmentQuesService)((_a = req.user) === null || _a === void 0 ? void 0 : _a._id);
    console.log("questions", questions);
    res.status(200).json({
        status: "success",
        message: "Assessment Questions",
        userId,
        age,
        level,
        questions
    });
});
exports.getAssessmentQuestions = getAssessmentQuestions;
const evaluateAssessment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        throw new Error("Not authenticated, please login");
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id;
    if (!userId) {
        throw new Error("Invalid user");
    }
    console.log("extracting userId: ", userId);
    const { assessmentResult } = yield (0, assessmentQuesService_1.evaluateAssessmentService)(userId, req.body);
    res.status(200).json({
        message: "Assessment evaluated successfully",
        assessmentResult
    });
});
exports.evaluateAssessment = evaluateAssessment;
