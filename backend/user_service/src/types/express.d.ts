 import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: {userId: string}; // Adjust type based on what your JWT decodes to
  }
}