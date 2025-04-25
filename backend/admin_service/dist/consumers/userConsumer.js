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
exports.users = void 0;
const rabbitmqConsumer_1 = require("../utils/rabbitmq/rabbitmqConsumer");
const users = new Map();
exports.users = users;
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        // Change the queue name to "adminUserData" to consume messages from the admin user data queue
        yield (0, rabbitmqConsumer_1.consumeFromQueue)("adminUserData", (data) => __awaiter(this, void 0, void 0, function* () {
            // console.log("Admin Service received 'adminUserData' event:", data);
            if (Array.isArray(data)) {
                // If it's a list of users
                data.forEach((user) => {
                    if (user === null || user === void 0 ? void 0 : user._id) {
                        users.set(user._id, user);
                    }
                });
                console.log(`✅ Cached ${users.size} users`);
            }
            else if (data === null || data === void 0 ? void 0 : data._id) {
                // If it's a single user
                users.set(data._id, data);
                console.log("✅ Cached 1 user");
            }
            else {
                console.warn("⚠️ Received unknown user data format", data);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
console.log("Server is running on port 5000");
