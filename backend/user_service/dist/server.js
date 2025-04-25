"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
require("./consumers/userConsumer");
require("./consumers/getAllUsersConsumer");
require("./consumers/getAllUsersNotification");
require("./consumers/getSpecificUser_NotioficationService");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5001;
(0, db_1.default)();
app_1.default.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service is running on port ${PORT}`);
});
