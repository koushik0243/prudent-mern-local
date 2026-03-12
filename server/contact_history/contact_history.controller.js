import express from 'express';
import * as ContactHistoryHelper from './contact_history.service.js';

const Router = express.Router();

const createContactHistory = async (req, res, next) => {
    try {
        const data = await ContactHistoryHelper.createContactHistory(req.body);
        const return_data = {
            status: 200,
            message: "Successfully added.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const editContactHistory = async (req, res, next) => {
    try {
        const data = await ContactHistoryHelper.editContactHistory(req.params.id);
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const updateContactHistory = async (req, res, next) => {
    try {
        const data = await ContactHistoryHelper.updateContactHistory(req.params.id, req.body);
        const return_data = {
            status: 200,
            message: "Successfully updated.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const listContactHistory = async (req, res, next) => {
    try {
        const {
            contact_id: contactId,
            lead_category: leadCategory,
            form_status: formStatus,
            status,
            stage_id: stageId
        } = req.query;

        const data = await ContactHistoryHelper.listContactHistory({
            contactId,
            leadCategory,
            formStatus,
            status,
            stageId
        });

        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const listContactHistoryPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const {
            contact_id: contactId,
            lead_category: leadCategory,
            form_status: formStatus,
            status,
            stage_id: stageId
        } = req.query;

        const history = await ContactHistoryHelper.listContactHistoryPagination(page, limit, {
            contactId,
            leadCategory,
            formStatus,
            status,
            stageId
        });
        const totalHistory = await ContactHistoryHelper.getContactHistoryCount({
            contactId,
            leadCategory,
            formStatus,
            status,
            stageId
        });
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: history,
            total: totalHistory,
            totalPages: Math.ceil(totalHistory / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const deleteContactHistory = async (req, res, next) => {
    try {
        const data = await ContactHistoryHelper.deleteContactHistory(req.params.id);
        const return_data = {
            status: 200,
            message: "Successfully deleted.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

Router.post('/create', createContactHistory);
Router.get('/edit/:id', editContactHistory);
Router.put('/update/:id', updateContactHistory);
Router.get('/list', listContactHistory);
Router.get('/delete/:id', deleteContactHistory);
Router.get('/list-pagination', listContactHistoryPagination);

export default Router;
