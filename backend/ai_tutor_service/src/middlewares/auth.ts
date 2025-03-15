import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface DecodedUser {
  [key: string]: any;
}

interface AuthRequest extends Request {
  user?: DecodedUser;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    const token = tokenFromCookie || tokenFromHeader; 
    if (!token) {
      res.status(401).json({ message: "Access Denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded as DecodedUser; 

    return next();
  } catch (error) {
     res.status(400).json({ message: "Invalid Token" });
  }
};
