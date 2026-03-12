import State from './state.model.js';
import Country from '../countries/country.model.js';

const parseStateId = (value) => {
    const parsedId = Number(value);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return null;
    }
    return parsedId;
};

const getNextStateId = async () => {
    const lastRecord = await State.findOne().sort({ id: -1 }).select('id').lean();
    return lastRecord ? lastRecord.id + 1 : 1;
};

const parseCountryId = (value) => {
    const parsedCountryId = Number(value);
    if (!Number.isInteger(parsedCountryId) || parsedCountryId <= 0) {
        return null;
    }
    return parsedCountryId;
};

const ensureCountryExistsById = async (countryId) => {
    const country = await Country.findOne({ id: countryId }).select('_id id').lean();
    return !!country;
};

export const createState = async (newState) => {
    try {
        if (!newState?.name) {
            const error = new Error('name is required');
            error.statusCode = 400;
            throw error;
        }

        const parsedCountryId = parseCountryId(newState?.country_id);
        if (!parsedCountryId) {
            const error = new Error('country_id is required and must be an integer value');
            error.statusCode = 400;
            throw error;
        }

        const isCountryExists = await ensureCountryExistsById(parsedCountryId);
        if (!isCountryExists) {
            const error = new Error('country_id does not exist in countries table');
            error.statusCode = 400;
            throw error;
        }

        const nextId = await getNextStateId();
        const payload = {
            id: nextId,
            name: newState?.name,
            country_id: parsedCountryId
        };

        return await new State(payload).save();
    } catch (error) {
        throw error;
    }
};

export const editState = async (editId) => {
    try {
        return await State.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateState = async (updateId, updateState) => {
    try {
        const {
            name,
            country_id
        } = updateState;

        const setPayload = {};

        if (name !== undefined) setPayload.name = name;
        if (country_id !== undefined) {
            const parsedCountryId = parseCountryId(country_id);
            if (!parsedCountryId) {
                const error = new Error('country_id must be an integer value');
                error.statusCode = 400;
                throw error;
            }

            const isCountryExists = await ensureCountryExistsById(parsedCountryId);
            if (!isCountryExists) {
                const error = new Error('country_id does not exist in countries table');
                error.statusCode = 400;
                throw error;
            }

            setPayload.country_id = parsedCountryId;
        }

        if (Object.keys(setPayload).length === 0) {
            return await State.findById(updateId);
        }

        return await State.findByIdAndUpdate(
            updateId,
            {
                $set: setPayload
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listState = async () => {
    try {
        return await State.find({}, '_id id name country_name createdAt updatedAt').sort({ name: 1 });
    } catch (error) {
        throw error;
    }
};

export const listStatePagination = async (page, limit) => {
    try {
        return await State.find({}, '_id id name country_name createdAt updatedAt')
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getStateCount = async () => {
    try {
        return await State.countDocuments();
    } catch (error) {
        throw error;
    }
};

export const deleteState = async (delId) => {
    try {
        const parsedId = parseStateId(delId);
        if (!parsedId) {
            return null;
        }

        const deletedState = await State.findOneAndDelete({ id: parsedId });
        if (!deletedState) {
            throw new Error('State not found');
        }
        return deletedState;
    } catch (error) {
        throw error;
    }
};
