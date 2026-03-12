import ContactHistory from './contact_history.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const buildContactHistoryQuery = (filters = {}) => {
    const query = {};

    if (filters.leadCategory) {
        query.lead_category = filters.leadCategory;
    }

    if (filters.formStatus) {
        query.form_status = filters.formStatus;
    }

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.stageId && ObjectId.isValid(filters.stageId)) {
        query.stage_id = new ObjectId(filters.stageId);
    }

    if (filters.contactId && ObjectId.isValid(filters.contactId)) {
        query.contact_id = new ObjectId(filters.contactId);
    }

    return query;
};

export const createContactHistory = async (newContactHistory) => {
    try {
        return await new ContactHistory(newContactHistory).save();
    } catch (error) {
        throw error;
    }
};

export const editContactHistory = async (editId) => {
    try {
        return await ContactHistory.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateContactHistory = async (updateId, updateContactHistory) => {
    try {
        const {
            contact_id,
            fname,
            mname,
            lname,
            phone,
            alternate_phone,
            email,
            address1,
            address2,
            city,
            state,
            country,
            zipcode,
            personal_website,
            org_name,
            org_address,
            org_phone,
            org_website,
            lead_source,
            referral,
            timezone,
            currency,
            priority,
            total_lead_score,
            lead_category,
            form_status,
            tries_count,
            last_reminder_date,
            q1_label,
            q1_answer,
            q2_label,
            q2_answer,
            q3_label,
            q3_answer,
            q4_label,
            q4_answer,
            q5_label,
            q5_answer,
            q6_label,
            q6_answer,
            q7_label,
            q7_answer,
            q8_label,
            q8_answer,
            q9_label,
            q9_answer,
            q10_label,
            q10_answer,
            status,
            stage_id,
            tags
        } = updateContactHistory;

        return await ContactHistory.findByIdAndUpdate(
            updateId,
            {
                $set: {
                    contact_id,
                    fname,
                    mname,
                    lname,
                    phone,
                    alternate_phone,
                    email,
                    address1,
                    address2,
                    city,
                    state,
                    country,
                    zipcode,
                    personal_website,
                    org_name,
                    org_address,
                    org_phone,
                    org_website,
                    lead_source,
                    referral,
                    timezone,
                    currency,
                    priority,
                    total_lead_score,
                    lead_category,
                    form_status,
                    tries_count,
                    last_reminder_date,
                    q1_label,
                    q1_answer,
                    q2_label,
                    q2_answer,
                    q3_label,
                    q3_answer,
                    q4_label,
                    q4_answer,
                    q5_label,
                    q5_answer,
                    q6_label,
                    q6_answer,
                    q7_label,
                    q7_answer,
                    q8_label,
                    q8_answer,
                    q9_label,
                    q9_answer,
                    q10_label,
                    q10_answer,
                    status,
                    stage_id,
                    tags
                }
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listContactHistory = async (filters = {}) => {
    try {
        const query = buildContactHistoryQuery(filters);
        return await ContactHistory.find(query);
    } catch (error) {
        throw error;
    }
};

export const listContactHistoryPagination = async (page, limit, filters = {}) => {
    try {
        const query = buildContactHistoryQuery(filters);
        return await ContactHistory.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getContactHistoryCount = async (filters = {}) => {
    try {
        const query = buildContactHistoryQuery(filters);
        return await ContactHistory.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteContactHistory = async (delId) => {
    try {
        const deletedContactHistory = await ContactHistory.findByIdAndDelete(delId);
        if (!deletedContactHistory) {
            throw new Error('Contact history not found');
        }
        return deletedContactHistory;
    } catch (error) {
        throw error;
    }
};
