import { NextFunction, Request, Response } from "express";
import jwt, {JwtPayload} from "jsonwebtoken";
import CustomError from "../utils/customErrorHandler";


//verifying the token
// interface DecodedToken {
//     [key: string]: any;
//   }
interface CustomRequest extends Request {
  user?: { userId: string, age: number , }; 
}

export const isAuthenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
    const token = req.cookies.token
    if(!token){
        return next(new CustomError("Token does not exist in the cookie", 401))
    }
    try{
      const decoded =jwt.verify(token, process.env.TOKEN_SECRET as string) as JwtPayload;
      console.log("hy1");
      if (typeof decoded === "string" || !decoded._id) {
          return next(new CustomError("Invalid token payload", 401));
      }
      // console.log("hy2",)
      req.user = { userId: decoded._id, age: decoded.age };
      console.log("hy2", req.user);
      next()
    }
    catch(err){
      return next(new CustomError(`Invalid or expired token ${err}`, 401));
    }     
};

interface CustomRequestOne extends Request {
  user?: { userId: string, role: string };
}

// export const isAdmin = (
//   req: CustomRequestOne,
//   res: Response,
//   next: NextFunction
// ) => {
//   if (!req.user || req.user.role !== "admin") {
//     console.log("hy2")
//     return next(new CustomError("Access denied. Admins only.", 403));
//   }
//   next();
// };