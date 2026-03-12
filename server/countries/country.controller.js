import express from 'express';
import * as CountryHelper from './country.service.js';
import Country from './country.model.js';

const Router = express.Router();

const createCountry = async (req, res, next) => {
    try {
        const data = await CountryHelper.createCountry(req.body);
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

const editCountry = async (req, res, next) => {
    try {
        const data = await CountryHelper.editCountry(req.params.id);
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

const updateCountry = async (req, res, next) => {
    try {
        const data = await CountryHelper.updateCountry(req.params.id, req.body);
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

const listCountry = async (req, res, next) => {
    try {
        const data = await CountryHelper.listCountry();
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

const listCountryPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const countries = await CountryHelper.listCountryPagination(page, limit);
        const totalCountries = await CountryHelper.getCountryCount();

        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: countries,
            total: totalCountries,
            totalPages: Math.ceil(totalCountries / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const deleteCountry = async (req, res, next) => {
    try {
        const data = await CountryHelper.deleteCountry(req.params.id);
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

Router.post('/create', createCountry);
Router.get('/edit/:id', editCountry);
Router.put('/update/:id', updateCountry);
Router.get('/list', listCountry);
Router.get('/delete/:id', deleteCountry);
Router.get('/list-pagination', listCountryPagination);

export default Router;
