"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const leaderboardSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    bestScores: { type: Map, of: Number, default: {} },
    totalScore: { type: Number, default: 0 },
    totalTimePlayed: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    lastPlayedGame: { type: String },
    lastPlayedDate: { type: Date },
    badges: { type: [String], default: [] }
});
const Leaderboard = mongoose_1.default.model('Leaderboard', leaderboardSchema);
exports.default = Leaderboard;
