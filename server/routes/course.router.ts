import express from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { addAnwser, addQuestion, addReplyToReview, addReview, deleteCourse, editCourse, getAllCourses, getCourseByUser, getSingleCourse, uploadCourse } from "../controllers/course.controller";

const courseRoute = express.Router();

courseRoute.post('/create-course', isAuthenticated, authorizeRole("admin"), uploadCourse);
courseRoute.put('/edit-course/:id', isAuthenticated, authorizeRole("admin"), editCourse);
courseRoute.get('/get-course/:id', getSingleCourse);
courseRoute.get('/get-courses', getAllCourses);
courseRoute.get('/get-course-content/:id', isAuthenticated, getCourseByUser);
courseRoute.put('/add-question', isAuthenticated, addQuestion);
courseRoute.put('/add-anwer', isAuthenticated, addAnwser);
courseRoute.put('/add-review/:id', isAuthenticated, addReview);
courseRoute.put('/add-reply/:id', isAuthenticated, addReplyToReview);
courseRoute.delete('/delete-courses/:id', isAuthenticated, authorizeRole("admin"), deleteCourse);

export default courseRoute; 