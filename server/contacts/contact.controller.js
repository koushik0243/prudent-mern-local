import express from 'express';
import multer from 'multer';
import * as ContactHelper from './contact.service.js';
import Contact from './contact.model.js';
const Router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const mapContactForListView = (contact = {}) => ({
    _id: contact._id,
    fname: contact.fname,
    mname: contact.mname,
    lname: contact.lname,
    full_name: `${contact.fname || ''} ${contact.mname || ''} ${contact.lname || ''}`.replace(/\s+/g, ' ').trim(),
    phone: contact.phone,
    alternate_phone: contact.alternate_phone,
    email: contact.email,
    city: contact.city,
    state: contact.state,
    country: contact.country,
    stage_id: contact.stage_id,
    tags: contact.tags,
    total_lead_score: contact.total_lead_score,
    lead_category: contact.lead_category,
    form_status: contact.form_status,
    contact_created: contact.contact_created,
    priority: contact.priority,
    status: contact.status,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt
});

const createContact = async (req, res, next) => { 
    try { 
        const data = await ContactHelper.createContact(req.body); 
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

const editContact = async (req, res, next) => { 
    try { 
        const data = await ContactHelper.editContact(req.params.id); 
        const return_data = { 
            status: 200, message: "Successfully fetched.",
            data: data,
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
} 

const updateContact = async (req, res, next) => { 
    try { 
        const data = await ContactHelper.updateContact(req.params.id, req.body); 
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

const listContact = async (req, res, next) => { 
    try { 
        const {
            lead_category: leadCategory,
            form_status: formStatus,
            status,
            stage_id: stageId,
            contact_created: contactCreated
        } = req.query;

        const data = await ContactHelper.listContact({
            leadCategory,
            formStatus,
            status,
            stageId,
            contactCreated
        }); 
        const return_data = { 
            status: 200, 
            message: "Successfully fetched.",
            data: Array.isArray(data) ? data.map(mapContactForListView) : [],
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const listContactPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const {
            lead_category: leadCategory,
            form_status: formStatus,
            status,
            stage_id: stageId,
            contact_created: contactCreated
        } = req.query;

        const categories = await ContactHelper.listContactPagination(page, limit, {
            leadCategory,
            formStatus,
            status,
            stageId,
            contactCreated
        });
        const totalCategories = await ContactHelper.getContactCount({
            leadCategory,
            formStatus,
            status,
            stageId,
            contactCreated
        });
        const return_data = {
            status: 200,
            message: "Successfully fetched.",
            data: categories,
            total: totalCategories,
            totalPages: Math.ceil(totalCategories / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const deleteContact = async (req, res, next) => {
    try {
        const data = await ContactHelper.deleteContact(req.params.id);
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

const checkDuplicateContact = async (req, res, next) => {
    try {
        const { phone, email, exclude_id: excludeIdFromBody, contact_id: contactIdFromBody } = req.body;
        const { exclude_id: excludeIdFromQuery, contact_id: contactIdFromQuery } = req.query;

        const data = await ContactHelper.checkDuplicateContact({
            phone,
            email,
            excludeId: excludeIdFromBody || contactIdFromBody || excludeIdFromQuery || contactIdFromQuery
        });

        const return_data = {
            status: 200,
            message: data.isDuplicate ? "contact exist" : "contact not exist",
            data
        };

        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

const importContact = async (req, res, next) => {
    try {
        const csvContentFromFile = req.files?.[0]?.buffer?.toString('utf8');
        const csvContentFromBody = req.body?.csv || req.body?.csvData;
        const csvContent = csvContentFromFile || csvContentFromBody;
        const contactCreated = 'imported';

        if (!csvContent) {
            const error = new Error('CSV file or csv content is required.');
            error.statusCode = 400;
            throw error;
        }

        const data = await ContactHelper.importContactsFromCsv(csvContent, {
            contactCreated
        });

        const return_data = {
            status: 200,
            message: 'Contacts imported successfully.',
            data
        };

        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
}

Router.post('/create', createContact);
Router.get('/edit/:id', editContact);
Router.put('/update/:id', updateContact);
Router.get('/list', listContact);
Router.get('/delete/:id', deleteContact);
Router.get('/list-pagination', listContactPagination);
Router.post('/duplicate-check', checkDuplicateContact);
Router.post('/import', upload.any(), importContact);

export default Router;
