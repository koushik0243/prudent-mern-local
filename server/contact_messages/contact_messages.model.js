import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContactMessages = new Schema({
    contact_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
        default: null
    },
    stage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stages',
        default: null
    },
    msg_type: {
        type: String,
        enum: ['send_msg', 'log_note', 'schedule_activity'],
        default: null,
        required: true
    },
    message: {
        type: String,
        default: null
    },
    activity_type: {
        type: String,
        enum: ['call', 'meeting', 'email', 'task'],
        default: null,
        required: function () {
            return this.msg_type === 'schedule_activity';
        }
    },
    due_date: {
        type: String,
        default: null,
        required: function () {
            return this.msg_type === 'schedule_activity';
        }
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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

export default mongoose.model('contact_messages', ContactMessages);
