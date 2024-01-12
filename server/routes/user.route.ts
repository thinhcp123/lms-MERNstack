import express from "express";
import { activateUser, deleteUser, getAllUsers, getUserInfo, loginUser, logoutUser, registrationUser, socialAuth, updateAccessToken, updateProfilePicture, updateUserInfo, updateUserRole } from "../controllers/user.controller";
import { authorizeRole, isAuthenticated } from "../middleware/auth";

const userRoute = express.Router();

userRoute.post('/registration', registrationUser);
userRoute.post('/activate-user', activateUser);
userRoute.post('/login', loginUser);
userRoute.get('/logout', isAuthenticated, logoutUser);
userRoute.get('/refresh', updateAccessToken);
userRoute.get('/me', isAuthenticated, getUserInfo);
userRoute.get('/get-users', isAuthenticated, authorizeRole("admin"), getAllUsers);
userRoute.put('/social-auth', socialAuth);
userRoute.put('/update-user-info', isAuthenticated, updateUserInfo);
userRoute.put('/update-user-password', isAuthenticated, updateUserInfo);
userRoute.put('/update-user-avatar', isAuthenticated, updateProfilePicture);
userRoute.put('/update-users', isAuthenticated, authorizeRole("admin"), updateUserRole);
userRoute.delete('/delete-users/:id', isAuthenticated, authorizeRole("admin"), deleteUser);
export default userRoute;