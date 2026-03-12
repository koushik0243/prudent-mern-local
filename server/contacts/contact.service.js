import Contact from './contact.model.js';
import mongoose from 'mongoose';
import Stage from '../stages/stage.model.js';
import ContactMessages from '../contact_messages/contact_messages.model.js';

const { ObjectId } = mongoose.Types;

const buildContactQuery = (filters = {}) => {
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

    if (filters.contactCreated) {
        query.contact_created = filters.contactCreated;
    }

    if (filters.stageId && ObjectId.isValid(filters.stageId)) {
        query.stage_id = new ObjectId(filters.stageId);
    }

    return query;
};

const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseCsvContent = (csvContent = '') => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvContent.length; i += 1) {
        const char = csvContent[i];
        const nextChar = csvContent[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
            continue;
        }

        if (char === '\n' && !inQuotes) {
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
            continue;
        }

        if (char !== '\r') {
            currentField += char;
        }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows;
};

const normalizeString = (value) => {
    if (value === undefined || value === null) {
        return undefined;
    }

    const trimmed = String(value).trim();
    return trimmed === '' ? undefined : trimmed;
};

const normalizeNumber = (value) => {
    const normalized = normalizeString(value);
    if (!normalized) {
        return undefined;
    }

    const numberValue = Number(normalized);
    return Number.isNaN(numberValue) ? undefined : numberValue;
};

const normalizeDate = (value) => {
    const normalized = normalizeString(value);
    if (!normalized) {
        return undefined;
    }

    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const normalizeContactLocationFields = (payload = {}) => {
    const normalizedPayload = { ...payload };

    if (Object.prototype.hasOwnProperty.call(payload, 'city')) {
        const city = normalizeString(payload.city);
        normalizedPayload.city = city === undefined ? '' : city;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'state')) {
        const state = normalizeNumber(payload.state);
        normalizedPayload.state = state === undefined ? 0 : state;
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'country')) {
        const country = normalizeNumber(payload.country);
        normalizedPayload.country = country === undefined ? 0 : country;
    }

    return normalizedPayload;
};

const mapCsvRowToContact = (row = {}, defaultStageId = null, contactCreated = 'imported') => {
    const contact = {
        fname: normalizeString(row.fname),
        mname: normalizeString(row.mname),
        lname: normalizeString(row.lname),
        phone: normalizeString(row.phone),
        alternate_phone: normalizeString(row.alternate_phone),
        email: normalizeString(row.email),
        address1: normalizeString(row.address1),
        address2: normalizeString(row.address2),
        zipcode: normalizeNumber(row.zipcode),
        personal_website: normalizeString(row.personal_website),
        org_name: normalizeString(row.org_name),
        org_address: normalizeString(row.org_address),
        org_phone: normalizeString(row.org_phone),
        org_website: normalizeString(row.org_website),
        total_lead_score: normalizeNumber(row.total_lead_score),
        lead_category: normalizeString(row.lead_category),
        form_status: normalizeString(row.form_status),
        tries_count: normalizeNumber(row.tries_count),
        last_reminder_date: normalizeDate(row.last_reminder_date),
        q1_label: normalizeString(row.q1_label),
        q1_answer: normalizeString(row.q1_answer),
        q2_label: normalizeString(row.q2_label),
        q2_answer: normalizeString(row.q2_answer),
        q3_label: normalizeString(row.q3_label),
        q3_answer: normalizeString(row.q3_answer),
        q4_label: normalizeString(row.q4_label),
        q4_answer: normalizeString(row.q4_answer),
        q5_label: normalizeString(row.q5_label),
        q5_answer: normalizeString(row.q5_answer),
        q6_label: normalizeString(row.q6_label),
        q6_answer: normalizeString(row.q6_answer),
        q7_label: normalizeString(row.q7_label),
        q7_answer: normalizeString(row.q7_answer),
        q8_label: normalizeString(row.q8_label),
        q8_answer: normalizeString(row.q8_answer),
        q9_label: normalizeString(row.q9_label),
        q9_answer: normalizeString(row.q9_answer),
        q10_label: normalizeString(row.q10_label),
        q10_answer: normalizeString(row.q10_answer),
        lead_source: normalizeString(row.lead_source),
        referral: normalizeString(row.referral),
        timezone: normalizeString(row.timezone),
        currency: normalizeString(row.currency),
        priority: normalizeString(row.priority),
        contact_created: contactCreated,
        city: normalizeString(row.city),
        state: normalizeNumber(row.state),
        country: normalizeNumber(row.country),
        stage_id: defaultStageId,
        tags: []
    };

    Object.keys(contact).forEach((key) => {
        if (contact[key] === undefined) {
            delete contact[key];
        }
    });

    return contact;
};

