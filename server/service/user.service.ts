import userModel from "../models/user.model";
import { Response } from "express";
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