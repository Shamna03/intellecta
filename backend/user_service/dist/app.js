"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const userServiceRouter_1 = __importDefault(require("./router/userServiceRouter"));
const errorHandler_1 = require("./middleware/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:8000"], // Replace with your frontend URL
    credentials: true, // Allow cookies/auth headers
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/user', userServiceRouter_1.default);
app.use(errorHandler_1.errorHandler);
exports.default = app;
