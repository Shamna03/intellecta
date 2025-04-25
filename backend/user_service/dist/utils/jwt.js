"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customErrorHandler_1 = __importDefault(require("./customErrorHandler"));
const generateToken = (userId, age, role) => {
    if (!process.env.TOKEN_SECRET) {
        console.log("within if", process.env.TOKEN_SECRET);
        throw new customErrorHandler_1.default("token secret is not defined in the environment variables", 404);
    }
    return jsonwebtoken_1.default.sign({ _id: userId, age: age, role }, process.env.TOKEN_SECRET, {
        expiresIn: "1d",
    });
};
exports.generateToken = generateToken;
//generaterefreshtoken
const generateRefreshToken = (userId, age) => {
    console.log("generating token", process.env.REFRESH_TOKEN_SECRET);
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new customErrorHandler_1.default("refresh token is not defined in the environment variables", 404);
    }
    return jsonwebtoken_1.default.sign({ _id: userId, age: age }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "3d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token, tokenSecret) => {
    const decoded = jsonwebtoken_1.default.verify(token, tokenSecret);
    console.log("verify decoded", decoded);
    if (typeof decoded === "string" || !("_id" in decoded)) {
        throw new customErrorHandler_1.default("Invalid token payload", 404);
    }
    return {
        _id: decoded._id,
        age: decoded.age, // you can now use this directly
        role: decoded.role
    };
};
exports.verifyToken = verifyToken;
