"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lessonController_1 = require("../controller/lessonController");
const upload_1 = require("../middlewares/upload");
const asyncErrorHandler_1 = require("../middlewares/asyncErrorHandler");
const lessonRouter = express_1.default.Router();
lessonRouter.post("/", upload_1.upload.single("video"), (0, asyncErrorHandler_1.asyncErrorHandler)(lessonController_1.addLesson));
lessonRouter.put("/editLesson/:lessonId", upload_1.upload.single("video"), (0, asyncErrorHandler_1.asyncErrorHandler)(lessonController_1.editLesson));
lessonRouter.delete("/:lessonId", (0, asyncErrorHandler_1.asyncErrorHandler)(lessonController_1.deleteLesson));
exports.default = lessonRouter;
