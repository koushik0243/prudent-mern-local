import express from 'express';
import * as StateHelper from './state.service.js';

const Router = express.Router();

const createState = async (req, res, next) => {
    try {
        const data = await StateHelper.createState(req.body);
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

const editState = async (req, res, next) => {
    try {
        const data = await StateHelper.editState(req.params.id);
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

const updateState = async (req, res, next) => {
    try {
        const data = await StateHelper.updateState(req.params.id, req.body);
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

const listState = async (req, res, next) => {
    try {
        const data = await StateHelper.listState();
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

const listStatePagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const states = await StateHelper.listStatePagination(page, limit);
        const totalStates = await StateHelper.getStateCount();

        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: states,
            total: totalStates,
            totalPages: Math.ceil(totalStates / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const deleteState = async (req, res, next) => {
    try {
        const data = await StateHelper.deleteState(req.params.id);
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

Router.post('/create', createState);
Router.get('/edit/:id', editState);
Router.put('/update/:id', updateState);
Router.get('/list', listState);
Router.get('/delete/:id', deleteState);
Router.get('/list-pagination', listStatePagination);

export default Router;
