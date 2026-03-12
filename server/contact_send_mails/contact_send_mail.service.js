import ContactSendMail from './contact_send_mail.model.js';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

const buildContactSendMailQuery = (filters = {}) => {
    const query = {};

    query.deletedAt = null;

    if (filters.userId && ObjectId.isValid(filters.userId)) {
        query.user_id = new ObjectId(filters.userId);
    }

    if (filters.contactId && ObjectId.isValid(filters.contactId)) {
        query.contact_id = new ObjectId(filters.contactId);
    }

    if (filters.mailId && ObjectId.isValid(filters.mailId)) {
        query.mail_id = new ObjectId(filters.mailId);
    }

    if (filters.status) {
        query.status = filters.status;
    }

    return query;
};

const buildContactSendMailAggregationPipeline = (filters = {}, pagination = null) => {
    const query = buildContactSendMailQuery(filters);
    const pipeline = [
        { $match: query },
        {
            $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $lookup: {
                from: 'contacts',
                localField: 'contact_id',
                foreignField: '_id',
                as: 'contact'
            }
        },
        {
            $lookup: {
                from: 'contact_emails',
                localField: 'mail_id',
                foreignField: '_id',
                as: 'mail'
            }
        },
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$contact',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$mail',
                preserveNullAndEmptyArrays: true
            }
        },
        { $sort: { createdAt: -1 } }
    ];

    if (pagination) {
        pipeline.push({ $skip: (pagination.page - 1) * pagination.limit });
        pipeline.push({ $limit: pagination.limit });
    }

    pipeline.push({
        $project: {
            _id: 1,
            user_id: 1,
            contact_id: 1,
            mail_id: 1,
            contact_name: 1,
            contact_email: 1,
            subject: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
                _id: '$user._id',
                full_name: '$user.full_name',
                email: '$user.email',
                phone: '$user.phone',
                status: '$user.status'
            },
            contact: {
                _id: '$contact._id',
                fname: '$contact.fname',
                lname: '$contact.lname',
                email: '$contact.email',
                phone: '$contact.phone',
                status: '$contact.status'
            },
            mail: {
                _id: '$mail._id',
                subject: '$mail.subject',
                message: '$mail.message',
                status: '$mail.status'
            }
        }
    });

    return pipeline;
};

export const createContactSendMail = async (newContactSendMail) => {
    try {
        return await new ContactSendMail(newContactSendMail).save();
    } catch (error) {
        throw error;
    }
};

export const createContactSendMailBulk = async (newContactSendMails = []) => {
    try {
        return await ContactSendMail.insertMany(newContactSendMails);
    } catch (error) {
        throw error;
    }
};

export const editContactSendMail = async (editId) => {
    try {
        return await ContactSendMail.findOne({ _id: editId, deletedAt: null });
    } catch (error) {
        throw error;
    }
};

export const updateContactSendMail = async (updateId, updateContactSendMailData) => {
    try {
        const {
            user_id,
            contact_id,
            mail_id,
            contact_name,
            contact_email,
            subject,
            message,
            status
        } = updateContactSendMailData;

        const updateFields = {};

        if (user_id && ObjectId.isValid(user_id)) {
            updateFields.user_id = new ObjectId(user_id);
        }

        if (contact_id && ObjectId.isValid(contact_id)) {
            updateFields.contact_id = new ObjectId(contact_id);
        }

        if (mail_id && ObjectId.isValid(mail_id)) {
            updateFields.mail_id = new ObjectId(mail_id);
        }

        if (typeof contact_name !== 'undefined') {
            updateFields.contact_name = contact_name;
        }

        if (typeof contact_email !== 'undefined') {
            updateFields.contact_email = contact_email;
        }

        if (typeof subject !== 'undefined') {
            updateFields.subject = subject;
        }

        if (typeof message !== 'undefined') {
            updateFields.message = message;
        }

        if (typeof status !== 'undefined') {
            updateFields.status = status;
        }

        return await ContactSendMail.findOneAndUpdate(
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

export const listContactSendMail = async (filters = {}) => {
    try {
        const pipeline = buildContactSendMailAggregationPipeline(filters);
        return await ContactSendMail.aggregate(pipeline);
    } catch (error) {
        throw error;
    }
};

export const listContactSendMailPagination = async (page, limit, filters = {}) => {
    try {
        const pipeline = buildContactSendMailAggregationPipeline(filters, { page, limit });
        return await ContactSendMail.aggregate(pipeline);
    } catch (error) {
        throw error;
    }
};

export const getContactSendMailCount = async (filters = {}) => {
    try {
        const query = buildContactSendMailQuery(filters);
        return await ContactSendMail.countDocuments(query);
    } catch (error) {
        throw error;
    }
};

export const deleteContactSendMail = async (delId) => {
    try {
        return await ContactSendMail.findOneAndUpdate(
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
