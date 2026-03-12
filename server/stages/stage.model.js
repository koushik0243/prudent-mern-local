import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Stage = new Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false
    },
    sort_order: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 99
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

export default mongoose.model('Stages', Stage);



