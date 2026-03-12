import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContactEmails = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    subject: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

export default mongoose.model('contact_emails', ContactEmails);