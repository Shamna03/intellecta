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
exports.deleteLesson = exports.editLesson = exports.addLesson = void 0;
const lessonsModel_1 = __importDefault(require("../models/lessonsModel"));
const coursesModel_1 = __importDefault(require("../models/coursesModel"));
const upload_1 = require("../middlewares/upload");
const customError_1 = __importDefault(require("../utils/customError"));
// Controller to add a lesson
const addLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, title, type, content, resources, notes, order } = req.body;
    if (!courseId) {
        throw new customError_1.default("Course ID is required.", 400);
    }
    const course = yield coursesModel_1.default.findById(courseId);
    if (!course) {
        throw new customError_1.default("Course not found.", 404);
    }
    let videoUrl = null;
    if (req.file) {
        try {
            const s3Key = yield (0, upload_1.uploadToS3)(req.file);
            videoUrl = yield (0, upload_1.generatePresignedUrl)(s3Key);
            if (!videoUrl) {
                throw new customError_1.default("Failed to generate video URL.", 500);
            }
        }
        catch (error) {
            console.error("Error uploading video to S3:", error);
            throw new customError_1.default("Failed to upload video.", 500);
        }
    }
    // Create a new lesson document
    const newLesson = new lessonsModel_1.default({
        course: courseId,
        title,
        type,
        url: videoUrl,
        content,
        resources,
        notes,
        order,
    });
    const savedLesson = yield newLesson.save();
    res.status(201).json({
        message: "Lesson added successfully.",
        lesson: savedLesson,
    });
});
exports.addLesson = addLesson;
const editLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lessonId } = req.params;
    const { title, type, content, resources, notes, order } = req.body;
    const lesson = yield lessonsModel_1.default.findById(lessonId);
    if (!lesson) {
        throw new customError_1.default("Lesson not found.", 404);
    }
    let videoUrl = lesson.url; // default to existing video
    if (req.file) {
        try {
            const s3Key = yield (0, upload_1.uploadToS3)(req.file);
            const presignedUrl = yield (0, upload_1.generatePresignedUrl)(s3Key);
            if (!presignedUrl) {
                throw new customError_1.default("Failed to generate video URL.", 500);
            }
            videoUrl = presignedUrl;
        }
        catch (error) {
            console.error("Error uploading video to S3:", error);
            throw new customError_1.default("Failed to upload video.", 500);
        }
    }
    const updatedLesson = yield lessonsModel_1.default.findByIdAndUpdate(lessonId, {
        title,
        type,
        url: videoUrl,
        content,
        resources,
        notes,
        order,
    }, { new: true, runValidators: true });
    res.status(200).json({
        message: "Lesson updated successfully.",
        lesson: updatedLesson,
    });
});
exports.editLesson = editLesson;
const deleteLesson = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lessonId } = req.params;
    const lesson = yield lessonsModel_1.default.findByIdAndDelete(lessonId);
    if (!lesson) {
        throw new customError_1.default("Lesson not found.", 404);
    }
    return res.status(200).json({ message: "Lesson deleted successfully." });
});
exports.deleteLesson = deleteLesson;
