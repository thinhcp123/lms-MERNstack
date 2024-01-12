import express from "express";
import { activateUser, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updateProfilePicture, updateUserInfo } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRoute = express.Router();

userRoute.post('/registration', registrationUser);
userRoute.post('/activate-user', activateUser);
userRoute.post('/login', loginUser);
userRoute.get('/logout', isAuthenticated, logoutUser);
userRoute.get('/refresh', updateAccessToken);
userRoute.get('/me', isAuthenticated, getUserInfo);
userRoute.put('/social-auth', socialAuth);
userRoute.put('/update-user-info', isAuthenticated, updateUserInfo);
userRoute.put('/update-user-password', isAuthenticated, updateUserInfo);
userRoute.put('/update-user-avatar', isAuthenticated, updateProfilePicture);
export default userRoute;