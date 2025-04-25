"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const gameThumbUpload_1 = __importDefault(require("../middleware/gameThumbUpload"));
const verifyToken_1 = require("../middleware/verifyToken");
const leaderboardController_1 = require("../controllers/leaderboardController");
const gameController_1 = require("../controllers/gameController");
const gameRouter = express_1.default.Router();
gameRouter.get("/allgames", (0, asyncHandler_1.asyncHandler)(gameController_1.getAllGames));
gameRouter.get("/:slug", (0, asyncHandler_1.asyncHandler)(gameController_1.getGameBySlug));
gameRouter.get("/users/leaderboard", (0, asyncHandler_1.asyncHandler)(leaderboardController_1.getLeaderboard));
gameRouter.get("/userbyid/leaderboard", verifyToken_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(leaderboardController_1.getLeaderboardByUserId)); // userleaderboard
gameRouter.get("/latest/recent-game", verifyToken_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(gameController_1.getRecentPlayedGame));
gameRouter.post("/create", gameThumbUpload_1.default.single("thumbnailImg"), (0, asyncHandler_1.asyncHandler)(gameController_1.addGame));
gameRouter.post("/game-session", verifyToken_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(gameController_1.createGameSession));
exports.default = gameRouter;
