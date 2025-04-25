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
exports.currentUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const rabbitmq_1 = require("../utils/rabbitmq");
let currentUser = new Map();
exports.currentUser = currentUser;
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        yield (0, rabbitmq_1.consumeFromQueue)("GetSpecificUser_Notification_service", (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("user consumer recieved the message", data);
            if (data) {
                console.log("data user service ", data);
                const user = yield userModel_1.default.findById(data);
                if (user) {
                    exports.currentUser = currentUser = new Map(Object.entries(user.toObject())); // Convert user to Map
                    console.log("currentUser details is sending to publish queue", currentUser);
                    yield (0, rabbitmq_1.publishToQueue)("sendSpecificUser_NotificaitonService", currentUser);
                }
                else {
                    exports.currentUser = currentUser = null; // Handle case where user is not found
                    console.warn("User not found for ID:", data);
                }
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
console.log("Server is running on port 5000");
