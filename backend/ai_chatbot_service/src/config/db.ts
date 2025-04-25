import mongoose from 'mongoose'
import dotenv from 'dotenv'
import CustomError from '../utils/customErrorHandler'

dotenv.config()

const connectDB = async () => {
    try {
        const CONNECTION_STRING = process.env.CONNECTION_STRING || ""  
        if(!CONNECTION_STRING){
            throw new CustomError("connection string not found",404)
        }
        await mongoose.connect(CONNECTION_STRING);
        console.log("chat bot service connection successfull")
    } catch (error) {
        console.log("Error connecting database", error)
    }
}
export default connectDB