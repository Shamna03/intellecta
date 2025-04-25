"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userEditService = exports.profilePictureService = exports.getUserByIdService = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
const profilePicUploader_1 = require("../middleware/profilePicUploader");
//Get User by ID
const getUserByIdService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const specificUser = yield userModel_1.default.findById(userId);
    if (!specificUser) {
        throw new customErrorHandler_1.default("user not found", 404);
    }
    if (specificUser.profilePic !== null && specificUser.profilePic !== undefined) {
        specificUser.profilePic = yield (0, profilePicUploader_1.generatePresignedUrl)(specificUser.profilePic);
    }
    return {
        message: "user data fetched",
        user: specificUser
    };
});
exports.getUserByIdService = getUserByIdService;
//Profile Upload
const profilePictureService = (userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new customErrorHandler_1.default("No file uploaded", 400);
    }
    if (!userId) {
        throw new customErrorHandler_1.default("User ID is required", 400);
    }
    const fileUrl = yield (0, profilePicUploader_1.uploadToS3)(file);
    const user = yield userModel_1.default.findByIdAndUpdate(userId, { profilePic: fileUrl }, { new: true });
    if (!user) {
        throw new customErrorHandler_1.default("User not found", 404);
    }
    return fileUrl;
});
exports.profilePictureService = profilePictureService;
//Edit User
const userEditService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, age, phone } = data;
    const user = yield userModel_1.default.findByIdAndUpdate(id, { name, email, age, phone }, { new: true });
    if (!user) {
        throw new customErrorHandler_1.default("User not found, Try Again", 404);
    }
    return {
        message: "User details updated successfully",
        user
    };
});
exports.userEditService = userEditService;
