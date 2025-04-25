import {Request, Response} from "express";
import CustomError from "../utils/CustomError";
import { publishToQueue } from "../utils/rabbitmq/rabbitmqPublish";
import { users } from "../consumers/userConsumer";
import Notification from "../models/notificationModel"
import mongoose from 'mongoose';
import { getUserData } from "../consumers/fetchSpecificUser";


interface AuthenticatedRequest extends Request {
    user?: {
      userId: string;
    };
  }

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);



export const sendNotification = async(req:AuthenticatedRequest, res:Response) => {
    
    const userId = req.user?.userId;


      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }


    const {
        title,
        message,
        type,
        status,
        targetType,
        targetAgeGroup,
        recipientId,
    } = req.body

    if(message){
      await publishToQueue("allUserDetailsNotification", userId);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const allUsers = Array.from(users.values());
    // console.log("allUsers:",allUsers)


    if(!title || !message || !type || !targetType){
        throw new CustomError("Missing required fields.", 400);
    }

//to all users 
    if(targetType === 'all'){
      const notification = await Notification.create({
        title,
        message,
        type,
        targetType
    });
          return res.status(200).json({ message: 'Notification sent to all users.', notification });
    }


//To all users bby catagory
if (targetType === 'age-group') {
  if (!targetAgeGroup) {
    throw new CustomError("targetGroup is required", 400);
  }

  let ageRange: [number, number];

  switch (targetAgeGroup) {
    case '5-8':
      ageRange = [5, 8];
      break;
    case '9-12':
      ageRange = [9, 12];
      break;
    case '13-18':
      ageRange = [13, 18];
      break;
    default:
      return res.status(400).json({ message: 'Invalid age group.' });
  }

  const filteredUsers = allUsers.filter((user) => {
    const userAge = user.age;
    return userAge >= ageRange[0] && userAge <= ageRange[1];
  });

  console.log("Filtered users for age group", targetAgeGroup, ":", filteredUsers);

  try {
    // Create only one notification for the age group
    const notification = await Notification.create({
      title,
      message,
      type,
      targetType,
    });

    return res.status(200).json({
      message: `Notification sent to age group ${targetAgeGroup}.`,
      notification,
    });
  } catch (error) {
    console.error("Error inserting notification:", error);
    throw new CustomError("Failed to save notification", 500);
  }
}



//TO send individually
    if (targetType === 'individual') {
        if (!recipientId || !isValidObjectId(recipientId)) {
            throw new CustomError("Valid recipientId is required.", 400);

        }
  
        const user = allUsers.find((u) => u._id.toString() === recipientId);
        if (!user) {
            throw new CustomError("User not found", 400);
        }
  
        const notification = await Notification.create({
          title,
          message,
          type,
          targetType,
          recipient: recipientId,
        });
        console.log(notification)
  
        return res.status(200).json({ message: 'Notification sent to user.', notification });
      }

    throw new CustomError("Invalid target type", 400);
}



export const getAllNotifications = async (req:AuthenticatedRequest, res:Response) => {
  
  const userId = req.user?.userId;

  if (!userId) {
    throw new CustomError("userId is not found", 400);
  }

  await publishToQueue("GetSpecificUser_Notification_service", userId);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const userData = await getUserData(userId) as { age: number }

  console.log("userData", userData)

  if (!userData) {
    throw new CustomError("userData is not found", 400);
  }

  const age = userData?.age

  const ageFitsGroup = (age: number, group: string): boolean => {
    const [min, max] = group.split("-").map(Number);
    return age >= min && age <= max;
  };

  const allNotifications = await Notification.find({
    $or: [
      { targetType: "all" },
      { targetType: "age-group" },
      { targetType: "individual", recipient: userId }
    ]
  });

  const filteredNotifications = allNotifications.filter((notification) => {
    if (notification.targetType === "all") return true;

    if (notification.targetType === "age-group" && notification.targetAgeGroup) {
      return ageFitsGroup(age, notification.targetAgeGroup);
    }

    if (notification.targetType === "individual") {
      return notification.recipient?.toString() === userId;
    }

    return false;
  });


  return res.status(200).json({
    message: "Notifications fetched successfully",
    data: filteredNotifications,
  });


}