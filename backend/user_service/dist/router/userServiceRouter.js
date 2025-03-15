"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const asyncHandler_1 = require("../middleware/asyncHandler");
const userController_1 = require("../controllers/userController");
const isAuth_1 = require("../middleware/isAuth");
const userServiceRouter = express_1.default.Router();
userServiceRouter.post("/register", (0, asyncHandler_1.asyncHandler)(authController_1.userRegistration));
userServiceRouter.post("/login", (0, asyncHandler_1.asyncHandler)(authController_1.userLogin));
userServiceRouter.post("/logout", (0, asyncHandler_1.asyncHandler)(authController_1.userLogout));
userServiceRouter.patch("/changepassword", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(authController_1.userChangePassword));
userServiceRouter.get("/getuserbyid:id", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(userController_1.getUserById));
exports.default = userServiceRouter;
