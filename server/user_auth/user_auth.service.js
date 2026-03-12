import User from '../users/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import mongoose from 'mongoose';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

const { ObjectId } = mongoose.Types;

const createUser = async (newUser) => {
    try {
        return await new User(newUser).save();
    } catch (error) {
        throw error;
    }
};

const registerUser = async (newUser) => {
    try {
        newUser.password = generatePasswordHash(newUser.password);
        return await new User(newUser).save();
    } catch (error) {
        throw error;
    }
};

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.SENDMAIL_EMAIL_USER,
        pass: process.env.SENDMAIL_EMAIL_PASS,
    },
});

const sendOTPUser = async (newUser) => {
    try {
        const email = newUser.email;
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        let user = await User.findOne({ email });
        if (!user) user = new User({ email });

        user.otp = otp;
        user.otpExpires = otpExpires;
        const user_save = await user.save();

        const mail_send = await transporter.sendMail({
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
        });

        return {
            message: "OTP sent to email",
            send_status: mail_send,
            create_user: user_save,
        };
    } catch (error) {
        throw error;
    }
};

const loginUser = async (userData) => {
    try {
        const user = await User.findOne({ email: userData.email });
        if (user && user._id) {
            const matchPassword = await bcrypt.compare(userData.password, user.password);
            if (matchPassword) {
                const token = generateJwtToken(user);
                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    status: user.status,
                    secret: token,
                };
            } else {
                throw new Error("Password does not match");
            }
        } else {
            throw new Error("Email not exist");
        }
    } catch (error) {
        throw error;
    }
};

const gmLoginUser = async (userData) => {
    try {
        let user = await User.findOne({ email: userData.email });

        if (!user) {
            const newUser = new User({
                name: userData.name,
                email: userData.email,
                googel_id: userData.email, // typo: consider fixing to `google_id`
                status: 'active',
            });
            user = await newUser.save();
        }

        const token = generateJwtToken(user);

        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            status: user.status,
            secret: token,
        };
    } catch (error) {
        console.error("Error in gmLoginUser:", error);
        throw error;
    }
};

const generatePasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

const generateJwtToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE
        }
    );
};

export {
    createUser,
    registerUser,
    sendOTPUser,
    loginUser,
    gmLoginUser
};
