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
const userProgressCache = new Map();
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        yield (0, rabbitmqConsumer_1.consumeFromQueue)("userProgressData", (data) => __awaiter(this, void 0, void 0, function* () {
            if (data) {
                userProgressCache.set(data._id, data);
                console.log("User progress data received event:", userProgressCache);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
exports.default = userProgressCache;
