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
exports.getTopPerfomingStudents = exports.adminDashboard = void 0;
const CustomError_1 = __importDefault(require("../utils/CustomError"));
const rabbitmqPublish_1 = require("../utils/rabbitmq/rabbitmqPublish");
const userConsumer_1 = require("../consumers/userConsumer");
const progressData_1 = __importDefault(require("../consumers/progressData"));
const bulkUsersData_1 = __importDefault(require("../consumers/bulkUsersData"));
const adminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        throw new CustomError_1.default("User ID is required", 400);
    }
    yield (0, rabbitmqPublish_1.publishToQueue)("allUserDetails", userId);
    yield new Promise((resolve) => setTimeout(resolve, 1500));
    const allUsers = Array.from(userConsumer_1.users.values());
    const filteredUsers = allUsers.filter(user => user.role === "student");
    if (!filteredUsers.length) {
        return res.status(404).json({ message: "No users found." });
    }
    //UserRegistration Details
    const now = new Date();
    const dayStats = new Map();
    const weekStats = new Map();
    const monthStats = new Map();
    const yearStats = new Map();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthsOfYear = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    filteredUsers.forEach((user) => {
        const createdAt = new Date(user.createdAt);
        // DAY: group by hour
        if (createdAt.toDateString() === now.toDateString()) {
            const hour = createdAt.getHours();
            const label = `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? "AM" : "PM"}`;
            dayStats.set(label, (dayStats.get(label) || 0) + 1);
        }
        // WEEK: group by day name
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        if (createdAt >= startOfWeek && createdAt < endOfWeek) {
            const day = daysOfWeek[createdAt.getDay()];
            weekStats.set(day, (weekStats.get(day) || 0) + 1);
        }
        // MONTH: group by week number (Week 1 to Week 4)
        if (createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()) {
            const weekNumber = Math.floor((createdAt.getDate() - 1) / 7) + 1;
            const label = `Week ${weekNumber}`;
            monthStats.set(label, (monthStats.get(label) || 0) + 1);
        }
        // YEAR: group by month name
        if (createdAt.getFullYear() === now.getFullYear()) {
            const month = monthsOfYear[createdAt.getMonth()];
            yearStats.set(month, (yearStats.get(month) || 0) + 1);
        }
    });
    const formatStats = (map) => Array.from(map.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // sort alphabetically or by time
        .map(([date, count]) => ({ date, count }));
    const graphData = {
        day: formatStats(dayStats),
        week: formatStats(weekStats),
        month: formatStats(monthStats),
        year: formatStats(yearStats),
    };
    //Students count
    const studentCategory = {
        total: filteredUsers.length,
        first: 0,
        second: 0,
        third: 0,
    };
    filteredUsers.forEach((user) => {
        const age = user === null || user === void 0 ? void 0 : user.age;
        if (typeof age === "number") {
            if (age >= 13) {
                studentCategory.third += 1;
            }
            else if (age >= 9) {
                studentCategory.second += 1;
            }
            else if (age >= 5) {
                studentCategory.first += 1;
            }
        }
    });
    return res.status(200).json({
        success: true,
        message: "catagoriesed the data ",
        studentsCountData: studentCategory,
        userRegistrationData: graphData,
    });
});
exports.adminDashboard = adminDashboard;
const getTopPerfomingStudents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query.limit) || 10;
    // Step 1: Request top performing users based on lessons completed
    yield (0, rabbitmqPublish_1.publishToQueue)("userProgress", limit);
    // Wait for userProgressData to arrive in cache
    yield new Promise((resolve) => setTimeout(resolve, 1500));
    // Step 2: Extract user progress from the cache
    const UsersProgressData = Array.from(progressData_1.default.values());
    if (!UsersProgressData.length) {
        return res.status(404).json({ message: "No user progress found." });
    }
    const userProgressList = UsersProgressData.flatMap((d) => d.userProgress || []);
    const userIds = userProgressList.map((up) => up.userId);
    // Step 3: Request full user details for those top users
    yield (0, rabbitmqPublish_1.publishToQueue)("fetchBulkUserDetails", { userIds });
    // Wait for user data to be populated in cache
    yield new Promise((resolve) => setTimeout(resolve, 1500));
    // Step 4: Map userId to user data
    const UsersDetailsMap = new Map(userIds.map((id) => [id, bulkUsersData_1.default.get(id)]));
    // Step 5: Merge user data with progress data
    const result = userProgressList.map((progress) => (Object.assign(Object.assign({}, progress), { user: UsersDetailsMap.get(progress.userId) || null })));
    return res.status(200).json({
        message: "Fetched top performing students (by lessons completed)",
        data: result,
    });
});
exports.getTopPerfomingStudents = getTopPerfomingStudents;
