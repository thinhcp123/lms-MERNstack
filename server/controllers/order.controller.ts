import { updateAccessToken } from './user.controller';
import { NextFunction, Request, Response } from 'express'
import { CatchAsyncError } from '../middleware/catchAsyncError'
import { ErrorHandler } from '../utils/ErrorHandler'
import OrderModel, { IOrder } from '../models/orderModel.model'
import userModel from '../models/user.model'
import CourseModel from '../models/course.model'
import path from 'path'
import ejs from 'ejs'
import sendMail from '../utils/sendMail'
import NotificationModel from '../models/notificationModel'
import { getAllOrderService, newOrder } from '../service/order.service';

//create order
export const createOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as IOrder;
        const user = await userModel.findById(req.user?._id);
        const courseExistInUser = user?.course.some((course: any) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler('You have already enrolled in this course', 400));

        }
        const course = await CourseModel.findById(courseId);

        if (!course) {
            return next(new ErrorHandler('Course not found', 400));
        }
        const data: any = {
            courseId: course._id,
            userId: user?._id,
            payment_info
        }


        const mailData = {
            order: {
                _id: course._id.toString().slice(0.6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            }
        }

        const html = await ejs.renderFile(path.join(__dirname, '../mails/order-confirm.ejs'), { order: mailData });

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: 'Order Confirmation',
                    template: 'order-confirm.ejs',
                    data: mailData
                })
            }
        } catch (e: any) {
            return next(new ErrorHandler(e.message, 400))
        }

        user?.course.push(course?._id);
        await user?.save();
        await NotificationModel.create({
            userId: user?._id,
            title: 'New Order',
            message: `You have a new order for ${course.name}`
        })

        course.purchased ? course.purchased += 1 : course.purchased
        await course.save()
        newOrder(data, res, next);


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

//get all course --- only for admin

export const getAllOrder = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        getAllOrderService(res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})