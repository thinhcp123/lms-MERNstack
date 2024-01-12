import { NextFunction, Response } from "express";
import CourseModel from "../models/course.model";
import { CatchAsyncError } from "../middleware/catchAsyncError";

//create a course
export const createCourse = CatchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    const course = await CourseModel.create(data);
    res.status(201).json({
        success: true,
        data: course,
        message: "Course created successfully"
    });
})

//get all course
export const getAllCourseService = async (res: Response) => {
    const course = await CourseModel.find().sort({ createdAt: -1 });;
    return res.status(201).json({
        success: true,
        course
    });
}