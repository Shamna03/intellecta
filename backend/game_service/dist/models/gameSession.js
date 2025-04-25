"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gameSessionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    gameSlug: { type: String, required: true },
    score: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    datePlayed: { type: Date, default: Date.now },
});
const GameSession = mongoose_1.default.model("GameSession", gameSessionSchema);
exports.default = GameSession;
