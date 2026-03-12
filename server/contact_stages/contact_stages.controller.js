import express from 'express';
import * as ContactStagesHelper from './contact_stages.service.js';
import ContactStages from './contact_stages.model.js';
const Router = express.Router();

const createContactStages = async (req, res, next) => { 
    try { 
        const data = await ContactStagesHelper.createContactStages(req.body); 
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

const editContactStages = async (req, res, next) => { 
    try { 
        const data = await ContactStagesHelper.editContactStages(req.params.id); 
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
} 

const updateContactStages = async (req, res, next) => { 
    try { 
        const data = await ContactStagesHelper.updateContactStages(req.params.id, req.body); 
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

const listContactStages = async (req, res, next) => { 
    try { 
        const data = await ContactStagesHelper.listContactStages(req.params.id); 
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

const listContactStagesPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const contactStages = await ContactStagesHelper.listContactStagesPagination(page, limit);
        const totalContactStages = await ContactStages.countDocuments();
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: contactStages,
            total: totalContactStages,
            totalPages: Math.ceil(totalContactStages / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteContactStages = async (req, res, next) => {
    try {
        const data = await ContactStagesHelper.deleteContactStages(req.params.id);
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

Router.post('/create', createContactStages);
Router.get('/edit/:id', editContactStages);
Router.put('/update/:id', updateContactStages);
Router.get('/list/:id', listContactStages);
Router.get('/delete/:id', deleteContactStages);
Router.get('/list-pagination', listContactStagesPagination);

export default Router;
