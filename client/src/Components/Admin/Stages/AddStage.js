'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createStage, fetchStages } from '@/redux/slices/stagesSlice';
import toast from 'react-hot-toast';
import { FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import './AddStage.css';

const AddStage = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { stages, loading } = useAppSelector((state) => state.stages);

    const [formData, setFormData] = useState({
        name: '',
        desc: '',
        status: 'active'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!Array.isArray(stages) || stages.length === 0) {
            dispatch(fetchStages());
        }
    }, [dispatch, stages]);

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
            let totalRecords = Array.isArray(stages) ? stages.length : 0;

            if (totalRecords === 0) {
                const stagesResponse = await dispatch(fetchStages()).unwrap();
                totalRecords = Array.isArray(stagesResponse) ? stagesResponse.length : 0;
            }

            await dispatch(
                createStage({
                    ...formData,
                    sort_order: totalRecords + 1,
                })
            ).unwrap();
            toast.success('Stage created successfully');
            router.push('/admin/stages');
        } catch (err) {
            toast.error(err || 'Failed to create stage');
        }
    };

    const handleCancel = () => {
        router.push('/admin/stages');
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Stages
                </button>
                <div>
                    <h1 className="page-title">Add New Stage</h1>
                    <p className="page-subtitle">Create a new stage entry</p>
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
                        {loading ? 'Creating...' : 'Create Stage'}
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

export default AddStage;
