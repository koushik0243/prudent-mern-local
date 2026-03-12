import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const Router = express.Router();
import * as UserHelper from './user.service.js';
import User from './user.model.js';
//import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const transporter = nodemailer.createTransport({
    service: process.env.PROVIDER_NAME,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD
    }
});

const createUser = async (req, res, next) => {
    try {
        //check the email exist or not
        const check_email = await User.findOne({ email: req.body.email });
        if (check_email) {
            return res.status(400).json({ status: 400, message: "Email already exist." });
        }

        const otp = Math.floor(1000 + Math.random() * 9999);
        // const otp = otpGenerator.generate(4, { digits: true });
        const payload = {
            // full_name: req.body.full_name,
            // email: req.body.email,
            // password: req.body.password,
            // phone: req.body.phone,
            // otp: otp,
            // otpExpires: new Date(Date.now() + 15 * 60 * 1000),
            // isVerified: false,
            // status: req.body.status,
            full_name: req.body.full_name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            alternate_phone: req.body.alternate_phone,
            dob: req.body.dob,
            gender: req.body.gender,
            bio: req.body.bio,
            is_admin: 1, // 1 for admin, 2 for general user
            // Work Information
            designation: req.body.designation,
            department: req.body.department,
            // Address Information
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zipcode: req.body.zipcode,
            // Social Links
            linkedin: req.body.linkedin,
            twitter: req.body.twitter,
            facebook: req.body.facebook,
            // Emergency Contact
            emergency_contact_name: req.body.emergency_contact_name,
            emergency_contact_phone: req.body.emergency_contact_phone,
            // Status
            status: req.body.status

        }
        const data = await UserHelper.createUser(payload);

        // const mailOptions = {
        //                         from: '"KIT" <koushik@thinksurfmedia.info>',  // Name + email address
        //                         to: req.body.email,
        //                         subject: 'Your OTP Code to Signup - KIT',
        //                         html: `<div class="container" style="max-width: 600px; margin: auto;">
        //                                     <div class="card" style="border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 2px solid #000; padding: 0px 20px 10px;  background-color: #f8f9fa;">
        //                                     <div class="card-body">

        //                                         <h2 class="text-center text-primary mb-4">OTP Verification</h2>
        //                                         <p class="text-center">Your One-Time Password (OTP) is:</p>        
        //                                         <h3 class="text-center" style="font-weight: bold; color: #d9534f;"> ${otp} </h3>        
        //                                         <p class="text-center">Please enter this OTP in the application to complete your verification.</p>

        //                                         <hr>
        //                                         <p class="text-center" style="font-size: 14px; color: #6c757d;">
        //                                         If you did not request this OTP, please ignore this email.
        //                                         </p>

        //                                         <hr>
        //                                         <div class="text-center mt-4">
        //                                         <p class="text-muted" style="font-size: 12px;">Powered by KIT</p>
        //                                         </div>
        //                                     </div>
        //                                     </div>
        //                                 </div>`  // Your HTML email content
        //                     };

        // await transporter.sendMail({
        //                                 ...mailOptions,  
        //                             });

        const return_data = {
            status: 200,
            message: "Successfully created.",
            data: data
        };

        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const detailsUser = async (req, res, next) => {
    try {
        const data = await UserHelper.detailsUser(req.params.id, req.params.type);
        res.status(200).json({ status: 200, message: "Successfully fetched.", data });
    } catch (error) {
        next(error);
    }
};

const editUser = async (req, res, next) => {
    try {
        const data = await UserHelper.editUser(req.params.id);
        res.status(200).json({ status: 200, message: "Successfully fetched.", data });
    } catch (error) {
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const data = await UserHelper.updateUser(req.params.id, req.body);
        res.status(200).json({ status: 200, message: "Successfully updated.", data });
    } catch (error) {
        next(error);
    }
};

const listUser = async (req, res, next) => {
    try {
        const data = await UserHelper.listUser();
        res.status(200).json({ status: 200, message: "Successfully fetched.", data });
    } catch (error) {
        next(error);
    }
};

const listUserPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const users = await UserHelper.listUserPagination(page, limit);
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            status: 200,
            message: "Successfully fetched.",
            data: users,
            total: totalUsers,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const data = await UserHelper.deleteUser(req.params.id);
        res.status(200).json({ status: 200, message: "Successfully deleted.", data });
    } catch (error) {
        next(error);
    }
};

