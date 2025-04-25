import mongoose from "mongoose";
import Lesson from "../models/lessonsModel";
import UserProgress from "../models/userProgressModel";
import CustomError from "../utils/customError";
import LessonProgress from "../models/lessonProgressModel";

export const markLessonAsCompleteService = async (
  userId: string,
  courseId: string,
  lessonId: string
) => {
  if (!lessonId || !courseId) {
    throw new CustomError("Lesson Id and course Id are required", 400);
  }
  const lessonProgress = await LessonProgress.findOneAndUpdate(
    { userId, courseId, lessonId },
    { completed: true, completedAt: new Date() },
    { upsert: true, new: true }
  );

  const totalLessons = await Lesson.countDocuments({ course: courseId });
  let userProgress = await UserProgress.findOne({ userId, courseId });

  const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

  if (userProgress) {
    if (!userProgress.completedLessons.includes(lessonObjectId)) {
      userProgress.completedLessons.push(lessonObjectId);
    }
    userProgress.progressPercent =
      (userProgress.completedLessons.length / totalLessons) * 100;
    userProgress.currentLesson = lessonObjectId;
    userProgress.lastUpdated = new Date();
    await userProgress.save();
  } else {
    userProgress = await UserProgress.create({
      userId,
      courseId,
      completedLessons: [lessonObjectId],
      currentLesson: lessonObjectId,
      progressPercent: (1 / totalLessons) * 100,
    });
  }

  return { progress: lessonProgress };
};

export const updateLessonProgressService = async (
  userId: string,
  courseId: string,
  lessonId: string
) => {
  if (!userId || !courseId || !lessonId) {
    throw new CustomError(
      "Please provide the userId, courseId and lessonId",
      404
    );
  }
  const totalLessons = await Lesson.countDocuments({ course: courseId });
  let progress = await UserProgress.findOne({ userId, courseId });

  const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

  if (progress) {
    const alreadyCompleted = progress.completedLessons.some((id) =>
      id.equals(lessonObjectId)
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push(lessonObjectId);
    }

    progress.progressPercent =
      (progress.completedLessons.length / totalLessons) * 100;
    progress.currentLesson = lessonObjectId;
    progress.lastUpdated = new Date();
    await progress.save();
  } else {
    progress = await UserProgress.create({
      userId,
      courseId,
      completedLessons: [lessonObjectId],
      currentLesson: lessonObjectId,
      progressPercent: (1 / totalLessons) * 100,
    });
  }
  return { progress };
};

export const getUserCourseProgressService = async (
  userId: string,
  courseId: string
) => {
  if (!userId || !courseId) {
    throw new CustomError(
      "Please provide the userId, courseId and lessonId",
      404
    );
  }
  const progress = await UserProgress.findOne({ userId, courseId });
  if (!progress) {
    throw new CustomError("No progress found", 404);
  }
  return { progress };
};

export const getAllUserProgressService = async (userId: string) => {
  if (!userId) {
    throw new CustomError("your session expired, please login", 404);
  }
  const progressData = await UserProgress.find({ userId: userId }).populate(
    "courseId"
  );
  if (!progressData) {
    throw new CustomError("No progress data found", 404);
  }
  return progressData;
};

export const updateCourseQuizScoreService = async (
  userId: string,
  courseId: string,
  score: number,
  totalQuestions: number
) => {
  if (
    !userId ||
    !courseId ||
    score === undefined ||
    totalQuestions === undefined
  ) {
    throw new CustomError("Missing required quiz data", 400);
  }
  const progress = await UserProgress.findOne({ userId, courseId });

  if (!progress) {
    throw new CustomError(
      "Please complete lessons before attempting quiz",
      404
    );
  }
  progress.quiz = {
    attempted: true,
    score,
    totalQuestions,
    completedAt: new Date(),
  };
  progress.lastUpdated = new Date();
  await progress.save();
  return { progress };
};

