import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const CONNECTION_STRING = process.env.CONNECTION_STRING ||"";
        if (!CONNECTION_STRING) {
            throw new Error("MongoDB connection string is not defined");
        }
        await mongoose.connect(CONNECTION_STRING);
        console.log("MongoDB Connected Successfully");
    }catch (error) {
        console.error("MongoDB Connection Failed:", error);
    }
};
  
export default connectDB;