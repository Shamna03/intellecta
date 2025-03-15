import express from "express";
import { evaluateAssessment, getAssessmentQuestions } from "../controllers/assessmentController";
import { authMiddleware } from "../middlewares/auth";
import { asyncErrorHandler } from "../middlewares/asyncErrorHandler";

const assessmentRouter = express.Router();

assessmentRouter.get("/questions", authMiddleware, asyncErrorHandler ( getAssessmentQuestions ));
assessmentRouter.post("/evaluate", authMiddleware, asyncErrorHandler ( evaluateAssessment ));

export default assessmentRouter;