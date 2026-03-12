import express from 'express';
import dotenv from 'dotenv';
import * as ContactSendMailHelper from './contact_send_mail.service.js';
import Contact from '../contacts/contact.model.js';
import ContactMail from '../contact_mails/contact_mail.model.js';
import nodemailer from 'nodemailer';
const Router = express.Router();

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "koushik@thinksurfmedia.info",
        pass: "ukeo jjfk kdxy dihf"
    }
});

const getContactFullName = (contactDetails) => {
    return `${contactDetails.fname || ''} ${contactDetails.mname || ''} ${contactDetails.lname || ''}`.replace(/\s+/g, ' ').trim();
};

const getContactPhoneDisplay = (contactDetails) => {
    const primaryPhone = (contactDetails.phone || '').trim();
    const alternatePhone = (contactDetails.alternate_phone || '').trim();

    if (primaryPhone && alternatePhone) {
        return `${primaryPhone} / ${alternatePhone}`;
    }

    return primaryPhone || alternatePhone || 'n/a';
};

const replaceContactVariables = (message, contactDetails) => {
    const contactName = getContactFullName(contactDetails);
    const contactEmail = contactDetails.email || '';
    const contactPhone = getContactPhoneDisplay(contactDetails);

    return (message || '')
        .replace(/\{name\}/g, contactName)
        .replace(/\{email\}/g, contactEmail)
        .replace(/\{phone\}/g, contactPhone);
};

const createContactSendMail = async (req, res, next) => {
    try {
        const contactIds = Array.isArray(req.body.contact_id)
            ? req.body.contact_id
            : req.body.contact_id
                ? [req.body.contact_id]
                : [];

        if (!contactIds.length) {
            return res.status(400).json({ status: 400, message: "contact_id is required." });
        }

        if (!req.body.mail_id) {
            return res.status(400).json({ status: 400, message: "mail_id is required." });
        }

        const contactDetailsList = await Contact.find({
            _id: { $in: contactIds },
            deletedAt: null
        });

        if (contactDetailsList.length !== contactIds.length) {
            return res.status(400).json({ status: 400, message: "One or more contacts do not exist." });
        }

        const mailTemplate = await ContactMail.findOne({ _id: req.body.mail_id, deletedAt: null });
        if (!mailTemplate) {
            return res.status(400).json({ status: 400, message: "Mail template does not exist." });
        }

        const resolvedSubject = (req.body.subject || '').trim() || (mailTemplate.subject || '');
        const resolvedMessage = (req.body.message || '').trim() || (mailTemplate.message || '');

        const payloads = [];
        for (const contactDetails of contactDetailsList) {
            const personalizedMessage = replaceContactVariables(resolvedMessage, contactDetails);
            const contactName = getContactFullName(contactDetails);
            const contactPhone = getContactPhoneDisplay(contactDetails);

            await transporter.sendMail({
                to: contactDetails.email,
                subject: resolvedSubject,
                html: `<div class="container" style="max-width: 600px; margin: auto;">
                            <div class="card" style="border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); border: 2px solid #000; padding: 0px 20px 10px; background-color: #f8f9fa;">
                            <div class="card-body">
                                <h2 class="text-center text-primary mb-4">${resolvedSubject}</h2>
                                <p style="white-space: pre-wrap;">${personalizedMessage}</p>
                                <hr>
                                <div class="text-center mt-4">
                                    <p class="text-muted" style="font-size: 12px;">Powered by KIT</p>
                                </div>
                            </div>
                            </div>
                        </div>`
            });

            payloads.push({
                user_id: req.body.user_id,
                contact_id: contactDetails._id,
                contact_name: contactName,
                contact_email: contactDetails.email,
                contact_phone: contactPhone,
                mail_id: req.body.mail_id,
                subject: resolvedSubject,
                message: personalizedMessage,
                status: req.body.status || 'active'
            });
        }

        const data = await ContactSendMailHelper.createContactSendMailBulk(payloads);
        const return_data = { 
            status: 200, 
            message: "Successfully added.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const editContactSendMail = async (req, res, next) => {
    try { 
        const data = await ContactSendMailHelper.editContactSendMail(req.params.id);
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const updateContactSendMail = async (req, res, next) => {
    try { 
        const payload = { ...req.body };

        if (req.body.contact_id) {
            const contactDetails = await Contact.findOne({ _id: req.body.contact_id, deletedAt: null });
            if (!contactDetails) {
                return res.status(400).json({ status: 400, message: "Contact does not exist." });
            }

            payload.contact_name = `${contactDetails.fname || ''} ${contactDetails.lname || ''}`.trim();
            payload.contact_email = contactDetails.email;
        }

        if (req.body.mail_id) {
            const mailTemplate = await ContactMail.findOne({ _id: req.body.mail_id, deletedAt: null });
            if (!mailTemplate) {
                return res.status(400).json({ status: 400, message: "Mail template does not exist." });
            }

            payload.subject = mailTemplate.subject || '';
            payload.message = mailTemplate.message || '';
        }

        const data = await ContactSendMailHelper.updateContactSendMail(req.params.id, payload);
        const return_data = { 
            status: 200, 
            message: "Successfully updated.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const listContactSendMail = async (req, res, next) => {
    try {
        const {
            user_id: userId,
            contact_id: contactId,
            mail_id: mailId,
            status
        } = req.query;

        const data = await ContactSendMailHelper.listContactSendMail({ userId, contactId, mailId, status });
        const return_data = { 
            status: 200, 
            message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const listContactSendMailPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const {
            user_id: userId,
            contact_id: contactId,
            mail_id: mailId,
            status
        } = req.query;

        const mails = await ContactSendMailHelper.listContactSendMailPagination(page, limit, {
            userId,
            contactId,
            mailId,
            status
        });
        const totalMails = await ContactSendMailHelper.getContactSendMailCount({
            userId,
            contactId,
            mailId,
            status
        });
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: mails,
            total: totalMails,
            totalPages: Math.ceil(totalMails / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteContactSendMail = async (req, res, next) => {
    try {
        const data = await ContactSendMailHelper.deleteContactSendMail(req.params.id);
        const return_data = {
            status: 200,
            message: "Successfully deleted.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

Router.post('/', createContactSendMail);
Router.post('/create', createContactSendMail);
Router.get('/edit/:id', editContactSendMail);
Router.put('/update/:id', updateContactSendMail);
Router.get('/list', listContactSendMail);
Router.get('/delete/:id', deleteContactSendMail);
Router.get('/list-pagination', listContactSendMailPagination);

export default Router;
