import { Request, Response } from "express";
import Game from "../models/gameSchema";
import GameSession from "../models/gameSession";
import Leaderboard from "../models/leaderboardSchema";
import { AuthenticatedRequest, ILeaderboard } from "../types";
import { checkAndEarnBadges } from "./leaderboardController";
import mongoose from "mongoose";

export const getAllGames = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const games = await Game.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  return res.status(200).json({ message: "Game fetched successfully", games });
};

export const createGameSession = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const { userId, gameSlug, score, completed, timeTaken } = req.body;

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  let pointsEarned = 0;
  if (completed) {
    const gamePoints: Record<string, number> = {
      tic_tac_toe: 50,
      memory_game: score,
      word_builder: score,
      geography_quiz: score * 10,
      math_quiz: 200,
      checkers: 300,
      sudoku: 350,
      chess: 500,
    };
    pointsEarned = gamePoints[gameSlug] || 10;
  }

  const newSession = new GameSession({
    userId,
    gameSlug,
    score,
    completed,
    pointsEarned,
    timeTaken,
    datePlayed: new Date(),
  });

  await newSession.save();

  let leaderboard = await Leaderboard.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });

  let updateData: any = {
    $inc: {
      gamesPlayed: 1,
      totalScore: pointsEarned,
      totalTimePlayed: timeTaken,
    },
    $set: {
      lastPlayedGame: gameSlug,
      lastPlayedDate: new Date(),
    },
  };

  if (!leaderboard?.bestScores) {
    updateData.$set["bestScores"] = { [gameSlug]: score };
  } else {
    updateData.$max = { [`bestScores.${gameSlug}`]: score };
  }

  if (leaderboard) {
    const leaderboardData: ILeaderboard = JSON.parse(
      JSON.stringify({
        ...leaderboard.toObject(),
        bestScores: Object.fromEntries(leaderboard.bestScores) as Record<
          string,
          number
        >,
      })
    );
    const updatedBadges = checkAndEarnBadges(leaderboardData);
    updateData.$set["badges"] = updatedBadges;
  }


  try {
    leaderboard = await Leaderboard.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return res
      .status(500)
      .json({ error: "Database error while updating leaderboard" });
  }

  return res.status(201).json({
    message: "Game session created & leaderboard updated",
    leaderboard,
  });
};

export const getRecentPlayedGame = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userId = req.user?.userId;
  const recentGames = await GameSession.find({ userId })
    .sort({ datePlayed: -1 })
    .exec();

  if (!recentGames) return res.json({ message: "No recent games found" });
  const gameSlugs = recentGames.map((session) => session.gameSlug);

  const games = await Game.find({ slug: { $in: gameSlugs } }).exec();
  if (!games) return res.status(404).json({ message: "Game data not found" });

  const recentPlayedGames = games.map((game) => {
    const session = recentGames.find((g) => g.gameSlug === game.slug);
    return {
      name: game.name,
      slug: game.slug,
      thumbnailImg: game.thumbnailImg,
      difficulty: game.difficulty,
      score: session?.score || 0,
      datePlayed: session?.datePlayed,
    };
  });
  return res
    .status(200)
    .json({ message: "Game fetched successfully", games: recentPlayedGames });
};

export const getGameBySlug = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const game = await Game.findOne({ slug: req.params.slug });
  if (!game) return res.status(404).json({ message: "Game not found" });
  return res.status(200).json({ game });
};

export const addGame = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, slug, description, difficulty } = req.body;

  const thumbImg: string | null = req.file?.path ?? null;

  const newGame = new Game({
    name,
    slug,
    description,
    thumbnailImg: thumbImg,
    difficulty,
  });

  await newGame.save();
  return res
    .status(201)
    .json({ message: "Game created successfully", newGame });
};
