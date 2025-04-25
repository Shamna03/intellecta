"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePresignedUrl = exports.uploadToS3 = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = __importDefault(require("../config/s3"));
// Ensure bucket name is defined
const bucketName = process.env.AWS_BUCKET_NAME;
// Multer configuration for handling file uploads
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/", "application/pdf", "video/"];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        if (!isAllowed) {
            return cb(new Error("Only image, PDF, or video files are allowed!"));
        }
        cb(null, true);
    },
});
// Function to upload file to S3
const uploadToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
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
        const command = new client_s3_1.PutObjectCommand(params);
        yield s3_1.default.send(command);
        return fileName;
    }
    catch (error) {
        console.error("Error uploading to S3:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
});
exports.uploadToS3 = uploadToS3;
// Function to generate a presigned URL for accessing files in S3
const generatePresignedUrl = (key) => __awaiter(void 0, void 0, void 0, function* () {
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
        const url = yield (0, s3_request_presigner_1.getSignedUrl)(s3_1.default, command, { expiresIn: 3600 });
        return url;
    }
    catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return null;
    }
});
exports.generatePresignedUrl = generatePresignedUrl;
