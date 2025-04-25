import User from "../models/userModel";
import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

async function startConsumer() {
  console.log("Initializing RabbitMQ consumer...");

  await consumeFromQueue("fetchBulkUserDetails", async (data) => {
    console.log("User service received request for user details:", data);

    try {
      const { userIds } = data;
      const users = await User.find({ _id: { $in: userIds } },{ password: 0 }).lean();

      if (users && users.length > 0) {
        console.log("Sending user details to requesting service");
        await publishToQueue("userData", users);
      } else {
        console.warn("No users found");
        await publishToQueue("userData", []);
      }
    } catch (error) {
      console.error("Error fetching user details by userIds:", error);
      await publishToQueue("userData", []);
    }
  });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));
