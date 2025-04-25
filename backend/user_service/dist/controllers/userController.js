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
exports.deleteUser = exports.getAllUsers = exports.getBulkUsers = exports.userEditController = exports.profilePictureController = exports.getUserById = void 0;
const userService_1 = require("../service/userService");
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const profilePicUploader_1 = require("../middleware/profilePicUploader");
//Get User
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new customErrorHandler_1.default("user not found", 404);
    }
    const userData = yield (0, userService_1.getUserByIdService)(userId);
    res.status(200).json({ success: true, message: userData.message, data: userData });
});
exports.getUserById = getUserById;
const profilePictureController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new customErrorHandler_1.default("User ID is required", 400);
    }
    const result = yield (0, userService_1.profilePictureService)(userId, req.file);
    return res.status(200).json({
        status: "success",
        message: "Uploaded Successfully",
        data: result,
    });
});
exports.profilePictureController = profilePictureController;
//Edit User
const userEditController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new customErrorHandler_1.default("User ID is required", 400);
    }
    const response = yield (0, userService_1.userEditService)(userId, req.body);
    return res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: response,
    });
});
exports.userEditController = userEditController;
//bulk users 
const getBulkUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIds } = req.body;
    const users = yield userModel_1.default.find({ _id: { $in: userIds } }, "_id name profilePic");
    return res.json(users);
});
exports.getBulkUsers = getBulkUsers;
//Get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = "1", limit = "10", isBlock, search, catagory, } = req.query;
    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;
    const filter = {
        isDeleted: { $ne: true },
        role: "student"
    };
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ];
    }
    if (isBlock !== undefined) {
        filter.isBlock = isBlock === "true";
    }
    if (catagory === "5-8") {
        filter.age = { $gte: 4, $lte: 8 };
    }
    else if (catagory === "9-12") {
        filter.age = { $gte: 9, $lte: 12 };
    }
    else if (catagory === "13-18") {
        filter.age = { $gte: 13, $lte: 18 };
    }
    const users = yield userModel_1.default.find(filter).skip(skip).limit(itemsPerPage);
    const totalUsers = yield userModel_1.default.countDocuments(filter);
    yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user.profilePic) {
            user.profilePic = yield (0, profilePicUploader_1.generatePresignedUrl)(user.profilePic);
        }
    })));
    return res.status(200).json({
        success: true,
        currentPage,
        totalPages: Math.ceil(totalUsers / itemsPerPage),
        totalUsers,
        users,
    });
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    console.log("user:", userId);
    const deletedUser = yield userModel_1.default.findByIdAndUpdate(userId, { $set: { isDeleted: true } }, { new: true });
    if (!deletedUser) {
        throw new customErrorHandler_1.default("User not found", 404);
    }
    res.status(200).json({
        message: "User soft-deleted successfully",
        user: deletedUser,
    });
});
exports.deleteUser = deleteUser;
