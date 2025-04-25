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
exports.deleteCourse = exports.editCourse = exports.addCourse = exports.getFilteredCourses = exports.fetchLessonQuiz = exports.generateCourseQuizzesService = exports.searchCourses = exports.getLessonById = exports.getCourseWithLessons = exports.getAllCoursesBySubject = exports.getAllCourses = void 0;
const coursesModel_1 = __importDefault(require("../models/coursesModel"));
const geminiService_1 = require("../utils/geminiService");
const LessonQuiz_1 = __importDefault(require("../models/LessonQuiz"));
const courseServices_1 = require("../services/courseServices");
const customError_1 = __importDefault(require("../utils/customError"));
const gradeMapping_1 = require("../utils/gradeMapping");
const rabbitmqPublish_1 = require("../utils/rabbitmq/rabbitmqPublish");
const userConsumers_1 = require("../consumers/userConsumers");
const upload_1 = require("../middlewares/upload");
const getAllCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const subject = req.query.subject;
    const grade = parseInt(req.query.grade);
    const skip = (page - 1) * limit;
    const search = req.query.search;
    console.log("query.grade raw value:", req.query.search);
    const filter = {};
    const validSubjects = ["maths", "science", "english", "coding", "history"];
    if (subject && validSubjects.includes(subject)) {
        filter.subject = subject;
    }
    if (!isNaN(grade)) {
        filter.gradeLevel = grade;
    }
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } }
        ];
    }
    filter.isDeleted = false;
    const { courses, totalCourses } = yield (0, courseServices_1.getAllCoursesService)({ skip, limit, filter });
    const totalPages = Math.ceil(totalCourses / limit);
    // console.log("good", courses);
    res.status(200).json({ status: "success", message: 'All Courses fetched successfully',
        data: {
            courses,
            pagination: {
                totalCourses,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        }
    });
});
exports.getAllCourses = getAllCourses;
// export const getAllCoursesBySubject = async(req:AuthRequest, res:Response) => {
//     const { subject } = req.params;
//     if (!req.user || !req.user._id) {
//         throw new CustomError("Unauthorized access. User ID not found.", 401);
//       }
//     const userId = req.user._id;
//     await publishToQueue("user_id", userId);
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     let userData = (await getUserData(userId)) as UserData | undefined;
//     if (!userData) {
//         throw new CustomError("User data not found. Try again later.", 400);
//     }
//     if (userData instanceof Map) {
//         userData = Object.fromEntries(userData) as UserData;
//     }
//     const  age  = userData.age;
//     if (!age) {     
//         throw new CustomError("User age not found in token", 400);
//       }
//     const { gradeLevel, difficultyLevel } = mapAgeToGradeAndDifficulty(age);
//     const { courses } = await getAllCoursesBySubjectService(subject, gradeLevel);
//     console.log("ru4",courses);
//     return res.status(200).json({ status:"success", message: "Courses By Subject fetched succcessfully", data: courses});
// };
const getAllCoursesBySubject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Step 1: Request Received");
    const { subject } = req.params;
    if (!req.user || !req.user._id) {
        throw new customError_1.default("Unauthorized access. User ID not found.", 401);
    }
    const userId = req.user._id;
    // Publishing to queue asynchronously (non-blocking)
    console.log("Step 2: Publishing to queue...");
    (0, rabbitmqPublish_1.publishToQueue)("user_id", userId);
    console.log("Step 2: Queue published.");
    // Fetch user data
    console.log("Step 3: Fetching user data...");
    let userData;
    try {
        userData = (yield (0, userConsumers_1.getUserData)(userId));
    }
    catch (err) {
        console.error("Error fetching user data:", err);
        throw new customError_1.default("User data not found. Try again later.", 400);
    }
    if (!userData) {
        throw new customError_1.default("User data not found. Try again later.", 400);
    }
    console.log("Step 4: User data fetched, processing age...");
    if (userData instanceof Map) {
        userData = Object.fromEntries(userData);
    }
    const age = userData.age;
    if (!age) {
        throw new customError_1.default("User age not found in token", 400);
    }
    // Fetch courses by subject and gradeLevel
    console.log("Step 5: Mapping age to gradeLevel and difficultyLevel...");
    const { gradeLevel, difficultyLevel } = (0, gradeMapping_1.mapAgeToGradeAndDifficulty)(age);
    console.log("Step 6: Fetching courses...");
    let courses;
    try {
        courses = yield (0, courseServices_1.getAllCoursesBySubjectService)(subject, gradeLevel);
    }
    catch (err) {
        console.error("Error fetching courses:", err);
        throw new customError_1.default("Error fetching courses by subject.", 500);
    }
    console.log("Step 7: Courses fetched, sending response.");
    res.status(200).json({
        status: "success",
        message: "Courses by subject fetched successfully",
        data: courses,
    });
});
exports.getAllCoursesBySubject = getAllCoursesBySubject;
const getCourseWithLessons = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const { course, lessons } = yield (0, courseServices_1.getCourseWithLessonsService)(courseId);
    res.status(200).json({ status: "success", message: 'Lessons fetched successfully', data: { course, lessons } });
});
exports.getCourseWithLessons = getCourseWithLessons;
const getLessonById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lessonId } = req.params;
    const { lesson } = yield (0, courseServices_1.getLessonByIdService)(lessonId);
    res.status(200).json({ status: "success", message: 'Lesson fetched successfully', data: lesson });
});
exports.getLessonById = getLessonById;
const searchCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, level } = req.query;
    const { courses } = yield (0, courseServices_1.searchCoursesService)(subject, level);
    res
        .status(200)
        .json({
        status: "success",
        message: "Search is successfull",
        data: courses,
    });
});
exports.searchCourses = searchCourses;
const generateCourseQuizzesService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.body;
    const existingQuiz = yield LessonQuiz_1.default.findOne({ courseId });
    if (existingQuiz) {
        return res.status(200).json({
            message: "Quiz already exists for this course",
            questions: existingQuiz.quizzes,
        });
    }
    const course = yield coursesModel_1.default.findById(courseId);
    if (!course)
        throw new customError_1.default("Course not found", 404);
    const { title, subject, description } = course;
    const prompt = `
      Generate 10 multiple choice quiz questions for kids aged 5 to 18.
      Use the following course information:
      Title: "${title}"
      Subject: "${subject}"
      Description: "${description}"
  
      Output format (JSON only):
      {
        "quizzes": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A",
            "explanation": "Simple explanation why this is the correct answer",
            "subject": "${subject}",
            "difficulty": "easy"
          }
        ]
      }
  
      Keep the language simple and fun for kids.
    `;
    const aiResponse = yield (0, geminiService_1.generateQuizzes)(prompt);
    let parsedQuizResponse;
    try {
        const cleanedResponse = aiResponse
            .replace(/```json?/g, "")
            .replace(/```/g, "")
            .trim();
        parsedQuizResponse = JSON.parse(cleanedResponse);
        if (!Array.isArray(parsedQuizResponse.quizzes) ||
            parsedQuizResponse.quizzes.length === 0) {
            throw new Error("No quizzes found");
        }
    }
    catch (error) {
        console.error("Failed to parse AI response:", error);
        throw new customError_1.default("Invalid AI response format", 500);
    }
    const formattedQuestions = parsedQuizResponse.quizzes.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        difficulty: q.difficulty,
    }));
    const newQuiz = yield LessonQuiz_1.default.create({
        courseId,
        quizzes: formattedQuestions,
    });
    return res.status(201).json({
        message: "Quizzes generated and saved",
        questions: newQuiz.quizzes,
    });
});
exports.generateCourseQuizzesService = generateCourseQuizzesService;
const fetchLessonQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const quiz = yield LessonQuiz_1.default.findOne({ courseId });
    if (!quiz) {
        throw new customError_1.default("NO quiz found for this lesson", 400);
    }
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    const formatQuizQuestion = quiz.quizzes.map((q) => ({
        question: q.question,
        options: shuffleArray(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        difficulty: q.difficulty,
    }));
    return res.status(200).json({ message: "quiz fetched successfully", quiz: formatQuizQuestion });
});
exports.fetchLessonQuiz = fetchLessonQuiz;
const getFilteredCourses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject } = req.params;
    const { gradeLevel, difficultyLevel } = req.query;
    const { courses } = yield (0, courseServices_1.getFilteredCoursesService)(subject, gradeLevel, difficultyLevel);
    res.status(200).json({ status: "success", message: "Filtration is successful", data: courses });
});
exports.getFilteredCourses = getFilteredCourses;
const addCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        throw new customError_1.default("Thumbnail image is required", 400);
    }
    const imageUrl = yield (0, upload_1.uploadToS3)(file);
    const course = yield coursesModel_1.default.create(Object.assign(Object.assign({}, req.body), { thumbnail: imageUrl }));
    res.status(201).json({ status: "success", message: "New course added successfully", data: course });
});
exports.addCourse = addCourse;
const editCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    const file = req.file;
    let updatedFields = Object.assign({}, req.body);
    if (file) {
        const imageUrl = yield (0, upload_1.uploadToS3)(file);
        updatedFields.thumbnail = imageUrl;
    }
    const course = yield coursesModel_1.default.findByIdAndUpdate(courseId, updatedFields, {
        new: true, // return the updated document
        runValidators: true, // run schema validators
    });
    if (!course) {
        throw new customError_1.default("Course not found", 404);
    }
    res.status(200).json({
        status: "success",
        message: "Course updated successfully",
        data: course,
    });
});
exports.editCourse = editCourse;
const deleteCourse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    if (!courseId) {
        throw new customError_1.default("Course not found", 404);
    }
    const course = yield coursesModel_1.default.findByIdAndUpdate(courseId, { $set: { isDeleted: true } }, { new: true });
    if (!course) {
        throw new customError_1.default("Course not found", 404);
    }
    return res.status(200).json({
        status: "success",
        message: "Course deleted successfully",
        data: course,
    });
});
exports.deleteCourse = deleteCourse;
