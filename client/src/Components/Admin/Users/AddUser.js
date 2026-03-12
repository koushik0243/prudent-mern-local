'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createUser } from '@/redux/slices/userSlice';
import toast from 'react-hot-toast';
import { FaUser, FaBriefcase, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import './AddUser.css';

const AddUser = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.user);

    // Calculate max date (18 years ago from today)
    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        alternate_phone: '',
        designation: '',
        department: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        zipcode: '',
        bio: '',
        status: 'active',
        linkedin: '',
        twitter: '',
        facebook: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        dob: '',
        gender: ''
    });

    const [errors, setErrors] = useState({});

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
            newErrors.full_name = 'Full Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
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
            const payload = { ...formData };

            if (!payload.gender || !payload.gender.trim()) {
                delete payload.gender;
            } else {
                payload.gender = payload.gender.trim().toLowerCase();
            }

            if (payload.status && payload.status.trim()) {
                payload.status = payload.status.trim().toLowerCase();
            }

            Object.keys(payload).forEach((key) => {
                if (payload[key] === '') {
                    delete payload[key];
                }
            });

            await dispatch(createUser(payload)).unwrap();
            toast.success('User created successfully');
            router.push('/admin/users');
        } catch (err) {
            toast.error(err || 'Failed to create user');
        }
    };

    const handleCancel = () => {
        router.push('/admin/users');
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Users
                </button>
                <div>
                    <h1 className="page-title">Add New User</h1>
                    <p className="page-subtitle">Create a new user account</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaUser style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Personal Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Full Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className={`form-input ${errors.full_name ? 'error' : ''}`}
                                    placeholder="Enter full name"
                                    disabled={loading}
                                />
                                {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="Enter email address"
                                    disabled={loading}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Phone <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`form-input ${errors.phone ? 'error' : ''}`}
                                    placeholder="Enter phone number"
                                    disabled={loading}
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Alternate Phone</label>
                                <input
                                    type="tel"
                                    name="alternate_phone"
                                    value={formData.alternate_phone}
                                    onChange={handleChange}
                                    className={`form-input ${errors.alternate_phone ? 'error' : ''}`}
                                    placeholder="Enter alternate phone"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Password <span className="required">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`form-input ${errors.password ? 'error' : ''}`}
                                    placeholder="Enter password"
                                    disabled={loading}
                                />
                                {errors.password && <span className="error-text">{errors.password}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="form-input"
                                    max={getMaxDate()}
                                    disabled={loading}
                                    title="User must be at least 18 years old"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={loading}
                                >
                                    <option value="male" selected>Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter bio"
                                    rows="3"
                                    disabled={loading}
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="form-input"
                                    disabled={loading}
                                >
                                    <option value="active" selected>Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    {/* Work Information */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaBriefcase style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Work Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Designation</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter designation"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter department"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    {/* Address Information */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaMapMarkerAlt style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Address Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address1"
                                    value={formData.address1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Street address"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address Line 2</label>
                                <input
                                    type="text"
                                    name="address2"
                                    value={formData.address2}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Apartment, suite, etc."
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter city"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter state"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter country"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Zipcode</label>
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter zipcode"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    {/* Social Links */}
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaUser style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Social Links & Emergency Contact
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">LinkedIn</label>
                                <input
                                    type="url"
                                    name="linkedin"
                                    value={formData.linkedin}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="LinkedIn profile URL"
                                    disabled={loading}
                                />
                            </div>
  
                            <div className="form-group">
                                <label className="form-label">Twitter</label>
                                <input
                                    type="url"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Twitter profile URL"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Facebook</label>
                                <input
                                    type="url"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Facebook profile URL"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Emergency Contact Name</label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter emergency contact name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Emergency Contact Phone</label>
                                <input
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter emergency contact phone"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddUser;
