import express from 'express';
import * as TagManagerHelper from './tag_manager.service.js';
import TagManager from './tag_manager.model.js';
const Router = express.Router();

const createTagManager = async (req, res, next) => { 
    try { 
        const data = await TagManagerHelper.createTagManager(req.body); 
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

const editTagManager = async (req, res, next) => { 
    try { 
        const data = await TagManagerHelper.editTagManager(req.params.id); 
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
} 

const updateTagManager = async (req, res, next) => { 
    try { 
        const data = await TagManagerHelper.updateTagManager(req.params.id, req.body); 
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

const listTagManager = async (req, res, next) => { 
    try { 
        const data = await TagManagerHelper.listTagManager(); 
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

const listTagManagerPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const tagManagers = await TagManagerHelper.listTagManagerPagination(page, limit);
        const totalTagManagers = await TagManager.countDocuments();
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: tagManagers,
            total: totalTagManagers,
            totalPages: Math.ceil(totalTagManagers / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteTagManager = async (req, res, next) => {
    try {
        const data = await TagManagerHelper.deleteTagManager(req.params.id);
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

Router.post('/create', createTagManager);
Router.get('/edit/:id', editTagManager);
Router.put('/update/:id', updateTagManager);
Router.get('/list', listTagManager);
Router.get('/listPagination', listTagManagerPagination);
Router.get('/delete/:id', deleteTagManager);

export default Router;
