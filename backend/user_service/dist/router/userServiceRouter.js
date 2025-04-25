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
const profilePicUploader_1 = require("../middleware/profilePicUploader");
const userServiceRouter = express_1.default.Router();
userServiceRouter.post("/register", (0, asyncHandler_1.asyncHandler)(authController_1.userRegistration));
userServiceRouter.post("/login", (0, asyncHandler_1.asyncHandler)(authController_1.userLogin));
userServiceRouter.post("/logout", (0, asyncHandler_1.asyncHandler)(authController_1.userLogout));
userServiceRouter.post("/google-login", (0, asyncHandler_1.asyncHandler)(authController_1.googleAuth));
userServiceRouter.post("/admin-login", (0, asyncHandler_1.asyncHandler)(authController_1.adminLogin));
userServiceRouter.post("/admin-logout", (0, asyncHandler_1.asyncHandler)(authController_1.adminLogout));
userServiceRouter.patch("/changepassword", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(authController_1.userChangePassword));
userServiceRouter.get("/getuserbyid", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(userController_1.getUserById));
//forgot-password
userServiceRouter.post("/forgotpassword/:id", (0, asyncHandler_1.asyncHandler)(authController_1.forgotPassword));
userServiceRouter.post("/resetPassword", (0, asyncHandler_1.asyncHandler)(authController_1.resetPassword));
//profile-upload
userServiceRouter.post("/upload-profile", isAuth_1.isAuthenticate, profilePicUploader_1.upload.single("image"), (0, asyncHandler_1.asyncHandler)(userController_1.profilePictureController));
//edit user profile
userServiceRouter.patch("/edit-profile", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(userController_1.userEditController));
//access token to refresh token
userServiceRouter.post("/refreshaccesstoken", (0, asyncHandler_1.asyncHandler)(authController_1.refreshTokeToAccessToken));
//get users by bulk ids
userServiceRouter.post("/bulk", (0, asyncHandler_1.asyncHandler)(userController_1.getBulkUsers));
userServiceRouter.get("/allusers", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(userController_1.getAllUsers));
//soft deleting the user 
userServiceRouter.post("/delete-user", isAuth_1.isAuthenticate, (0, asyncHandler_1.asyncHandler)(userController_1.deleteUser));
exports.default = userServiceRouter;
