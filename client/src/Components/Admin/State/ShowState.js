'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchStateById } from '@/redux/slices/stateSlice';
import { FaMapMarkedAlt, FaArrowLeft, FaEdit } from 'react-icons/fa';
import '../TagManagers/ShowTagManager.css';

const ShowState = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentState, loading } = useAppSelector((state) => state.stateMaster);

    useEffect(() => {
        if (id) {
            dispatch(fetchStateById(id));
        }
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/state');
    };

    const handleEdit = () => {
        router.push(`/admin/state/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading state details...</p>
                </div>
            </div>
        );
    }

    if (!currentState) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaMapMarkedAlt className="empty-icon" />
                    <h3>State not found</h3>
                    <p>The state you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to States
                    </button>
                </div>
            </div>
        );
    }

    const InfoRow = ({ label, value }) => {
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                <div className="form-value">{value || 'N/A'}</div>
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
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> Back to States
                </button>
                <div>
                    <h1 className="page-title">View State</h1>
                    <p className="page-subtitle">State details and information</p>
                </div>
            </div>

            <div className="contact-card">
                <InfoSection title="State Information" icon={FaMapMarkedAlt}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="State Name" value={currentState.name} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Phonecode" value={currentState.phonecode} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="ISO3" value={currentState.iso3} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="ISO2" value={currentState.iso2} />
                        </div>
                    </div>
                </InfoSection>

                <div className="form-actions">
                    <button className="btn-primary" onClick={handleEdit}>
                        <FaEdit /> Edit State
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowState;
