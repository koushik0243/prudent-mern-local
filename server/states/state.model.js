import mongoose from "mongoose";
const Schema = mongoose.Schema;

const State = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    country_id: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'country_id must be an integer value'
        }
    }
}, { timestamps: true });

export default mongoose.model('States', State);
