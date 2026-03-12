import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Country = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    iso3: {
        type: String,
        required: false,
        default: ""
    },
    iso2: {
        type: String,
        required: false,
        default: ""
    },
    phonecode: {
        type: String,
        required: false,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model('Countries', Country);
