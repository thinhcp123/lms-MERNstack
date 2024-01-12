import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import NotificationModel from "../models/notificationModel";
import cron from 'node-cron'
import { log } from "console";
//get all notifications --- only admin
export const getNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await NotificationModel.find({ createdAd: -1 });
        res.status(200).json({
            success: true,
            notifications,
            message: "Notifications fetched successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// update notificaiton status --- only admin

export const updateNotificationStatus = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404));
        } else {
            notification.status ? notification.status = 'read' : notification?.status
        }
        await notification.save();

        const notifications = await NotificationModel.find().sort({ createdAd: -1 });

        res.status(200).json({
            success: true,
            notifications,
            message: "Notification updated successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//delete notification --- only admin
cron.schedule("0 0 0 ***", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 1000)
    await NotificationModel.deleteMany({ status: "read", createdAd: { $lt: thirtyDaysAgo } })
})