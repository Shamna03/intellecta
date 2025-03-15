import { Response } from "express";
import User from "../models/userModel";
import CustomError from "../utils/customErrorHandler";
import { generateRefreshToken, generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/passwordHash";
import { JwtPayload } from "jsonwebtoken";


//user register
export const registerUser = async (data: any , res:Response) => {
  if (!data) {
    throw new CustomError("input datas not found", 404);
  }
  const userEmail = data.email;
  const existUser = await User.findOne({ email: userEmail });
  if (existUser) {
    throw new CustomError(
      "user with this email already exist, pleasee try another email",
      404
    );
  }
  if (data.age < 5 || data.age > 18) {
    throw new CustomError("you are not eligible to create account", 404);
  }
  const passwordHash = await hashPassword(data.password);
  if (!passwordHash) {
    throw new CustomError("password encryption failed", 404);
  }
  const newUser = new User({
    name: data.name,
    email: data.email,
    password: passwordHash,
    profile: data.profile,
    age: data.age,
    phone: data.phone,
  });
  await newUser.save();

  const token =  generateToken(newUser._id)
  res.cookie("token", token,{
    httpOnly: true,
    secure: false,
  })

  return { message: "user registered successfully", token:token };
};




//login
interface LoginData {
  email: string;
  password: string;
}

// Define return type
interface LoginResponse {
  message: string;
  token: string;
  user: {
      id: string;
      name: string;
      email: string;
  };
}

// Type your User model (assuming it’s defined elsewhere)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  age: number;
  _id: import("mongoose").Types.ObjectId;
}

export const loginUserService = async (data: LoginData , res:Response): Promise<LoginResponse> => {
  const userExist = await User.findOne({ email: data.email }).select("password") as IUser | null;
  if (!userExist) {
      throw new CustomError("User not found, please register", 404);
  }

  const validateUser = await comparePassword(data.password, userExist.password);

  if (!validateUser) {
      throw new CustomError("Incorrect password", 401); // 401 for unauthorized
  }

  const token = generateToken(userExist._id.toString()); // Convert ObjectId to string
  const refreshToken = generateRefreshToken(userExist._id.toString())

  res.cookie("token",token,{
    httpOnly: true,
    secure: false,
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly: true,
    secure: false,
  })
  return {
      message: "User logged in", // Fixed typo: "loggined" → "logged in"
      token, // No .toString() needed
      user: {
          id: userExist._id.toString(), // Convert to string for consistency
          name: userExist.name,
          email: userExist.email,
      },
  };
};


export const logOutUserService = async(data:any , res:Response)=>{
  res.clearCookie("token",{
    httpOnly: true, // Match the settings from login
      secure: false,
  })
  return {message:"user logged out"}
}

export const changePasswordService = async (id:string | undefined | JwtPayload , data:any ) => {
    const oldPassword = data.currentpassword
    if(!oldPassword){
      throw new CustomError("old password required",404)
    }
    const newpassword = data.newpassword
    if(!newpassword){
      throw new CustomError("new password required",404)
    }

    if(oldPassword == newpassword){
      throw new CustomError("the new password should not be same as the current password",404)
    }
    const currentUserData = await User.findById(id).select("password")
    if(!currentUserData){
      throw new CustomError("cannot fetch current user data",404)
    }
    const fetchedPassword = currentUserData.password          
    const passwordCheck = await comparePassword(oldPassword , fetchedPassword )
    if(!passwordCheck){
      throw new CustomError("current password is wrong",404)
    }
    const hashedPsswd = await hashPassword(newpassword)
    if(!hashedPsswd){
      throw new CustomError("password is not hashed",404)
    }
    
    currentUserData.password = hashedPsswd
    await currentUserData.save()
    return {message:"password changed successfully"}
}