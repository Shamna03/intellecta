import * as amqplib from "amqplib";
import { Connection, Channel, ConsumeMessage } from "amqplib";

const RABBITMQ_URL = "amqp://admin:password@rabbitmq:5672";

let connection: Connection | null = null;
let channel: Channel | null = null;

async function connectToRabbitMQ(): Promise<void> {
  try {
    if (!connection) {
      console.log(" Connecting to RabbitMQ...");
      let connection = await amqplib.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      console.log(" Connected to RabbitMQ!");
    }
  } catch (error) {
    console.error(" RabbitMQ Connection Error:", error);
    throw error;
  }
}


export async function consumeFromQueue(queue: string, callback: (message: any) => void): Promise<void> {
  try {
    await connectToRabbitMQ();
    if (!channel) throw new Error("Channel is not initialized");
    
    await channel.assertQueue(queue);
    console.log(`📥 Waiting for messages in queue:in ai service ${queue}...`);
    
    channel.consume(queue, (msg: ConsumeMessage | null) => {
      if (msg) {
        console.log("🟢 Raw message received:", msg.content.toString("utf-8"));
        const data = JSON.parse(msg.content.toString("utf-8"));
        // console.log(`Received message in ai service`, data);
        callback(data);
        channel?.ack(msg);
      }
    });
  } catch (error) {
    console.error("RabbitMQ Consumer Error:", error);
  }
}
