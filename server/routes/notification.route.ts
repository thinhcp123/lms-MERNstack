import express from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getNotifications, updateNotificationStatus } from "../controllers/notification.controller";
const notificationRoute = express.Router();


notificationRoute.get("/get-allnotifications", isAuthenticated, authorizeRole("admin"), getNotifications);
notificationRoute.put("/update-notification/:id", isAuthenticated, authorizeRole("admin"), updateNotificationStatus);

export default notificationRoute;