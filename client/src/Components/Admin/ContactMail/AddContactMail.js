'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { createContactMail } from '@/redux/slices/contactMailSlice';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import '../TagManagers/AddTagManager.css';

const AddContactMail = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state) => state.contactMail);
    const [userId, setUserId] = useState('');

    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded?._id) {
                    setUserId(decoded._id);
                }
            } catch (err) {
                console.error('Token decode error:', err);
                toast.error('Session expired. Please login again.');
                router.push('/admin/login');
            }
        }
    }, [router]);

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

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
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

        if (!userId) {
            toast.error('User session not found. Please login again.');
            return;
        }

        try {
            const payload = {
                ...formData,
                user_id: userId,
            };
            await dispatch(createContactMail(payload)).unwrap();
            toast.success('Contact mail created successfully');
            router.push('/admin/contact-mail');
        } catch (err) {
            toast.error(err || 'Failed to create contact mail');
        }
    };

    const handleCancel = () => {
        router.push('/admin/contact-mail');
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Contact Mail
                </button>
                <div>
                    <h1 className="page-title">Add Contact Mail Template</h1>
                    <p className="page-subtitle">Create a new contact mail entry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-card">
                    <div className="form-section">
                        {/* <h2 className="section-title">
                            <FaEnvelope style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Contact Mail Information
                        </h2> */}

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Subject <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`form-input ${errors.subject ? 'error' : ''}`}
                                    placeholder="Enter subject"
                                />
                                {errors.subject && <span className="error-message">{errors.subject}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mail Body</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="form-textarea"
                                    placeholder="Enter mail body"
                                    style={{ minHeight: '600px' }}
                                    rows="4"
                                />
                                <p className="text-sm text-gray-600 mt-2" style={{ fontSize: "12px" }}>
                                    <strong>Use the below placeholders in the mail body:</strong>
                                    <br />
                                    {'{name}'} - Contact's full name
                                    <br />
                                    {'{email}'} - Contact's email address
                                    <br />
                                    {'{phone}'} - Contact's phone number
                                </p>
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
                        {loading ? 'Creating...' : 'Create Contact Mail Template'}
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

export default AddContactMail;