export const importContactsFromCsv = async (csvContent, options = {}) => {
    try {
        const contactCreated = options.contactCreated || 'imported';
        const defaultStage = await Stage.findOne({ sort_order: 1 }).select('_id').lean();
        const defaultStageId = defaultStage?._id || null;

        const parsedRows = parseCsvContent(csvContent || '');

        if (!parsedRows.length) {
            const error = new Error('CSV is empty.');
            error.statusCode = 400;
            throw error;
        }

        const headers = parsedRows[0].map((header) => String(header || '').trim());
        if (!headers.length || !headers[0]) {
            const error = new Error('CSV header row is invalid.');
            error.statusCode = 400;
            throw error;
        }

        headers[0] = headers[0].replace(/^\uFEFF/, '');

        const requiredHeaders = ['fname', 'lname', 'phone', 'email'];
        const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

        if (missingHeaders.length) {
            const error = new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
            error.statusCode = 400;
            throw error;
        }

        const dataRows = parsedRows.slice(1).filter((row) => row.some((cell) => String(cell || '').trim() !== ''));
        const validatedContacts = [];
        const failedRows = [];

        for (let index = 0; index < dataRows.length; index += 1) {
            const row = dataRows[index];
            const rowObject = {};

            headers.forEach((header, headerIndex) => {
                rowObject[header] = row[headerIndex];
            });

            const contact = mapCsvRowToContact(rowObject, defaultStageId, contactCreated);
            const rowNumber = index + 2;

            try {
                await new Contact(contact).validate();
                validatedContacts.push({
                    rowNumber,
                    contact
                });
            } catch (validationError) {
                failedRows.push({
                    row: rowNumber,
                    message: validationError.message
                });
            }
        }

        const phoneNumbers = [...new Set(
            validatedContacts
                .map(({ contact }) => contact.phone)
                .filter(Boolean)
        )];

        const existingContacts = phoneNumbers.length
            ? await Contact.find({ phone: { $in: phoneNumbers } })
                .select('phone email')
                .lean()
            : [];

        const existingPairSet = new Set(
            existingContacts
                .filter((item) => item.phone && item.email)
                .map((item) => `${String(item.phone).trim()}::${String(item.email).trim().toLowerCase()}`)
        );

        const contactsToInsert = [];

        for (const { rowNumber, contact } of validatedContacts) {
            const pairKey = `${String(contact.phone).trim()}::${String(contact.email).trim().toLowerCase()}`;

            if (existingPairSet.has(pairKey)) {
                failedRows.push({
                    row: rowNumber,
                    message: 'Contact with same phone and email already exists.'
                });
                continue;
            }

            contactsToInsert.push(contact);
            existingPairSet.add(pairKey);
        }

        let insertedCount = 0;
        if (contactsToInsert.length > 0) {
            const inserted = await Contact.insertMany(contactsToInsert, { ordered: false });
            insertedCount = inserted.length;
        }

        return {
            totalRows: dataRows.length,
            importedCount: insertedCount,
            failedCount: failedRows.length,
            failedRows
        };
    } catch (error) {
        throw error;
    }
};

export const createContact = async (newContact) => {
    try {
        const normalizedContact = normalizeContactLocationFields(newContact);
        return await new Contact(normalizedContact).save();
    } catch (error) {
        throw error;
    }
};

export const editContact = async (editId) => {
    try {
        return await Contact.findById(editId);
    } catch (error) {
        throw error;
    }
};

export const updateContact = async (updateId, updateContact) => {
    try {
        const normalizedContact = normalizeContactLocationFields(updateContact);
        const {
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
            contact_created,
            status,
            stage_id,
            tags
        } = normalizedContact;

        return await Contact.findByIdAndUpdate(
            updateId,
            {
                $set: {
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
                    contact_created,
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

export const listContact = async (filters = {}) => {
    try {
        const query = buildContactQuery(filters);
        return await Contact.find(query);
    } catch (error) {
        throw error;
    }
};

export const listContactPagination = async (page, limit, filters = {}) => {
    try {
        const query = buildContactQuery(filters);
        return await Contact.find(query)
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getContactCount = async (filters = {}) => {
    try {
        const query = buildContactQuery(filters);
        return await Contact.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteContact = async (delId) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(delId);
        if (!deletedContact) {
            throw new Error('Contact not found');
        }

        await ContactMessages.deleteMany({ contact_id: deletedContact._id });

        return deletedContact;
    } catch (error) {
        throw error;
    }
};

export const checkDuplicateContact = async ({ phone, email, excludeId } = {}) => {
    try {
        const normalizedPhone = phone?.toString().trim();
        const normalizedEmail = email?.toString().trim();

        if (!normalizedPhone && !normalizedEmail) {
            const error = new Error('Either phone or email is required for duplicate check.');
            error.statusCode = 400;
            throw error;
        }

        const duplicateQuery = {
            $or: []
        };

        if (normalizedPhone) {
            duplicateQuery.$or.push({ phone: normalizedPhone });
        }

        if (normalizedEmail) {
            duplicateQuery.$or.push({
                email: {
                    $regex: `^${escapeRegex(normalizedEmail)}$`,
                    $options: 'i'
                }
            });
        }

        if (excludeId && ObjectId.isValid(excludeId)) {
            duplicateQuery._id = { $ne: new ObjectId(excludeId) };
        }

        const duplicates = await Contact.find(duplicateQuery)
            .select('_id fname lname phone email')
            .lean();

        const phoneExists = normalizedPhone
            ? duplicates.some((item) => (item.phone || '').trim() === normalizedPhone)
            : false;

        const emailExists = normalizedEmail
            ? duplicates.some((item) => (item.email || '').trim().toLowerCase() === normalizedEmail.toLowerCase())
            : false;

        return {
            phoneExists,
            emailExists,
            isDuplicate: phoneExists || emailExists,
            duplicates
        };
    } catch (error) {
        throw error;
    }
};
