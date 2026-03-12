import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContactSendEmails = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    contact_id: {
        type: Schema.Types.ObjectId,
        ref: 'contacts',
        required: true
    },
    contact_name: {
        type: String,
        required: true
    },
    contact_email: {
        type: String,
        required: true
    },
    contact_phone: {
        type: String,
        required: true
    },
    mail_id: {
        type: Schema.Types.ObjectId,
        ref: 'contact_mails',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
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

export default mongoose.model('contact_send_mails', ContactSendEmails);