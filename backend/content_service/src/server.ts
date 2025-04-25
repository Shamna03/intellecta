import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";
import "./consumers/userProgress";

dotenv.config();

connectDB();

const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
