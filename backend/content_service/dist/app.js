"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const globalErrorHandler_1 = require("./middlewares/globalErrorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const progressRoutes_1 = __importDefault(require("./routes/progressRoutes"));
const lessonRoutes_1 = __importDefault(require("./routes/lessonRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/courses", courseRoutes_1.default);
app.use("/api/progress", progressRoutes_1.default);
app.use("/api/lessons", lessonRoutes_1.default);
const errorHandlerMiddleware = (err, req, res, next) => {
    (0, globalErrorHandler_1.globalErrorHandler)(err, req, res, next);
};
app.use(errorHandlerMiddleware);
exports.default = app;
