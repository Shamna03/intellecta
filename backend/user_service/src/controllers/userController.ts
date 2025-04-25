import { Request, Response } from "express";
import { getUserByIdService, profilePictureService, userEditService  } from "../service/userService";
import CustomError from "../utils/customErrorHandler";
import User from "../models/userModel";
import { generatePresignedUrl } from "../middleware/profilePicUploader";

//Get User
export const getUserById = async (req:Request , res:Response) => {
    const userId = req.user?.userId;
    if(!userId){
        throw new CustomError("user not found",404)
    }
    const userData = await getUserByIdService(userId)
    res.status(200).json({success:true, message:userData.message, data:userData})
}


interface AuthenticatedRequest extends Request {
    user?: { userId: string }; 
}

export const profilePictureController = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new CustomError("User ID is required", 400);
    }
    const result = await profilePictureService(userId, req.file as Express.Multer.File);
    return res.status(200).json({
        status: "success",
        message: "Uploaded Successfully",
        data: result,
    });
}

//Edit User
export const userEditController = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.user?.userId; 
    if (!userId) {
        throw new CustomError("User ID is required", 400);
    }
    const response = await userEditService(userId, req.body);
    return res.status(200).json({
        status: "success",
        message: "User updated successfully",
        data: response,
    });
}


//bulk users 
export const getBulkUsers = async (req:Request, res:Response) :Promise<Response> => {
    const { userIds } = req.body;
    const users = await User.find({ _id: { $in: userIds } }, "_id name profilePic");    
    return res.json(users);
  };


//Get all users


export const getAllUsers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {

    const {
      page = "1",
      limit = "10",
      isBlock,
      search,
      catagory,
    } = req.query as {
      page?: string;
      limit?: string; 
      isBlock?: string;
      search?: string;
      catagory?: string;
    };

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    const filter: any = {
      isDeleted: { $ne: true },
      role: "student"
    };


    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (isBlock !== undefined) {
      filter.isBlock = isBlock === "true";
    }

    if (catagory === "5-8") {
      filter.age = { $gte: 4, $lte: 8 };
    } else if (catagory === "9-12") {
      filter.age = { $gte: 9, $lte: 12 };
    } else if (catagory === "13-18") {
      filter.age = { $gte: 13, $lte: 18 };
    }

    const users = await User.find(filter).skip(skip).limit(itemsPerPage);
    const totalUsers = await User.countDocuments(filter);

    await Promise.all(
      users.map(async (user) => {
        if (user.profilePic) {
          user.profilePic = await generatePresignedUrl(user.profilePic);
        }
      })
    );

    return res.status(200).json({
      success: true,
      currentPage,
      totalPages: Math.ceil(totalUsers / itemsPerPage),
      totalUsers,
      users,
    });
};


export const deleteUser = async (req:AuthenticatedRequest, res: Response ) => {

  const {userId} = req.body 

  console.log( "user:",userId)

  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!deletedUser) {
    throw new CustomError("User not found", 404);
  }

  res.status(200).json({
    message: "User soft-deleted successfully",
    user: deletedUser,
  });

}
