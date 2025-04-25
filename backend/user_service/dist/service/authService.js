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
exports.adminLoginService = exports.changePasswordService = exports.logOutUserService = exports.googleAuthentication = exports.loginUserService = exports.registerUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
const jwt_1 = require("../utils/jwt");
const passwordHash_1 = require("../utils/passwordHash");
const google_auth_library_1 = require("google-auth-library");
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
        name: data.firstname + " " + data.lastname,
        email: data.email,
        password: passwordHash,
        profile: data.profile || "",
        age: data.age,
        phone: data.phone,
    });
    yield newUser.save();
    const token = (0, jwt_1.generateToken)(newUser._id, Number(newUser.age), newUser.role);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
    });
    return { message: "user registered successfully", token: token };
});
exports.registerUser = registerUser;
const loginUserService = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userExist = yield userModel_1.default.findOne({ email: data.email }).select("password age");
    if (!userExist) {
        throw new customErrorHandler_1.default("User not found, please register", 404);
    }
    const validateUser = yield (0, passwordHash_1.comparePassword)(data.password, userExist.password);
    if (!validateUser) {
        throw new customErrorHandler_1.default("Incorrect password", 401);
    }
    const token = (0, jwt_1.generateToken)(userExist._id.toString(), userExist.age, userExist.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(userExist._id.toString(), userExist.age);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 60 * 1000,
    });
    return {
        message: "User logged in",
        token,
        user: {
            id: userExist._id.toString(),
            name: userExist.name,
            email: userExist.email
        },
    };
});
exports.loginUserService = loginUserService;
const googleAuthentication = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.credential) {
        throw new customErrorHandler_1.default("No Google credentials provided!", 400);
    }
    const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = yield client.verifyIdToken({
        idToken: data.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name) {
        throw new customErrorHandler_1.default("Google Authentication Failed", 400);
    }
    let user = yield userModel_1.default.findOne({ email: payload.email });
    if (!user) {
        user = new userModel_1.default({
            name: payload.name,
            email: payload.email,
            password: '',
            profilePic: payload.picture,
        });
        yield user.save();
    }
    if (!user._id) {
        throw new customErrorHandler_1.default("User ID not found", 500);
    }
    const token = (0, jwt_1.generateToken)(user._id.toString(), Number(user.age), user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString(), Number(user.age));
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 60 * 1000,
        // sameSite:"none"
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 60 * 1000,
        // sameSite:"none"
    });
    return {
        message: "User logged in via Google",
        token,
        user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        },
    };
});
exports.googleAuthentication = googleAuthentication;
const logOutUserService = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
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
const adminLoginService = (data, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminExist = yield userModel_1.default.findOne({ email: data.email }).select("password age role");
    if (!adminExist) {
        throw new customErrorHandler_1.default("Admin not exists", 404);
    }
    const isAdmin = adminExist.role === "admin";
    if (!isAdmin) {
        throw new customErrorHandler_1.default("You don't have access to Admin Dashboard", 401);
    }
    const validateUser = yield (0, passwordHash_1.comparePassword)(data.password, adminExist.password);
    if (!validateUser) {
        throw new customErrorHandler_1.default("Invalid Credentials", 401);
    }
    const token = (0, jwt_1.generateToken)((_a = adminExist._id) === null || _a === void 0 ? void 0 : _a.toString(), adminExist.age, adminExist.role);
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 60 * 1000,
    });
    return {
        message: "User logged in",
        token,
        user: {
            id: adminExist._id.toString(),
            name: adminExist.name,
            role: adminExist.role,
            email: adminExist.email
        },
    };
});
exports.adminLoginService = adminLoginService;
