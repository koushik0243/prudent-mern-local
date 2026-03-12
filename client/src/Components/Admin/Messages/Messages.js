'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContactById, clearCurrentContact } from '@/redux/slices/contactsSlice';
import { fetchStages } from '@/redux/slices/stagesSlice';
import { fetchTagManagers } from '@/redux/slices/tagManagerSlice';
import { createContactStage, fetchContactStagesByContactId } from '@/redux/slices/contactStageSlice';
import { fetchCountries } from '@/redux/slices/countrySlice';
import { fetchStates } from '@/redux/slices/stateSlice';
import { fetchCities } from '@/redux/slices/citySlice';
import { FaArrowLeft, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaUser, FaGlobe } from 'react-icons/fa';
import toast from 'react-hot-toast';
import apiServiceHandler from '@/service/apiService';
import './Messages.css';

const Messages = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const contactId = searchParams.get('contactId');
    
    const { currentContact, loading: contactLoading } = useAppSelector((state) => state.contacts);
    const { stages, loading: stagesLoading } = useAppSelector((state) => state.stages);
    const { contactStages } = useAppSelector((state) => state.contactStage);
    const { tagManagers } = useAppSelector((state) => state.tagManager);
    const { countries } = useAppSelector((state) => state.country);
    const { states } = useAppSelector((state) => state.stateMaster);
    const { cities } = useAppSelector((state) => state.cityMaster);
    
    const [activeStage, setActiveStage] = useState('');
    const [previousStage, setPreviousStage] = useState('');
    const [messageText, setMessageText] = useState('');
    const [noteText, setNoteText] = useState('');
    const [activeTab, setActiveTab] = useState(''); // message, note, schedule
    const [activityType, setActivityType] = useState('Call');
    const [activityDateTime, setActivityDateTime] = useState('');
    const [activityDescription, setActivityDescription] = useState('');
    const [contactMessages, setContactMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingStageId, setPendingStageId] = useState('');
    const [showStageConfirm, setShowStageConfirm] = useState(false);

    const normalizeId = (value) => {
        if (!value) return '';
        if (typeof value === 'object') {
            return String(value._id || value.id || '');
        }
        return String(value);
    };

    const resolveStageFromContact = () => {
        if (!currentContact || !Array.isArray(stages) || stages.length === 0) {
            return '';
        }

        const rawStage = currentContact.stage_id || currentContact.stage || currentContact.current_stage_id || currentContact.current_stage;

        if (!rawStage) {
            return '';
        }

        if (typeof rawStage === 'object') {
            const objectStageId = normalizeId(rawStage);
            if (objectStageId) {
                const matchedById = stages.find((stage) => normalizeId(stage._id || stage.id) === objectStageId);
                if (matchedById) {
                    return normalizeId(matchedById._id || matchedById.id);
                }
            }

            const objectStageName = String(rawStage.name || rawStage.stage_name || rawStage.title || '').trim().toLowerCase();
            if (objectStageName) {
                const matchedByName = stages.find((stage) => String(stage.name || stage.stage_name || stage.title || '').trim().toLowerCase() === objectStageName);
                if (matchedByName) {
                    return normalizeId(matchedByName._id || matchedByName.id);
                }
            }

            return objectStageId;
        }

        const rawStageId = normalizeId(rawStage);
        const matchedById = stages.find((stage) => normalizeId(stage._id || stage.id) === rawStageId);
        if (matchedById) {
            return normalizeId(matchedById._id || matchedById.id);
        }

        const rawStageName = String(rawStage).trim().toLowerCase();
        const matchedByName = stages.find((stage) => String(stage.name || stage.stage_name || stage.title || '').trim().toLowerCase() === rawStageName);
        if (matchedByName) {
            return normalizeId(matchedByName._id || matchedByName.id);
        }

        return '';
    };

    const resolveStageFromHistory = () => {
        if (!Array.isArray(contactStages) || contactStages.length === 0 || !Array.isArray(stages) || stages.length === 0) {
            return '';
        }

        const sortedStages = [...contactStages].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at);
            const dateB = new Date(b.createdAt || b.created_at);
            return dateB - dateA;
        });

        const latestStageChange = sortedStages[0] || {};

        const rawNewStageId = latestStageChange.new_stage_id;
        const normalizedNewStageId = normalizeId(rawNewStageId);
        if (normalizedNewStageId) {
            const matchedById = stages.find((stage) => normalizeId(stage._id || stage.id) === normalizedNewStageId);
            if (matchedById) {
                return normalizeId(matchedById._id || matchedById.id);
            }
        }

        const newStageName = String(latestStageChange.new_stage_name || '').trim().toLowerCase();
        if (newStageName) {
            const matchedByName = stages.find((stage) => String(stage.name || stage.stage_name || stage.title || '').trim().toLowerCase() === newStageName);
            if (matchedByName) {
                return normalizeId(matchedByName._id || matchedByName.id);
            }
        }

        return '';
    };

    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1:
                return 'st';
            case 2:
                return 'nd';
            case 3:
                return 'rd';
            default:
                return 'th';
        }
    };

    const formatDateWithOrdinal = (dateValue, includeTime = true) => {
        if (!dateValue) return 'N/A';

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';

        const day = parsedDate.getDate();
        const suffix = getOrdinalSuffix(day);
        const month = parsedDate.toLocaleString('en-US', { month: 'long' });
        const year = parsedDate.getFullYear();

        if (!includeTime) {
            return `${day}${suffix} ${month}, ${year}`;
        }

        const time = parsedDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });

        return `${day}${suffix} ${month}, ${year}, ${time}`;
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

    const getTimeAgo = (dateValue) => {
        const entryDate = new Date(dateValue);
        if (Number.isNaN(entryDate.getTime())) return 'Unknown time';

        const now = new Date();
        const diffMs = now - entryDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        }

        if (diffDays === 1) {
            return '1 day ago';
        }

        return `${diffDays} days ago`;
    };

    const fetchMessageHistory = async (selectedContactId) => {
        if (!selectedContactId) return;

        setMessagesLoading(true);
        try {
            const response = await apiServiceHandler('GET', `contact-message/list/${selectedContactId}`);
            setContactMessages(Array.isArray(response?.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch message history:', error);
            setContactMessages([]);
        } finally {
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        if (contactId) {
            dispatch(fetchContactById(contactId));
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
            if (!Array.isArray(contactStages) || contactStages.length === 0) {
                dispatch(fetchContactStagesByContactId(contactId));
            }
            fetchMessageHistory(contactId);
        } else {
            // If no contactId, redirect to contacts page
            router.push('/admin/contacts');
        }

        return () => {
            dispatch(clearCurrentContact());
        };
    }, [contactId, dispatch, router, stages, tagManagers, countries, states, cities, contactStages]);

    useEffect(() => {
        if (stages && Array.isArray(stages) && stages.length > 0) {
            const historyStageId = resolveStageFromHistory();
            if (historyStageId) {
                setActiveStage(historyStageId);
                setPreviousStage(historyStageId);
                return;
            }

            const contactStageId = resolveStageFromContact();
            if (contactStageId) {
                setActiveStage(contactStageId);
                setPreviousStage(contactStageId);
                return;
            }

            setActiveStage('');
            setPreviousStage('');
        }
    }, [stages, contactStages, currentContact]);

    const handleBack = () => {
        router.push('/admin/contacts');
    };

    const handleEditContact = () => {
        if (!contactId) return;
        router.push(`/admin/contacts/edit/${contactId}`);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            toast.error('Please enter a message');
            return;
        }

        if (!contactId) {
            toast.error('Contact ID is missing');
            return;
        }

        const selectedStageId = activeStage || previousStage;
        if (!selectedStageId) {
            toast.error('Please select an active stage');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                contact_id: contactId,
                stage_id: selectedStageId,
                msg_type: 'send_msg',
                message: messageText
            };

            await apiServiceHandler('POST', 'contact-message/create', payload);
            toast.success('Message sent successfully');
            setMessageText('');
            fetchMessageHistory(contactId);
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error(error.message || 'Failed to send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogNote = async () => {
        if (!noteText.trim()) {
            toast.error('Please enter a note');
            return;
        }

        if (!contactId) {
            toast.error('Contact ID is missing');
            return;
        }

        const selectedStageId = activeStage || previousStage;
        if (!selectedStageId) {
            toast.error('Please select an active stage');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                contact_id: contactId,
                stage_id: selectedStageId,
                msg_type: 'log_note',
                message: noteText.trim()
            };

            await apiServiceHandler('POST', 'contact-message/create', payload);
            toast.success('Note logged successfully');
            setNoteText('');
            fetchMessageHistory(contactId);
        } catch (error) {
            console.error('Failed to log note:', error);
            toast.error(error.message || 'Failed to log note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleScheduleActivity = async () => {
        if (!activityDateTime) {
            toast.error('Please select a date and time');
            return;
        }

        if (!activityDescription.trim()) {
            toast.error('Please enter a description');
            return;
        }

        if (!contactId) {
            toast.error('Contact ID is missing');
            return;
        }

        const selectedStageId = activeStage || previousStage;
        if (!selectedStageId) {
            toast.error('Please select an active stage');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                contact_id: contactId,
                stage_id: selectedStageId,
                msg_type: 'schedule_activity',
                activity_type: activityType.toLowerCase(),
                due_date: activityDateTime,
                message: activityDescription.trim()
            };

            await apiServiceHandler('POST', 'contact-message/create', payload);
            toast.success(`${activityType} scheduled successfully`);
            setActivityType('Call');
            setActivityDateTime('');
            setActivityDescription('');
            fetchMessageHistory(contactId);
        } catch (error) {
            console.error('Failed to schedule activity:', error);
            toast.error(error.message || 'Failed to schedule activity');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStageNameById = (stageId) => {
        if (!stageId || !Array.isArray(stages)) return 'N/A';
        const matchedStage = stages.find((stage) => normalizeId(stage._id || stage.id) === normalizeId(stageId));
        return matchedStage?.name || matchedStage?.stage_name || matchedStage?.title || 'N/A';
    };

    const clearStageConfirmation = () => {
        setPendingStageId('');
        setShowStageConfirm(false);
    };

    const performStageChange = async (newStageId) => {
        if (!newStageId) {
            console.error('newStageId is null or undefined');
            return;
        }

        if (!contactId) {
            console.error('contactId is null or undefined');
            toast.error('Contact ID is missing');
            return;
        }

        const normalizedNewStageId = normalizeId(newStageId);
        const normalizedActiveStageId = normalizeId(activeStage);

        if (normalizedNewStageId && normalizedNewStageId === normalizedActiveStageId) {
            console.log('Same stage clicked, no change needed');
            return;
        }

        const newStageObj = stages.find((stageItem) => normalizeId(stageItem._id || stageItem.id) === normalizedNewStageId);

        if (!newStageObj) {
            console.error('New stage object not found for ID:', newStageId);
            setActiveStage(newStageId);
            return;
        }

        const oldStageObj = stages.find((stageItem) => normalizeId(stageItem._id || stageItem.id) === normalizedActiveStageId);

        try {
            // Get contact's full name from currentContact
            let userName = 'Unknown Contact';
            if (currentContact) {
                const nameParts = [
                    currentContact.fname || '',
                    currentContact.mname || '',
                    currentContact.lname || ''
                ].filter(part => part.trim() !== '');
                
                userName = nameParts.length > 0 ? nameParts.join(' ') : 'Unknown Contact';
            }

            const stageUpdatePayload = {
                stage_id: newStageObj._id || newStageObj.id,
                stage: newStageObj._id || newStageObj.id,
                current_stage_id: newStageObj._id || newStageObj.id,
                current_stage: newStageObj._id || newStageObj.id,
            };

            // Persist stage on the selected contact itself.
            await apiServiceHandler('PUT', `contact/update/${contactId}`, stageUpdatePayload);

            const contactStageData = {
                contact_id: contactId,
                old_stage_id: oldStageObj?._id || oldStageObj?.id || null,
                new_stage_id: newStageObj._id || newStageObj.id,
                old_stage_name: oldStageObj?.name || '',
                new_stage_name: newStageObj.name,
                user_name: userName,
                createdAt: new Date().toISOString()
            };

            await dispatch(createContactStage(contactStageData)).unwrap();
            // Refresh contact stages list
            dispatch(fetchContactStagesByContactId(contactId));
            dispatch(fetchContactById(contactId));

            setActiveStage(normalizedNewStageId);
            setPreviousStage(normalizedNewStageId);

            if (oldStageObj?.name) {
                toast.success(`Stage changed from ${oldStageObj.name} to ${newStageObj.name}`);
            } else {
                toast.success(`Stage changed to ${newStageObj.name}`);
            }
        } catch (error) {
            console.error('Failed to log stage change:', error);
            toast.error(error?.message || 'Failed to update contact stage');
        }
    };

    const handleStageChange = (newStageId) => {
        if (!newStageId) {
            return;
        }

        if (newStageId === activeStage) {
            return;
        }

        setPendingStageId(newStageId);
        setShowStageConfirm(true);
    };

    const confirmStageChange = async () => {
        if (!pendingStageId) return;

        await performStageChange(pendingStageId);
        clearStageConfirmation();
    };

    if (contactLoading || !currentContact) {
        return (
            <div className="messages-container">
                <div className="loading-state">
                    <div className="spinner-border"></div>
                    <p>Loading contact details...</p>
                </div>
            </div>
        );
    }

    const activeStages = Array.isArray(stages) ? stages.filter(stage => stage.status === 'active') : [];
    const contactDisplayName = [currentContact?.fname, currentContact?.mname, currentContact?.lname]
        .filter(part => !!part && part.trim() !== '')
        .join(' ') || 'Contact';

    const resolvedStageName = (() => {
        const currentStageId = activeStage || previousStage || resolveStageFromContact();

        if (currentStageId) {
            const matchedByCurrentId = Array.isArray(stages)
                ? stages.find((stage) => normalizeId(stage._id || stage.id) === normalizeId(currentStageId))
                : null;

            if (matchedByCurrentId) {
                return matchedByCurrentId.name || matchedByCurrentId.stage_name || matchedByCurrentId.title || 'N/A';
            }
        }

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

    return (
        <div className="messages-container">
            {/* Header with Back Button */}
            <div className="messages-header">
                <div className="messages-header-actions">
                    <button onClick={handleBack} className="btn-back">
                        <FaArrowLeft /> Back to Contacts
                    </button>
                    <button onClick={handleEditContact} className="btn-back btn-edit-contact" type="button">
                        Edit Contact
                    </button>
                </div>
                {showStageConfirm && (
                    <div className="stage-change-confirm-box">
                        <div className="stage-change-confirm-text">
                            Are you sure you want to change stage from <strong>{getStageNameById(activeStage)}</strong> to <strong>{getStageNameById(pendingStageId)}</strong>?
                        </div>
                        <div className="stage-change-confirm-actions">
                            <button
                                type="button"
                                className="stage-confirm-btn stage-confirm-btn-primary"
                                onClick={confirmStageChange}
                            >
                                Confirm
                            </button>
                            <button
                                type="button"
                                className="stage-confirm-btn stage-confirm-btn-secondary"
                                onClick={clearStageConfirmation}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="messages-layout">
                {/* Main Content Area */}
                <div className="messages-main">

                    {/* Stage Tabs */}
                    <div className="stage-tabs">
                        {activeStages.map((stage, index) => {
                            const rawId = stage._id || stage.id;
                            const stageId = typeof rawId === 'object' && rawId !== null 
                                ? (rawId.toString ? rawId.toString() : String(rawId))
                                : String(rawId);
                            const isActive = activeStage === stageId;
                            return (
                                <button
                                    key={stageId}
                                    className={`stage-tab stage-color-${index % 9} ${isActive ? 'active' : ''}`}
                                    onClick={() => handleStageChange(stageId)}
                                >
                                    {stage.name}
                                </button>
                            );
                        })}
                    </div>


                    {/* Contact Details Section */}
                    <div className="contact-header">
                        <div className="contact-title">
                            <h1>{currentContact.fname} {currentContact.mname} {currentContact.lname}</h1>
                        </div>

                        {/* Personal Information */}
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

                        {/* Address Information */}
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

                        {/* Organization Information */}
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

                        {/* Question & Answer */}
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

                        {/* Additional Information */}
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
                                                        // Handle both populated tag objects and plain IDs
                                                        let tagDisplay;
                                                        let tagKey;
                                                        
                                                        if (typeof tag === 'object' && tag !== null) {
                                                            // Tag is already populated
                                                            tagDisplay = tag.full_name || tag.name || 'Unknown Tag';
                                                            tagKey = tag._id || index;
                                                        } else {
                                                            // Tag is just an ID string, look it up in tagManagers
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

                    

                    {/* Stage Content Area */}
                    {/* <div className="stage-content">
                        <div className="empty-state">
                            <p>No activities yet for this stage</p>
                        </div>
                    </div> */}
                </div>

                {/* Right Sidebar */}
                <div className="messages-sidebar">
                    {/* Action Tabs */}
                    <div className="sidebar-tabs">
                        <button
                            className={`sidebar-tab ${activeTab === 'message' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'message' ? '' : 'message')}
                        >
                            Send message
                        </button>
                        <button
                            className={`sidebar-tab ${activeTab === 'note' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'note' ? '' : 'note')}
                        >
                            Log note
                        </button>
                        <button
                            className={`sidebar-tab ${activeTab === 'schedule' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab === 'schedule' ? '' : 'schedule')}
                        >
                            Schedule activity
                        </button>
                    </div>

                    {/* Action Content */}
                    {activeTab && (
                        <div className="sidebar-content">
                            {activeTab === 'message' && (
                                <div className="action-panel">
                                    <textarea
                                        className="action-textarea"
                                        placeholder="Type your message here..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        rows={4}
                                    />
                                    <button 
                                        className="btn-log" 
                                        onClick={handleSendMessage}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'note' && (
                                <div className="action-panel">
                                    <textarea
                                        className="action-textarea"
                                        placeholder="Log an internal note..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        rows={4}
                                    />
                                    <button 
                                        className="btn-log" 
                                        onClick={handleLogNote}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Logging...' : 'Log'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'schedule' && (
                                <div className="action-panel">
                                    <div className="form-group">
                                        <label>Activity Type</label>
                                        <select 
                                            className="form-input" 
                                            style={{color: "black"}}
                                            value={activityType}
                                            onChange={(e) => setActivityType(e.target.value)}
                                        >
                                            <option value="Call">Call</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Email">Email</option>
                                            <option value="Task">Task</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date & Time</label>
                                        <input 
                                            type="datetime-local" 
                                            className="form-input"
                                            value={activityDateTime}
                                            onChange={(e) => setActivityDateTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea 
                                            className="action-textarea" 
                                            rows={3}
                                            placeholder="Enter activity description..."
                                            value={activityDescription}
                                            onChange={(e) => setActivityDescription(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        className="btn-log"
                                        onClick={handleScheduleActivity}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Scheduling...' : 'Schedule'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Combined Message + Stage History */}
                    <div className="activity-timeline">
                        <h3>Message & Stage History</h3>
                        <div className="timeline-items">
                            {messagesLoading ? (
                                <div className="empty-state">
                                    <p>Loading history...</p>
                                </div>
                            ) : (() => {
                                const messageHistory = Array.isArray(contactMessages)
                                    ? contactMessages.map((messageItem, index) => ({
                                        type: 'message',
                                        id: messageItem._id || `message-${index}`,
                                        createdAt: messageItem.createdAt || messageItem.created_at,
                                        item: messageItem,
                                    }))
                                    : [];

                                const stageHistory = Array.isArray(contactStages)
                                    ? contactStages.map((stageItem, index) => ({
                                        type: 'stage',
                                        id: stageItem._id || `stage-${index}`,
                                        createdAt: stageItem.createdAt || stageItem.created_at,
                                        item: stageItem,
                                    }))
                                    : [];

                                const combinedHistory = [...messageHistory, ...stageHistory]
                                    .map((entry) => ({
                                        ...entry,
                                        createdDate: new Date(entry.createdAt),
                                    }))
                                    .filter((entry) => !Number.isNaN(entry.createdDate.getTime()))
                                    .sort((a, b) => b.createdDate - a.createdDate);

                                if (combinedHistory.length === 0) {
                                    return (
                                        <div className="empty-state">
                                            <p>No history recorded yet</p>
                                        </div>
                                    );
                                }

                                const groupedHistory = combinedHistory.reduce((acc, entry) => {
                                    const dateKey = formatDateWithOrdinal(entry.createdDate, false);
                                    if (!acc[dateKey]) {
                                        acc[dateKey] = [];
                                    }
                                    acc[dateKey].push(entry);
                                    return acc;
                                }, {});

                                return Object.keys(groupedHistory).map((dateKey) => (
                                    <div key={dateKey} className="timeline-item">
                                        <div className="timeline-date">{dateKey}</div>
                                        {groupedHistory[dateKey].map((entry, index) => {
                                            if (entry.type === 'message') {
                                                const messageItem = entry.item;
                                                const timeAgo = getTimeAgo(entry.createdDate);
                                                const typeLabel = messageItem.msg_type === 'send_msg'
                                                    ? 'Send Message'
                                                    : messageItem.msg_type === 'log_note'
                                                        ? 'Log Note'
                                                        : 'Schedule Activity';

                                                const stageName = messageItem?.stage_id?.name || 'N/A';
                                                const initials = contactDisplayName
                                                    .split(' ')
                                                    .map((part) => part.charAt(0))
                                                    .join('')
                                                    .substring(0, 2)
                                                    .toUpperCase();

                                                return (
                                                    <div key={`${entry.id}-${index}`} className="timeline-entry">
                                                        <div className="entry-avatar">{initials}</div>
                                                        <div className="entry-content">
                                                            <div className="entry-header">
                                                                <strong>{contactDisplayName}</strong>
                                                                <span className="entry-time">- {timeAgo}</span>
                                                            </div>
                                                            <div className="entry-text">{typeLabel}</div>
                                                            <ul>
                                                                <li>{messageItem.message || 'N/A'}</li>
                                                                <li>{stageName}</li>
                                                                {messageItem.msg_type === 'schedule_activity' && messageItem.due_date && (
                                                                    <li>{formatDateWithOrdinal(messageItem.due_date)}</li>
                                                                )}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            const stageChange = entry.item;
                                            const timeAgo = getTimeAgo(entry.createdDate);
                                            const userName = stageChange.user_name || 'Unknown User';
                                            const initials = userName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();

                                            return (
                                                <div key={`${entry.id}-${index}`} className="timeline-entry">
                                                    <div className="entry-avatar" style={{
                                                        background: `hsl(${(userName.charCodeAt(0) * 137) % 360}, 60%, 60%)`
                                                    }}>
                                                        {initials}
                                                    </div>
                                                    <div className="entry-content">
                                                        <div className="entry-header">
                                                            <strong>{userName}</strong>
                                                            <span className="entry-time">- {timeAgo}</span>
                                                        </div>
                                                        <div className="entry-text">Stage changed</div>
                                                        <ul>
                                                            <li>Stage: {stageChange.old_stage_name || 'N/A'} → {stageChange.new_stage_name || 'N/A'}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    {/* <div className="activity-timeline">
                        <h3>Activity Timeline</h3>
                        <div className="timeline-items">
                            <div className="timeline-item">
                                <div className="timeline-date">
                                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className="timeline-entry">
                                    <div className="entry-avatar">
                                        {currentContact.fname?.charAt(0)}{currentContact.lname?.charAt(0)}
                                    </div>
                                    <div className="entry-content">
                                        <div className="entry-header">
                                            <strong>{currentContact.fname} {currentContact.lname}</strong>
                                            <span className="entry-time">Just now</span>
                                        </div>
                                        <div className="entry-text">Contact created</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Messages;
