'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCountryById, updateCountry } from '@/redux/slices/countrySlice';
import toast from 'react-hot-toast';
import { FaGlobe, FaArrowLeft } from 'react-icons/fa';
import '../TagManagers/EditTagManager.css';

const EditCountry = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentCountry, loading } = useAppSelector((state) => state.country);

    const [formData, setFormData] = useState({
        name: '',
        phonecode: '',
        iso3: '',
        iso2: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            dispatch(fetchCountryById(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (currentCountry) {
            setFormData({
                name: currentCountry.name || '',
                phonecode: currentCountry.phonecode || '',
                iso3: currentCountry.iso3 || '',
                iso2: currentCountry.iso2 || ''
            });
        }
    }, [currentCountry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Country name is required';
        }

        if (formData.phonecode && !/^\d{1,5}$/.test(formData.phonecode)) {
            newErrors.phonecode = 'Phonecode must be digits only and maximum 5 digits';
        }

        if (formData.iso3 && formData.iso3.length > 5) {
            newErrors.iso3 = 'ISO3 must be maximum 5 characters';
        }

        if (formData.iso2 && formData.iso2.length > 5) {
            newErrors.iso2 = 'ISO2 must be maximum 5 characters';
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
            await dispatch(updateCountry({ id, countryData: formData })).unwrap();
            toast.success('Country updated successfully');
            router.push('/admin/country');
        } catch (err) {
            toast.error(err || 'Failed to update country');
        }
    };

    const handleCancel = () => {
        router.push('/admin/country');
    };

    if (loading && !currentCountry) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading country...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Countries
                </button>
                <div>
                    <h1 className="page-title">Edit Country</h1>
                    <p className="page-subtitle">Update country information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaGlobe style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Country Information
                        </h2>

                        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Country Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="Enter country name"
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phonecode</label>
                                <input
                                    type="text"
                                    name="phonecode"
                                    value={formData.phonecode}
                                    onChange={handleChange}
                                    className={`form-input ${errors.phonecode ? 'error' : ''}`}
                                    placeholder="Enter phonecode"
                                    maxLength={5}
                                />
                                {errors.phonecode && <span className="error-message">{errors.phonecode}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">ISO3</label>
                                <input
                                    type="text"
                                    name="iso3"
                                    value={formData.iso3}
                                    onChange={handleChange}
                                    className={`form-input ${errors.iso3 ? 'error' : ''}`}
                                    placeholder="Enter ISO3"
                                    maxLength={5}
                                />
                                {errors.iso3 && <span className="error-message">{errors.iso3}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">ISO2</label>
                                <input
                                    type="text"
                                    name="iso2"
                                    value={formData.iso2}
                                    onChange={handleChange}
                                    className={`form-input ${errors.iso2 ? 'error' : ''}`}
                                    placeholder="Enter ISO2"
                                    maxLength={5}
                                />
                                {errors.iso2 && <span className="error-message">{errors.iso2}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-primary-custom"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Country'}
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

export default EditCountry;
