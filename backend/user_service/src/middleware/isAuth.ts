import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import CustomError from "../utils/customErrorHandler";
//verifying the token


interface DecodedToken {
    [key: string]: any;
  }
  
  interface CustomRequest extends Request {
    user?: DecodedToken;
  }


export const isAuthenticate = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
    const token = req.cookies.token
    if(!token){
        throw new CustomError("token is not exist in the cookie", token)
    }
    try{
      const decoded =jwt.verify(token, process.env.TOKEN_SECRET as string)
      req.user = decoded as DecodedToken
      next()
    }
    catch(err){
      return next(new CustomError(`Invalid or expired token ${err}`, 401));
    }
    

       
};
