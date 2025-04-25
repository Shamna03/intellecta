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
exports.softDeleteUser = exports.getallUsers = void 0;
const rabbitmqPublish_1 = require("../utils/rabbitmq/rabbitmqPublish");
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const userConsumer_1 = require("../consumers/userConsumer");
const getallUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new CustomError_1.default("User ID is required", 400);
    }
    yield (0, rabbitmqPublish_1.publishToQueue)("allUserDetails", userId);
    yield new Promise((resolve) => setTimeout(resolve, 1500));
    const allUsers = Array.from(userConsumer_1.users.values()).filter(user => !user.isDeleted);
    if (!allUsers.length) {
        return res.status(404).json({ message: "No users found." });
    }
    return res.status(200).json({
        success: true,
        message: "got all users",
        data: allUsers
    });
});
exports.getallUsers = getallUsers;
const softDeleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const admin = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { userId } = req.body;
    if (!userId) {
        throw new CustomError_1.default("User ID is required", 400);
    }
    yield (0, rabbitmqPublish_1.publishToQueue)("deleteUser", userId);
});
exports.softDeleteUser = softDeleteUser;
