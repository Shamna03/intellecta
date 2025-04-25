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
const userProgressModel_1 = __importDefault(require("../models/userProgressModel"));
const rabbitmqConsumer_1 = require("../utils/rabbitmq/rabbitmqConsumer");
const rabbitmqPublish_1 = require("../utils/rabbitmq/rabbitmqPublish");
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        yield (0, rabbitmqConsumer_1.consumeFromQueue)("userProgress", (limit) => __awaiter(this, void 0, void 0, function* () {
            console.log("UserProgress received request for top users:", limit);
            try {
                const allProgress = yield userProgressModel_1.default.find().lean();
                // Aggregate lessons completed per user
                const progressMap = new Map();
                allProgress.forEach((entry) => {
                    var _a;
                    const userId = entry.userId.toString();
                    const lessons = ((_a = entry.completedLessons) === null || _a === void 0 ? void 0 : _a.length) || 0;
                    if (!progressMap.has(userId)) {
                        progressMap.set(userId, { userId, totalLessons: 0, records: [] });
                    }
                    const userRecord = progressMap.get(userId);
                    userRecord.totalLessons += lessons;
                    userRecord.records.push(entry); // optional: keep course-level data
                });
                // Convert to array and sort by totalLessons descending
                const sorted = Array.from(progressMap.values())
                    .sort((a, b) => b.totalLessons - a.totalLessons)
                    .slice(0, limit);
                const userIds = sorted.map((p) => p.userId);
                console.log("Sending top performers to admin service...");
                yield (0, rabbitmqPublish_1.publishToQueue)("userProgressData", { userProgress: sorted, userIds });
            }
            catch (error) {
                console.error("Error aggregating user progress:", error);
                yield (0, rabbitmqPublish_1.publishToQueue)("userProgressData", []);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
