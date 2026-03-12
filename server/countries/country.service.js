import Country from './country.model.js';

const parseCountryId = (value) => {
    const parsedId = Number(value);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return null;
    }
    return parsedId;
};

const getNextCountryId = async () => {
    const lastRecord = await Country.findOne().sort({ id: -1 }).select('id').lean();
    return lastRecord ? lastRecord.id + 1 : 1;
};

export const createCountry = async (newCountry) => {
    try {
        const nextId = await getNextCountryId();
        const payload = {
            id: nextId,
            name: newCountry?.name,
            iso3: newCountry?.iso3 || '',
            iso2: newCountry?.iso2 || '',
            phonecode: newCountry?.phonecode || ''
        };

        return await new Country(payload).save();
    } catch (error) {
        throw error;
    }
};

export const editCountry = async (editId) => {
    try {
        return await Country.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateCountry = async (updateId, updateCountry) => {
    try {
        const {
            name,
            iso3,
            iso2,
            phonecode
        } = updateCountry;

        const setPayload = {};

        if (name !== undefined) setPayload.name = name;
        if (iso3 !== undefined) setPayload.iso3 = iso3;
        if (iso2 !== undefined) setPayload.iso2 = iso2;
        if (phonecode !== undefined) setPayload.phonecode = phonecode;

        if (Object.keys(setPayload).length === 0) {
            return await Country.findById(updateId);
        }

        return await Country.findByIdAndUpdate(
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

export const listCountry = async () => {
    try {
        return await Country.find({}, '_id id name iso3 iso2 phonecode').sort({ name: 1 });
    } catch (error) {
        throw error;
    }
};

export const listCountryPagination = async (page, limit) => {
    try {
        return await Country.find({}, '_id id name iso3 iso2 phonecode')
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getCountryCount = async () => {
    try {
        return await Country.countDocuments();
    } catch (error) {
        throw error;
    }
};

export const deleteCountry = async (delId) => {
    try {
        const parsedId = parseCountryId(delId);
        if (!parsedId) {
            return null;
        }

        const deletedCountry = await Country.findOneAndDelete({ id: parsedId });
        if (!deletedCountry) {
            throw new Error('Country not found');
        }
        return deletedCountry;
    } catch (error) {
        throw error;
    }
};
