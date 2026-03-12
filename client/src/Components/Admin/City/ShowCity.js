'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCityById, clearCurrentCity } from '@/redux/slices/citySlice';
import { FaCity, FaArrowLeft, FaEdit } from 'react-icons/fa';
import '../TagManagers/ShowTagManager.css';

const ShowCity = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentCity, loading } = useAppSelector((state) => state.cityMaster);

    useEffect(() => {
        if (id) {
            dispatch(fetchCityById(id));
        }

        return () => {
            dispatch(clearCurrentCity());
        };
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/city');
    };

    const handleEdit = () => {
        router.push(`/admin/city/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading city details...</p>
                </div>
            </div>
        );
    }

    if (!currentCity) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaCity className="empty-icon" />
                    <h3>City not found</h3>
                    <p>The city you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Cities
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
                    <FaArrowLeft /> Back to Cities
                </button>
                <div>
                    <h1 className="page-title">View City</h1>
                    <p className="page-subtitle">City details and information</p>
                </div>
            </div>

            <div className="contact-card">
                <InfoSection title="City Information" icon={FaCity}>
                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="City Name" value={currentCity.name} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InfoRow label="Country Name" value={currentCity.country_name || currentCity.countryName || currentCity.country?.name} />
                        </div>
                    </div>
                </InfoSection>

                <div className="form-actions">
                    <button className="btn-primary" onClick={handleEdit}>
                        <FaEdit /> Edit City
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowCity;
