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
// More structured currentUser definition
let currentUser = null;
exports.currentUser = currentUser;
// Improved consumer function
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        // Change the queue name to "admin_user_id" to listen for admin user data
        yield (0, rabbitmq_1.consumeFromQueue)("admin_user_id", (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("user consumer received the message", data);
            if (data) {
                try {
                    // Ensure data is a valid user ID
                    console.log("data received for user fetch:", data);
                    // Query the database to find the user by ID
                    const user = yield userModel_1.default.findById(data);
                    if (user) {
                        // If user is found, set it in currentUser and publish to queue
                        exports.currentUser = currentUser = user.toObject(); // Convert user to plain object
                        console.log("currentUser details are sending to ai_tutor_service", currentUser);
                        // Change the queue name to "adminUserData" to publish data to the correct queue
                        yield (0, rabbitmq_1.publishToQueue)("adminUserData", currentUser); // Changed the queue name here
                    }
                    else {
                        // Handle case where user is not found
                        exports.currentUser = currentUser = null;
                        console.warn("User not found for ID:", data);
                    }
                }
                catch (err) {
                    console.error("Error fetching user data:", err);
                    exports.currentUser = currentUser = null;
                }
            }
            else {
                console.warn("Received invalid or empty data for user fetch.");
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
console.log("Server is running on port 5000");
