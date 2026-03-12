import express from 'express';
import * as ContactMessagesHelper from './contact_messages.service.js';
import ContactMessages from './contact_messages.model.js';
const Router = express.Router();

const createContactMessages = async (req, res, next) => { 
    try { 
        const data = await ContactMessagesHelper.createContactMessages({
            ...req.body,
            created_by: req.user || null
        }); 
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

const editContactMessages = async (req, res, next) => { 
    try { 
        const data = await ContactMessagesHelper.editContactMessages(req.params.id); 
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
} 

const updateContactMessages = async (req, res, next) => { 
    try { 
        const data = await ContactMessagesHelper.updateContactMessages(req.params.id, req.body); 
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

const listContactMessages = async (req, res, next) => { 
    try { 
        const data = await ContactMessagesHelper.listContactMessages(); 
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

const listContactMessagesByContactId = async (req, res, next) => {
    try {
        const data = await ContactMessagesHelper.listContactMessagesByContactId(req.params.contactId);
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

const listContactMessagesPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const contactMessages = await ContactMessagesHelper.listContactMessagesPagination(page, limit);
        const totalContactMessages = await ContactMessages.countDocuments();
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: contactMessages,
            total: totalContactMessages,
            totalPages: Math.ceil(totalContactMessages / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteContactMessages = async (req, res, next) => {
    try {
        const data = await ContactMessagesHelper.deleteContactMessages(req.params.id);
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

Router.post('/create', createContactMessages);
Router.get('/edit/:id', editContactMessages);
Router.put('/update/:id', updateContactMessages);
Router.get('/list', listContactMessages);
Router.get('/list/:contactId', listContactMessagesByContactId);
Router.get('/delete/:id', deleteContactMessages);
Router.get('/list-pagination', listContactMessagesPagination);

export default Router;
