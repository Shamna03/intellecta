"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishToQueue = publishToQueue;
exports.consumeFromQueue = consumeFromQueue;
const amqplib = __importStar(require("amqplib"));
const RABBITMQ_URL = "amqp://admin:password@rabbitmq:5672";
let connection = null;
let channel = null;
async function connectToRabbitMQ() {
    try {
        if (!connection) {
            console.log("🔄 Connecting to RabbitMQ...");
            let connection = await amqplib.connect(RABBITMQ_URL);
            channel = await connection.createChannel();
            console.log("✅ Connected to RabbitMQ!");
        }
    }
    catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
        throw error;
    }
}
async function publishToQueue(queue, message) {
    try {
        await connectToRabbitMQ();
        if (!channel)
            throw new Error("Channel is not initialized");
        await channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`📤 Message sent to queue: ${queue}`);
        // setTimeout(() => connection.close(), 500);
    }
    catch (error) {
        console.error("❌ RabbitMQ Publish Error:", error);
        throw error;
    }
}
async function consumeFromQueue(queue, callback) {
    try {
        await connectToRabbitMQ();
        if (!channel)
            throw new Error("Channel is not initialized");
        await channel.assertQueue(queue);
        console.log(`📥 Waiting for messages in queue: ${queue}...`);
        channel.consume(queue, (msg) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                // console.log(`📩 Received message:`, data);
                callback(data);
                channel?.ack(msg);
            }
        });
    }
    catch (error) {
        console.error("❌ RabbitMQ Consumer Error:", error);
    }
}
