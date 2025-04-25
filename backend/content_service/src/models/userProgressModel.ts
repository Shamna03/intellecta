import mongoose, { Schema, Document } from "mongoose";

interface IQuizProgress {
  attempted: boolean;
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedLessons: mongoose.Types.ObjectId[];
  currentLesson?: mongoose.Types.ObjectId;
  progressPercent: number;
  quiz?: IQuizProgress;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema: Schema<IUserProgress> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: [
      {
        type: Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    currentLesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
    progressPercent: {
      type: Number,
      default: 0,
    },
    quiz: {
      attempted: { type: Boolean, default: false },
      score: Number,
      totalQuestions: Number,
      completedAt: Date,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const UserProgress = mongoose.model<IUserProgress>("UserProgress", UserProgressSchema);
export default UserProgress;
