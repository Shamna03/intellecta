import {  GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3config"; 

const bucketName = process.env.AWS_BUCKET_NAME as string;

export const generatePresignedUrl = async (key: string): Promise<string | null> => {

    try {
        if (!key || typeof key !== "string") {
            console.error("Invalid key provided to generatePresignedUrl:", key);
            return null;
        }

        // Extract key if it's a full URL
        if (key.includes("amazonaws.com")) {
            const urlParts = key.split("amazonaws.com/");
            if (urlParts.length > 1) {
                key = urlParts[1];
            }
        }

        if (!key) return null;

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        // URL will expire in 1 hour (3600 seconds)
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return null;
    }
};

