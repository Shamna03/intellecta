import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import CustomError from "../utils/CustomError";

//verifying the token
// interface DecodedToken {
//     [key: string]: any;
//   }
interface CustomRequest extends Request {
  user?: { userId: string };
}

export const isAuthenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) {
    return next(new CustomError("Token does not exist in the cookie", 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.TOKEN_SECRET as string
    ) as JwtPayload;

    // ✅ Ensure `decoded` contains `userId`
    if (typeof decoded === "string" || !decoded._id) {
      return next(new CustomError("Invalid token payload", 401));
    }

    req.user = { userId: decoded._id };
    next();
  } catch (err) {
    return next(new CustomError(`Invalid or expired token ${err}`, 401));
  }
};
