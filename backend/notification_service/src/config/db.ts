import mongoose from "mongoose";

async function connectDb() {
  try {
    const connectionString = process.env.CONNECTION_STRING;
    if (!connectionString) {
      throw new Error(
        "connenction string is undefined , check the environmental variables"
      );
    }
    await mongoose.connect(connectionString);
    console.log("server connected to the database");
  } catch (error) {
    console.log("Error connecting database", error);
  }
}



export default connectDb;
