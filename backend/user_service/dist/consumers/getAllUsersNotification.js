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
const userModel_1 = __importDefault(require("../models/userModel"));
const rabbitmq_1 = require("../utils/rabbitmq");
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        yield (0, rabbitmq_1.consumeFromQueue)("allUserDetailsNotification", (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("User service received request for all users:", data);
            try {
                const users = yield userModel_1.default.find({}, { password: 0 }); // Exclude sensitive fields
                console.log(users);
                if (users) {
                    console.log("Sending user list to notification service");
                    yield (0, rabbitmq_1.publishToQueue)("allUserDetailsToNotification", users);
                }
                else {
                    console.warn("No users found");
                    yield (0, rabbitmq_1.publishToQueue)("allUserDetailsToNotification", []);
                }
            }
            catch (error) {
                console.error("Error fetching users:", error);
                yield (0, rabbitmq_1.publishToQueue)("allUserDetailsToNotification", []);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
