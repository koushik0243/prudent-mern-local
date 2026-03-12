import ContactStages from './contact_stages.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const createContactStages = async (newContactStages) => {
    try {
        return await new ContactStages(newContactStages).save();
    } catch (error) {
        throw error;
    }
};

export const editContactStages = async (editId) => {
    try {
        return await ContactStages.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateContactStages = async (updateId, updateContactStages) => {
    try {
        const {
            contact_id,
            old_stage_id,
            new_stage_id,
            old_stage_name,
            new_stage_name,
            user_name
        } = updateContactStages;

        return await ContactStages.findByIdAndUpdate(
            updateId,
            {
                $set: {
                    contact_id,
                    old_stage_id,
                    new_stage_id,
                    old_stage_name,
                    new_stage_name,
                    user_name
                }
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listContactStages = async (contactId) => {
    try {
        return await ContactStages.find({ contact_id: contactId })
            .populate('contact_id')
            .populate('old_stage_id')
            .populate('new_stage_id');
    } catch (error) {
        throw error;
    }
};

export const listContactStagesPagination = async (page, limit) => {
    try {
        return await ContactStages.find()
            .populate('contact_id')
            .populate('old_stage_id')
            .populate('new_stage_id')
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const deleteContactStages = async (delId) => {
    try {
        const deletedContactStages = await ContactStages.findByIdAndDelete(delId);
        if (!deletedContactStages) {
            throw new Error('ContactStages not found');
        }
        return deletedContactStages;
    } catch (error) {
        throw error;
    }
};
