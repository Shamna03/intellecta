"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3config_1 = __importDefault(require("../config/s3config"));
const bucketName = process.env.AWS_BUCKET_NAME;
const generatePresignedUrl = async (key) => {
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
        if (!key)
            return null;
        const command = new client_s3_1.GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        // URL will expire in 1 hour (3600 seconds)
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3config_1.default, command, { expiresIn: 3600 });
        return url;
    }
    catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return null;
    }
};
exports.generatePresignedUrl = generatePresignedUrl;
