"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const assessmentRoutes_1 = __importDefault(require("./routes/assessmentRoutes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/ai-tutor", assessmentRoutes_1.default);
const errorHandlerMiddleware = (err, req, res, next) => {
    (0, errorHandler_1.errorHandler)(err, req, res, next);
};
app.use(errorHandlerMiddleware);
exports.default = app;
