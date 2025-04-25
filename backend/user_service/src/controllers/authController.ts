import { NextFunction, Request, Response } from "express";
import {
  adminLoginService,
  changePasswordService,
  loginUserService,
  logOutUserService,
  registerUser,
} from "../service/authService";
import CustomError from "../utils/customErrorHandler";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { hashPassword } from "../utils/passwordHash";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import { googleAuthentication } from "../service/authService";

dotenv.config();

//registration
export const userRegistration = async (req: Request, res: Response) => {
  const data = await registerUser(req.body, res);
  if (!data) {
    throw new CustomError("registration failed", 404);
  }
  return res.status(200).json({
    success: true,
    message: "user registered successfully",
    data: data,
  });
};

//login
export const userLogin = async (req: Request, res: Response) => {
  console.log("req.body", req.body);
  const loginData = await loginUserService(req.body, res);
  return res.status(200).json({ message: "user logged in", data: loginData });
};

//google login
export const googleAuth = async (req: Request, res: Response) => {
  const response = await googleAuthentication(req.body, res);
  res
    .status(200)
    .json({
      status: "success",
      message: "Successfully logged in with Google",
      data: response,
    });
};

//logout
export const userLogout = async (req: Request, res: Response) => {
  const userData = await logOutUserService(req.body, res);
  return res.status(200).json({ message: "user logged out", data: userData });
};

//changePassword
export const userChangePassword = async (req: Request, res: Response) => {
  const userId = req.user;
  if (!userId) {
    throw new CustomError("user not found, please login", 404);
  }
  const changePsswdData = await changePasswordService(userId, req.body);
  return res.status(200).json({ message: "password changed" });
};

//forgot-password & reset-password
export const forgotPassword = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const currentUser = await User.findById(userId).select("password email");
  if (!currentUser?.email || !currentUser?.password) {
    throw new CustomError("user not found", 404);
  }

  const secret = process.env.TOKEN_SECRET + currentUser.password;
  if (!secret) {
    throw new CustomError("token not found", 404);
  }
  const token = jwt.sign({ id: currentUser._id }, secret, { expiresIn: "1h" });
  const resetURL = `http://localhost:4586/api/user/resetPassword?id=${userId}&token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "intellectademo@gmail.com",
      pass: "iqgg fgtp hsfe jkwk",
    },
  });

  const mailOptions = {
    to: currentUser.email,
    from: "intellectademo@gmail.com",
    subject: "Password Reset Request",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetURL}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };
  await transporter.sendMail(mailOptions);
  return res.status(200).json({ message: "Password reset link sent" });
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, token } = req.query;
  const { password } = req.body;
  if (!id || !token) {
    throw new CustomError("data not found", 404);
  }
  const strToken = token.toString();
  const user = await User.findById(id).select("password");
  if (!user) {
    return res.status(400).json({ message: "User not exists!" });
  }
  const secret = process.env.TOKEN_SECRET + user.password;
  const verify = jwt.verify(strToken, secret);
  const encryptedPassword = await hashPassword(password);
  await User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        password: encryptedPassword,
      },
    }
  );

  await user.save();
  res.status(200).json({ message: "Password has been reset" });
};

// ====================================================================
//refresh token to access token
export const refreshTokeToAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new CustomError("refresh token is required", 404);
  }

  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new CustomError("token credentials not found", 404);
  }

  const data = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  if (!data) {
    throw new CustomError("token verification failed", 404);
  }

  const accessToken = generateRefreshToken(data._id, data.age);
  if (!accessToken) {
    throw new CustomError("access token generation failed", 404);
  }
  return res
    .status(200)
    .json({ message: "Access token generated", accessToken });
};

export const adminLogin = async (req: Request, res: Response) => {
  const loginData = await adminLoginService(req.body, res);
  return res.status(200).json({ message: "admin logged in", data: loginData });
};

export const adminLogout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
  });
  return res.status(200).json({ message: "user logged out" });
};
