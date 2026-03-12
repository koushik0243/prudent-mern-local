'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUserById } from '@/redux/slices/userSlice';
import { FaUser, FaBriefcase, FaArrowLeft, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShieldAlt, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import './ShowUser.css';

const ShowUser = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentUser, loading } = useAppSelector((state) => state.user);

    useEffect(() => {
        if (id) {
            dispatch(fetchUserById(id));
        }
    }, [id, dispatch]);

    const handleBack = () => {
        router.push('/admin/users');
    };

    const handleEdit = () => {
        router.push(`/admin/users/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-user-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading user details...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="show-user-container">
                <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <h3>User not found</h3>
                    <p>The user you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Users
                    </button>
                </div>
            </div>
        );
    }

    const InfoRow = ({ label, value }) => {
        return (
            <div className="form-group">
                <label className="form-label">{label}</label>
                <div className="form-value">{value || 'N/A'}</div>
            </div>
        );
    };

    const InfoSection = ({ title, icon: Icon, children }) => {
        return (
            <div className="form-section">
                <h2 className="section-title">
                    {Icon && <Icon style={{ marginRight: '0.5rem', color: '#b6110f' }} />}
                    {title}
                </h2>
                {children}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="show-user-container">
            {/* Header */}
            <div className="show-user-header">
                <button className="btn-back" onClick={handleBack}>
                    <FaArrowLeft /> Back to Users
                </button>
                <div>
                    <h1 className="page-title">View User</h1>
                    <p className="page-subtitle">User details and information</p>
                </div>
            </div>

            {/* User Card */}
            <div className="user-card">
                {/* Personal Information */}
                <InfoSection title="Personal Information" icon={FaUser}>
                    <div className="form-row">
                        <InfoRow label="Full Name" value={currentUser.full_name || currentUser.name} />
                        <InfoRow label="Email" value={currentUser.email} />
                    </div>
                    <div className="form-row">
                        <InfoRow label="Phone" value={currentUser.phone} />
                        <InfoRow label="Alternate Phone" value={currentUser.alternate_phone} />
                    </div>
                    <div className="form-row">
                        <InfoRow label="Date of Birth" value={formatDate(currentUser.dob)} />
                        <InfoRow label="Gender" value={currentUser.gender} />
                    </div>
                </InfoSection>

                <hr className="section-divider" />

                {/* Professional Information */}
                <InfoSection title="Professional Information" icon={FaBriefcase}>
                    <div className="form-row">
                        <InfoRow label="Designation" value={currentUser.designation} />
                        <InfoRow label="Department" value={currentUser.department} />
                        <InfoRow label="Status" value={currentUser.status} />
                    </div>
                    {currentUser.bio && (
                        <InfoRow label="Bio" value={currentUser.bio} />
                    )}
                </InfoSection>

                <hr className="section-divider" />

                {/* Address Information */}
                <InfoSection title="Address Information" icon={FaMapMarkerAlt}>
                    <InfoRow label="Address Line 1" value={currentUser.address1} />
                    <InfoRow label="Address Line 2" value={currentUser.address2} />
                    <div className="form-row">
                        <InfoRow label="City" value={currentUser.city} />
                        <InfoRow label="State" value={currentUser.state} />
                    </div>
                    <div className="form-row">
                        <InfoRow label="Country" value={currentUser.country} />
                        <InfoRow label="Zipcode" value={currentUser.zipcode} />
                    </div>
                </InfoSection>

                <hr className="section-divider" />

                {/* Emergency Contact */}
                <InfoSection title="Emergency Contact" icon={FaShieldAlt}>
                    <div className="form-row">
                        <InfoRow label="Contact Name" value={currentUser.emergency_contact_name} />
                        <InfoRow label="Contact Phone" value={currentUser.emergency_contact_phone} />
                    </div>
                </InfoSection>

                {/* Social Media - Always show section to display the structure */}
                <hr className="section-divider" />
                <InfoSection title="Social Media">
                    <div className="form-row">
                        <InfoRow 
                            label={<><FaLinkedin style={{ marginRight: '0.5rem', color: '#0077b5' }} />LinkedIn</>} 
                            value={currentUser.linkedin ? (
                                <a href={currentUser.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                                    {currentUser.linkedin}
                                </a>
                            ) : 'N/A'} 
                        />
                        <InfoRow 
                            label={<><FaTwitter style={{ marginRight: '0.5rem', color: '#1DA1F2' }} />Twitter</>} 
                            value={currentUser.twitter ? (
                                <a href={currentUser.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                                    {currentUser.twitter}
                                </a>
                            ) : 'N/A'} 
                        />
                        <InfoRow 
                            label={<><FaFacebook style={{ marginRight: '0.5rem', color: '#4267B2' }} />Facebook</>} 
                            value={currentUser.facebook ? (
                                <a href={currentUser.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                                    {currentUser.facebook}
                                </a>
                            ) : 'N/A'} 
                        />
                    </div>
                </InfoSection>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button className="btn-primary" onClick={handleEdit}>
                        <FaEdit /> Edit User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowUser;
