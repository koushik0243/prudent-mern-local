import mongoose from "mongoose";
const Schema = mongoose.Schema;

const NotificationMessage = new Schema({
    cm_id: {
        type: Schema.Types.ObjectId,
        ref: 'contact_messages',
        required: true
    },
    sender_name: {
        type: String,
        required: true
    },
    sender_email: {
        type: String,
        required: true
    },
    receiver_name: {
        type: String,
        required: true
    },
    receiver_email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    mail_body: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['failed', 'send'],
        default: 'failed',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('notification_messages', NotificationMessage);
