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
Object.defineProperty(exports, "__esModule", { value: true });
const rabbitmqConsumer_1 = require("../utils/rabbitmq/rabbitmqConsumer");
const bulkUsersCache = new Map();
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        // ✅ Listen to the response queue (where the user-service sends details)
        yield (0, rabbitmqConsumer_1.consumeFromQueue)("adminUserData", (users) => __awaiter(this, void 0, void 0, function* () {
            if (users && Array.isArray(users)) {
                // Store by userId for quick lookup
                users.forEach((user) => {
                    bulkUsersCache.set(user._id.toString(), user);
                });
                console.log("✅ Fetched and cached bulk user details:", users);
            }
            else {
                console.warn("⚠️ Invalid users data received:", users);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start bulk users consumer:", err));
exports.default = bulkUsersCache;
