import { JwtPayload } from "jsonwebtoken"
import User from "../models/userModel"
import CustomError from "../utils/customErrorHandler"

export const getUserByIdService = async(userId:string | undefined | JwtPayload) =>{
    const specificUser = await User.findById(userId)
    if(!specificUser){
        throw new CustomError("user not found", 404)
    }
    return{
        message:"user data fetched",
        user:specificUser
    }
}