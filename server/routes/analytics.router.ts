import express from "express";
import { getUsersAnalytics } from "../controllers/analytics.controller";
import { authorizeRole, isAuthenticated } from "../middleware/auth";

const analyticsRoute = express.Router();

analyticsRoute.get('/get-users-analytics', isAuthenticated, authorizeRole("admin"), getUsersAnalytics);
analyticsRoute.get('/get-orders-analytics', isAuthenticated, authorizeRole("admin"), getUsersAnalytics);
analyticsRoute.get('/get-courses-analytics', isAuthenticated, authorizeRole("admin"), getUsersAnalytics);

export default analyticsRoute;