import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create an S3 client instance
const s3 = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export default s3;


