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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "*" }, // Allow all origins for testing
});
io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.post("https://api.together.xyz/v1/chat/completions", {
                model: "deepseek-ai/DeepSeek-V3",
                messages: [{ role: "user", content: message }],
                max_tokens: 256,
                temperature: 0.7,
                top_p: 0.7,
                top_k: 50,
                repetition_penalty: 1,
                stream: false, // Set to true if you want streaming responses
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            });
            // Extract AI response and send it back to the user
            // console.log("response", response.data?.choices[0])
            socket.emit("reply", (_a = response.data) === null || _a === void 0 ? void 0 : _a.choices[0].message.content);
        }
        catch (error) {
            console.error("Error:", error);
            socket.emit("error", "Failed to fetch AI response");
        }
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`server is running in ${PORT}`);
});
