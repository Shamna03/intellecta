import express from "express";
import { evaluateAssessment, getAssessmentQuestions } from "../controllers/assessmentController";
import { authMiddleware } from "../middlewares/auth";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";
import { generateSyllabus } from "../controllers/aiTutorController";

const assessmentRouter = express.Router();

assessmentRouter.get("/questions", authMiddleware, asyncErrorHandler ( getAssessmentQuestions ));
assessmentRouter.post("/evaluate", authMiddleware, asyncErrorHandler ( evaluateAssessment ));
assessmentRouter.get("/syllabus", authMiddleware, asyncErrorHandler ( generateSyllabus ));



export default assessmentRouter;