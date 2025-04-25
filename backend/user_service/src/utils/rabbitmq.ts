import * as amqplib from "amqplib";
import { Connection, Channel, ConsumeMessage } from "amqplib";

const RABBITMQ_URL = "amqp://admin:password@rabbitmq:5672";

// let connection: Connection | null = null;
// let channel: Channel | null = null;

async function connectToRabbitMQ(): Promise<Channel> {
  try {
    console.log("🔄 Connecting to RabbitMQ...");
    const conn = await amqplib.connect(RABBITMQ_URL);
    const ch = await conn.createChannel();
    console.log("✅ Connected to RabbitMQ!");
    return ch;
  } catch (error) {
    console.error("❌ RabbitMQ Connection Error:", error);
    throw error;
  }
}

export async function publishToQueue(queue: string, data: any): Promise<void> {
  let channel;
  try {
    channel = await connectToRabbitMQ();
    await channel.assertQueue(queue);

    let message;

    // Check if it's a Map (single user)
    if (data instanceof Map) {
      message = {
        _id: data.get("_id")?.toString() || "",
        name: data.get("name") || "Unknown",
        email: data.get("email") || "Unknown",
        age: data.get("age") || null,
        phone: data.get("phone") || "Unknown",
        role: data.get("role") || "Unknown",
        profilePic: data.get("profilePic") || "",
        createdAt: data.get("createdAt")
          ? new Date(data.get("createdAt")).toISOString()
          : null,
        updatedAt: data.get("updatedAt")
          ? new Date(data.get("updatedAt")).toISOString()
          : null,
      };
    } else {
      // It's either an array of users or a plain object (like already mapped users)
      message = data;
    }

    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message), "utf-8"));
    console.log(`Message sent to queue "${queue}"`);
  } catch (error) {
    console.error("RabbitMQ Publish Error:", error);
    throw error;
  } finally {
    if (channel) await channel.close();
  }
}


export async function consumeFromQueue(
  queue: string,
  callback: (data: any, msg: ConsumeMessage) => Promise<void>
): Promise<void> {
  let channel: any;
  try {
    channel = await connectToRabbitMQ();
    await channel.assertQueue(queue);
    channel.prefetch(1);
    console.log(`📥 Waiting for messages in queue userservice: ${queue}...`);

    channel.consume(
      queue,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          console.log(`📩 Received message in userservice`, data);

          try {
            await callback(data, msg);
            channel.ack(msg); // ✅ Acknowledge the message after successful processing
          } catch (error) {
            console.error("❌ Error processing message:", error);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ RabbitMQ Consumer Error:", error);
  }
}

