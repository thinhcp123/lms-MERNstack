import { NextFunction, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/orderModel.model";


//create new order 
export const newOrder = CatchAsyncError(async (res: Response, data: any, next: NextFunction) => {
    const order = await OrderModel.create(data);
    res.status(200).json({
        success: true,
        order,
    })
});

//get all users
export const getAllOrderService = async (res: Response) => {
    const order = await OrderModel.find().sort({ createdAt: -1 });;
    return res.status(201).json({
        success: true,
        order
    });
}