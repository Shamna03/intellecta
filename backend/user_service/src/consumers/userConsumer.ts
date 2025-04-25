// import User from "../models/userModel";
// import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

// let currentUser: Map<string, any> | null = new Map(); 

// async function startConsumer() {
//     console.log("Initializing RabbitMQ consumer...");
//     await consumeFromQueue("user_id", async (data) => {
//       console.log("user consumer recieved the message", data);

//       if (data) {
//         console.log("data user service ", data);

//           const user = await User.findById(data)
        
//           if (user) {
//             currentUser = new Map(Object.entries(user.toObject())); // Convert user to Map
//             console.log("currentUser details is sending to ai_tutor_service", currentUser)
//             await publishToQueue("userData", currentUser);
//           } else {
//             currentUser = null; // Handle case where user is not found
//             console.warn("User not found for ID:", data);
//           }
//       }
//     });
//   }
  
//   startConsumer().catch((err) => console.error("Failed to start consumer:", err));
//   console.log("Server is running on port 5000");

//   export { currentUser };


import User from "../models/userModel";
import { consumeFromQueue, publishToQueue } from "../utils/rabbitmq";

// More structured currentUser definition
let currentUser: Record<string, any> | null = null; 

// Improved consumer function
async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");

    await consumeFromQueue("user_id", async (data) => {
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
                    await publishToQueue("userData", currentUser);
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
