import { JwtPayload } from "jsonwebtoken"
import User from "../models/userModel"
import CustomError from "../utils/customErrorHandler"
import { uploadToS3, generatePresignedUrl } from "../middleware/profilePicUploader";

//Get User by ID
export const getUserByIdService = async(userId:string | undefined | JwtPayload) =>{
    const specificUser = await User.findById(userId)
    if(!specificUser){
        throw new CustomError("user not found", 404)
    }
    if (specificUser.profilePic !== null && specificUser.profilePic !== undefined) {
        specificUser.profilePic = await generatePresignedUrl(specificUser.profilePic);
      }
    return{
        message:"user data fetched",
        user: specificUser
    }
}

//Profile Upload
export const profilePictureService = async (userId: string, file: Express.Multer.File): Promise<string> => {
    if (!file) {
        throw new CustomError("No file uploaded", 400);
    }
    if (!userId) {
        throw new CustomError("User ID is required", 400);
    }

    const fileUrl: string = await uploadToS3(file);
    const user = await User.findByIdAndUpdate(userId, { profilePic: fileUrl }, { new: true });

    if (!user) {
        throw new CustomError("User not found", 404);
    }

    return fileUrl;
};

//Edit User
export const userEditService = async (id: string, data: { name?: string; email?: string; age?: number; phone?: string }) => {
    const { name, email, age, phone } = data;
    const user = await User.findByIdAndUpdate(id, { name, email, age, phone }, { new: true });

    if (!user) {
        throw new CustomError("User not found, Try Again", 404);
    }

    return {
        message: "User details updated successfully",
        user
    };
};