import express from 'express';
import * as NotificationMessagesHelper from './notification_message.service.js';

const Router = express.Router();

const createNotificationMessages = async (req, res, next) => {
    try {
        const data = await NotificationMessagesHelper.createNotificationMessages({
            cm_id: req.body.cm_id,
            sender_name: req.body.sender_name,
            sender_email: req.body.sender_email,
            receiver_name: req.body.receiver_name,
            receiver_email: req.body.receiver_email,
            subject: req.body.subject,
            mail_body: req.body.mail_body,
            status: req.body.status
        });
        const return_data = {
            status: 200,
            message: 'Successfully added.',
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const editNotificationMessages = async (req, res, next) => {
    try {
        const data = await NotificationMessagesHelper.editNotificationMessages(req.params.id);
        const return_data = {
            status: 200,
            message: 'Successfully fetched.',
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const updateNotificationMessages = async (req, res, next) => {
    try {
        const data = await NotificationMessagesHelper.updateNotificationMessages(req.params.id, {
            cm_id: req.body.cm_id,
            sender_name: req.body.sender_name,
            sender_email: req.body.sender_email,
            receiver_name: req.body.receiver_name,
            receiver_email: req.body.receiver_email,
            subject: req.body.subject,
            mail_body: req.body.mail_body,
            status: req.body.status
        });
        const return_data = {
            status: 200,
            message: 'Successfully updated.',
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const listNotificationMessages = async (req, res, next) => {
    try {
        const data = await NotificationMessagesHelper.listNotificationMessages();
        const return_data = {
            status: 200,
            message: 'Successfully fetched.',
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const listNotificationMessagesPagination = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const notificationMessages = await NotificationMessagesHelper.listNotificationMessagesPagination(page, limit);
        const totalNotificationMessages = await NotificationMessagesHelper.getNotificationMessagesCount();

        const return_data = {
            status: 200,
            message: 'Successfully fetched.',
            data: notificationMessages,
            total: totalNotificationMessages,
            totalPages: Math.ceil(totalNotificationMessages / limit),
            currentPage: page
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

const deleteNotificationMessages = async (req, res, next) => {
    try {
        const data = await NotificationMessagesHelper.deleteNotificationMessages(req.params.id);
        const return_data = {
            status: 200,
            message: 'Successfully deleted.',
            data: data
        };
        res.status(200).json(return_data);
    } catch (error) {
        next(error);
    }
};

Router.post('/create', createNotificationMessages);
Router.get('/edit/:id', editNotificationMessages);
Router.put('/update/:id', updateNotificationMessages);
Router.get('/list', listNotificationMessages);
Router.get('/delete/:id', deleteNotificationMessages);
Router.get('/list-pagination', listNotificationMessagesPagination);

export default Router;
