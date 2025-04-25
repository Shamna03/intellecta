"use strict";
// import { Request, Response } from "express";
// import CustomError from "../utils/CustomError";
// import { uploadToS3 } from "../middleware/upload";
// export const createCourse = async (req: Request, res: Response) => {
//       const file = req.file;
//       if (!file) {
//         throw new CustomError("Thumbnail image is required",400);
//       }
//       const imageUrl = await uploadToS3(file);
//       console.log("imgage", imageUrl);
//       const course = await Course.create({
//         ...req.body,
//         thumbNailImage: imageUrl,
//       });
//     res.status(201).json(course);
// };
