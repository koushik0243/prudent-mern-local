'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCountryById } from '@/redux/slices/countrySlice';
import { FaGlobe, FaArrowLeft, FaEdit } from 'react-icons/fa';
import '../TagManagers/ShowTagManager.css';

const ShowCountry = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentCountry, loading } = useAppSelector((state) => state.country);

    useEffect(() => {
        if (id) {
            dispatch(fetchCountryById(id));
        }
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/country');
    };

    const handleEdit = () => {
        router.push(`/admin/country/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading country details...</p>
                </div>
            </div>
        );
    }

    if (!currentCountry) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaGlobe className="empty-icon" />
                    <h3>Country not found</h3>
                    <p>The country you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Countries
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
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> Back to Countries
                </button>
                <div>
                    <h1 className="page-title">View Country</h1>
                    <p className="page-subtitle">Country details and information</p>
                </div>
            </div>

            <div className="contact-card">
                <InfoSection title="Country Information" icon={FaGlobe}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Country Name" value={currentCountry.name} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Phonecode" value={currentCountry.phonecode} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="ISO3" value={currentCountry.iso3} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="ISO2" value={currentCountry.iso2} />
                        </div>
                    </div>
                </InfoSection>

                <div className="form-actions">
                    <button className="btn-primary" onClick={handleEdit}>
                        <FaEdit /> Edit Country
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowCountry;
