import * as express from 'express';
import * as cookieParser from "cookie-parser";
import * as cors from "cors"
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

//test api
app.get("/test",  (req,res, next) => {
    res.status(200).json({
        success:true,
        message:"Api working",
    })
});

app.all("*",(req,res, next)=>{
    const err = new Error(`route ${req.originalUrl} not Found`);
    err.statusCode = 404;
    next(err);
})