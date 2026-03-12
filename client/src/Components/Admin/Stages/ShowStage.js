'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchStageById } from '@/redux/slices/stagesSlice';
import { FaLayerGroup, FaArrowLeft, FaEdit } from 'react-icons/fa';
import './ShowStage.css';

const ShowStage = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentStage, loading } = useAppSelector((state) => state.stages);

    useEffect(() => {
        if (id) {
            dispatch(fetchStageById(id));
        }
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/stages');
    };

    const handleEdit = () => {
        router.push(`/admin/stages/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading stage details...</p>
                </div>
            </div>
        );
    }

    if (!currentStage) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaLayerGroup className="empty-icon" />
                    <h3>Stage not found</h3>
                    <p>The stage you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Stages
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            {/* Header */}
            <div className="show-contact-header">
                <div className="header-actions">
                    <button className="btn-back" onClick={handleBack}>
                        <FaArrowLeft /> Back to Stages
                    </button>
                    <button className="btn-back" onClick={handleEdit}>
                        <FaEdit /> Edit Stage
                    </button>
                </div>
                <div>
                    <h1 className="page-title">View Stage</h1>
                    <p className="page-subtitle">Stage details and information</p>
                </div>
            </div>

            {/* Stage Card */}
            <div className="contact-card">
                <div className="contact-header">
                    <div className="contact-title">
                        <h1>{currentStage.name || 'Stage'}</h1>
                    </div>

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaLayerGroup style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Stage Information
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Stage Name</label>
                                    <div className="info-value">{currentStage.name || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Status</label>
                                    <div className="info-value">{currentStage.status || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Sort Order</label>
                                    <div className="info-value">{currentStage.sort_order ?? 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Description</label>
                                    <div className="info-value">{currentStage.desc || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ShowStage;
