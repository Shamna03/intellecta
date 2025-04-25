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
exports.getFilteredCoursesService = exports.searchCoursesService = exports.getLessonByIdService = exports.getCourseWithLessonsService = exports.getAllCoursesBySubjectService = exports.getAllCoursesService = void 0;
const coursesModel_1 = __importDefault(require("../models/coursesModel"));
const lessonsModel_1 = __importDefault(require("../models/lessonsModel"));
// import LessonProgress from "../models/lessonProgressModel";
const customError_1 = __importDefault(require("../utils/customError"));
const upload_1 = require("../middlewares/upload");
const isS3ObjectKey = (thumbnail) => {
    return !/^https?:\/\//i.test(thumbnail);
};
const getAllCoursesService = (_a) => __awaiter(void 0, [_a], void 0, function* ({ skip, limit, filter = {}, }) {
    const courses = yield coursesModel_1.default.find(filter).skip(skip).limit(limit);
    const totalCourses = yield coursesModel_1.default.countDocuments(filter);
    const coursesWithPresignedUrls = yield Promise.all(courses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const courseData = course.toObject();
        if (course.thumbnail) {
            if (isS3ObjectKey(course.thumbnail)) {
                const presignedUrl = yield (0, upload_1.generatePresignedUrl)(course.thumbnail);
                courseData.thumbnail = presignedUrl !== null && presignedUrl !== void 0 ? presignedUrl : undefined;
            }
            else {
                courseData.thumbnail = (_a = course.thumbnail) !== null && _a !== void 0 ? _a : undefined;
            }
        }
        else {
            courseData.thumbnail = undefined;
        }
        return courseData;
    })));
    return { courses: coursesWithPresignedUrls, totalCourses };
});
exports.getAllCoursesService = getAllCoursesService;
const getAllCoursesBySubjectService = (subject, gradeLevel) => __awaiter(void 0, void 0, void 0, function* () {
    if (!subject || !gradeLevel) {
        throw new customError_1.default("Please provide the subject", 404);
    }
    const courses = yield coursesModel_1.default.find({ subject, gradeLevel, isDeleted: false });
    if (!courses || courses.length === 0) {
        throw new customError_1.default("There are no course for this subject", 404);
    }
    const coursesWithPresignedUrls = yield Promise.all(courses.map((course) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const courseData = course.toObject();
        if (course.thumbnail) {
            if (isS3ObjectKey(course.thumbnail)) {
                const presignedUrl = yield (0, upload_1.generatePresignedUrl)(course.thumbnail);
                courseData.thumbnail = presignedUrl !== null && presignedUrl !== void 0 ? presignedUrl : undefined;
            }
            else {
                courseData.thumbnail = (_a = course.thumbnail) !== null && _a !== void 0 ? _a : undefined;
            }
        }
        else {
            courseData.thumbnail = undefined;
        }
        return courseData;
    })));
    return { courses: coursesWithPresignedUrls };
});
exports.getAllCoursesBySubjectService = getAllCoursesBySubjectService;
const getCourseWithLessonsService = (courseId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!courseId) {
        throw new customError_1.default("Please provide the course id", 404);
    }
    const course = yield coursesModel_1.default.findById(courseId);
    if (!course) {
        throw new customError_1.default("Course not found", 404);
    }
    const lessons = yield lessonsModel_1.default.find({ course: courseId }).sort({ order: 1 });
    if (!lessons) {
        throw new customError_1.default("No lessons for the provided course", 404);
    }
    return { course, lessons };
});
exports.getCourseWithLessonsService = getCourseWithLessonsService;
const getLessonByIdService = (lessonId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lessonId) {
        throw new customError_1.default("Please provide the lesson id", 404);
    }
    const lesson = yield lessonsModel_1.default.findById(lessonId);
    if (!lesson) {
        throw new customError_1.default("Lesson not found", 404);
    }
    return { lesson };
});
exports.getLessonByIdService = getLessonByIdService;
const searchCoursesService = (subject, level) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {};
    if (subject)
        query.subject = subject;
    if (level)
        query.difficultyLevel = level;
    query.isDeleted = false;
    const courses = yield coursesModel_1.default.find(query);
    if (!courses || courses.length === 0) {
        throw new customError_1.default("No courses found for the given filters", 404);
    }
    return { courses };
});
exports.searchCoursesService = searchCoursesService;
const getFilteredCoursesService = (subject, gradeLevel, difficultyLevel) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
    if (subject) {
        filter.subject = subject.toLowerCase();
    }
    if (gradeLevel) {
        const grades = gradeLevel.split(",").map((g) => {
            const gradeNum = Number(g.replace("Grade ", ""));
            if (isNaN(gradeNum))
                throw new customError_1.default("Invalid grade level", 400);
            return gradeNum;
        });
        filter.gradeLevel = { $in: grades };
    }
    if (difficultyLevel) {
        const levels = difficultyLevel.split(",").map((l) => l.toLowerCase());
        filter.difficultyLevel = { $in: levels };
    }
    filter.isDeleted = false;
    const courses = yield coursesModel_1.default.find(filter);
    if (!courses || courses.length === 0) {
        throw new customError_1.default("No courses found for the given filters", 404);
    }
    return { courses };
});
exports.getFilteredCoursesService = getFilteredCoursesService;
