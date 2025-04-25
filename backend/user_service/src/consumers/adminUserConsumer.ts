import User from "../models/userModel";
import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

// More structured currentUser definition
let currentUser: Record<string, any> | null = null; 

// Improved consumer function
async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");

    // Change the queue name to "admin_user_id" to listen for admin user data
    await consumeFromQueue("admin_user_id", async (data) => {  // Changed the queue name here
        console.log("user consumer received the message", data);

        if (data) {
            try {
                // Ensure data is a valid user ID
                console.log("data received for user fetch:", data);

                // Query the database to find the user by ID
                const user = await User.findById(data);

                if (user) {
                    // If user is found, set it in currentUser and publish to queue
                    currentUser = user.toObject();  // Convert user to plain object
                    console.log("currentUser details are sending to ai_tutor_service", currentUser);

                    // Change the queue name to "adminUserData" to publish data to the correct queue
                    await publishToQueue("adminUserData", currentUser);  // Changed the queue name here
                } else {
                    // Handle case where user is not found
                    currentUser = null;
                    console.warn("User not found for ID:", data);
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                currentUser = null;
            }
        } else {
            console.warn("Received invalid or empty data for user fetch.");
        }
    });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));

console.log("Server is running on port 5000");

// Export the currentUser object for use elsewhere
export { currentUser };
