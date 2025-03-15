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
exports.forgotPassword = exports.userChangePassword = exports.userLogout = exports.userLogin = exports.userRegistration = void 0;
const authService_1 = require("../service/authService");
const customErrorHandler_1 = __importDefault(require("../utils/customErrorHandler"));
//registeration
const userRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, authService_1.registerUser)(req.body, res);
    if (!data) {
        throw new customErrorHandler_1.default("registration failed", 404);
    }
    return res
        .status(200)
        .json({ success: true, message: "user registered successfully", data: data });
});
exports.userRegistration = userRegistration;
//login
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginData = yield (0, authService_1.loginUserService)(req.body, res);
    return res.status(200).json({ message: "user logged in", data: loginData });
});
exports.userLogin = userLogin;
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
});
exports.forgotPassword = forgotPassword;
