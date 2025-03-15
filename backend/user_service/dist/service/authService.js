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
exports.changePasswordService = exports.logOutUserService = exports.loginUserService = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
const jwt_1 = require("../utils/jwt");
const passwordHash_1 = require("../utils/passwordHash");
//user register
const registerUser = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data) {
        throw new customErrorHandler_1.default("input datas not found", 404);
    }
    const userEmail = data.email;
    const existUser = yield userModel_1.default.findOne({ email: userEmail });
    if (existUser) {
        throw new customErrorHandler_1.default("user with this email already exist, pleasee try another email", 404);
    }
    if (data.age < 5 || data.age > 18) {
        throw new customErrorHandler_1.default("you are not eligible to create account", 404);
    }
    const passwordHash = yield (0, passwordHash_1.hashPassword)(data.password);
    if (!passwordHash) {
        throw new customErrorHandler_1.default("password encryption failed", 404);
    }
    const newUser = new userModel_1.default({
        name: data.name,
        email: data.email,
        password: passwordHash,
        profile: data.profile,
        age: data.age,
        phone: data.phone,
    });
    yield newUser.save();
    const token = (0, jwt_1.generateToken)(newUser._id);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
    });
    return { message: "user registered successfully", token: token };
});
exports.registerUser = registerUser;
const loginUserService = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userExist = yield userModel_1.default.findOne({ email: data.email }).select("password");
    if (!userExist) {
        throw new customErrorHandler_1.default("User not found, please register", 404);
    }
    const validateUser = yield (0, passwordHash_1.comparePassword)(data.password, userExist.password);
    if (!validateUser) {
        throw new customErrorHandler_1.default("Incorrect password", 401); // 401 for unauthorized
    }
    const token = (0, jwt_1.generateToken)(userExist._id.toString()); // Convert ObjectId to string
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
    });
    return {
        message: "User logged in", // Fixed typo: "loggined" → "logged in"
        token, // No .toString() needed
        user: {
            id: userExist._id.toString(), // Convert to string for consistency
            name: userExist.name,
            email: userExist.email,
        },
    };
});
exports.loginUserService = loginUserService;
const logOutUserService = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token", {
        httpOnly: true, // Match the settings from login
        secure: false,
    });
    return { message: "user logged out" };
});
exports.logOutUserService = logOutUserService;
const changePasswordService = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const oldPassword = data.currentpassword;
    if (!oldPassword) {
        throw new customErrorHandler_1.default("old password required", 404);
    }
    const newpassword = data.newpassword;
    if (!newpassword) {
        throw new customErrorHandler_1.default("new password required", 404);
    }
    if (oldPassword == newpassword) {
        throw new customErrorHandler_1.default("the new password should not be same as the current password", 404);
    }
    const currentUserData = yield userModel_1.default.findById(id).select("password");
    if (!currentUserData) {
        throw new customErrorHandler_1.default("cannot fetch current user data", 404);
    }
    const fetchedPassword = currentUserData.password;
    const passwordCheck = yield (0, passwordHash_1.comparePassword)(oldPassword, fetchedPassword);
    if (!passwordCheck) {
        throw new customErrorHandler_1.default("current password is wrong", 404);
    }
    const hashedPsswd = yield (0, passwordHash_1.hashPassword)(newpassword);
    if (!hashedPsswd) {
        throw new customErrorHandler_1.default("password is not hashed", 404);
    }
    currentUserData.password = hashedPsswd;
    yield currentUserData.save();
    return { message: "password changed successfully" };
});
exports.changePasswordService = changePasswordService;
