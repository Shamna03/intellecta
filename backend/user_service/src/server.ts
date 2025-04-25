
import app from './app'
import dotenv from 'dotenv'
import connectDb from './config/db'
import "./consumers/userConsumer";
import "./consumers/getAllUsersConsumer";
import "./consumers/getAllUsersNotification";
import "./consumers/getSpecificUser_NotioficationService";


dotenv.config()
const PORT = Number(process.env.PORT)  || 5001

connectDb()


app.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service is running on port ${PORT}`);
});





