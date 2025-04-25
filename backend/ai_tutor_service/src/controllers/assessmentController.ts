import { Request, Response } from "express";
import { evaluateAssessmentService, getAssessmentQuesService } from "../services/assessmentQuesService";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    user?: { _id: string };
}
  
export const getAssessmentQuestions = async (req: AuthRequest, res: Response ): Promise<void>  => {
  console.log("getAssessmentQuestions");
  console.log("req",req.user)
  const { userId, age, level, questions } = await getAssessmentQuesService(req.user?._id);
  console.log("questions", questions)
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
  const token = req.cookies.token;
  if (!token) {
    throw new Error("Not authenticated, please login");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
  const userId = decoded._id;
  if (!userId) {
    throw new Error("Invalid user");
  }
  console.log("extracting userId: ", userId);

  const { assessmentResult } = await evaluateAssessmentService(userId, req.body);
  res.status(200).json({
    message: "Assessment evaluated successfully",              
    assessmentResult
  })
};

