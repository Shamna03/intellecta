import multer from "multer";
import cloudinary from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: "game_thumbnails",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  }),
});

const gameThumbUpload = multer({ storage: storage });

export default gameThumbUpload;
