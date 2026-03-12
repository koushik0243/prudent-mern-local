'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTagManagerById, updateTagManager, clearCurrentTagManager } from '@/redux/slices/tagManagerSlice';
import toast from 'react-hot-toast';
import { FaTags, FaArrowLeft } from 'react-icons/fa';
import './EditTagManager.css';

const EditTagManager = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentTagManager, loading } = useAppSelector((state) => state.tagManager);

    const [formData, setFormData] = useState({
        full_name: '',
        desc: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            dispatch(fetchTagManagerById(id));
        }

        return () => {
            dispatch(clearCurrentTagManager());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (currentTagManager) {
            setFormData({
                full_name: currentTagManager.full_name || '',
                desc: currentTagManager.desc || ''
            });
        }
    }, [currentTagManager]);

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

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Tag name is required';
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
            await dispatch(updateTagManager({ id, tagManagerData: formData })).unwrap();
            toast.success('Tag manager updated successfully');
            router.push('/admin/tag-managers');
        } catch (err) {
            toast.error(err || 'Failed to update tag manager');
        }
    };

    const handleCancel = () => {
        router.push('/admin/tag-managers');
    };

    if (loading && !currentTagManager) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading tag manager...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Tag Managers
                </button>
                <div>
                    <h1 className="page-title">Edit Tag</h1>
                    <p className="page-subtitle">Update tag manager information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                {/* Tag Information */}
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaTags style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Tag Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Tag Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.full_name ? 'error' : ''}`}
                                    placeholder="Enter tag name"
                                />
                                {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Description
                                </label>
                                <textarea
                                    name="desc"
                                    value={formData.desc}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Enter tag description"
                                    rows="4"
                                />
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
                        {loading ? 'Updating...' : 'Update Tag'}
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

export default EditTagManager;
