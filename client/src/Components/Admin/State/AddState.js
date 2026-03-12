'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createState } from '@/redux/slices/stateSlice';
import { fetchCountries } from '@/redux/slices/countrySlice';
import toast from 'react-hot-toast';
import { FaMapMarkedAlt, FaArrowLeft } from 'react-icons/fa';
import '../TagManagers/AddTagManager.css';

const AddState = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.stateMaster);
    const { countries } = useAppSelector((state) => state.country);

    const [formData, setFormData] = useState({
        country_id: '',
        name: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!Array.isArray(countries) || countries.length === 0) {
            dispatch(fetchCountries());
        }
    }, [dispatch, countries]);

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

        if (!formData.country_id) {
            newErrors.country_id = 'Country is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'State name is required';
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
            const normalizedCountryId = Number.isNaN(Number(formData.country_id))
                ? formData.country_id
                : Number(formData.country_id);

            await dispatch(createState({
                name: formData.name,
                country_id: normalizedCountryId,
                countryId: normalizedCountryId,
            })).unwrap();
            toast.success('State created successfully');
            router.push('/admin/state');
        } catch (err) {
            toast.error(err || 'Failed to create state');
        }
    };

    const handleCancel = () => {
        router.push('/admin/state');
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to States
                </button>
                <div>
                    <h1 className="page-title">Add New State</h1>
                    <p className="page-subtitle">Create a new state entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaMapMarkedAlt style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            State Information
                        </h2>

                        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                                <label className="form-label">
                                    Country <span className="required">*</span>
                                </label>
                                <select
                                    name="country_id"
                                    value={formData.country_id}
                                    onChange={handleChange}
                                    className={`form-input ${errors.country_id ? 'error' : ''}`}
                                    style={{
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        MozAppearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'%3E%3Cpath fill=\'%236c757d\' d=\'M5 6 0 0h10z\'/%3E%3C/svg%3E")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '10px 6px',
                                        paddingRight: '2rem',
                                        height: '40px',
                                    }}
                                >
                                    <option value="">Select Country</option>
                                    {(Array.isArray(countries) ? countries : []).map((country) => (
                                        <option key={country._id || country.id} value={country.id}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.country_id && <span className="error-message">{errors.country_id}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    State <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="Enter state name"
                                    style={{ height: '40px' }}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
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
                        {loading ? 'Creating...' : 'Create State'}
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

export default AddState;