const registerUser = async (req, res, next) => {
    try {
        const data = await UserHelper.registerUser(req.body);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const check_email = await User.findOne({ email: req.body.email, is_admin: req.body.is_admin });
        if (!check_email) {
            return res.status(400).json({ status: 400, message: "Email does not exist." });
        }

        const check_password = await User.findOne({ email: req.body.email, is_admin: req.body.is_admin });
        if (check_password) {
            const isMatch = await bcrypt.compare(req.body.password, check_password.password);
            if (!isMatch) {
                return res.status(400).json({ status: 400, message: "Password does not match." });
            }
        }

        const data = await UserHelper.loginUser(req.body);
        res.status(200).json({ status: 200, message: "Successfully logged in.", data });
    } catch (err) {
        next(err);
    }
};

const gmLoginUser = async (req, res, next) => {
    try {
        const data = await UserHelper.gmLoginUser(req.body);
        res.status(200).json({ status: 200, message: "Successfully logged in.", data });
    } catch (err) {
        next(err);
    }
};

const adminLoginUser = async (req, res, next) => {
    try {
        const check_email = await User.findOne({ email: req.body.email, is_admin: 1 });
        if (!check_email) {
            return res.status(400).json({ status: 400, message: "Email does not exist." });
        }

        const check_password = await User.findOne({ email: req.body.email, is_admin: req.body.is_admin });
        if (check_password) {
            const isMatch = await bcrypt.compare(req.body.password, check_password.password);
            if (!isMatch) {
                return res.status(400).json({ status: 400, message: "Password does not match." });
            }
        }
        
        const data = await UserHelper.adminLoginUser(req.body);
        res.status(200).json({ status: 200, message: "Successfully logged in.", data });
    } catch (err) {
        next(err);
    }
};

const adminLoginRequestOtp = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.body.email, is_admin: 1 });
        if (!userDetails) {
            return res.status(400).json({ status: 400, message: "Email does not exist." });
        }

        const isMatch = await bcrypt.compare(req.body.password, userDetails.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: "Password does not match." });
        }

        const otp = Math.floor(1000 + Math.random() * 9999).toString();
        const payload = {
            otp: otp,
            otpExpires: new Date(Date.now() + 15 * 60 * 1000),
        };
        await UserHelper.updateUser(userDetails._id, payload);

        await transporter.sendMail({
            to: userDetails.email,
            subject: "Your OTP Code to Login - KIT",
            html: `<div class="container" style="max-width: 600px; margin: auto;">
                        <div class="card" style="border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 2px solid #000; padding: 0px 20px 10px;  background-color: #f8f9fa;">
                        <div class="card-body">

                            <h2 class="text-center text-primary mb-4">OTP Verification</h2>
                            <p class="text-center">Your One-Time Password (OTP) is:</p>
                            <h3 class="text-center" style="font-weight: bold; color: #d9534f;"> ${otp} </h3>
                            <p class="text-center">Please enter this OTP to complete your login.</p>

                            <hr>
                            <p class="text-center" style="font-size: 14px; color: #6c757d;">
                            If you did not request this OTP, please ignore this email.
                            </p>

                            <hr>
                            <div class="text-center mt-4">
                            <p class="text-muted" style="font-size: 12px;">Powered by KIT</p>
                            </div>
                        </div>
                        </div>
                    </div>`,
        });

        const return_data = {
            status: 200,
            message: "Successfully sent OTP.",
            data: {
                otp: otp,
                mail: "send",
            }
        };

        res.status(200).json(return_data);
    } catch (err) {
        next(err);
    }
};

const adminLoginVerifyOtp = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.body.email, is_admin: 1 });
        if (!userDetails) {
            return res.status(400).json({ status: 400, message: "Email does not exist." });
        }

        if (!userDetails.otp || userDetails.otp !== String(req.body.otp)) {
            return res.status(400).json({ status: 400, message: "OTP does not match." });
        }

        if (!userDetails.otpExpires || userDetails.otpExpires < Date.now()) {
            return res.status(400).json({ status: 400, message: "OTP has expired." });
        }

        const payload = {
            otp: null,
            otpExpires: null,
        };
        await UserHelper.updateUser(userDetails._id, payload);

        const token = generateJwtToken(userDetails);
        return res.status(200).json({
            status: 200,
            message: "Successfully verified OTP.",
            data: {
                _id: userDetails._id,
                full_name: userDetails.full_name,
                email: userDetails.email,
                status: userDetails.status,
                secret: token,
            }
        });
    } catch (err) {
        next(err);
    }
};

const verifyUserOtp = async (req, res, next) => {
    try {
        const check_otp = await User.findOne({ email: req.body.email, otp: req.body.otp });
        if (!check_otp) {
            return res.status(400).json({ status: 400, message: "OTP does not match." });
        }

        const data = await UserHelper.verifyUserOtp(req.body);
        res.status(200).json(data);
    } catch (err) {
        next(err);
    }
};

