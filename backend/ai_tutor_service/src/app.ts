import express, { ErrorRequestHandler}  from "express";
import cors from "cors";
import dotenv from "dotenv";
import assessmentRoutes from "./routes/assessmentRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(
    cors({
      origin: "http://localhost:5173", 
      credentials: true,
    })
  );

app.use(express.json());
app.use(cookieParser())

app.use("/api/ai-tutor", assessmentRoutes);

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
    errorHandler(err, req, res, next);
};

app.use(errorHandlerMiddleware);

export default app;