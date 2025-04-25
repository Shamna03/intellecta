import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
    subject: string;
    question: string;
    options: string[];
    correctAnswer: string;
    difficulty: "beginner" | "intermediate" | "advanced";
}

const questionSchema: Schema = new Schema ({
    subject: { 
        type: String,  
        required: true 
    },
    question: { 
        type: String, 
        required: true 
    },
    options: { 
        type: [String], 
        required: true 
    },
    correctAnswer: { 
        type: String, 
        required: true 
    },
    difficulty: { 
        type: String, 
        enum: ["beginner", "intermediate", "advanced"], 
        required: true 
    },
});

const question = mongoose.model<IQuestion>("Question", questionSchema);

export default question;