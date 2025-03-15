import mongoose, { Schema, Document } from "mongoose";

interface IAssessment extends Document {
  userId: string;
  responses: { questionId: number; answer: string }[];
  score: number;
  level: "beginner" | "intermediate" | "advanced";
}

const AssessmentSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    responses: [{ questionId: Number, answer: String }],
    score: { type: Number, default: 0 },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  },
  { timestamps: true }
);

const Assessment = mongoose.model<IAssessment>("Assessment", AssessmentSchema);
export default Assessment;
