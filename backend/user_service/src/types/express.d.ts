import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    user?: string | JwtPayload; // Adjust type based on what your JWT decodes to
  }
}