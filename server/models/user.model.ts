require('dotenv').config();
import mongoose, {Document, Model, Schema} from "mongoose";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegexPattern: RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    }
    role: string;
    isVerified: boolean;
    course: Array<{ courseId: string }>;
    comparePassword: (pw: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefeshToken: () => string;
}

const useSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value)
            },
            message: "please enter a valid email"
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    }, course: [{
        courseId: String,
    }]
}, {timestamps: true});
//Hash Password before saving
useSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
//sign access token
useSchema.methods.SignAccessToken = function () {
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || '')
}
//refresh token

// compare password
useSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("User", useSchema);
export default userModel;