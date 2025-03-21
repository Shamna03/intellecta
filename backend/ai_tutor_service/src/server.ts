// import app from "./app";

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";
import "./consumers/userConsumer";

dotenv.config();

connectDB();

const PORT = process.env.PORT ;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
