import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer"; 

const specificUserData = new Map<string, any>();

async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");
  
    await consumeFromQueue("sendSpecificUser_NotificaitonService", async (data) => {
        if (data) {
            specificUserData.set(data._id, data);
            console.log("notification consumer received user_fetched event:", specificUserData);
        }
    });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));

export function getUserData(userId: string) {
    return new Promise((resolve, reject) => {
        const checkCache = () => {
            if (specificUserData.has(userId)) {
                resolve(specificUserData.get(userId));
            } else {
                setTimeout(checkCache, 500); // Retry after 500ms
            }
        };
        checkCache();
    });
}
