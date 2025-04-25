

import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer";

const users = new Map<string, any>();

async function startConsumer() {
  console.log("Initializing RabbitMQ consumer...");

  await consumeFromQueue("allUserDetailsToNotification", async (data) => {
    console.log("notification Service received event:", data);

    if (Array.isArray(data)) {
      // If it's a list of users
      data.forEach((user) => {
        if (user?._id) {
          users.set(user._id, user);
        }
      });
      console.log(`✅ Cached ${users.size} users`);
    } else if (data?._id) {
      // If it's a single user
      users.set(data._id, data);
      console.log("✅ Cached 1 user");
    } else {
      console.warn("⚠️ Received unknown user data format", data);
    }
  });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));
console.log("Server is running on port 5000");

export { users };
