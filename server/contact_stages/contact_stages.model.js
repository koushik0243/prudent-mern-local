import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContactStages = new Schema({
    contact_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
        default: null
    },
    old_stage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stages',
        default: null
    },
    new_stage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stages',
        default: null
    },
    old_stage_name: {
        type: String,
        default: ""
    },
    new_stage_name: {
        type: String,
        default: ""
    },
    user_name: {
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

export default mongoose.model('contact_stages', ContactStages);
