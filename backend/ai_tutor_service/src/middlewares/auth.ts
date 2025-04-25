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
    console.log("mid try");
    const tokenFromCookie = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    const token = tokenFromCookie || tokenFromHeader; 
    console.log(" token: ", req.cookies);
    if (!token) {
      res.status(401).json({ message: "Access Denied. No token provided." });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("decoded", decoded);  
    req.user = decoded as DecodedUser;
    console.log("req user", req.user); 

    return next();
  } catch (error) {
    console.log("mid catch");
     res.status(400).json({ message: "Invalid Token" });
  }
};
