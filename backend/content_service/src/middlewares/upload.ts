import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3";

// Ensure bucket name is defined
const bucketName = process.env.AWS_BUCKET_NAME as string;

// Multer configuration for handling file uploads
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = ["image/", "application/pdf", "video/"];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        if (!isAllowed) {
          return cb(new Error("Only image, PDF, or video files are allowed!"));
        }
        cb(null, true);
    },
});

// Function to upload file to S3
export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const folder = file.mimetype.startsWith("image/")
    ? "thumbnail"
    : file.mimetype === "application/pdf"
    ? "pdf"
    : file.mimetype.startsWith("video/")
    ? "videos"
    : "others";
    const fileName = `${folder}/${Date.now()}_${file.originalname.replace(/\s+/g, "-")}`;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    }; 

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return fileName;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
};

// Function to generate a presigned URL for accessing files in S3
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

