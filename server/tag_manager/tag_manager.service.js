import TagManager from './tag_manager.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const createTagManager = async (newTagManager) => {
    try {
        return await new TagManager(newTagManager).save();
    } catch (error) {
        throw error;
    }
};

export const editTagManager = async (editId) => {
    try {
        return await TagManager.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateTagManager = async (updateId, updateTagManager) => {
    try {
        const {
            full_name,
            desc,
            status
        } = updateTagManager;

        return await TagManager.findByIdAndUpdate(
            updateId,
            {
                $set: {
                    full_name,
                    desc,
                    status
                }
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listTagManager = async () => {
    try {
        return await TagManager.find({});
    } catch (error) {
        throw error;
    }
};

export const listTagManagerPagination = async (page, limit) => {
    try {
        return await TagManager.find()
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const deleteTagManager = async (delId) => {
    try {
        const deletedTagManager = await TagManager.findByIdAndDelete(delId);
        if (!deletedTagManager) {
            throw new Error('TagManager not found');
        }
        return deletedTagManager;
    } catch (error) {
        throw error;
    }
};
