require('dotenv').config();
import { Response } from 'express';
import userModel, { IUser } from '../models/user.model';
import { redis } from "./redis";


interface ITokenOptions {
    expires: string;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none' | undefined;
    secure?: boolean;
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefeshToken();

    //upload session to redis
    redis.set(user._id, JSON.stringify(user) as any)

    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRATION || '300', 10)
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRATION || '1200', 10)

    const accessTokenOptions: any = {
        expires: new Date(Date.now() + accessTokenExpire * 1000).toUTCString(),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }

    const refreshTokenOptions: any = {
        expires: new Date(Date.now() + refreshTokenExpire * 1000).toUTCString(),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    }
    //only set secure to true in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }
    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', refreshToken, refreshTokenOptions)
    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    })
}