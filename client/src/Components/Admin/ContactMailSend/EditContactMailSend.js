'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchContactMails } from '@/redux/slices/contactMailSlice';
import {
    fetchContactMailSendById,
    updateContactMailSend,
} from '@/redux/slices/contactMailSendSlice';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import '../TagManagers/EditTagManager.css';

const EditContactMailSend = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { currentContactMailSend, loading } = useAppSelector((state) => state.contactMailSend);
    const { contacts } = useAppSelector((state) => state.contacts);
    const { contactMails } = useAppSelector((state) => state.contactMail);

    const [userId, setUserId] = useState('');
    const [formData, setFormData] = useState({
        contact_id: '',
        contact_mail_id: '',
    });
    const [errors, setErrors] = useState({});

    const selectWithArrowStyle = {
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        paddingRight: '2.2rem',
        backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 16 16\"%3E%3Cpath fill=\"%236c757d\" d=\"M4.47 5.97a.75.75 0 0 1 1.06 0L8 8.44l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06Z\"/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.8rem center',
        backgroundSize: '16px',
    };

    const resolveId = (value) => {
        if (!value) return '';
        if (typeof value === 'object') return value._id || value.id || '';
        return value;
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded?._id) {
                    setUserId(decoded._id);
                }
            } catch (err) {
                console.error('Token decode error:', err);
                toast.error('Session expired. Please login again.');
                router.push('/admin/login');
            }
        }

        if (id) {
            dispatch(fetchContactMailSendById(id));
        }
    }, [id, dispatch, router]);

    useEffect(() => {
        if (!Array.isArray(contactMails) || contactMails.length === 0) {
            dispatch(fetchContactMails());
        }
        if (userId && (!Array.isArray(contacts) || contacts.length === 0)) {
            dispatch(fetchContacts(userId));
        }
    }, [dispatch, userId, contactMails, contacts]);

    useEffect(() => {
        if (currentContactMailSend) {
            const rawContactValue = currentContactMailSend.contact_id || currentContactMailSend.contactId || currentContactMailSend.contact;
            const firstContactId = Array.isArray(rawContactValue)
                ? resolveId(rawContactValue[0])
                : resolveId(rawContactValue);

            setFormData({
                contact_id: firstContactId,
                contact_mail_id: resolveId(currentContactMailSend.mail_id || currentContactMailSend.contact_mail_id || currentContactMailSend.contactMailId || currentContactMailSend.contact_mail),
            });
        }
    }, [currentContactMailSend]);

    const contactsList = useMemo(() => (Array.isArray(contacts) ? contacts : []), [contacts]);
    const contactMailsList = useMemo(() => (Array.isArray(contactMails) ? contactMails : []), [contactMails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.contact_id) {
            newErrors.contact_id = 'Contact is required';
        }

        if (!formData.contact_mail_id) {
            newErrors.contact_mail_id = 'Contact Mail is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!userId) {
            toast.error('User session not found. Please login again.');
            return;
        }

        try {
            const payload = {
                ...formData,
                user_id: userId,
            };

            await dispatch(updateContactMailSend({ id, payload })).unwrap();
            toast.success('Contact mail send updated successfully');
            router.push('/admin/contact-mail-send');
        } catch (err) {
            toast.error(err || 'Failed to update contact mail send');
        }
    };

    const handleCancel = () => {
        router.push('/admin/contact-mail-send');
    };

    if (loading && !currentContactMailSend) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading contact mail send...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Contact Mail Send
                </button>
                <div>
                    <h1 className="page-title">Edit Contact Mail Send</h1>
                    <p className="page-subtitle">Update contact mail send information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaEnvelope style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Contact Mail Send Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Contact <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        name="contact_id"
                                        value={formData.contact_id}
                                        onChange={handleChange}
                                        className={`form-input ${errors.contact_id ? 'error' : ''}`}
                                        style={selectWithArrowStyle}
                                    >
                                        <option value="">Select Contact</option>
                                        {contactsList.map((contact) => {
                                            const contactId = contact._id || contact.id;
                                            const fullName = `${contact.fname || ''} ${contact.lname || ''}`.trim();
                                            return (
                                                <option key={contactId} value={contactId}>
                                                    {fullName || contact.email || contactId}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <FaChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }} />
                                </div>
                                {errors.contact_id && <span className="error-message">{errors.contact_id}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Contact Mail <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        name="contact_mail_id"
                                        value={formData.contact_mail_id}
                                        onChange={handleChange}
                                        className={`form-input ${errors.contact_mail_id ? 'error' : ''}`}
                                        style={selectWithArrowStyle}
                                    >
                                        <option value="">Select Contact Mail</option>
                                        {contactMailsList.map((mail) => {
                                            const mailId = mail._id || mail.id;
                                            const label = mail.subject || mail.full_name || mailId;
                                            return (
                                                <option key={mailId} value={mailId}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <FaChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }} />
                                </div>
                                {errors.contact_mail_id && <span className="error-message">{errors.contact_mail_id}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary-custom" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Contact Mail Send'}
                    </button>
                    <button type="button" className="btn-secondary-custom" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditContactMailSend;
