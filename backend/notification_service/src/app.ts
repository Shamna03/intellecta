import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import notificationServiceRouter from "./router/notificationrouter";


dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use('/api/notification',notificationServiceRouter)


app.use(errorHandler as (err: any,req: Request,res: Response, next: NextFunction) => void);

export default app;