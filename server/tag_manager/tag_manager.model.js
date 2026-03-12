import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Tag_Manager = new Schema({
    full_name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false,
        default: null
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
}, { timestamps: true });

export default mongoose.model('Tag_Manager', Tag_Manager);
