import Jwt, { JwtPayload } from "jsonwebtoken";
import CustomError from "./customErrorHandler";

// const TokenSecret = process.env.TOKEN_SECRET;

export const generateToken = (userId: string | unknown): string => {
  if (!process.env.TOKEN_SECRET) {
    throw new CustomError(
      "token secret is not defined in the environment variables",
      404
    );
  }
  return Jwt.sign({ _id: userId }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

export const generateRefreshToken = (userId: string | unknown): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new CustomError(
      "token secret is not defined in the environment variables",
      404
    );
  }
  return Jwt.sign({ _id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};


interface CustomJwtPayload extends JwtPayload {
  _id: string;
}

export const verifyToken = (token: string, tokenSecret: string) => {
  const decoded = Jwt.verify(token, tokenSecret) as CustomJwtPayload ;

  if (typeof decoded === 'string' || !('_id' in decoded)) {
    throw new CustomError('Invalid token payload',404);
  }
  return decoded._id;
};
