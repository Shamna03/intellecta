import express, { ErrorRequestHandler}  from "express";
import cors from "cors";
import dotenv from "dotenv";
import courseRoutes from "./routes/courseRoutes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import cookieParser from "cookie-parser";
import progressRoutes from "./routes/progressRoutes";
import lessonRoutes from "./routes/lessonRoutes";

dotenv.config();

const app = express();
app.use(
    cors({
      origin: "http://localhost:5173", 
      credentials: true,
    })
  );

app.use(express.json());
app.use(cookieParser());

app.use("/api/courses", courseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/lessons", lessonRoutes);

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    globalErrorHandler(err, req, res, next);
};

app.use(errorHandlerMiddleware);

export default app;