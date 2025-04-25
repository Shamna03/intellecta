import express from "express";
import { sendNotification, getAllNotifications } from "../controllers/notificationController";
import { asyncHandler } from "../middleware/asyncHandler";
import {isAuthenticate} from "../middleware/verifyToken"

const notificationServiceRouter = express.Router();

notificationServiceRouter.post("/send",isAuthenticate, asyncHandler(sendNotification))
notificationServiceRouter.get("/get",isAuthenticate, asyncHandler(getAllNotifications))


export default notificationServiceRouter;