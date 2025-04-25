"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncErrorHandler_1 = require("../middlewares/asyncErrorHandler");
const auth_1 = require("../middlewares/auth");
const progressController_1 = require("../controller/progressController");
const progressRouter = express_1.default.Router();
progressRouter.post("/update", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(progressController_1.markLessonAsComplete));
progressRouter.get("/top", (0, asyncErrorHandler_1.asyncErrorHandler)(progressController_1.getTopCourses));
progressRouter.get("/:courseId", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(progressController_1.getUserCourseProgress));
progressRouter.post("/update/quiz-score", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(progressController_1.quizScoreUpdate));
progressRouter.get("/allusercourse/aa", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(progressController_1.getAllUserCourseProgress));
exports.default = progressRouter;
