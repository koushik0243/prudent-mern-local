import express from 'express';
import * as ContactMailHelper from './contact_mail.service.js';
const Router = express.Router();

const createContactMail = async (req, res, next) => {
    try { 
        const data = await ContactMailHelper.createContactMail(req.body);
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

const editContactMail = async (req, res, next) => {
    try { 
        const data = await ContactMailHelper.editContactMail(req.params.id);
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const updateContactMail = async (req, res, next) => {
    try { 
        const data = await ContactMailHelper.updateContactMail(req.params.id, req.body);
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

const listContactMail = async (req, res, next) => {
    try {
        const { user_id: userId, status } = req.query;

        const data = await ContactMailHelper.listContactMail({ userId, status });
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

const listContactMailPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { user_id: userId, status } = req.query;

        const mails = await ContactMailHelper.listContactMailPagination(page, limit, { userId, status });
        const totalMails = await ContactMailHelper.getContactMailCount({ userId, status });
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

const deleteContactMail = async (req, res, next) => {
    try {
        const data = await ContactMailHelper.deleteContactMail(req.params.id);
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

Router.post('/create', createContactMail);
Router.get('/edit/:id', editContactMail);
Router.put('/update/:id', updateContactMail);
Router.get('/list', listContactMail);
Router.get('/delete/:id', deleteContactMail);
Router.get('/list-pagination', listContactMailPagination);

export default Router;