const resendUserOtp = async (req, res, next) => {
    try {

        const user = await User.findOne({ email: req.body.email });
        const otp = Math.floor(1000 + Math.random() * 9999);
        const payload = {
            otp: otp,
            otpExpires: new Date(Date.now() + 15 * 60 * 1000),
        }
        await UserHelper.updateUser(user._id, payload);
        const token = generateJwtToken(user);

        await transporter.sendMail({
            to: req.body.email,
            subject: "Your OTP Code to Signup - KIT",
            html: `<div class="container" style="max-width: 600px; margin: auto;">
                        <div class="card" style="border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 2px solid #000; padding: 0px 20px 10px;  background-color: #f8f9fa;">
                        <div class="card-body">

                            <h2 class="text-center text-primary mb-4">OTP Verification</h2>
                            <p class="text-center">Your One-Time Password (OTP) is:</p>        
                            <h3 class="text-center" style="font-weight: bold; color: #d9534f;"> ${otp} </h3>        
                            <p class="text-center">Please enter this OTP in the application to complete your verification.</p>

                            <hr>
                            <p class="text-center" style="font-size: 14px; color: #6c757d;">
                            If you did not request this OTP, please ignore this email.
                            </p>

                            <hr>
                            <div class="text-center mt-4">
                            <p class="text-muted" style="font-size: 12px;">Powered by KIT</p>
                            </div>
                        </div>
                        </div>
                    </div>`,
        });

        const return_data = {
            status: 200,
            message: "Successfully sent OTP.",
            data: {
                secret: token
            }
        };

        res.status(200).json(return_data);
    } catch (err) {
        next(err);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.body.email, is_admin: req.body.is_admin });
        if (!userDetails) {
            return res.status(400).json({ status: 400, message: "Email does not exist." });
        }

        const full_name = userDetails.full_name;
        const email = userDetails.email;
        //const password = Math.floor(1000 + Math.random() * 9999);

        // 1. Generate random password
        const plainPassword = generateRandomPassword();

        // 2. Encrypt with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

        const payload = {
            password: hashedPassword,
        }
        await UserHelper.updateUser(userDetails._id, payload);
        
        await transporter.sendMail({
            to: email,
            subject: "Your password to Login - KIT",
            html: `<div class="container" style="max-width: 600px; margin: auto;">
                        <div class="card" style="border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 2px solid #000; padding: 0px 20px 10px;  background-color: #f8f9fa;">
                        <div class="card-body">

                            <h2 class="text-center text-primary mb-4">Your Password is:</h2>       
                            <h3 class="text-center" style="font-weight: bold; color: #d9534f;"> ${plainPassword} </h3>        
                            <p class="text-center">Please login using the password and change the password after login to your account.</p>

                            <hr>
                            <p class="text-center" style="font-size: 14px; color: #6c757d;">
                            If you already changed your password, please ignore this email.
                            </p>

                            <hr>
                            <div class="text-center mt-4">
                            <p class="text-muted" style="font-size: 12px;">Powered by KIT</p>
                            </div>
                        </div>
                        </div>
                    </div>`,
        });

        const return_data = {
            status: 200,
            message: "Successfully sent password.",
            data: {
                mail: "send",
            }
        };

        res.status(200).json(return_data);
    } catch (err) {
        next(err);
    }
};

const updateUserPassword = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ _id: req.params.id, is_admin: req.body.is_admin });
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const payload = {
            password: hashedPassword,
        }
        await UserHelper.updateUser(req.params.id, payload);
        res.status(200).json({ status: 200, message: "Successfully updated.", data: userDetails });
    } catch (error) {
        next(error);
    }
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

const generateRandomPassword = (length = 12) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Route bindings
Router.post('/create', createUser);
Router.get('/edit/:id', editUser);
Router.get('/details/:id/:type', detailsUser);
Router.put('/update/:id', updateUser);
Router.get('/list', listUser);
Router.get('/delete/:id', deleteUser);
Router.get('/list-pagination', listUserPagination);
Router.post('/register', registerUser);
Router.post('/login', loginUser);
Router.post('/gmail-login', gmLoginUser);

Router.post('/verify-user-otp', verifyUserOtp);
Router.post('/resend-user-otp', resendUserOtp);
Router.post('/forgot-password', forgotPassword);
Router.put('/change-password/:id', updateUserPassword);

Router.post('/admin/login/request-otp', adminLoginRequestOtp);
Router.post('/admin/login/verifyotp', adminLoginVerifyOtp);
Router.post('/admin/login', adminLoginUser);

// Export the router
export default Router;
