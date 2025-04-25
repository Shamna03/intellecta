"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        const tokenFromCookie = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))
            ? authHeader.substring(7)
            : null;
        console.log("token Header", tokenFromHeader, tokenFromCookie);
        const token = tokenFromCookie || tokenFromHeader;
        console.log("token", token);
        if (!token) {
            res.status(401).json({ message: "Access Denied. No token provided." });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    }
    catch (error) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
exports.authMiddleware = authMiddleware;
