import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import axios from "axios";
import cors from "cors";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }, // Allow all origins for testing
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", async (message) => {
        try {
            const response = await axios.post(
                "https://api.together.xyz/v1/chat/completions",
                {
                    model: "deepseek-ai/DeepSeek-V3",
                    messages: [{ role: "user", content: message }],
                    max_tokens: 256,
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    repetition_penalty: 1,
                    stream: false, // Set to true if you want streaming responses
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Extract AI response and send it back to the user
            // console.log("response", response.data?.choices[0])
            socket.emit("reply", response.data?.choices[0].message.content);
        } catch (error) {
            console.error("Error:", error);
            socket.emit("error", "Failed to fetch AI response");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`server is running in ${PORT}`);
});
