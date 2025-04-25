"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCache = void 0;
const rabbitmq_1 = require("../utils/rabbitmq");
const userCache = new Map();
exports.userCache = userCache;
async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");
    await (0, rabbitmq_1.consumeFromQueue)("user_fetched", async (data) => {
        console.log("AI Tutor Service received user_fetched event:", data);
        if (data) {
            userCache.set(data?._id, data);
            console.log("Updated userCache:", userCache); // Cache user data
        }
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
console.log("Server is running on port 5000");
