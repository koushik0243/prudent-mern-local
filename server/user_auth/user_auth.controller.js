import express from 'express';
import * as UserAuthHelper from './user_auth.service.js';

const Router = express.Router();

const createUser = async (req, res, next) => {
    try {
        const data = await UserAuthHelper.createUser(req.body);
        const return_data = {
            status: 200,
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const data = await UserAuthHelper.registerUser(req.body);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const sendOTPUser = async (req, res, next) => {
    try {
        const data = await UserAuthHelper.sendOTPUser(req.body);
        const return_data = {
            status: 200,
            message: "Successfully sent OTP.",
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const data = await UserAuthHelper.loginUser(req.body);
        const return_data = {
            status: 200,
            message: "Successfully logged in.",
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const gmLoginUser = async (req, res, next) => {
    try {
        const data = await UserAuthHelper.gmLoginUser(req.body);
        const return_data = {
            status: 200,
            message: "Successfully logged in.",
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

// Route definitions
Router.post('/create', createUser);
Router.post('/register', registerUser);
Router.post('/send-otp', sendOTPUser);
Router.post('/login', loginUser);
Router.post('/gmail-login', gmLoginUser);

// Export router in ESM format
export default Router;
