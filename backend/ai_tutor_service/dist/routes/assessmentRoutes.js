"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assessmentController_1 = require("../controllers/assessmentController");
const auth_1 = require("../middlewares/auth");
const asyncErrorHandler_1 = require("../middlewares/asyncErrorHandler");
const aiTutorController_1 = require("../controllers/aiTutorController");
const assessmentRouter = express_1.default.Router();
assessmentRouter.get("/questions", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(assessmentController_1.getAssessmentQuestions));
assessmentRouter.post("/evaluate", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(assessmentController_1.evaluateAssessment));
assessmentRouter.get("/syllabus", auth_1.authMiddleware, (0, asyncErrorHandler_1.asyncErrorHandler)(aiTutorController_1.generateSyllabus));
exports.default = assessmentRouter;
