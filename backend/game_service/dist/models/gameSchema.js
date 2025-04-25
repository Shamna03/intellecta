"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gameSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    thumbnailImg: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    createdAt: { type: Date, default: Date.now },
});
const Game = mongoose_1.default.model("Game", gameSchema);
exports.default = Game;
