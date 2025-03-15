"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customErrorHandler_1 = __importDefault(require("./customErrorHandler"));
// const TokenSecret = process.env.TOKEN_SECRET;
const generateToken = (userId) => {
    if (!process.env.TOKEN_SECRET) {
        throw new customErrorHandler_1.default("token secret is not defined in the environment variables", 404);
    }
    return jsonwebtoken_1.default.sign({ _id: userId }, process.env.TOKEN_SECRET, { expiresIn: "1h" });
};
exports.generateToken = generateToken;
