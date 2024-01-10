import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors"
import {NextFunction,Response,Request} from "express";
import {ErrorMiddleware} from "./middleware/error";
import userRouter from './routes/user.route'
require("dotenv").config();
export const app = express();

//body parser
app.use(express.json({limit:'50mb'}));


//cookie parser
app.use(cookieParser())

//cors
app.use(cors({
    origin:process.env.ORIGIN
}));

//routes
app.use('/api/v1',userRouter);

//test api
app.get("/test",  (req:Request,res:Response, next:NextFunction) => {
    res.status(200).json({
        success:true,
        message:"Api working",
    })
});

app.all("*",(req:Request,res:Response, next:NextFunction)=>{
    const err = new Error(`route ${req.originalUrl} not Found`)as any;
    err.statusCode = 404;
    next(err);
})

app.use(ErrorMiddleware);