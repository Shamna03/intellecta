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
exports.getTopCourses = exports.quizScoreUpdate = exports.getUserCourseProgress = exports.getAllUserCourseProgress = exports.markLessonAsComplete = void 0;
const customError_1 = __importDefault(require("../utils/customError"));
const progressService_1 = require("../services/progressService");
const userProgressModel_1 = __importDefault(require("../models/userProgressModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const markLessonAsComplete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { courseId, lessonId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        throw new customError_1.default("User not authenticated", 401);
    }
    const { progress } = yield (0, progressService_1.markLessonAsCompleteService)(userId, courseId, lessonId);
    res.status(200).json({
        status: "success",
        message: "Lesson marked as complete",
        data: progress,
    });
});
exports.markLessonAsComplete = markLessonAsComplete;
// export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
//   if (!req.user || !req.user._id) {
//     throw new CustomError("Unauthorized access. User ID not found.", 401);
//   }
//   const userId = req.user._id;
//   const { courseId, lessonId } = req.body;
//   const { progress } = await updateLessonProgressService(
//     userId,
//     courseId,
//     lessonId
//   );
//   res
//     .status(200)
//     .json({
//       status: "success",
//       message: "propgress updated successfully",
//       data: progress,
//     });
// };
const getAllUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("hello");
    if (!req.user || !req.user._id) {
        throw new customError_1.default("Unauthorized access. User ID not found.", 401);
    }
    const userId = req.user._id;
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        throw new customError_1.default("user id format Invalid", 401);
    }
    const progressData = yield (0, progressService_1.getAllUserProgressService)(userId);
    res.status(200).json({ status: "success", message: "progress data fetched", data: progressData });
});
exports.getAllUserCourseProgress = getAllUserCourseProgress;
const getUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user._id) {
        throw new customError_1.default("Unauthorized access. User ID not found.", 401);
    }
    const userId = req.user._id;
    const { courseId } = req.params;
    const { progress } = yield (0, progressService_1.getUserCourseProgressService)(userId, courseId);
    res
        .status(200)
        .json({
        status: "success",
        message: "propgress fetched successfully",
        data: progress,
    });
});
exports.getUserCourseProgress = getUserCourseProgress;
const quizScoreUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { courseId, score, totalQuestions = 10 } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        throw new customError_1.default("User not authenticated", 401);
    }
    const existingProgress = yield userProgressModel_1.default.findOne({ userId, courseId });
    if (((_b = existingProgress === null || existingProgress === void 0 ? void 0 : existingProgress.quiz) === null || _b === void 0 ? void 0 : _b.attempted) && existingProgress.quiz.score >= score) {
        return res.status(400).json({
            status: "fail",
            message: "Your previous score is higher or equal. Resubmission not allowed.",
        });
    }
    const { progress } = yield (0, progressService_1.updateCourseQuizScoreService)(userId, courseId, score, totalQuestions);
    res.status(200).json({
        status: "success",
        message: "Quiz score updated successfully",
        data: progress,
    });
});
exports.quizScoreUpdate = quizScoreUpdate;
const getTopCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const topCourses = yield userProgressModel_1.default.aggregate([
        {
            $group: {
                _id: "$courseId",
                userCount: { $sum: 1 },
            },
        },
        { $sort: { userCount: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: "courses",
                localField: "_id",
                foreignField: "_id",
                as: "course",
            },
        },
        {
            $unwind: "$course",
        },
        {
            $project: {
                _id: 0,
                courseId: "$course._id",
                title: "$course.title",
                userCount: 1,
            },
        },
    ]);
    res.status(200).json({
        success: true,
        message: "Top courses fetched successfully",
        data: topCourses,
    });
});
exports.getTopCourses = getTopCourses;
