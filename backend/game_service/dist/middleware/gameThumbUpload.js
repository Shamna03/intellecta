"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async () => ({
        folder: "game_thumbnails",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    }),
});
const gameThumbUpload = (0, multer_1.default)({ storage: storage });
exports.default = gameThumbUpload;
