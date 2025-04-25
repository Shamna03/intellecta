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
exports.isAdmin = exports.isAuthenticate = void 0;
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuthenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        req.user = { userId: decoded._id, role: decoded.role };
        next();
    }
    catch (err) {
        return next(new CustomError_1.default(`Invalid or expired token ${err}`, 401));
    }
});
exports.isAuthenticate = isAuthenticate;
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return next(new CustomError_1.default("Access denied. Admins only.", 403));
    }
    next();
};
exports.isAdmin = isAdmin;
