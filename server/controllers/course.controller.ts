import cloudinary from 'cloudinary';
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { ErrorHandler } from "../utils/ErrorHandler";
import { createCourse, getAllCourseService } from '../service/course.service';
import CourseModel from '../models/course.model';
import { redis } from '../utils/redis';
import mongoose from 'mongoose';
import path from 'path';
import ejs from 'ejs';
import sendMail from '../utils/sendMail';
import NotificationModel from '../models/notificationModel';


// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail) {
            const myCloudinary = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: 'course',
            });
            data.thumbnail = {
                publc_Id: myCloudinary.public_id,
                url: myCloudinary.secure_url,
            }
        }
        createCourse(data, res, next);

    } catch (error: any) {

    }
})


//edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;

        const thumnail = data.thumbnail;
        if (thumnail) {
            await cloudinary.v2.uploader.destroy(thumnail.public_id)
            const myCloudinary = await cloudinary.v2.uploader.upload(thumnail, {
                folder: 'course',
            });
            data.thumbnail = {
                publc_Id: myCloudinary.public_id,
                url: myCloudinary.secure_url,
            }
        }

        const courseId = req.params.id;
        const course = await CourseModel.findByIdAndUpdate(courseId, { $set: data }, { new: true });
        res.status(200).json({
            success: true,
            course,
            message: "Course updated successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


//get sigle course --- without purchasing
export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params.id;
        const isCacheExist = await redis.get(courseId);

        if (isCacheExist) {
            const course = JSON.parse(isCacheExist)
            res.status(200).json({
                success: true,
                course,
                message: "Course fetched successfully"
            });
        } else {
            const course = await CourseModel.findById(courseId).select("-courseData.videoUrl -courseData.suggestion --courseData.questions --courseData.links");

            await redis.set(courseId, JSON.stringify(course), "EX", 604776)
            res.status(200).json({
                success: true,
                course,
                message: "Course fetched successfully"
            });
        }


    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//get all cousre
export const getAllCourses = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const isCacheExist = await redis.get("allCourses");
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist)
            res.status(200).json({
                success: true,
                courses,
                message: "All courses fetched successfully"
            });
        } else {
            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion --courseData.questions --courseData.links");
            await redis.set("allCourses", JSON.stringify(courses));
            res.status(200).json({
                success: true,
                courses,
                message: "Courses fetched successfully"
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//get course content -- only for valid user
export const getCourseByUser = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourseList = req.user?.course;
            const courseId = req.params.id;

            const courseExists = userCourseList?.find((course: any) => {
                course._id.toString() === courseId
            });

            if (!courseExists) {
                return next(new ErrorHandler("You are not enrolled in this course", 400));
            }
            const course = await CourseModel.findById(courseId)

            const content = course?.courseData;

            res.status(200).json({
                success: true,
                content,
                message: "Course fetched successfully"
            });

        } catch (error: any) {

        }
    })


//add question is course
interface IAddQuestionData {
    question: string;
    courseId: string;
    contentId: string;
}


export const addQuestion = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { question, courseId, contentId }: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid contentId", 400));
        }
        const couseContext = course?.courseData?.find((item: any) => { item._id.equals(contentId) })

        if (!couseContext) {
            return next(new ErrorHandler("Invalid contentId", 400));
        }
        const newQuestion: any = {
            question,
            courseId,
            contentId
        }

        couseContext.questions.push(newQuestion);

        await NotificationModel.create({
            userId: req.user?._id,
            title: 'New Question',
            message: `You have a new Question for ${couseContext.title}`,
        })
        await course?.save();

        res.status(200).json({
            success: true,
            course,
            message: "Question added successfully"
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//add answer is course question
interface IAddAnserData {
    answer: string;
    questionId: string;
    contentId: string;
    courseId: string;
}

export const addAnwser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { answer, questionId, contentId, courseId }: IAddAnserData = req.body;
        const course = await CourseModel.findById(courseId);


        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid contentId", 400));
        }
        const couseContent = course?.courseData?.find((item: any) => { item._id.equals(contentId) })

        if (!couseContent) {
            return next(new ErrorHandler("Invalid contentId", 400));
        }

        const question = couseContent?.questions?.find((item: any) => { item._id.equals(questionId) })

        if (!question) {
            return next(new ErrorHandler("Invalid questionId", 400));
        }

        const newAnwser: any = {
            user: req.user,
            answer
        }
        question.questionReplies.push(newAnwser);

        await course?.save();

        if (req.user?.id === question.user._id) {
            //create a notification
        } else {
            const data = {
                name: question.user.name,
                title: couseContent.title
            }

            const html = await ejs.renderFile(path.join(__dirname, '../mails/question-reply.ejs'), data)

            try {
                await sendMail({
                    email: question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                })
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }

            res.status(200).json({
                success: true,
                course,
                message: "Anwser added successfully"
            });
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

//add review in course 
interface IAddReviewData {
    review: string,
    courseId: string,
    rating: number,
    userID: string
}

export const addReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.course
        const courseId = req.params.id;

        const courseExists = userCourseList?.some((course: any) => { course._id.toString() === courseId.toString() })

        if (!courseExists) {
            return next(new ErrorHandler("You are not enrolled in this course", 400));
        }
        const course = await CourseModel.findById(courseId)

        const { review, rating } = req.body as IAddReviewData;
        const reviewData: any = {
            user: req.user,
            comment: review,
            rating
        }

        course?.reviews.push(reviewData)

        let avg = 0;
        course?.reviews.forEach((item: any) => {
            avg += item.rating
        })
        if (course) {
            course.ratings = avg / course.reviews.length;
        }
        await course?.save();

        const notification = {
            title: "New Review Received",
            message: `${req.user?.name} has added a review to your course ${course?.name}`,
        }

        //create notification

        res.status(200).json({
            success: true,
            course,
            message: "Review added successfully"
        });
    } catch (error) {

    }
})

//add reply in review
interface IAddReviewData {
    comment: string,
    reviewId: string,
    courseId: string
}
export const addReplyToReview = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { comment, reviewId, courseId } = req.body as IAddReviewData;
        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Invalid courseId", 400));

        }
        const review = course?.reviews?.find((item: any) => { item._id.toString() === reviewId.toString() })
        if (!review) {
            return next(new ErrorHandler("Invalid reviewId", 400));
        }

        const replyData: any = {
            user: req.user,
            comment
        };

        if (!review.commenReplies) {
            review.commenReplies = [];
        }
        review.commenReplies?.push(replyData);

        await course?.save();
        res.status(200).json({
            success: true,
            course,
            message: "Reply added successfully"
        });
    } catch (e: any) {
        return next(new ErrorHandler(e.message, 500));
    }
})

//delete course --- only for admin
export const deleteCourse = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.findById(id);
        if (!course) {
            return next(new ErrorHandler("course not found", 400));
        }
        await course.deleteOne({ id });
        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "course deleted successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})