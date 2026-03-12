'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchStageById, fetchStages, updateStage } from '@/redux/slices/stagesSlice';
import toast from 'react-hot-toast';
import { FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import './EditStage.css';

const EditStage = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentStage, stages, loading } = useAppSelector((state) => state.stages);
    const totalStageRecords = Array.isArray(stages) ? stages.length : 0;
    const sortOrderOptions = Array.from({ length: totalStageRecords }, (_, index) => String(index + 1));

    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        status: 'active',
        sort_order: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            dispatch(fetchStageById(id));
            dispatch(fetchStages());
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentStage) {
            setFormData({
                name: currentStage.name || '',
                desc: currentStage.desc || '',
                status: currentStage.status || 'active',
                sort_order: currentStage.sort_order !== null && currentStage.sort_order !== undefined
                    ? String(currentStage.sort_order)
                    : ''
            });
        }
    }, [currentStage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Stage name is required';
        }

        if (!formData.desc.trim()) {
            newErrors.desc = 'Description is required';
        }

        if (!formData.sort_order) {
            newErrors.sort_order = 'Sort order is required';
        } else {
            const selectedSortOrder = Number(formData.sort_order);
            if (!Number.isInteger(selectedSortOrder) || selectedSortOrder < 1 || selectedSortOrder > totalStageRecords) {
                newErrors.sort_order = `Sort order must be between 1 and ${totalStageRecords}`;
            }
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

        try {
            await dispatch(updateStage({
                id,
                stageData: {
                    ...formData,
                    sort_order: Number(formData.sort_order),
                },
            })).unwrap();
            toast.success('Stage updated successfully');
            router.push('/admin/stages');
        } catch (err) {
            toast.error(err || 'Failed to update stage');
        }
    };

    const handleCancel = () => {
        router.push('/admin/stages');
    };

    if (loading && !currentStage) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading stage...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Stages
                </button>
                <div>
                    <h1 className="page-title">Edit Stage</h1>
                    <p className="page-subtitle">Update stage information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                {/* Stage Information */}
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaLayerGroup style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Stage Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label className="form-label">
                                        Stage Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`form-input ${errors.name ? 'error' : ''}`}
                                        placeholder="Enter stage name"
                                    />
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>
                                <div>
                                    <label className="form-label">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">
                                        Sort Order
                                    </label>
                                    <select
                                        name="sort_order"
                                        value={formData.sort_order}
                                        onChange={handleChange}
                                        className={`form-input ${errors.sort_order ? 'error' : ''}`}
                                    >
                                        <option value="">Select sort order</option>
                                        {sortOrderOptions.map((optionValue) => (
                                            <option key={optionValue} value={optionValue}>
                                                {optionValue}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sort_order && <span className="error-message">{errors.sort_order}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Description <span className="required">*</span>
                                </label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleChange}
                                    className={`form-textarea ${errors.desc ? 'error' : ''}`}
                                    placeholder="Enter stage description"
                                    rows="4"
                                />
                                {errors.desc && <span className="error-message">{errors.desc}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary-custom"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Stage'}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary-custom"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditStage;
