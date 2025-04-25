import UserProgress from "../models/userProgressModel";
import { consumeFromQueue } from "../utils/rabbitmq/rabbitmqConsumer";
import { publishToQueue } from "../utils/rabbitmq/rabbitmqPublish";

async function startConsumer() {
  console.log("Initializing RabbitMQ consumer...");

  await consumeFromQueue("userProgress", async (limit) => {
    console.log("UserProgress received request for top users:", limit);

    try {
      const allProgress = await UserProgress.find().lean();

      // Aggregate lessons completed per user
      const progressMap = new Map();

      allProgress.forEach((entry) => {
        const userId = entry.userId.toString();
        const lessons = entry.completedLessons?.length || 0;

        if (!progressMap.has(userId)) {
          progressMap.set(userId, { userId, totalLessons: 0, records: [] });
        }

        const userRecord = progressMap.get(userId);
        userRecord.totalLessons += lessons;
        userRecord.records.push(entry); // optional: keep course-level data
      });

      // Convert to array and sort by totalLessons descending
      const sorted = Array.from(progressMap.values())
        .sort((a, b) => b.totalLessons - a.totalLessons)
        .slice(0, limit);

      const userIds = sorted.map((p) => p.userId);

      console.log("Sending top performers to admin service...");
      await publishToQueue("userProgressData", { userProgress: sorted, userIds });
    } catch (error) {
      console.error("Error aggregating user progress:", error);
      await publishToQueue("userProgressData", []);
    }
  });
}

startConsumer().catch((err) => console.error("Failed to start consumer:", err));
