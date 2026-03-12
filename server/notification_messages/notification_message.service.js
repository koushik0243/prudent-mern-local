import NotificationMessages from './notification_message.model.js';

export const createNotificationMessages = async (newNotificationMessage) => {
    try {
        const {
            cm_id,
            sender_name,
            sender_email,
            receiver_name,
            receiver_email,
            subject,
            mail_body,
            status
        } = newNotificationMessage;

        return await new NotificationMessages({
            cm_id,
            sender_name,
            sender_email,
            receiver_name,
            receiver_email,
            subject,
            mail_body,
            status
        }).save();
    } catch (error) {
        throw error;
    }
};

export const editNotificationMessages = async (editId) => {
    try {
        return await NotificationMessages.findById(editId).populate('cm_id');
    } catch (error) {
        throw error;
    }
};

export const updateNotificationMessages = async (updateId, updateNotificationMessages) => {
    try {
        const {
            cm_id,
            sender_name,
            sender_email,
            receiver_name,
            receiver_email,
            subject,
            mail_body,
            status
        } = updateNotificationMessages;

        const setPayload = {};
        if (cm_id !== undefined) setPayload.cm_id = cm_id;
        if (sender_name !== undefined) setPayload.sender_name = sender_name;
        if (sender_email !== undefined) setPayload.sender_email = sender_email;
        if (receiver_name !== undefined) setPayload.receiver_name = receiver_name;
        if (receiver_email !== undefined) setPayload.receiver_email = receiver_email;
        if (subject !== undefined) setPayload.subject = subject;
        if (mail_body !== undefined) setPayload.mail_body = mail_body;
        if (status !== undefined) setPayload.status = status;

        if (Object.keys(setPayload).length === 0) {
            return await NotificationMessages.findById(updateId).populate('cm_id');
        }

        return await NotificationMessages.findByIdAndUpdate(
            updateId,
            {
                $set: setPayload
            },
            { new: false, runValidators: true }
        );
    } catch (error) {
        throw error;
    }
};

export const listNotificationMessages = async () => {
    try {
        return await NotificationMessages.find({}).populate('cm_id').sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

export const listNotificationMessagesPagination = async (page, limit) => {
    try {
        return await NotificationMessages.find({})
            .populate('cm_id')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

export const getNotificationMessagesCount = async () => {
    try {
        return await NotificationMessages.countDocuments();
    } catch (error) {
        throw error;
    }
};

export const deleteNotificationMessages = async (delId) => {
    try {
        const deletedNotificationMessages = await NotificationMessages.findByIdAndDelete(delId);
        if (!deletedNotificationMessages) {
            throw new Error('Notification message not found');
        }
        return deletedNotificationMessages;
    } catch (error) {
        throw error;
    }
};
