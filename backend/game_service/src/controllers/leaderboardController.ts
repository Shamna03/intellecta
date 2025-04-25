import { Response } from "express";
import Leaderboard from "../models/leaderboardSchema";
import { AuthenticatedRequest, ILeaderboard } from "../types";
import axios from "axios";
import { generatePresignedUrl } from "../utils/generatePresignedURL";

interface User {
  _id: string;
  name: string;
  profilePic: string;
}

export const getLeaderboardByUserId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const userid = req.user?.userId;
  const userLeaderboard = await Leaderboard.findOne({ userId: userid });
  if (!userLeaderboard)
    return res
      .status(404)
      .json({ message: "No leaderboard found for this user" });
  return res.status(200).json({
    leaderboard: userLeaderboard,
    message: "leaderboard fetched successfully",
  });
};

export const checkAndEarnBadges = (leaderboard: ILeaderboard) => {
  const { totalScore, totalTimePlayed, gamesPlayed, badges } = leaderboard;
  const newBadges = [];
  if (gamesPlayed >= 1 && !badges?.includes("Beginner"))
    newBadges.push("Beginner");
  if (gamesPlayed >= 10 && !badges?.includes("Gamer")) newBadges.push("Gamer");
  if (totalTimePlayed >= 3600 && !badges?.includes("Marathoner"))
    newBadges.push("Marathoner");
  if (totalScore >= 100 && !badges?.includes("Pro Player"))
    newBadges.push("Pro Player");
  if (totalScore >= 500 && !badges?.includes("Legend"))
    newBadges.push("Legend");

  return [...badges, ...newBadges];
};

export const getLeaderboard = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  const leaderboardEntries = await Leaderboard.find()
    .limit(20)
    .sort({ totalScore: -1 });

  const userIds: string[] = leaderboardEntries.map((entry: any) =>
    entry.userId.toString()
  );

  const { data: usersData }: { data: User[] } = await axios.post(
    "http://user-service:5000/api/user/bulk",
    { userIds }
  );

  const leaderboardWithUsers = await Promise.all(
    leaderboardEntries.map(async (entry) => {
      const user = usersData.find((u) => u._id === entry.userId.toString());

      let profilePicUrl = null;
      if (user?.profilePic) {
        profilePicUrl = await generatePresignedUrl(user.profilePic);
      }

      return {
        ...entry.toObject(),
        user: user ? { name: user.name, profilePic: profilePicUrl } : null,
      };
    })
  );

  return res
    .status(200)
    .json({
      message: "Leaderboard fetched",
      leaderboard: leaderboardWithUsers,
    });
};
