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
        yield (0, rabbitmq_1.consumeFromQueue)("fetchBulkUserDetails", (data) => __awaiter(this, void 0, void 0, function* () {
            console.log("User service received request for user details:", data);
            try {
                const { userIds } = data;
                const users = yield userModel_1.default.find({ _id: { $in: userIds } }, { password: 0 }).lean();
                if (users && users.length > 0) {
                    console.log("Sending user details to requesting service");
                    yield (0, rabbitmq_1.publishToQueue)("userData", users);
                }
                else {
                    console.warn("No users found");
                    yield (0, rabbitmq_1.publishToQueue)("userData", []);
                }
            }
            catch (error) {
                console.error("Error fetching user details by userIds:", error);
                yield (0, rabbitmq_1.publishToQueue)("userData", []);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
