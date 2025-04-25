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
exports.adminLogout = exports.adminLogin = exports.refreshTokeToAccessToken = exports.resetPassword = exports.forgotPassword = exports.userChangePassword = exports.userLogout = exports.googleAuth = exports.userLogin = exports.userRegistration = void 0;
const authService_1 = require("../service/authService");
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
const userModel_1 = __importDefault(require("../models/userModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const passwordHash_1 = require("../utils/passwordHash");
const jwt_1 = require("../utils/jwt");
const authService_2 = require("../service/authService");
dotenv_1.default.config();
//registration
const userRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, authService_1.registerUser)(req.body, res);
    if (!data) {
        throw new customErrorHandler_1.default("registration failed", 404);
    }
    return res.status(200).json({
        success: true,
        message: "user registered successfully",
        data: data,
    });
});
exports.userRegistration = userRegistration;
//login
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("req.body", req.body);
    const loginData = yield (0, authService_1.loginUserService)(req.body, res);
    return res.status(200).json({ message: "user logged in", data: loginData });
});
exports.userLogin = userLogin;
//google login
const googleAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, authService_2.googleAuthentication)(req.body, res);
    res
        .status(200)
        .json({
        status: "success",
        message: "Successfully logged in with Google",
        data: response,
    });
});
exports.googleAuth = googleAuth;
//logout
const userLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield (0, authService_1.logOutUserService)(req.body, res);
    return res.status(200).json({ message: "user logged out", data: userData });
});
exports.userLogout = userLogout;
//changePassword
const userChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user;
    if (!userId) {
        throw new customErrorHandler_1.default("user not found, please login", 404);
    }
    const changePsswdData = yield (0, authService_1.changePasswordService)(userId, req.body);
    return res.status(200).json({ message: "password changed" });
});
exports.userChangePassword = userChangePassword;
//forgot-password & reset-password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const currentUser = yield userModel_1.default.findById(userId).select("password email");
    if (!(currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || !(currentUser === null || currentUser === void 0 ? void 0 : currentUser.password)) {
        throw new customErrorHandler_1.default("user not found", 404);
    }
    const secret = process.env.TOKEN_SECRET + currentUser.password;
    if (!secret) {
        throw new customErrorHandler_1.default("token not found", 404);
    }
    const token = jsonwebtoken_1.default.sign({ id: currentUser._id }, secret, { expiresIn: "1h" });
    const resetURL = `http://localhost:4586/api/user/resetPassword?id=${userId}&token=${token}`;
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: "intellectademo@gmail.com",
            pass: "iqgg fgtp hsfe jkwk",
        },
    });
    const mailOptions = {
        to: currentUser.email,
        from: "intellectademo@gmail.com",
        subject: "Password Reset Request",
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
    Please click on the following link, or paste this into your browser to complete the process:\n\n
    ${resetURL}\n\n
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    yield transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Password reset link sent" });
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, token } = req.query;
    const { password } = req.body;
    if (!id || !token) {
        throw new customErrorHandler_1.default("data not found", 404);
    }
    const strToken = token.toString();
    const user = yield userModel_1.default.findById(id).select("password");
    if (!user) {
        return res.status(400).json({ message: "User not exists!" });
    }
    const secret = process.env.TOKEN_SECRET + user.password;
    const verify = jsonwebtoken_1.default.verify(strToken, secret);
    const encryptedPassword = yield (0, passwordHash_1.hashPassword)(password);
    yield userModel_1.default.updateOne({
        _id: id,
    }, {
        $set: {
            password: encryptedPassword,
        },
    });
    yield user.save();
    res.status(200).json({ message: "Password has been reset" });
});
exports.resetPassword = resetPassword;
// ====================================================================
//refresh token to access token
const refreshTokeToAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new customErrorHandler_1.default("refresh token is required", 404);
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new customErrorHandler_1.default("token credentials not found", 404);
    }
    const data = (0, jwt_1.verifyToken)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!data) {
        throw new customErrorHandler_1.default("token verification failed", 404);
    }
    const accessToken = (0, jwt_1.generateRefreshToken)(data._id, data.age);
    if (!accessToken) {
        throw new customErrorHandler_1.default("access token generation failed", 404);
    }
    return res
        .status(200)
        .json({ message: "Access token generated", accessToken });
});
exports.refreshTokeToAccessToken = refreshTokeToAccessToken;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginData = yield (0, authService_1.adminLoginService)(req.body, res);
    return res.status(200).json({ message: "admin logged in", data: loginData });
});
exports.adminLogin = adminLogin;
const adminLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
    });
    return res.status(200).json({ message: "user logged out" });
});
exports.adminLogout = adminLogout;
