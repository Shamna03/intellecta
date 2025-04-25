"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGame = exports.getGameBySlug = exports.getRecentPlayedGame = exports.createGameSession = exports.getAllGames = void 0;
const gameSchema_1 = __importDefault(require("../models/gameSchema"));
const gameSession_1 = __importDefault(require("../models/gameSession"));
const leaderboardSchema_1 = __importDefault(require("../models/leaderboardSchema"));
const leaderboardController_1 = require("./leaderboardController");
const mongoose_1 = __importDefault(require("mongoose"));
const getAllGames = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const games = await gameSchema_1.default.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    return res.status(200).json({ message: "Game fetched successfully", games });
};
exports.getAllGames = getAllGames;
const createGameSession = async (req, res) => {
    const { userId, gameSlug, score, completed, timeTaken } = req.body;
    if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    let pointsEarned = 0;
    if (completed) {
        const gamePoints = {
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
    const newSession = new gameSession_1.default({
        userId,
        gameSlug,
        score,
        completed,
        pointsEarned,
        timeTaken,
        datePlayed: new Date(),
    });
    await newSession.save();
    let leaderboard = await leaderboardSchema_1.default.findOne({
        userId: new mongoose_1.default.Types.ObjectId(userId),
    });
    let updateData = {
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
    }
    else {
        updateData.$max = { [`bestScores.${gameSlug}`]: score };
    }
    if (leaderboard) {
        const leaderboardData = JSON.parse(JSON.stringify({
            ...leaderboard.toObject(),
            bestScores: Object.fromEntries(leaderboard.bestScores),
        }));
        const updatedBadges = (0, leaderboardController_1.checkAndEarnBadges)(leaderboardData);
        updateData.$set["badges"] = updatedBadges;
    }
    try {
        leaderboard = await leaderboardSchema_1.default.findOneAndUpdate({ userId: new mongoose_1.default.Types.ObjectId(userId) }, updateData, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    catch (error) {
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
exports.createGameSession = createGameSession;
const getRecentPlayedGame = async (req, res) => {
    const userId = req.user?.userId;
    const recentGames = await gameSession_1.default.find({ userId })
        .sort({ datePlayed: -1 })
        .exec();
    if (!recentGames)
        return res.json({ message: "No recent games found" });
    const gameSlugs = recentGames.map((session) => session.gameSlug);
    const games = await gameSchema_1.default.find({ slug: { $in: gameSlugs } }).exec();
    if (!games)
        return res.status(404).json({ message: "Game data not found" });
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
exports.getRecentPlayedGame = getRecentPlayedGame;
const getGameBySlug = async (req, res) => {
    const game = await gameSchema_1.default.findOne({ slug: req.params.slug });
    if (!game)
        return res.status(404).json({ message: "Game not found" });
    return res.status(200).json({ game });
};
exports.getGameBySlug = getGameBySlug;
const addGame = async (req, res) => {
    const { name, slug, description, difficulty } = req.body;
    const thumbImg = req.file?.path ?? null;
    const newGame = new gameSchema_1.default({
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
exports.addGame = addGame;
