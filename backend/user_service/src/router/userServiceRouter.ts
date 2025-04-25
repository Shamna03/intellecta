import express from "express";
import {
  forgotPassword,
  refreshTokeToAccessToken,
  resetPassword,
  userChangePassword,
  userLogin,
  userLogout,
  userRegistration,
  googleAuth,
  adminLogin,
  adminLogout,
} from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";

import {
  deleteUser,
  getAllUsers,
  getBulkUsers,
  getUserById,
  profilePictureController,
  userEditController,
} from "../controllers/userController";

import { isAuthenticate } from "../middleware/isAuth";
import { upload } from "../middleware/profilePicUploader";

const userServiceRouter = express.Router();

userServiceRouter.post("/register", asyncHandler(userRegistration));
userServiceRouter.post("/login", asyncHandler(userLogin));
userServiceRouter.post("/logout", asyncHandler(userLogout));
userServiceRouter.post("/google-login", asyncHandler(googleAuth));
userServiceRouter.post("/admin-login", asyncHandler(adminLogin));
userServiceRouter.post("/admin-logout", asyncHandler(adminLogout));

userServiceRouter.patch(
  "/changepassword",
  isAuthenticate,
  asyncHandler(userChangePassword)
);
userServiceRouter.get(
  "/getuserbyid",
  isAuthenticate,
  asyncHandler(getUserById)
);

//forgot-password
userServiceRouter.post("/forgotpassword/:id", asyncHandler(forgotPassword));
userServiceRouter.post("/resetPassword", asyncHandler(resetPassword));

//profile-upload
userServiceRouter.post(
  "/upload-profile",
  isAuthenticate,
  upload.single("image"),
  asyncHandler(profilePictureController)
);

//edit user profile
userServiceRouter.patch(
  "/edit-profile",
  isAuthenticate,
  asyncHandler(userEditController)
);

//access token to refresh token
userServiceRouter.post(
  "/refreshaccesstoken",
  asyncHandler(refreshTokeToAccessToken)
);

//get users by bulk ids
userServiceRouter.post("/bulk", asyncHandler(getBulkUsers));

userServiceRouter.get("/allusers", isAuthenticate, asyncHandler(getAllUsers))

//soft deleting the user 
userServiceRouter.post("/delete-user",isAuthenticate, asyncHandler(deleteUser) )

export default userServiceRouter;
