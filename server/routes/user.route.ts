import express from "express";
import { activateUser, loginUser, logoutUser, registrationUser } from "../controllers/user.controller";

const userRoute = express.Router();

userRoute.post('/registration', registrationUser);
userRoute.post('/activate-user', activateUser);
userRoute.post('/login-user', loginUser);
userRoute.post('/logout-user', logoutUser);

export default userRoute;