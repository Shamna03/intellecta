import mongoose, { Schema, Document } from "mongoose";

interface IResource {
  type: string;
  title: string;
  difficulty: string;
  link: string;
}

interface ILearningPath {
  subject: string;
  currentLevel: string;
  learningGoals: string[];
  resources: IResource[];
}

interface IAIResponse {
  learningPaths: ILearningPath[];
  nextSteps: string[];
  motivationalNote: string;
}

interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  subjectScores: Map<string, number>;
  strengths: string[]; 
  weaknesses: string[]; 
  aiResponse?: IAIResponse;
}

const ResourceSchema: Schema = new Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, required: true },
  link: { type: String, required: true }
});

const LearningPathSchema: Schema = new Schema({
  subject: { type: String, required: true },
  currentLevel: { type: String, required: true },
  learningGoals: { type: [String], required: true },
  resources: { type: [ResourceSchema], required: true }
});

const AIResponseSchema: Schema = new Schema({
  learningPaths: { type: [LearningPathSchema], required: true },
  nextSteps: { type: [String], required: true },
  motivationalNote: { type: String, required: true }
});

const AssessmentSchema: Schema = new Schema(
  {
    userId : { 
      type: Schema.Types.ObjectId, 
      ref: "User", required: true 
    },
    totalQuestions: { 
      type: Number, 
      required: true 
    },
    correctCount: { 
      type: Number, 
      required: true 
    },
    scorePercentage: { 
      type: Number, 
      required: true 
    },
    subjectScores: { 
      type: Map, of: Number, 
      default: {} 
    }, 
    strengths: { 
      type: [String], 
      default: [] 
    },
    weaknesses: { 
      type: [String], 
      default: [] 
    },
    aiResponse: { 
      type: AIResponseSchema, 
      default: null 
    }
   
  },
  { timestamps: true }
);

const Assessment = mongoose.model<IAssessment>("AssessmentResult", AssessmentSchema);
export default Assessment;
