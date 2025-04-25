"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.checkAndEarnBadges = exports.getLeaderboardByUserId = void 0;
const leaderboardSchema_1 = __importDefault(require("../models/leaderboardSchema"));
const axios_1 = __importDefault(require("axios"));
const generatePresignedURL_1 = require("../utils/generatePresignedURL");
const getLeaderboardByUserId = async (req, res) => {
    const userid = req.user?.userId;
    const userLeaderboard = await leaderboardSchema_1.default.findOne({ userId: userid });
    if (!userLeaderboard)
        return res
            .status(404)
            .json({ message: "No leaderboard found for this user" });
    return res.status(200).json({
        leaderboard: userLeaderboard,
        message: "leaderboard fetched successfully",
    });
};
exports.getLeaderboardByUserId = getLeaderboardByUserId;
const checkAndEarnBadges = (leaderboard) => {
    const { totalScore, totalTimePlayed, gamesPlayed, badges } = leaderboard;
    const newBadges = [];
    if (gamesPlayed >= 1 && !badges?.includes("Beginner"))
        newBadges.push("Beginner");
    if (gamesPlayed >= 10 && !badges?.includes("Gamer"))
        newBadges.push("Gamer");
    if (totalTimePlayed >= 3600 && !badges?.includes("Marathoner"))
        newBadges.push("Marathoner");
    if (totalScore >= 100 && !badges?.includes("Pro Player"))
        newBadges.push("Pro Player");
    if (totalScore >= 500 && !badges?.includes("Legend"))
        newBadges.push("Legend");
    return [...badges, ...newBadges];
};
exports.checkAndEarnBadges = checkAndEarnBadges;
const getLeaderboard = async (req, res) => {
    const leaderboardEntries = await leaderboardSchema_1.default.find()
        .limit(20)
        .sort({ totalScore: -1 });
    const userIds = leaderboardEntries.map((entry) => entry.userId.toString());
    const { data: usersData } = await axios_1.default.post("http://user-service:5000/api/user/bulk", { userIds });
    const leaderboardWithUsers = await Promise.all(leaderboardEntries.map(async (entry) => {
        const user = usersData.find((u) => u._id === entry.userId.toString());
        let profilePicUrl = null;
        if (user?.profilePic) {
            profilePicUrl = await (0, generatePresignedURL_1.generatePresignedUrl)(user.profilePic);
        }
        return {
            ...entry.toObject(),
            user: user ? { name: user.name, profilePic: profilePicUrl } : null,
        };
    }));
    return res
        .status(200)
        .json({
        message: "Leaderboard fetched",
        leaderboard: leaderboardWithUsers,
    });
};
exports.getLeaderboard = getLeaderboard;
