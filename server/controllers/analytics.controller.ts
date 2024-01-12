import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import userModel from "../models/user.model";
import { generateLast12MothsData } from "../utils/analytics.generator";
import CourseModel from "../models/course.model";
import OrderModel from "../models/orderModel.model";

//get users analytics
export const getUsersAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await generateLast12MothsData(userModel);
        res.status(201).json({
            success: true,
            data: user
        })
    } catch (error: any) {
        next(new ErrorHandler(error.message, 500));
    }
})

//get users analytics
export const getCourseAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await generateLast12MothsData(CourseModel);
        res.status(201).json({
            success: true,
            data: course
        })
    } catch (error: any) {
        next(new ErrorHandler(error.message, 500));
    }
})

//get order analytics
export const getOrderAnalytics = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await generateLast12MothsData(OrderModel);
        res.status(201).json({
            success: true,
            data: orders
        })
    } catch (error: any) {
        next(new ErrorHandler(error.message, 500));
    }
})