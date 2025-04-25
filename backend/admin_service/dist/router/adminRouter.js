"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const asyncHandler_1 = require("../middleware/asyncHandler");
const adminAllUsersController_1 = require("../controllers/adminAllUsersController");
const verifyToken_1 = require("../middleware/verifyToken");
const adminServiceRouter = express_1.default.Router();
adminServiceRouter.get("/adminDashboard", verifyToken_1.isAuthenticate, verifyToken_1.isAdmin, (0, asyncHandler_1.asyncHandler)(adminController_1.adminDashboard));
adminServiceRouter.get("/users", verifyToken_1.isAuthenticate, verifyToken_1.isAdmin, (0, asyncHandler_1.asyncHandler)(adminAllUsersController_1.getallUsers));
adminServiceRouter.get("/users/topPerformers", verifyToken_1.isAuthenticate, verifyToken_1.isAdmin, (0, asyncHandler_1.asyncHandler)(adminController_1.getTopPerfomingStudents));
exports.default = adminServiceRouter;
