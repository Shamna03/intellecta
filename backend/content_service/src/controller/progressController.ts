import { Request, Response } from "express";
import CustomError from "../utils/customError";
import {
  getAllUserProgressService,
  getUserCourseProgressService,
  markLessonAsCompleteService, 
  updateCourseQuizScoreService
} from "../services/progressService";
import UserProgress from "../models/userProgressModel";
import mongoose from "mongoose";

interface AuthRequest extends Request {
  user?: { _id: string };
}

export const markLessonAsComplete = async (req: AuthRequest, res: Response) => {
  const { courseId, lessonId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }

  const { progress } = await markLessonAsCompleteService(userId, courseId, lessonId);

  res.status(200).json({
    status: "success",
    message: "Lesson marked as complete",
    data: progress,
  });
};

  
// export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
//   if (!req.user || !req.user._id) {
//     throw new CustomError("Unauthorized access. User ID not found.", 401);
//   }
//   const userId = req.user._id;
//   const { courseId, lessonId } = req.body;

//   const { progress } = await updateLessonProgressService(
//     userId,
//     courseId,
//     lessonId
//   );

//   res
//     .status(200)
//     .json({
//       status: "success",
//       message: "propgress updated successfully",
//       data: progress,
//     });
// };

export const getAllUserCourseProgress = async(req:AuthRequest, res:Response)=>{
  console.log("hello")
  if (!req.user || !req.user._id) {
      throw new CustomError("Unauthorized access. User ID not found.", 401);
  }
  const userId = req.user._id;
  if(!mongoose.Types.ObjectId.isValid(userId)){
      throw new CustomError("user id format Invalid",401)
  }
  const progressData = await getAllUserProgressService(userId)

  res.status(200).json({status:"success", message:"progress data fetched", data:progressData})
}

export const getUserCourseProgress = async (
  req: AuthRequest,
  res: Response
) => {
  if (!req.user || !req.user._id) {
    throw new CustomError("Unauthorized access. User ID not found.", 401);
  }
  const userId = req.user._id;
  const { courseId } = req.params;

  const { progress } = await getUserCourseProgressService(userId, courseId);

  res
    .status(200)
    .json({
      status: "success",
      message: "propgress fetched successfully",
      data: progress,
    });
};


export const quizScoreUpdate = async (req: AuthRequest, res: Response) => {
  const { courseId, score, totalQuestions = 10 } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new CustomError("User not authenticated", 401);
  }
  const existingProgress = await UserProgress.findOne({ userId, courseId });
  if (existingProgress?.quiz?.attempted && existingProgress.quiz.score >= score) {
    return res.status(400).json({
      status: "fail",
      message: "Your previous score is higher or equal. Resubmission not allowed.",
    });
  }
  
  const { progress } = await updateCourseQuizScoreService(userId, courseId, score, totalQuestions);

  res.status(200).json({
    status: "success",
    message:"Quiz score updated successfully",
    data: progress,
  });
};

export const getTopCourses = async (req: Request, res: Response) => {
    const topCourses = await UserProgress.aggregate([
      {
        $group: {
          _id: "$courseId",
          userCount: { $sum: 1 },
        },
      },
      { $sort: { userCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$course",
      },
      {
        $project: {
          _id: 0,
          courseId: "$course._id",
          title: "$course.title",
          userCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top courses fetched successfully",
      data: topCourses,
    });
};