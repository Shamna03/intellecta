import mongoose, { Schema, Document } from "mongoose";


interface ICourse extends Document {
    title: string;
    subject: string;
    description: string;
    gradeLevel: number;
    difficultyLevel: string;
    thumbnail?: string | undefined; 
    isDeleted:boolean;
} 


const CourseSchema: Schema = new Schema(
  {
    title:{
        type: String,
        required: true,
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    gradeLevel: { 
      type: Number, 
      required: true 
    }, 
    difficultyLevel: { 
      type: String, 
      enum: ["beginner", "intermediate", "advanced"], 
      required: true 
    },
    thumbnail: { 
      type: String 
    },
    isDeleted: {
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);

const Course = mongoose.model<ICourse>("Course", CourseSchema);
export default Course;
