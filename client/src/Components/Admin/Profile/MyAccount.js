"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { jwtDecode } from "jwt-decode";
import { FaUser, FaEnvelope, FaPhone, FaArrowLeft, FaBriefcase, FaMapMarkerAlt, FaGlobe, FaLinkedin, FaTwitter, FaFacebook, FaCalendar } from 'react-icons/fa';
import apiServiceHandler from '@/service/apiService';
import './MyAccount.css';

const MyAccount = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState('');
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
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
        status: '',
        linkedin: '',
        twitter: '',
        facebook: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        date_of_birth: '',
        gender: ''
    });

    useEffect(() => {
        // Get user ID from token and fetch profile
        const token = localStorage.getItem('adminToken');
        if (!token) {
            toast.error('Please login first');
            router.push('/admin/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded?._id) {
                setUserId(decoded._id);
                fetchUserProfile(decoded._id);
            } else {
                toast.error("Invalid token");
                router.push('/admin/login');
            }
        } catch (error) {
            toast.error("Error decoding token");
            router.push('/admin/login');
        }
    }, [router]);

    // Helper function to format date for input[type="date"]
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (error) {
            return '';
        }
    };

    const fetchUserProfile = async (id) => {
        try {
            setLoading(true);
            const response = await apiServiceHandler('GET', `user/edit/${id}`);
            
            console.log('Profile API Response:', response);
            
            // Handle different response formats
            let userData = null;
            if (response && response.data) {
                userData = response.data;
            } else if (response && response.result) {
                userData = response.result;
            } else if (response && response._id) {
                // Direct user object
                userData = response;
            }
            
            if (userData) {
                console.log('User Data:', userData);
                setFormData({
                    full_name: userData.full_name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    alternate_phone: userData.alternate_phone || '',
                    designation: userData.designation || '',
                    department: userData.department || '',
                    address1: userData.address1 || '',
                    address2: userData.address2 || '',
                    city: userData.city || '',
                    state: userData.state || '',
                    country: userData.country || '',
                    zipcode: userData.zipcode || '',
                    bio: userData.bio || '',
                    status: userData.status || '',
                    linkedin: userData.linkedin || '',
                    twitter: userData.twitter || '',
                    facebook: userData.facebook || '',
                    emergency_contact_name: userData.emergency_contact_name || '',
                    emergency_contact_phone: userData.emergency_contact_phone || '',
                    date_of_birth: formatDateForInput(userData.date_of_birth),
                    gender: userData.gender || ''
                });
            } else {
                console.error('No user data found in response');
                toast.error('Failed to load profile data');
            }
        } catch (error) {
            toast.error('Failed to fetch profile');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        if (!formData.full_name || !formData.full_name.trim()) {
            toast.error('Full Name is required');
            return false;
        }

        if (!formData.email || !formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        if (!formData.phone || !formData.phone.trim()) {
            toast.error('Phone is required');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            console.log('Submitting form data:', formData);
            const response = await apiServiceHandler('PUT', `user/update/${userId}`, formData);
            
            console.log('Update response:', response);

            if (response && response.message) {
                toast.success(response.message || 'Profile updated successfully');
                // Refetch profile to get updated data
                fetchUserProfile(userId);
            } else if (response && response.success) {
                toast.success('Profile updated successfully');
                fetchUserProfile(userId);
            } else {
                toast.success('Profile updated successfully');
                fetchUserProfile(userId);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/dashboard');
    };

    return (
        <div id="content-wrapper" className="my-account-page">
            <div className="my-account-container">
                <div className="my-account-header">
                    <div className="header-content">
                        <h1>My Account</h1>
                        <p className="subtitle">Update your profile information</p>
                    </div>
                </div>

                <hr className="section-divider" />

                {loading && !formData.full_name ? (
                    <div className="loading-state">Loading profile...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="my-account-form">
                        {/* Personal Information Section */}
                        <div className="form-section">
                            <h3 className="section-title">Personal Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="full_name">
                                        <FaUser className="label-icon" /> Full Name <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="full_name"
                                        name="full_name"
                                        className="form-control"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FaEnvelope className="label-icon" /> Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="phone">
                                        <FaPhone className="label-icon" /> Phone <span className="required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="form-control"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="alternate_phone">
                                        <FaPhone className="label-icon" /> Alternate Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="alternate_phone"
                                        name="alternate_phone"
                                        className="form-control"
                                        value={formData.alternate_phone}
                                        onChange={handleChange}
                                        placeholder="Enter alternate phone"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date_of_birth">
                                        <FaCalendar className="label-icon" /> Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        className="form-control"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="gender">
                                        <FaUser className="label-icon" /> Gender
                                    </label>
                                    <select
                                        id="gender"
                                        name="gender"
                                        className="form-control"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="bio">
                                        <FaUser className="label-icon" /> Bio
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        className="form-control"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us about yourself"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="status">
                                        <FaUser className="label-icon" /> Status
                                    </label>
                                    <select
                                        id="status"
                                        name="status"
                                        className="form-control"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-group"></div>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        {/* Work Information Section */}
                        <div className="form-section">
                            <h3 className="section-title">Work Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="designation">
                                        <FaBriefcase className="label-icon" /> Designation
                                    </label>
                                    <input
                                        type="text"
                                        id="designation"
                                        name="designation"
                                        className="form-control"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Enter your designation"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="department">
                                        <FaBriefcase className="label-icon" /> Department
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        name="department"
                                        className="form-control"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="Enter your department"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        {/* Address Information Section */}
                        <div className="form-section">
                            <h3 className="section-title">Address Information</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="address1">
                                        <FaMapMarkerAlt className="label-icon" /> Address Line 1
                                    </label>
                                    <input
                                        type="text"
                                        id="address1"
                                        name="address1"
                                        className="form-control"
                                        value={formData.address1}
                                        onChange={handleChange}
                                        placeholder="Street address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address2">
                                        <FaMapMarkerAlt className="label-icon" /> Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        id="address2"
                                        name="address2"
                                        className="form-control"
                                        value={formData.address2}
                                        onChange={handleChange}
                                        placeholder="Apartment, suite, etc."
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">
                                        <FaMapMarkerAlt className="label-icon" /> City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        className="form-control"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">
                                        <FaMapMarkerAlt className="label-icon" /> State/Province
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        className="form-control"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="country">
                                        <FaGlobe className="label-icon" /> Country
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        className="form-control"
                                        value={formData.country}
                                        onChange={handleChange}
                                        placeholder="Enter country"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="zipcode">
                                        <FaMapMarkerAlt className="label-icon" /> ZIP/Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="zipcode"
                                        name="zipcode"
                                        className="form-control"
                                        value={formData.zipcode}
                                        onChange={handleChange}
                                        placeholder="Enter ZIP code"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        {/* Social Links Section */}
                        <div className="form-section">
                            <h3 className="section-title">Social Links</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="social_linkedin">
                                        <FaLinkedin className="label-icon" /> LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        id="linkedin"
                                        name="linkedin"
                                        className="form-control"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        placeholder="LinkedIn profile URL"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="social_twitter">
                                        <FaTwitter className="label-icon" /> Twitter
                                    </label>
                                    <input
                                        type="url"
                                        id="twitter"
                                        name="twitter"
                                        className="form-control"
                                        value={formData.twitter}
                                        onChange={handleChange}
                                        placeholder="Twitter profile URL"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="social_facebook">
                                        <FaFacebook className="label-icon" /> Facebook
                                    </label>
                                    <input
                                        type="url"
                                        id="facebook"
                                        name="facebook"
                                        className="form-control"
                                        value={formData.facebook}
                                        onChange={handleChange}
                                        placeholder="Facebook profile URL"
                                    />
                                </div>
                                <div className="form-group"></div>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        {/* Emergency Contact Section */}
                        <div className="form-section">
                            <h3 className="section-title">Emergency Contact</h3>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="emergency_contact_name">
                                        <FaUser className="label-icon" /> Emergency Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        id="emergency_contact_name"
                                        name="emergency_contact_name"
                                        className="form-control"
                                        value={formData.emergency_contact_name}
                                        onChange={handleChange}
                                        placeholder="Enter emergency contact name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="emergency_contact_phone">
                                        <FaPhone className="label-icon" /> Emergency Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="emergency_contact_phone"
                                        name="emergency_contact_phone"
                                        className="form-control"
                                        value={formData.emergency_contact_phone}
                                        onChange={handleChange}
                                        placeholder="Enter emergency contact phone"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="section-divider" />

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn-back" 
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                <FaArrowLeft /> Back
                            </button>
                            <button 
                                type="submit" 
                                className="btn-submit" 
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MyAccount;
