"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDb() {
    try {
        const connectionString = process.env.CONNECTION_STRING;
        if (!connectionString) {
            throw new Error("connenction string is undefined , check the environmental variables");
        }
        await mongoose_1.default.connect(connectionString);
        console.log("server connected to the database");
    }
    catch (error) {
        console.log("Error connecting database", error);
    }
}
exports.default = connectDb;
