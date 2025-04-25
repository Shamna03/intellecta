import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  quizzes: IQuizQuestion[];
}

const QuizSchema: Schema = new Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true, // Ensure one quiz doc per course
    },
    quizzes: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          required: true,
          validate: (val: string[]) => val.length === 4,
        },
        correctAnswer: { type: String, required: true },
        explanation: { type: String },
        subject: { type: String, required: true },
        difficulty: {
          type: String,
          enum: ["easy", "medium", "hard"],
          default: "easy",
        },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);
export default Quiz;
