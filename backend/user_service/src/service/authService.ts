import { Response } from "express";
import User from "../models/userModel";
import CustomError from "../utils/customErrorHandler";
import { generateRefreshToken, generateToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/passwordHash";
import { JwtPayload } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";


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
    name: data.firstname + " " + data.lastname,
    email: data.email,
    password: passwordHash,
    profile: data.profile ||"",
    age: data.age,
    phone: data.phone,
  });
  await newUser.save();
  const token =  generateToken(newUser._id, Number(newUser.age), newUser.role)
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
      role?: string;
  };
}

export interface IUser extends Document {
  _id: import("mongoose").Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role?:string;
  age: number;
  save(): Promise<IUser>;
}

export const loginUserService = async (data: LoginData , res:Response): Promise<LoginResponse> => {
  const userExist = await User.findOne({ email: data.email }).select("password age") as IUser | null;
  if (!userExist) {
    throw new CustomError("User not found, please register", 404);
  }

  const validateUser = await comparePassword(data.password, userExist.password);

  if (!validateUser) {
    throw new CustomError("Incorrect password", 401);
  }
  const token = generateToken(userExist._id.toString(),userExist.age, userExist.role); 
  const refreshToken = generateRefreshToken(userExist._id.toString(), userExist.age);

  res.cookie("token",token,{
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 60 * 1000,
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 60 * 1000,
  })
  return {
      message: "User logged in", 
      token, 
      user: {
          id: userExist._id.toString(),
          name: userExist.name,
          email: userExist.email
      },
  };
};

//google login
interface GoogleAuthData { credential: string; }

interface GoogleAuthResponse {
  message: string;
  token: string;
  user: {
      id: string;
      name: string;
      email: string;
  };
}

export const googleAuthentication = async (data: GoogleAuthData, res: Response) : Promise<GoogleAuthResponse> => {
  if(!data.credential){
    throw new CustomError("No Google credentials provided!", 400);
  }
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
      idToken: data.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
    if(!payload || !payload.email || !payload.name){
    throw new CustomError("Google Authentication Failed", 400); 
  }

  let user  = await User.findOne({ email: payload.email });
  if (!user) {
    user = new User({
      name: payload.name,
      email: payload.email,
      password: '',
      profilePic: payload.picture, 
    });
  await user.save();
  }

  if (!user._id) {
    throw new CustomError("User ID not found", 500);
  }

  const token = generateToken(user._id.toString(), Number(user.age), user.role);
  const refreshToken = generateRefreshToken(user._id.toString(), Number(user.age))

  res.cookie("token",token,{
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 60 * 1000,
    // sameSite:"none"
  })
  res.cookie("refreshToken",refreshToken,{
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 60 * 1000,
    // sameSite:"none"
  })

  return {
      message: "User logged in via Google",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      },
  };
};


export const logOutUserService = async(data:any , res:Response)=>{
  res.clearCookie("token",{
      httpOnly: true,
      secure: false,
  })
  res.clearCookie("refreshToken",{
      httpOnly: true,
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

export const adminLoginService = async(data: LoginData, res:Response) : Promise<LoginResponse>=> {
  const adminExist = await User.findOne({email: data.email}).select("password age role") as IUser | null
  
  if(!adminExist){
    throw new CustomError("Admin not exists",404)
  }
  const isAdmin = adminExist.role === "admin";
  if(!isAdmin){
    throw new CustomError("You don't have access to Admin Dashboard",401)
  }
  const validateUser = await comparePassword(data.password, adminExist.password);
  if(!validateUser){
    throw new CustomError("Invalid Credentials",401)
  }

  const token = generateToken(adminExist._id?.toString(), adminExist.age,  adminExist.role);   
  
  res.cookie("token",token,{
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 60 * 1000,
  })
  return {
    message: "User logged in", 
    token, 
    user: {
        id: adminExist._id.toString(),
        name: adminExist.name,
        role: adminExist.role,
        email: adminExist.email
  },
};
}