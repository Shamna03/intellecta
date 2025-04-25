
import app from './app'
import dotenv from 'dotenv'
import connectDb from './config/db'
import "./consumers/fetchSpecificUser";
import "./consumers/userConsumer";

dotenv.config()
const PORT = process.env.PORT

connectDb()


app.listen(PORT, ()=>{
    console.log(`server is running in ${PORT}`)
})




