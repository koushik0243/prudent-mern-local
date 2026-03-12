"use client";

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { changePassword } from "@/redux/slices/userSlice";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";
import { FaLock } from 'react-icons/fa';
import './ChangePassword.css';

const ChangePassword = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error } = useAppSelector((state) => state.user);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [validationError, setValidationError] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        // Get user ID from localStorage or currentUser
        const token = localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login first');
            router.push('/admin/login');
            return;
        }

        // Decode token to extract userId
        const decoded = jwtDecode(token);

        if (decoded?._id) {
            setUserId(decoded._id);
        } else {
            toast.error("Invalid token: user ID missing");
        }

        // You might want to get the user ID from the token or from Redux state
        // For now, assuming you store userId in localStorage
        // const storedUserId = localStorage.getItem('userId');
        // if (storedUserId) {
        //     setUserId(storedUserId);
        // } else {
        //     // If you have user info in Redux state, use that
        //     // Otherwise, you might need to decode the token to get user ID
        //     toast.error('User ID not found');
        // }
    }, [router]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError('');
        }
    };

    const validateForm = () => {
        if (!formData.password) {
            setValidationError('Password is required');
            return false;
        }

        if (formData.password.length < 6) {
            setValidationError('Password must be at least 6 characters long');
            return false;
        }

        if (!formData.confirmPassword) {
            setValidationError('Confirm password is required');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setValidationError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!userId) {
            toast.error('User ID not found. Please login again.');
            return;
        }

        try {
            await dispatch(changePassword({
                id: userId,
                passwordData: {
                    password: formData.password,
                    confirm_password: formData.confirmPassword,
                    is_admin: 1
                }
            })).unwrap();

            toast.success('Password changed successfully');

            // Clear form
            setFormData({
                password: '',
                confirmPassword: ''
            });

            // Optionally redirect to dashboard or logout
            // router.push('/admin/dashboard');
        } catch (err) {
            toast.error(err || 'Failed to change password');
        }
    };

    return (
        <div className="change-password-container">
            <div className="change-password-header">
                <h1 className="page-title">Change Password</h1>
                <p className="page-subtitle">Update your account password</p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="cp-form-section">
                        <h2 className="cp-section-title">
                            <FaLock style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Password Information
                        </h2>

                        <div className="cp-form-row">
                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    New Password <span className="required">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="cp-form-input"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter new password"
                                    disabled={loading}
                                    required
                                />
                                <small className="cp-form-hint">Password must be at least 6 characters</small>
                            </div>

                            <div className="cp-form-group">
                                <label className="cp-form-label">
                                    Confirm Password <span className="required">*</span>
                                </label>
                                <input
                                    type="password"
                                    className="cp-form-input"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter new password"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {validationError && (
                            <div className="cp-alert-danger">
                                {validationError}
                            </div>
                        )}
                    </div>

                    <div className="cp-form-actions">
                        <button
                            type="submit"
                            className="cp-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                                    Changing...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
