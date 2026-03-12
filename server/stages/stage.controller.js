import express from 'express';
import * as StageHelper from './stage.service.js';
import Stage from './stage.model.js';
const Router = express.Router();

const createStage = async (req, res, next) => { 
    try { 
        const data = await StageHelper.createStage(req.body); 
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

const editStage = async (req, res, next) => { 
    try { 
        const data = await StageHelper.editStage(req.params.id); 
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
} 

const updateStage = async (req, res, next) => { 
    try { 
        const data = await StageHelper.updateStage(req.params.id, req.body); 
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

const listStage = async (req, res, next) => { 
    try { 
        const data = await StageHelper.listStage(req.params.userId); 
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

const listStagePagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const stages = await StageHelper.listStagePagination(page, limit);
        const totalStages = await Stage.countDocuments();
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: stages,
            total: totalStages,
            totalPages: Math.ceil(totalStages / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteStage = async (req, res, next) => {
    try {
        const data = await StageHelper.deleteStage(req.params.id);
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

Router.post('/create', createStage);
Router.get('/edit/:id', editStage);
Router.put('/update/:id', updateStage);
Router.get('/list', listStage);
Router.get('/delete/:id', deleteStage);
Router.get('/list-pagination', listStagePagination);

export default Router;
