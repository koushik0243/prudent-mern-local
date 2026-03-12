'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTagManagerById, clearCurrentTagManager } from '@/redux/slices/tagManagerSlice';
import { FaTags, FaArrowLeft, FaEdit } from 'react-icons/fa';
import './ShowTagManager.css';

const ShowTagManager = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentTagManager, loading } = useAppSelector((state) => state.tagManager);

    useEffect(() => {
        if (id) {
            dispatch(fetchTagManagerById(id));
        }

        return () => {
            dispatch(clearCurrentTagManager());
        };
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/tag-managers');
    };

    const handleEdit = () => {
        router.push(`/admin/tag-managers/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading tag manager details...</p>
                </div>
            </div>
        );
    }

    if (!currentTagManager) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaTags className="empty-icon" />
                    <h3>Tag manager not found</h3>
                    <p>The tag manager you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Tag Managers
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
                        style={{ resize: 'none', backgroundColor: '#f8f9fa', cursor: 'default' }}
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
            {/* Header */}
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> Back to Tag Managers
                </button>
                <div>
                    <h1 className="page-title">View Tag Manager</h1>
                    <p className="page-subtitle">Tag manager details and information</p>
                </div>
            </div>

            {/* Tag Card */}
            <div className="contact-card">
                {/* Tag Information */}
                <InfoSection title="Tag Information" icon={FaTags}>
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Tag Name" value={currentTagManager.full_name} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Description" value={currentTagManager.desc} multiline={true} />
                        </div>
                    </div>
                </InfoSection>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button className="btn-primary" onClick={handleEdit}>
                        <FaEdit /> Edit Tag
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowTagManager;
