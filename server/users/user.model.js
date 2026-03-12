import mongoose from "mongoose";
const Schema = mongoose.Schema;
import bcrypt from 'bcryptjs';

const Users = new Schema(
    {
        // Personal Information
        // name: {
        //     type: String,
        // },
        full_name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: false
        },
        alternate_phone: {
            type: String,
            required: false
        },
        dob: {
            type: Date,
            required: false
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'male',
            required: false
        },
        bio: {
            type: String,
            required: false
        },
        password: {
            type: String,
            required: true
        },
        // Work Information
        designation: {
            type: String,
            required: false
        },
        department: {
            type: String,
            required: false
        },
        // Address Information
        address1: {
            type: String,
            required: false
        },
        address2: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        country: {
            type: String,
            required: false
        },
        zipcode: {
            type: String,
            required: false
        },
        // Social Links
        linkedin: {
            type: String,
            required: false
        },
        twitter: {
            type: String,
            required: false
        },
        facebook: {
            type: String,
            required: false
        },
        // Emergency Contact
        emergency_contact_name: {
            type: String,
            required: false
        },
        emergency_contact_phone: {
            type: String,
            required: false
        },
        // Other fields        
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
        deletedAt: {
            type: Date,
            default: null
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
Users.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password verification method
Users.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

Users.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

export default mongoose.model('User', Users);

