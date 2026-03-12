import Stage from './stage.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const createStage = async (newStage) => {
    try {
        return await new Stage(newStage).save();
    } catch (error) {
        throw error;
    }
};

export const editStage = async (editId) => {
    try {
        return await Stage.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateStage = async (updateId, updateStage) => {
    try {
        const {
            name,
            desc,
            sort_order
        } = updateStage;

        return await Stage.findByIdAndUpdate(
            updateId,
            {
                $set: {
                    name,
                    desc,
                    sort_order
                }
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listStage = async () => {
    try {
        return await Stage.find({
            deleted_at: null
        }).sort({ sort_order: 1 });
    } catch (error) {
        throw error;
    }
};

export const listStagePagination = async (page, limit) => {
    try {
        return await Stage.find()
            .sort({ sort_order: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const deleteStage = async (delId) => {
    try {
        const deletedStage = await Stage.findByIdAndDelete(delId);
        if (!deletedStage) {
            throw new Error('Stage not found');
        }
        return deletedStage;
    } catch (error) {
        throw error;
    }
};
