import ContactMail from './contact_mail.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const buildContactMailQuery = (filters = {}) => {
    const query = {};

    query.deletedAt = null;

    if (filters.userId && ObjectId.isValid(filters.userId)) {
        query.user_id = new ObjectId(filters.userId);
    }

    if (filters.status) {
        query.status = filters.status;
    }

    return query;
};

export const createContactMail = async (newContactMail) => {
    try {
        return await new ContactMail(newContactMail).save();
    } catch (error) {
        throw error;
    }
};

export const editContactMail = async (editId) => {
    try {
        return await ContactMail.findOne({ _id: editId, deletedAt: null });
    } catch (error) {
        throw error;
    }
};

export const updateContactMail = async (updateId, updateContactMailData) => {
    try {
        const { user_id, subject, message, status } = updateContactMailData;

        const updateFields = {
            subject,
            message,
            status
        };

        if (user_id && ObjectId.isValid(user_id)) {
            updateFields.user_id = new ObjectId(user_id);
        }

        return await ContactMail.findOneAndUpdate(
            { _id: updateId, deletedAt: null },
            {
                $set: updateFields
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listContactMail = async (filters = {}) => {
    try {
        const query = buildContactMailQuery(filters);
        return await ContactMail.find(query).sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

export const listContactMailPagination = async (page, limit, filters = {}) => {
    try {
        const query = buildContactMailQuery(filters);
        return await ContactMail.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getContactMailCount = async (filters = {}) => {
    try {
        const query = buildContactMailQuery(filters);
        return await ContactMail.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteContactMail = async (delId) => {
    try {
        return await ContactMail.findOneAndUpdate(
            { _id: delId, deletedAt: null },
            {
                $set: {
                    deletedAt: new Date(),
                    status: 'inactive'
                }
            },
            { new: false }
        );
    } catch (error) {
        throw error;
    }
};
