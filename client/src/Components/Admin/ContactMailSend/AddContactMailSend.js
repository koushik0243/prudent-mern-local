'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchContactMails } from '@/redux/slices/contactMailSlice';
import { createContactMailSend } from '@/redux/slices/contactMailSendSlice';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaChevronDown } from 'react-icons/fa';
import '../TagManagers/AddTagManager.css';

const AddContactMailSend = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { loading } = useAppSelector((state) => state.contactMailSend);
    const { contacts } = useAppSelector((state) => state.contacts);
    const { contactMails } = useAppSelector((state) => state.contactMail);

    const [userId, setUserId] = useState('');
    const [formData, setFormData] = useState({
        selected_contact_ids: [],
        mail_id: '',
        subject: '',
        message: '',
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
        if (typeof value === 'object') {
            return value._id || value.id || value.$oid || '';
        }
        return String(value);
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
    }, [router]);

    useEffect(() => {
        if (!Array.isArray(contactMails) || contactMails.length === 0) {
            dispatch(fetchContactMails());
        }
        if (userId && (!Array.isArray(contacts) || contacts.length === 0)) {
            dispatch(fetchContacts(userId));
        }
    }, [dispatch, userId, contactMails, contacts]);

    const contactsList = useMemo(() => (Array.isArray(contacts) ? contacts : []), [contacts]);
    const contactMailsList = useMemo(() => (Array.isArray(contactMails) ? contactMails : []), [contactMails]);
    const contactIds = useMemo(
        () => contactsList.map((contact) => contact._id || contact.id).filter(Boolean),
        [contactsList]
    );

    const areAllContactsSelected = contactIds.length > 0 && contactIds.every((id) => formData.selected_contact_ids.includes(id));

    const getCheckboxStyle = (checked) => ({
        marginTop: '0.1rem',
        appearance: 'none',
        WebkitAppearance: 'none',
        width: '14px',
        height: '14px',
        border: checked ? '1px solid #b6110f' : '1px solid #000',
        backgroundColor: checked ? '#b6110f' : '#ffffff',
        borderRadius: '2px',
        cursor: 'pointer',
        display: 'inline-block',
        verticalAlign: 'middle',
        backgroundImage: checked
            ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3.5 8.5l3 3 6-6'/%3E%3C/svg%3E\")"
            : 'none',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '11px 11px',
    });

    const selectedContactMail = useMemo(() => {
        if (!formData.mail_id) return null;
        return (
            contactMailsList.find((mail) => resolveId(mail._id || mail.id) === String(formData.mail_id)) ||
            null
        );
    }, [contactMailsList, formData.mail_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'mail_id') {
            const selectedMail = contactMailsList.find((mail) => resolveId(mail._id || mail.id) === String(value));
            setFormData((prev) => ({
                ...prev,
                mail_id: value,
                subject: selectedMail ? (selectedMail.subject || selectedMail.full_name || '') : '',
                message: selectedMail ? (selectedMail.message || selectedMail.desc || '') : '',
            }));

            if (errors.mail_id) {
                setErrors((prev) => ({
                    ...prev,
                    mail_id: '',
                }));
            }
            return;
        }

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

    const handleContactToggle = (selectedId) => {
        setFormData((prev) => {
            const exists = prev.selected_contact_ids.includes(selectedId);
            return {
                ...prev,
                selected_contact_ids: exists
                    ? prev.selected_contact_ids.filter((id) => id !== selectedId)
                    : [...prev.selected_contact_ids, selectedId],
            };
        });

        if (errors.selected_contact_ids) {
            setErrors((prev) => ({
                ...prev,
                selected_contact_ids: '',
            }));
        }
    };

    const handleToggleSelectAllContacts = () => {
        setFormData((prev) => ({
            ...prev,
            selected_contact_ids: areAllContactsSelected ? [] : [...contactIds],
        }));

        if (errors.selected_contact_ids) {
            setErrors((prev) => ({
                ...prev,
                selected_contact_ids: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!Array.isArray(formData.selected_contact_ids) || formData.selected_contact_ids.length === 0) {
            newErrors.selected_contact_ids = 'At least one contact is required';
        }

        if (!formData.mail_id) {
            newErrors.mail_id = 'Contact Mail is required';
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
            const selectedMailId = String(formData.mail_id || '').trim();
            const payload = {
                contact_id: formData.selected_contact_ids,
                mail_id: selectedMailId,
                subject: formData.subject,
                message: formData.message,
                user_id: userId,
            };

            await dispatch(createContactMailSend(payload)).unwrap();
            toast.success('Mail successfully sent to selected contacts');
            router.push('/admin/contact-mail-send');
        } catch (err) {
            toast.error(err || 'Failed to send mail to contacts');
        }
    };

    const handleCancel = () => {
        router.push('/admin/contact-mail-send');
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Contact Mail Send
                </button>
                <div>
                    <h1 className="page-title">Add Contact Mail Send</h1>
                    <p className="page-subtitle">Create a new contact mail send entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaEnvelope style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Contact Mail Send Information
                        </h2>

                        <div
                            className="form-row"
                            style={{
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            }}
                        >
                            <div className="form-group">
                                <label className="form-label">
                                    Contacts <span className="required">*</span>
                                </label>
                                <div
                                    className={`form-input ${errors.selected_contact_ids ? 'error' : ''}`}
                                    style={{
                                        minHeight: '700px',
                                        maxHeight: '700px',
                                        overflowY: 'auto',
                                        padding: '0.75rem',
                                        border: errors.selected_contact_ids ? '1px solid #dc3545' : undefined,
                                    }}
                                >
                                    {contactsList.length === 0 ? (
                                        <div style={{ color: '#6c757d' }}>No contacts found</div>
                                    ) : (
                                        <>
                                            <label
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: '0.6rem',
                                                    marginBottom: '0.8rem !important',
                                                    cursor: 'pointer',
                                                    lineHeight: 1.3,
                                                    borderBottom: '1px solid #e9ecef',
                                                    paddingBottom: '0.6rem',
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={areAllContactsSelected}
                                                    onChange={handleToggleSelectAllContacts}
                                                    style={getCheckboxStyle(areAllContactsSelected)}
                                                />
                                                <span>
                                                    <strong>Select All</strong>
                                                </span>
                                            </label>

                                            <div style={{ marginTop: '0.7rem' }}>
                                                {contactsList.map((contact) => {
                                                    const id = contact._id || contact.id;
                                                    const isChecked = formData.selected_contact_ids.includes(id);
                                                    const name = `${contact.fname || ''} ${contact.mname || ''} ${contact.lname || ''}`.trim() || contact.full_name || 'Unnamed Contact';
                                                    const email = contact.email || 'No email';
                                                    const phone = contact.phone || 'No phone';

                                                    return (
                                                        <label
                                                            key={id}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '0.6rem',
                                                                marginBottom: '0.65rem',
                                                                cursor: 'pointer',
                                                                lineHeight: 1.3,
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => handleContactToggle(id)}
                                                                style={getCheckboxStyle(isChecked)}
                                                            />
                                                            <span>
                                                                <strong>{name}</strong> ({email} / {phone})
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                                {errors.selected_contact_ids && <span className="error-message">{errors.selected_contact_ids}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Contact Mail <span className="required">*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        name="mail_id"
                                        value={formData.mail_id}
                                        onChange={handleChange}
                                        className={`form-input ${errors.mail_id ? 'error' : ''}`}
                                        style={selectWithArrowStyle}
                                    >
                                        <option value="">Select Contact Mail</option>
                                        {contactMailsList.map((mail) => {
                                            const id = resolveId(mail._id || mail.id);
                                            const label = mail.subject || mail.full_name || id;
                                            return (
                                                <option key={id} value={id}>
                                                    {label}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <FaChevronDown style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }} />
                                </div>
                                {errors.mail_id && <span className="error-message">{errors.mail_id}</span>}

                                {selectedContactMail && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                                            <label className="form-label">Subject</label>
                                            <input
                                                type="text"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="Enter subject"
                                            />
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label className="form-label">Mail Body</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="form-textarea"
                                                placeholder="Enter mail body"
                                                rows="6"
                                                style={{ minHeight: '536px' }}
                                            />
                                            <p className="text-sm text-gray-600 mt-2" style={{ fontSize: "12px" }}>
                                                <strong>Use the below placeholders in the mail body:</strong>
                                                <br />
                                                {'{name}'} - Contact's full name
                                                <br />
                                                {'{email}'} - Contact's email address
                                                <br />
                                                {'{phone}'} - Contact's phone number
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-primary-custom" disabled={loading}>
                        {loading ? 'Sending Mail...' : 'Send Mail'}
                    </button>
                    <button type="button" className="btn-secondary-custom" onClick={handleCancel} disabled={loading}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddContactMailSend;
