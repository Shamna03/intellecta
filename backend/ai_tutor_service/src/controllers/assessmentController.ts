import { Request, Response } from "express";
import { evaluateAssessmentService, getAssessmentQuesService } from "../services/assessmentQuesService";

interface AuthRequest extends Request {
    user?: { _id: string };
}
  
export const getAssessmentQuestions = async (req: AuthRequest, res: Response ): Promise<void>  => {
  const { userId, age, level, questions } = await getAssessmentQuesService(req.user?._id);
  res.status(200).json({
    status: "success",
    message: "Assessment Questions",
    userId,
    age,
    level,
    questions
  }); 
};

export const evaluateAssessment = async( req: Request, res: Response) => {
  const { assessmentResult, aiFeedback } = await evaluateAssessmentService(req.body);
  res.status(200).json({
    message: "Assessment evaluated successfully",
    assessmentResult,
    aiFeedback
  })
};
