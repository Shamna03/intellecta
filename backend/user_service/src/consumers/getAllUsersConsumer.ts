import User from "../models/userModel";
import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

async function startConsumer() {
  console.log("Initializing RabbitMQ consumer...");

  await consumeFromQueue("allUserDetails", async (data) => {
    console.log("User service received request for all users:", data);

    try {
      const users = await User.find({}, { password: 0 }); // Exclude sensitive fields

      if (users) {
        console.log("Sending user list to admin service");
        await publishToQueue("adminUserData", users);
      } else {
        console.warn("No users found");
        await publishToQueue("adminUserData", []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      await publishToQueue("adminUserData", []);
    }
  });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));
