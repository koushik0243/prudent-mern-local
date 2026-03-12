'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContactMailById, clearCurrentContactMail } from '@/redux/slices/contactMailSlice';
import { FaEnvelope, FaArrowLeft, FaEdit } from 'react-icons/fa';
import '../TagManagers/ShowTagManager.css';

const ShowContactMail = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentContactMail, loading } = useAppSelector((state) => state.contactMail);

    useEffect(() => {
        if (id) {
            dispatch(fetchContactMailById(id));
        }
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/contact-mail');
    };

    const handleEdit = () => {
        router.push(`/admin/contact-mail/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading contact mail details...</p>
                </div>
            </div>
        );
    }

    if (!currentContactMail) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaEnvelope className="empty-icon" />
                    <h3>Contact mail not found</h3>
                    <p>The contact mail record you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Contact Mail
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

    const InfoSection = ({ title, icon: Icon, children }) => {
        return (
            <div className="form-section">
                <h2 className="section-title">
                    {Icon && <Icon style={{ marginRight: '0.5rem', color: '#b6110f' }} />}
                    {title}
                </h2>
                {children}
            </div>
        );
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                    <button className="btn-back" style={{ marginBottom: 0 }} onClick={handleBack}>
                        <FaArrowLeft /> Back to Contact Mail
                    </button>
                    <button className="btn-back" style={{ marginBottom: 0 }} onClick={handleEdit}>
                        <FaEdit /> Edit Contact Mail
                    </button>
                </div>
                <div>
                    <h1 className="page-title">View Contact Mail</h1>
                    <p className="page-subtitle">Contact mail details and information</p>
                </div>
            </div>

            <div className="contact-card">
                <InfoSection title="Contact Mail Information" icon={FaEnvelope}>
                    <InfoRow label="Subject" value={currentContactMail.subject || currentContactMail.full_name} />
                    <br />
                    <InfoRow label="Mail Body" value={currentContactMail.message || currentContactMail.desc} multiline={true} />
                </InfoSection>
            </div>
        </div>
    );
};

export default ShowContactMail;
