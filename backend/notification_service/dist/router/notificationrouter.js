"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const asyncHandler_1 = require("../middleware/asyncHandler");
const verifyToken_1 = require("../middleware/verifyToken");
const notificationServiceRouter = express_1.default.Router();
notificationServiceRouter.post("/send", verifyToken_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(notificationController_1.sendNotification));
notificationServiceRouter.get("/get", verifyToken_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(notificationController_1.getAllNotifications));
exports.default = notificationServiceRouter;
