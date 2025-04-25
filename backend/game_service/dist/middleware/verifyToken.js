"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const isAuthenticate = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next(new CustomError_1.default("Token does not exist in the cookie", 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        // ✅ Ensure `decoded` contains `userId`
        if (typeof decoded === "string" || !decoded._id) {
            return next(new CustomError_1.default("Invalid token payload", 401));
        }
        req.user = { userId: decoded._id };
        next();
    }
    catch (err) {
        return next(new CustomError_1.default(`Invalid or expired token ${err}`, 401));
    }
};
exports.isAuthenticate = isAuthenticate;
