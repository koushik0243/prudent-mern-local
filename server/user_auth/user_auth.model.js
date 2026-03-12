import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const Users = new Schema(
    {
        name: {
            type: String,
        },
        contact_number: {
            type: String,
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        is_address_exist: {
            type: Boolean,
            default: false
        },
        profile: {
            type: String,
            trim: true,
        },
        gender: {
            type: String,
        },
        device_token: {
            type: String,
        },
        facebook_id: {
            type: String,
        },
        facebook_profile: {
            type: String,
        },
        googel_id: { // Consider fixing this typo to `google_id`
            type: String,
        },
        google_profile: {
            type: String,
        },
        social_account: {
            type: Boolean,
        },
        other_info: {
            type: String
        },
        is_admin: {
            type: Number,
            enum: [1, 2],
            default: 2,
            required: true,
            comment: '1 for admin and 2 for user'
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            required: true
        }
    },
    { timestamps: true }
);

// Password hash middleware
Users.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password verification method
Users.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', Users);
export default User;
