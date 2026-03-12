import User from './user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

export const createUser = async (newUser) => {
    try {
        const user = await new User(newUser).save();
        const token = generateJwtToken(user);
        return {
            secret: token,
        };

    } catch (error) {
        throw error;
    }
};

export const editUser = async (userId) => {
    try {
        const user = await User.findById(userId);
        return {
            _id: user._id,
            // Personal Information
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            alternate_phone: user.alternate_phone,
            dob: user.dob,
            gender: user.gender,
            bio: user.bio,
            // Work Information
            designation: user.designation,
            department: user.department,
            // Address Information
            address1: user.address1,
            address2: user.address2,
            city: user.city,
            state: user.state,
            country: user.country,
            zipcode: user.zipcode,
            // Social Links
            linkedin: user.linkedin,
            twitter: user.twitter,
            facebook: user.facebook,
            // Emergency Contact
            emergency_contact_name: user.emergency_contact_name,
            emergency_contact_phone: user.emergency_contact_phone,
            // Status
            status: user.status
        };
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (updateId, updateData) => {
    try {
        const updateFields = {
            // Personal Information
            full_name: updateData.full_name,
            email: updateData.email,
            phone: updateData.phone,
            alternate_phone: updateData.alternate_phone,
            dob: updateData.dob,
            gender: updateData.gender,
            bio: updateData.bio,
            // Work Information
            designation: updateData.designation,
            department: updateData.department,
            // Address Information
            address1: updateData.address1,
            address2: updateData.address2,
            city: updateData.city,
            state: updateData.state,
            country: updateData.country,
            zipcode: updateData.zipcode,
            // Social Links
            linkedin: updateData.linkedin,
            twitter: updateData.twitter,
            facebook: updateData.facebook,
            // Emergency Contact
            emergency_contact_name: updateData.emergency_contact_name,
            emergency_contact_phone: updateData.emergency_contact_phone,
            // OTP fields
            otp: updateData.otp,
            otpExpires: updateData.otpExpires,
            // Status
            status: updateData.status
        };

        // Include password if provided
        if (updateData.password) {
            updateFields.password = updateData.password;
        }

        return await User.findByIdAndUpdate(
            new ObjectId(updateId),
            { $set: updateFields },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listUser = async () => {
    try {
        const result = await User.find({ deletedAt: null }).sort({ createdAt: -1 });
        return result;
    } catch (error) {
        throw error;
    }
};

export const listUserPagination = async (page, limit) => {
    try {
        return await User.find({ is_admin: { $ne: 1 }, deletedAt: null }).skip((page - 1) * limit).limit(limit);
    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (delId) => {
    try {
        return await User.findByIdAndUpdate(
            delId,
            {
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: false }
        );
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (newUser) => {
    try {
        newUser.password = generatePasswordHash(newUser.password);
        return await new User(newUser).save();
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (userData) => {
    try {
        const user = await User.findOne({ email: userData.email, is_admin: 2 });
        if (user && user._id) {
            const matchPassword = await bcrypt.compare(userData.password, user.password);
            if (matchPassword) {
                const token = generateJwtToken(user);
                return {
                    _id: user._id,
                    full_name: user.full_name,
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

export const adminLoginUser = async (userData) => {
    try {
        const user = await User.findOne({ email: userData.email, is_admin: 1 });
        if (user && user._id) {
            const matchPassword = await bcrypt.compare(userData.password, user.password);
            if (matchPassword) {
                const token = generateJwtToken(user);
                return {
                    _id: user._id,
                    full_name: user.full_name,
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

export const gmLoginUser = async (userData) => {
    try {
        let user = await User.findOne({ email: userData.email });

        if (!user) {
            const newUser = new User({
                full_name: userData.full_name,
                email: userData.email,
                googel_id: userData.email,
                status: 'active',
            });
            user = await newUser.save();
        }

        const token = generateJwtToken(user);

        return {
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            status: user.status,
            secret: token,
        };
    } catch (error) {
        console.error("Error in gmLoginUser:", error);
        throw error;
    }
};

export const detailsUser = async (id_token, type) => {
    if (type === "id") {
        const user = await User.findById(id_token);
        return {
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            status: user.status
        };
    }

    if (type === "token") {
        const decoded = jwt.verify(id_token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        return {
            _id: user._id,
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            status: user.status
        };
    }
};

export const verifyUserOtp = async (newUser) => {
    try {
        const email = newUser.email;
        const otp = newUser.otp;
        const secret = newUser.jwtSecret;

        const user = await User.findOne({ email });
        if (user.otp !== otp) throw new Error("OTP does not match");
        if (user.otpExpires < Date.now()) throw new Error("OTP has expired");

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        user.status = 'active';

        await user.save();        

        const response = {
            status: "success",
            message: "User verified successfully",
            data: {
                _id: user._id,
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                status: user.status,
                secret: secret,
            }
        };

        return response;

    } catch (error) {
        throw error;
    }
};

const generatePasswordHash = (password) => {
    const TEN = 10;
    const salt = bcrypt.genSaltSync(TEN);
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
