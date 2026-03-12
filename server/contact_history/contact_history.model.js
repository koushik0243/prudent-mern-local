import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ContactHistory = new Schema({
    contact_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    mname: {
        type: String,
        required: false
    },
    lname: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    alternate_phone: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        default: ""
    },
    address2: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    zipcode: {
        type: Number,
        default: ""
    },
    personal_website: {
        type: String,
        default: ""
    },
    org_name: {
        type: String,
        default: ""
    },
    org_address: {
        type: String,
        default: ""
    },
    org_phone: {
        type: String,
        default: ""
    },
    org_website: {
        type: String,
        default: ""
    },      
    lead_source: {
        type: String,
    },
    referral: {
        type: String,
    },
    timezone: {
        type: String,
    },
    currency: {
        type: String,
        default: ""
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
    },
    stage_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stages',
        default: null
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag_Manager'
    }],
    total_lead_score: {
        type: Number,
        default: 0
    },
    lead_category: {
        type: String,
        enum: ['hot', 'warm', 'cold'],
        default: 'hot',
        required: false
    },
    form_status: {
        type: String,
        enum: ['completed', 'not-completed'],
        default: 'completed',
        required: false
    },
    tries_count: {
        type: Number,
        default: 0
    },
    last_reminder_date: {
        type: Date,
        default: null
    },
    q1_label: {
        type: String,
        default: ""
    },
    q1_answer: {
        type: String,
        default: ""
    },
    q2_label: {
        type: String,
        default: ""
    },
    q2_answer: {
        type: String,
        default: ""
    },    
    q3_label: {
        type: String,
        default: ""
    },
    q3_answer: {
        type: String,
        default: ""
    },
    q4_label: {
        type: String,
        default: ""
    },
    q4_answer: {
        type: String,
        default: ""
    },
    q5_label: {
        type: String,
        default: ""
    },
    q5_answer: {
        type: String,
        default: ""
    },    
    q6_label: {
        type: String,
        default: ""
    },
    q6_answer: {
        type: String,
        default: ""
    },
    q7_label: {
        type: String,
        default: ""
    },
    q7_answer: {
        type: String,
        default: ""
    },
    q8_label: {
        type: String,
        default: ""
    },
    q8_answer: {
        type: String,
        default: ""
    },
    q9_label: {
        type: String,
        default: ""
    },
    q9_answer: {
        type: String,
        default: ""
    },
    q10_label: {
        type: String,
        default: ""
    },
    q10_answer: {
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

export default mongoose.model('contact_history', ContactHistory);
