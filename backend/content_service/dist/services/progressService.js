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
exports.updateCourseQuizScoreService = exports.getAllUserProgressService = exports.getUserCourseProgressService = exports.updateLessonProgressService = exports.markLessonAsCompleteService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const lessonsModel_1 = __importDefault(require("../models/lessonsModel"));
const userProgressModel_1 = __importDefault(require("../models/userProgressModel"));
const customError_1 = __importDefault(require("../utils/customError"));
const lessonProgressModel_1 = __importDefault(require("../models/lessonProgressModel"));
const markLessonAsCompleteService = (userId, courseId, lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lessonId || !courseId) {
        throw new customError_1.default("Lesson Id and course Id are required", 400);
    }
    const lessonProgress = yield lessonProgressModel_1.default.findOneAndUpdate({ userId, courseId, lessonId }, { completed: true, completedAt: new Date() }, { upsert: true, new: true });
    const totalLessons = yield lessonsModel_1.default.countDocuments({ course: courseId });
    let userProgress = yield userProgressModel_1.default.findOne({ userId, courseId });
    const lessonObjectId = new mongoose_1.default.Types.ObjectId(lessonId);
    if (userProgress) {
        if (!userProgress.completedLessons.includes(lessonObjectId)) {
            userProgress.completedLessons.push(lessonObjectId);
        }
        userProgress.progressPercent =
            (userProgress.completedLessons.length / totalLessons) * 100;
        userProgress.currentLesson = lessonObjectId;
        userProgress.lastUpdated = new Date();
        yield userProgress.save();
    }
    else {
        userProgress = yield userProgressModel_1.default.create({
            userId,
            courseId,
            completedLessons: [lessonObjectId],
            currentLesson: lessonObjectId,
            progressPercent: (1 / totalLessons) * 100,
        });
    }
    return { progress: lessonProgress };
});
exports.markLessonAsCompleteService = markLessonAsCompleteService;
const updateLessonProgressService = (userId, courseId, lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId || !courseId || !lessonId) {
        throw new customError_1.default("Please provide the userId, courseId and lessonId", 404);
    }
    const totalLessons = yield lessonsModel_1.default.countDocuments({ course: courseId });
    let progress = yield userProgressModel_1.default.findOne({ userId, courseId });
    const lessonObjectId = new mongoose_1.default.Types.ObjectId(lessonId);
    if (progress) {
        const alreadyCompleted = progress.completedLessons.some((id) => id.equals(lessonObjectId));
        if (!alreadyCompleted) {
            progress.completedLessons.push(lessonObjectId);
        }
        progress.progressPercent =
            (progress.completedLessons.length / totalLessons) * 100;
        progress.currentLesson = lessonObjectId;
        progress.lastUpdated = new Date();
        yield progress.save();
    }
    else {
        progress = yield userProgressModel_1.default.create({
            userId,
            courseId,
            completedLessons: [lessonObjectId],
            currentLesson: lessonObjectId,
            progressPercent: (1 / totalLessons) * 100,
        });
    }
    return { progress };
});
exports.updateLessonProgressService = updateLessonProgressService;
const getUserCourseProgressService = (userId, courseId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId || !courseId) {
        throw new customError_1.default("Please provide the userId, courseId and lessonId", 404);
    }
    const progress = yield userProgressModel_1.default.findOne({ userId, courseId });
    if (!progress) {
        throw new customError_1.default("No progress found", 404);
    }
    return { progress };
});
exports.getUserCourseProgressService = getUserCourseProgressService;
const getAllUserProgressService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new customError_1.default("your session expired, please login", 404);
    }
    const progressData = yield userProgressModel_1.default.find({ userId: userId }).populate("courseId");
    if (!progressData) {
        throw new customError_1.default("No progress data found", 404);
    }
    return progressData;
});
exports.getAllUserProgressService = getAllUserProgressService;
const updateCourseQuizScoreService = (userId, courseId, score, totalQuestions) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId ||
        !courseId ||
        score === undefined ||
        totalQuestions === undefined) {
        throw new customError_1.default("Missing required quiz data", 400);
    }
    const progress = yield userProgressModel_1.default.findOne({ userId, courseId });
    if (!progress) {
        throw new customError_1.default("Please complete lessons before attempting quiz", 404);
    }
    progress.quiz = {
        attempted: true,
        score,
        totalQuestions,
        completedAt: new Date(),
    };
    progress.lastUpdated = new Date();
    yield progress.save();
    return { progress };
});
exports.updateCourseQuizScoreService = updateCourseQuizScoreService;
