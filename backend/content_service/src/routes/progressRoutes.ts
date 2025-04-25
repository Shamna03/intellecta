import express from "express";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import { authMiddleware } from "../middlewares/auth"
import { getAllUserCourseProgress, getTopCourses, getUserCourseProgress, markLessonAsComplete, quizScoreUpdate } from "../controller/progressController";

const progressRouter = express.Router();

progressRouter.post("/update",authMiddleware, asyncErrorHandler( markLessonAsComplete ));
progressRouter.get("/top", asyncErrorHandler( getTopCourses ));
progressRouter.get("/:courseId",authMiddleware, asyncErrorHandler( getUserCourseProgress ));

progressRouter.post("/update/quiz-score",authMiddleware, asyncErrorHandler( quizScoreUpdate ));
progressRouter.get("/allusercourse/aa",authMiddleware,asyncErrorHandler(getAllUserCourseProgress));

export default progressRouter;
