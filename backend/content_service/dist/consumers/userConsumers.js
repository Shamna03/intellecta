"use strict";
// import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer"; 
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
exports.getUserData = getUserData;
// const userCache = new Map<string, any>();
// async function startConsumer() {
//     console.log("Initializing RabbitMQ consumer...");
//     await consumeFromQueue("userData", async (data) => {
//         if (data) {
//             userCache.set(data._id, data);
//             console.log("Content consumer received user_fetched event:", userCache);
//         }
//     });
// }
// startConsumer().catch((err) => console.error("Failed to start consumer:", err));
// export function getUserData(userId: string) {
//     return new Promise((resolve, reject) => {
//         const checkCache = () => {
//             if (userCache.has(userId)) {
//                 resolve(userCache.get(userId));
//             } else {
//                 setTimeout(checkCache, 500); 
//             }
//         };
//         checkCache();
//     });
// }
const rabbitmqConsumer_1 = require("../utils/rabbitmq/rabbitmqConsumer");
const userCache = new Map();
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Initializing RabbitMQ consumer...");
        yield (0, rabbitmqConsumer_1.consumeFromQueue)("userData", (data) => __awaiter(this, void 0, void 0, function* () {
            if (data) {
                console.log("Received user data:", data);
                userCache.set(data._id, data);
                console.log("User data cached:", userCache);
            }
        }));
    });
}
startConsumer().catch((err) => console.error("Failed to start consumer:", err));
function getUserData(userId) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timeout: User data not found in cache"));
        }, 2000); // Increase timeout to 5 seconds
        const checkCache = () => {
            console.log("Checking cache for user:", userId);
            if (userCache.has(userId)) {
                console.log("User data found in cache:", userCache.get(userId));
                clearTimeout(timeout);
                resolve(userCache.get(userId));
            }
            else {
                setTimeout(checkCache, 500); // Check again in 1 second
            }
        };
        checkCache();
    });
}
