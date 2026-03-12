'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCityById, updateCity, clearCurrentCity } from '@/redux/slices/citySlice';
import { fetchCountries } from '@/redux/slices/countrySlice';
import { fetchStates } from '@/redux/slices/stateSlice';
import toast from 'react-hot-toast';
import { FaCity, FaArrowLeft } from 'react-icons/fa';
import '../TagManagers/EditTagManager.css';

const EditCity = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentCity, loading } = useAppSelector((state) => state.cityMaster);
    const { countries } = useAppSelector((state) => state.country);
    const { states } = useAppSelector((state) => state.stateMaster);

    const [formData, setFormData] = useState({
        country_id: '',
        state_id: '',
        name: '',
    });

    const [errors, setErrors] = useState({});
    const countriesArray = Array.isArray(countries) ? countries : [];
    const statesArray = Array.isArray(states) ? states : [];

    const selectedCountry = useMemo(() => {
        if (!formData.country_id) return null;
        return countriesArray.find((country) => (
            String(country.id) === String(formData.country_id) ||
            String(country._id) === String(formData.country_id)
        ));
    }, [countriesArray, formData.country_id]);

    const filteredStates = useMemo(() => {
        if (!formData.country_id) return [];

        const selectedCountryIds = [
            formData.country_id,
            selectedCountry?.id,
            selectedCountry?._id,
        ]
            .filter((value) => value !== undefined && value !== null && value !== '')
            .map((value) => String(value));

        const selectedCountryName = (selectedCountry?.name || '').toLowerCase();

        return statesArray.filter((item) => {
            const relatedCountryIds = [
                item.country_id,
                item.countryId,
                item.country?.id,
                item.country?._id,
                item.country_ref,
                item.country_ref_id,
            ]
                .filter((value) => value !== undefined && value !== null && value !== '')
                .map((value) => String(value));

            const relatedCountryNames = [
                item.country_name,
                item.countryName,
                item.country?.name,
            ]
                .filter((value) => typeof value === 'string' && value.trim())
                .map((value) => value.toLowerCase());

            const matchesById = relatedCountryIds.some((value) => selectedCountryIds.includes(value));
            const matchesByName = selectedCountryName && relatedCountryNames.includes(selectedCountryName);

            return matchesById || matchesByName;
        });
    }, [formData.country_id, selectedCountry, statesArray]);

    useEffect(() => {
        if (id) {
            dispatch(fetchCityById(id));
        }
        dispatch(fetchCountries());
        dispatch(fetchStates());

        return () => {
            dispatch(clearCurrentCity());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (currentCity) {
            setFormData({
                name: currentCity.name || '',
                country_id: currentCity.country_id || currentCity.countryId || currentCity.country?.id || '',
                state_id: currentCity.state_id || currentCity.stateId || currentCity.state?.id || ''
            });
        }
    }, [currentCity]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'country_id') {
            setFormData((prev) => ({
                ...prev,
                country_id: value,
                state_id: '',
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value
            }));
        }

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

        if (!formData.state_id) {
            newErrors.state_id = 'State is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'City name is required';
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
            const normalizedStateId = Number.isNaN(Number(formData.state_id))
                ? formData.state_id
                : Number(formData.state_id);

            await dispatch(updateCity({
                id,
                cityData: {
                    name: formData.name,
                    country_id: normalizedCountryId,
                    countryId: normalizedCountryId,
                    state_id: normalizedStateId,
                    stateId: normalizedStateId,
                }
            })).unwrap();
            toast.success('City updated successfully');
            router.push('/admin/city');
        } catch (err) {
            toast.error(err || 'Failed to update city');
        }
    };

    const handleCancel = () => {
        router.push('/admin/city');
    };

    if (loading && !currentCity) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading city...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Cities
                </button>
                <div>
                    <h1 className="page-title">Edit City</h1>
                    <p className="page-subtitle">Update city information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaCity style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            City Information
                        </h2>

                        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
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
                                <select
                                    name="state_id"
                                    value={formData.state_id}
                                    onChange={handleChange}
                                    className={`form-input ${errors.state_id ? 'error' : ''}`}
                                    disabled={!formData.country_id}
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
                                    <option value="">Select State</option>
                                    {filteredStates.map((item) => (
                                        <option key={item._id || item.id} value={item.id || item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.state_id && <span className="error-message">{errors.state_id}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    City <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                    placeholder="Enter city name"
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
                        {loading ? 'Updating...' : 'Update City'}
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

export default EditCity;
