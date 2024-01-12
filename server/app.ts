import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"
import { NextFunction, Response, Request } from "express";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from './routes/user.route'
import courseRoute from './routes/course.router';
import orderRouter from './routes/order.router';
import notificationRoute from './routes/notification.route';
import analyticsRouter from './routes/analytics.router';
import layoutRouter from './routes/layout.router';
require("dotenv").config();
export const app = express();

//body parser
app.use(express.json({ limit: '50mb' }));


//cookie parser
app.use(cookieParser())

//cors
app.use(cors({
    origin: process.env.ORIGIN
}));

//routes
app.use('/api/v1', userRouter, orderRouter, courseRoute, notificationRoute, analyticsRouter, layoutRouter);

//test api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "Api working",
    })
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`route ${req.originalUrl} not Found`) as any;
    err.statusCode = 404;
    next(err);
})

app.use(ErrorMiddleware);