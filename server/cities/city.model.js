import mongoose from "mongoose";
const Schema = mongoose.Schema;

const City = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    state_id: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'state_id must be an integer value'
        }
    }
}, { timestamps: true });

export default mongoose.model('Cities', City);
