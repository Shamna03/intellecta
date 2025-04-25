import { Request } from "express";
import { Document, Types } from "mongoose";

export interface ILeaderboard extends Document {
  userId: Types.ObjectId;
  bestScores: Record<string, number>; // { "gameSlug": highestScore }
  totalScore: number;
  totalTimePlayed: number; // In seconds or milliseconds
  gamesPlayed: number;
  lastPlayedGame?: string;
  lastPlayedDate?: Date;
  badges: string[]; // Ensure it's always an array
}


export interface AuthenticatedRequest extends Request {
    user?: {
      userId: string;
    };
  }