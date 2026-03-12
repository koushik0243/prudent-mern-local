import City from './city.model.js';
import State from '../states/state.model.js';
import Country from '../countries/country.model.js';

const parseCityId = (value) => {
    const parsedId = Number(value);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return null;
    }
    return parsedId;
};

const parseStateId = (value) => {
    const parsedStateId = Number(value);
    if (!Number.isInteger(parsedStateId) || parsedStateId <= 0) {
        return null;
    }
    return parsedStateId;
};

const getNextCityId = async () => {
    const lastRecord = await City.findOne().sort({ id: -1 }).select('id').lean();
    return lastRecord ? lastRecord.id + 1 : 1;
};

const ensureStateExistsById = async (stateId) => {
    const state = await State.findOne({ id: stateId }).select('_id id').lean();
    return !!state;
};

export const createCity = async (newCity) => {
    try {
        if (!newCity?.name) {
            const error = new Error('name is required');
            error.statusCode = 400;
            throw error;
        }

        const parsedStateId = parseStateId(newCity?.state_id);
        if (!parsedStateId) {
            const error = new Error('state_id is required and must be an integer value');
            error.statusCode = 400;
            throw error;
        }

        const isStateExists = await ensureStateExistsById(parsedStateId);
        if (!isStateExists) {
            const error = new Error('state_id does not exist in states table');
            error.statusCode = 400;
            throw error;
        }

        const nextId = await getNextCityId();
        const payload = {
            id: nextId,
            name: newCity.name,
            state_id: parsedStateId
        };

        return await new City(payload).save();
    } catch (error) {
        throw error;
    }
};

export const editCity = async (editId) => {
    try {
        return await City.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateCity = async (updateId, updateCity) => {
    try {
        const {
            name,
            state_id
        } = updateCity;

        const setPayload = {};

        if (name !== undefined) setPayload.name = name;

        if (state_id !== undefined) {
            const parsedStateId = parseStateId(state_id);
            if (!parsedStateId) {
                const error = new Error('state_id must be an integer value');
                error.statusCode = 400;
                throw error;
            }

            const isStateExists = await ensureStateExistsById(parsedStateId);
            if (!isStateExists) {
                const error = new Error('state_id does not exist in states table');
                error.statusCode = 400;
                throw error;
            }

            setPayload.state_id = parsedStateId;
        }

        if (Object.keys(setPayload).length === 0) {
            return await City.findById(updateId);
        }

        return await City.findByIdAndUpdate(
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

export const listCity = async () => {
    try {
        return await City.aggregate([
            {
                $lookup: {
                    from: State.collection.name,
                    localField: 'state_id',
                    foreignField: 'id',
                    as: 'state'
                }
            },
            {
                $unwind: {
                    path: '$state',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: Country.collection.name,
                    localField: 'state.country_id',
                    foreignField: 'id',
                    as: 'country'
                }
            },
            {
                $unwind: {
                    path: '$country',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    name: 1,
                    state_id: 1,
                    state_name: '$state.name',
                    country_name: '$country.name',
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: {
                    name: 1
                }
            }
        ]);
    } catch (error) {
        throw error;
    }
};

export const listCityPagination = async (page, limit) => {
    try {
        return await City.aggregate([
            {
                $lookup: {
                    from: State.collection.name,
                    localField: 'state_id',
                    foreignField: 'id',
                    as: 'state'
                }
            },
            {
                $unwind: {
                    path: '$state',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: Country.collection.name,
                    localField: 'state.country_id',
                    foreignField: 'id',
                    as: 'country'
                }
            },
            {
                $unwind: {
                    path: '$country',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    id: 1,
                    name: 1,
                    state_id: 1,
                    state_name: '$state.name',
                    country_name: '$country.name',
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: {
                    name: 1
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: limit
            }
        ]);
    } catch (error) {
        throw error;
    }
};

export const getCityCount = async () => {
    try {
        return await City.countDocuments();
    } catch (error) {
        throw error;
    }
};

export const deleteCity = async (delId) => {
    try {
        const parsedId = parseCityId(delId);
        if (!parsedId) {
            return null;
        }

        const deletedCity = await City.findOneAndDelete({ id: parsedId });
        if (!deletedCity) {
            throw new Error('City not found');
        }
        return deletedCity;
    } catch (error) {
        throw error;
    }
};
