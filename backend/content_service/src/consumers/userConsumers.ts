// import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer"; 

// const userCache = new Map<string, any>();

// async function startConsumer() {
//     console.log("Initializing RabbitMQ consumer...");
  
//     await consumeFromQueue("userData", async (data) => {
//         if (data) {
//             userCache.set(data._id, data);
//             console.log("Content consumer received user_fetched event:", userCache);
//         }
//     });
// }

// startConsumer().catch((err) => console.error("Failed to start consumer:", err));

// export function getUserData(userId: string) {
//     return new Promise((resolve, reject) => {
//         const checkCache = () => {
//             if (userCache.has(userId)) {
//                 resolve(userCache.get(userId));
//             } else {
//                 setTimeout(checkCache, 500); 
//             }
//         };
//         checkCache();
//     });
// }


import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer"; 

const userCache = new Map<string, any>();

async function startConsumer() {
    console.log("Initializing RabbitMQ consumer...");
  
    await consumeFromQueue("userData", async (data) => {
        if (data) {
            console.log("Received user data:", data);
            userCache.set(data._id, data);
            console.log("User data cached:", userCache);
        }
    });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));

export function getUserData(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Timeout: User data not found in cache"));
        }, 2000); // Increase timeout to 5 seconds

        const checkCache = () => {
            console.log("Checking cache for user:", userId);
            if (userCache.has(userId)) {
                console.log("User data found in cache:", userCache.get(userId));
                clearTimeout(timeout);
                resolve(userCache.get(userId));
            } else {
                setTimeout(checkCache, 500); // Check again in 1 second
            }
        };
        checkCache();
    });
}
