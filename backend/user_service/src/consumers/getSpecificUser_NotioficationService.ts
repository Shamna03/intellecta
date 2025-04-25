import User from "../models/userModel";
import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

let currentUser: Map<string, any> | null = new Map(); 

async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");
    await consumeFromQueue("GetSpecificUser_Notification_service", async (data) => {
      console.log("user consumer recieved the message", data);

      if (data) {
        console.log("data user service ", data);

          const user = await User.findById(data)
        
          if (user) {
            currentUser = new Map(Object.entries(user.toObject())); // Convert user to Map
            console.log("currentUser details is sending to publish queue", currentUser)
            await publishToQueue("sendSpecificUser_NotificaitonService", currentUser);
          } else {
            currentUser = null; // Handle case where user is not found
            console.warn("User not found for ID:", data);
          }
      }
    });
  }
  
  startConsumer().catch((err) => console.error("Failed to start consumer:", err));
  console.log("Server is running on port 5000");

  export { currentUser };