import ContactMessages from './contact_messages.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const createContactMessages = async (newContactMessages) => {
    try {
        return await new ContactMessages(newContactMessages).save();
    } catch (error) {
        throw error;
    }
};

export const editContactMessages = async (editId) => {
    try {
        return await ContactMessages.findById(editId)
            .populate('contact_id')
            .populate('stage_id')
            .populate('created_by');
    } catch (error) {
        throw error;
    }
};

export const updateContactMessages = async (updateId, updateContactMessages) => {
    try {
        const {
            contact_id,
            stage_id,
            msg_type,
            message,
            activity_type,
            due_date,
            created_by
        } = updateContactMessages;

        return await ContactMessages.findByIdAndUpdate(
            updateId,
            {
                $set: {
                    contact_id,
                    stage_id,
                    msg_type,
                    message,
                    activity_type,
                    due_date,
                    created_by
                }
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listContactMessages = async () => {
    try {
        return await ContactMessages.find({})
            .populate('contact_id')
            .populate('stage_id')
            .populate('created_by');
    } catch (error) {
        throw error;
    }
};

export const listContactMessagesByContactId = async (contactId) => {
    try {
        if (!ObjectId.isValid(contactId)) {
            return [];
        }

        return await ContactMessages.find({ contact_id: contactId })
            .populate('contact_id')
            .populate('stage_id')
            .populate('created_by')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

export const listContactMessagesPagination = async (page, limit) => {
    try {
        return await ContactMessages.find()
            .populate('contact_id')
            .populate('stage_id')
            .populate('created_by')
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const deleteContactMessages = async (delId) => {
    try {
        const deletedContactMessages = await ContactMessages.findByIdAndDelete(delId);
        if (!deletedContactMessages) {
            throw new Error('ContactMessages not found');
        }
        return deletedContactMessages;
    } catch (error) {
        throw error;
    }
};
