import express from 'express';
import * as CityHelper from './city.service.js';

const Router = express.Router();

const createCity = async (req, res, next) => {
    try {
        const data = await CityHelper.createCity(req.body);
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

const editCity = async (req, res, next) => {
    try {
        const data = await CityHelper.editCity(req.params.id);
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

const updateCity = async (req, res, next) => {
    try {
        const data = await CityHelper.updateCity(req.params.id, req.body);
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

const listCity = async (req, res, next) => {
    try {
        const data = await CityHelper.listCity();
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

const listCityPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const cities = await CityHelper.listCityPagination(page, limit);
        const totalCities = await CityHelper.getCityCount();

        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: cities,
            total: totalCities,
            totalPages: Math.ceil(totalCities / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const deleteCity = async (req, res, next) => {
    try {
        const data = await CityHelper.deleteCity(req.params.id);
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

Router.post('/create', createCity);
Router.get('/edit/:id', editCity);
Router.put('/update/:id', updateCity);
Router.get('/list', listCity);
Router.get('/delete/:id', deleteCity);
Router.get('/list-pagination', listCityPagination);

export default Router;
