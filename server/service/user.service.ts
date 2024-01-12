import userModel from "../models/user.model";
import { NextFunction, Response } from "express";
import { redis } from "../utils/redis";

//get user by id
export const getUserById = async (id: string, res: NewType) => {
    const userJson = await redis.get(id);

    if (userJson) {
        const user = JSON.parse(userJson);
        return res.status(201).json({
            success: true,
            user
        });
    }
}

//get all users
export const getAllUserService = async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 });;
    return res.status(201).json({
        success: true,
        users
    });
}

//update user role

export const updateUserRoleService = async (res: Response, id: string, role: string) => {
    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
    return res.status(201).json({
        success: true,
        user
    });
}