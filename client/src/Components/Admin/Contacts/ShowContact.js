'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContactById, clearCurrentContact } from '@/redux/slices/contactsSlice';
import { fetchStages } from '@/redux/slices/stagesSlice';
import { fetchTagManagers } from '@/redux/slices/tagManagerSlice';
import { fetchCountries } from '@/redux/slices/countrySlice';
import { fetchStates } from '@/redux/slices/stateSlice';
import { fetchCities } from '@/redux/slices/citySlice';
import { FaUser, FaBuilding, FaArrowLeft, FaEdit, FaEnvelope, FaPhone, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import './ShowContact.css';

const ShowContact = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentContact, loading } = useAppSelector((state) => state.contacts);
    const { stages } = useAppSelector((state) => state.stages);
    const { tagManagers } = useAppSelector((state) => state.tagManager);
    const { countries } = useAppSelector((state) => state.country);
    const { states } = useAppSelector((state) => state.stateMaster);
    const { cities } = useAppSelector((state) => state.cityMaster);

    useEffect(() => {
        if (id) {
            dispatch(fetchContactById(id));
        }

        if (!Array.isArray(stages) || stages.length === 0) {
            dispatch(fetchStages());
        }
        if (!Array.isArray(tagManagers) || tagManagers.length === 0) {
            dispatch(fetchTagManagers());
        }
        if (!Array.isArray(countries) || countries.length === 0) {
            dispatch(fetchCountries());
        }
        if (!Array.isArray(states) || states.length === 0) {
            dispatch(fetchStates());
        }
        if (!Array.isArray(cities) || cities.length === 0) {
            dispatch(fetchCities());
        }

        return () => {
            dispatch(clearCurrentContact());
        };
    }, [id, dispatch, stages, tagManagers, countries, states, cities]);

    const handleBack = () => {
        router.push('/admin/contacts');
    };

    const handleEdit = () => {
        router.push(`/admin/contacts/edit/${id}`);
    };

    if (loading) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading contact details...</p>
                </div>
            </div>
        );
    }

    if (!currentContact) {
        return (
            <div className="show-contact-container">
                <div className="empty-state">
                    <FaUser className="empty-icon" />
                    <h3>Contact not found</h3>
                    <p>The contact you're looking for doesn't exist.</p>
                    <button className="btn-primary" onClick={handleBack}>
                        <FaArrowLeft /> Back to Contacts
                    </button>
                </div>
            </div>
        );
    }

    const resolvedStageName = (() => {
        const rawStage = currentContact?.stage_id || currentContact?.stage;

        if (!rawStage) return 'N/A';

        if (typeof rawStage === 'object') {
            return rawStage.name || rawStage.stage_name || rawStage.title || 'N/A';
        }

        const stageValue = String(rawStage);
        const matchedStage = Array.isArray(stages)
            ? stages.find((stage) => String(stage._id || stage.id) === stageValue)
            : null;

        return matchedStage?.name || matchedStage?.stage_name || stageValue;
    })();

    const formatLeadCategory = (categoryValue) => {
        if (!categoryValue) return 'N/A';

        const normalizedCategory = String(categoryValue).trim().toLowerCase();
        const emojiByCategory = {
            hot: '🔥',
            warm: '🟡',
            cold: '🔵',
        };

        const emoji = emojiByCategory[normalizedCategory];

        return emoji ? `${emoji} ${categoryValue}` : categoryValue;
    };

    const formatDateDDMMYYYY = (dateValue) => {
        if (!dateValue) return 'N/A';

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const resolveLocationName = (value, list) => {
        if (value === null || value === undefined || value === '') return 'N/A';

        if (typeof value === 'object') {
            if (value.name) return value.name;

            const objectId = value.id || value._id;
            if (objectId !== undefined && objectId !== null) {
                const matched = (Array.isArray(list) ? list : []).find((item) => (
                    String(item?.id) === String(objectId) ||
                    String(item?._id) === String(objectId)
                ));
                if (matched?.name) return matched.name;
            }

            return 'N/A';
        }

        const valueStr = String(value);
        const matched = (Array.isArray(list) ? list : []).find((item) => (
            String(item?.id) === valueStr ||
            String(item?._id) === valueStr
        ));

        return matched?.name || valueStr;
    };

    const resolvedCountryName = resolveLocationName(currentContact?.country, countries);
    const resolvedStateName = resolveLocationName(currentContact?.state, states);
    const resolvedCityName = resolveLocationName(currentContact?.city, cities);

    return (
        <div className="show-contact-container">
            {/* Header */}
            <div className="show-contact-header">
                <div className="header-actions">
                    <button className="btn-back" onClick={handleBack}>
                        <FaArrowLeft /> Back to Contacts
                    </button>
                    <button className="btn-back" onClick={handleEdit}>
                        <FaEdit /> Edit Contact
                    </button>
                </div>
            </div>

            {/* Contact Card */}
            <div className="contact-card">
                <div className="contact-header">
                    <div className="contact-title">
                        <h1>{currentContact.fname} {currentContact.mname} {currentContact.lname}</h1>
                    </div>

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaUser style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Personal Information
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">First Name</label>
                                    <div className="info-value">{currentContact.fname || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Middle Name</label>
                                    <div className="info-value">{currentContact.mname || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Last Name</label>
                                    <div className="info-value">{currentContact.lname || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Email</label>
                                    <div className="info-value">{currentContact.email || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Phone</label>
                                    <div className="info-value">{currentContact.phone || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Alternate Phone</label>
                                    <div className="info-value">{currentContact.alternate_phone || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Personal Website</label>
                                    <div className="info-value">
                                        {currentContact.personal_website ? (
                                            <a href={currentContact.personal_website} target="_blank" rel="noopener noreferrer">
                                                {currentContact.personal_website}
                                            </a>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaMapMarkerAlt style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Address Information
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Address Line 1</label>
                                    <div className="info-value">{currentContact.address1 || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Address Line 2</label>
                                    <div className="info-value">{currentContact.address2 || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Country</label>
                                    <div className="info-value">{resolvedCountryName}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">State</label>
                                    <div className="info-value">{resolvedStateName}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">City</label>
                                    <div className="info-value">{resolvedCityName}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Zipcode</label>
                                    <div className="info-value">{currentContact.zipcode || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaBuilding style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Organization Information
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Organization Name</label>
                                    <div className="info-value">{currentContact.org_name || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Organization Address</label>
                                    <div className="info-value">{currentContact.org_address || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Organization Phone</label>
                                    <div className="info-value">{currentContact.org_phone || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Organization Website</label>
                                    <div className="info-value">
                                        {currentContact.org_website ? (
                                            <a href={currentContact.org_website} target="_blank" rel="noopener noreferrer">
                                                {currentContact.org_website}
                                            </a>
                                        ) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaUser style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Question & Answer
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Total Lead Score</label>
                                    <div className="info-value">{currentContact.total_lead_score || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Lead Category</label>
                                    <div className="info-value">{formatLeadCategory(currentContact.lead_category)}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Form Status</label>
                                    <div className="info-value">{currentContact.form_status || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Tries Count</label>
                                    <div className="info-value">{currentContact.tries_count || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Last Reminder Date</label>
                                    <div className="info-value">{formatDateDDMMYYYY(currentContact.last_reminder_date)}</div>
                                </div>
                            </div>

                            <div className="qa-line-break" />

                            {Array.from({ length: 10 }).map((_, index) => {
                                const questionNumber = index + 1;
                                const questionLabel = currentContact[`q${questionNumber}_label`];
                                const questionAnswer = currentContact[`q${questionNumber}_answer`];

                                return (
                                    <div key={`qa-view-item-${questionNumber}`} className="info-item">
                                        <label className="info-label">{questionLabel || `Q${questionNumber}`}</label>
                                        <div className="info-value">{questionAnswer || 'N/A'}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr className="section-divider" />

                    <div className="info-section">
                        <h2 className="section-title">
                            <FaGlobe style={{ marginRight: '0.1rem', color: '#b6110f' }} />
                            Additional Information
                        </h2>
                        <div className="info-grid">
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Lead Source</label>
                                    <div className="info-value">{currentContact.lead_source || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Referral</label>
                                    <div className="info-value">{currentContact.referral || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Timezone</label>
                                    <div className="info-value">{currentContact.timezone || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Currency</label>
                                    <div className="info-value">{currentContact.currency || 'N/A'}</div>
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Stage Name</label>
                                    <div className="info-value">{resolvedStageName}</div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item">
                                    <label className="info-label">Priority</label>
                                    <div className="info-value">
                                        <span className={`priority-badge priority-${currentContact.priority || 'low'}`}>
                                            {(currentContact.priority || 'low').charAt(0).toUpperCase() + (currentContact.priority || 'low').slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="info-row">
                                <div className="info-item info-item-full">
                                    <label className="info-label">Tags</label>
                                    <div className="info-value">
                                        {currentContact.tags && currentContact.tags.length > 0 ? (
                                            <div className="tags-list">
                                                {currentContact.tags.map((tag, index) => {
                                                    let tagDisplay;
                                                    let tagKey;

                                                    if (typeof tag === 'object' && tag !== null) {
                                                        tagDisplay = tag.full_name || tag.name || 'Unknown Tag';
                                                        tagKey = tag._id || index;
                                                    } else {
                                                        const tagId = String(tag);
                                                        const foundTag = tagManagers?.find(t =>
                                                            String(t._id) === tagId || String(t.id) === tagId
                                                        );
                                                        tagDisplay = foundTag ? (foundTag.full_name || foundTag.name) : tagId;
                                                        tagKey = tagId || index;
                                                    }

                                                    return (
                                                        <span key={tagKey} className="tag-badge-view">
                                                            {tagDisplay}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : 'No tags'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ShowContact;
