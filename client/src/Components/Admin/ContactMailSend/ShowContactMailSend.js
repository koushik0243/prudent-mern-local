'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchContactMails } from '@/redux/slices/contactMailSlice';
import { fetchContactMailSendById } from '@/redux/slices/contactMailSendSlice';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import '../TagManagers/ShowTagManager.css';

const ShowContactMailSend = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { currentContactMailSend, loading } = useAppSelector((state) => state.contactMailSend);
    const { contacts } = useAppSelector((state) => state.contacts);
    const { contactMails } = useAppSelector((state) => state.contactMail);

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
                if (decoded?._id && (!Array.isArray(contacts) || contacts.length === 0)) {
                    dispatch(fetchContacts(decoded._id));
                }
            } catch (err) {
                console.error('Token decode error:', err);
            }
        }

        if (!Array.isArray(contactMails) || contactMails.length === 0) {
            dispatch(fetchContactMails());
        }

        if (id) {
            dispatch(fetchContactMailSendById(id));
        }
    }, [id, dispatch, contacts, contactMails]);

    const getContactLabel = () => {
        if (currentContactMailSend?.contact && typeof currentContactMailSend.contact === 'object') {
            const fullName = `${currentContactMailSend.contact.fname || ''} ${currentContactMailSend.contact.lname || ''}`.trim();
            const contactName = fullName || currentContactMailSend.contact.email || 'N/A';
            const email = currentContactMailSend.contact.email || 'No email';
            const phone = currentContactMailSend.contact.phone || 'No phone';
            return `${contactName} (${email} / ${phone})`;
        }

        const rawContactValue = currentContactMailSend?.contact_id || currentContactMailSend?.contactId;
        const contactIds = Array.isArray(rawContactValue)
            ? rawContactValue.map((value) => resolveId(value)).filter(Boolean)
            : [resolveId(rawContactValue)].filter(Boolean);

        if (contactIds.length === 0) return 'N/A';

        const labels = contactIds
            .map((contactId) => {
                const contact = (Array.isArray(contacts) ? contacts : []).find((item) => (item._id || item.id) === contactId);
                if (!contact) return null;
                const fullName = `${contact.fname || ''} ${contact.lname || ''}`.trim();
                const contactName = fullName || contact.email || 'N/A';
                const email = contact.email || 'No email';
                const phone = contact.phone || 'No phone';
                return `${contactName} (${email} / ${phone})`;
            })
            .filter(Boolean);

        return labels.length > 0 ? labels.join(', ') : 'N/A';
    };

    const getContactMailLabel = () => {
        if (currentContactMailSend?.contact_mail && typeof currentContactMailSend.contact_mail === 'object') {
            return currentContactMailSend.contact_mail.subject || currentContactMailSend.contact_mail.full_name || 'N/A';
        }

        const mailId = resolveId(currentContactMailSend?.mail_id || currentContactMailSend?.contact_mail_id || currentContactMailSend?.contactMailId);
        const mail = (Array.isArray(contactMails) ? contactMails : []).find((item) => (item._id || item.id) === mailId);
        return mail ? (mail.subject || mail.full_name || 'N/A') : 'N/A';
    };

    const getMessageValue = () => {
        if (currentContactMailSend?.message) return currentContactMailSend.message;
        if (currentContactMailSend?.contact_mail && typeof currentContactMailSend.contact_mail === 'object') {
            return currentContactMailSend.contact_mail.message || currentContactMailSend.contact_mail.desc || 'N/A';
        }

        const mailId = resolveId(currentContactMailSend?.mail_id || currentContactMailSend?.contact_mail_id || currentContactMailSend?.contactMailId);
        const mail = (Array.isArray(contactMails) ? contactMails : []).find((item) => (item._id || item.id) === mailId);
        return mail ? (mail.message || mail.desc || 'N/A') : 'N/A';
    };

    const handleBack = () => {
        router.push('/admin/contact-mail-send');
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading contact mail send details...</p>
                </div>
            </div>
        );
    }

    if (!currentContactMailSend) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaEnvelope className="empty-icon" />
                    <h3>Contact mail send not found</h3>
                    <p>The contact mail send record you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Contact Mail Send
                    </button>
                </div>
            </div>
        );
    }

    const InfoRow = ({ label, value, multiline = false }) => {
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                {multiline ? (
                    <textarea
                        className="form-value form-textarea"
                        value={value || 'N/A'}
                        readOnly
                        rows="4"
                        style={{ resize: 'none', backgroundColor: '#f8f9fa', cursor: 'default', height: '600px', minHeight: '600px' }}
                    />
                ) : (
                    <div className="form-value">{value || 'N/A'}</div>
                )}
            </div>
        );
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> Back to Contact Mail Send
                </button>
                <div>
                    <h1 className="page-title">View Contact Mail Send</h1>
                    <p className="page-subtitle">Contact mail send details and information</p>
                </div>
            </div>

            <div className="contact-card">
                <div className="form-section">
                    <h2 className="section-title">
                        <FaEnvelope style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                        Contact Mail Send Information
                    </h2>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Contact" value={getContactLabel()} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Contact Mail" value={getContactMailLabel()} />
                        </div>
                    </div>

                    <InfoRow label="Mail Body" value={getMessageValue()} multiline={true} />
                </div>
            </div>
        </div>
    );
};

export default ShowContactMailSend;
