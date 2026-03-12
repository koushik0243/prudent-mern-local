'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchStages } from '@/redux/slices/stagesSlice';
import { createContactStage } from '@/redux/slices/contactStageSlice';
import toast from 'react-hot-toast';
import apiServiceHandler from '@/service/apiService';
import {
    FaChevronDown,
    FaChevronUp,
    FaCommentDots,
    FaEnvelope,
    FaPhone,
    FaUser,
    FaBuilding,
    FaThLarge,
    FaBars,
    FaEdit,
} from 'react-icons/fa';
import './ContactLeads.css';

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getIdString = (value) => {
    if (!value) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
        return String(value._id || value.id || value.$oid || '');
    }
    return '';
};

const ContactLeads = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { contacts, loading, error } = useAppSelector((state) => state.contacts);
    const { stages } = useAppSelector((state) => state.stages);

    const [viewMode, setViewMode] = useState('accordion');
    const [openStageKey, setOpenStageKey] = useState('');
    const [openContactMap, setOpenContactMap] = useState({});
    const [contactInsightsMap, setContactInsightsMap] = useState({});
    const [stageOverrideByContact, setStageOverrideByContact] = useState({});
    const [shiftingContactMap, setShiftingContactMap] = useState({});
    const [pendingStageChange, setPendingStageChange] = useState(null);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded?._id) {
                    setUserId(decoded._id);
                }
            } catch (decodeError) {
                console.error('Token decode error:', decodeError);
            }
        }
    }, []);

    useEffect(() => {
        dispatch(fetchStages());
    }, [dispatch]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchContacts(userId));
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const contactsArray = Array.isArray(contacts) ? contacts : [];
    const stagesArray = Array.isArray(stages) ? stages : [];

    const activeLeads = contactsArray;

    const stageLookupById = useMemo(() => {
        const lookup = new Map();
        stagesArray.forEach((stage) => {
            const stageId = getIdString(stage._id || stage.id);
            if (stageId) {
                lookup.set(stageId, stage);
            }
        });
        return lookup;
    }, [stagesArray]);

    const stageLookupByName = useMemo(() => {
        const lookup = new Map();
        stagesArray.forEach((stage) => {
            const stageName = normalizeText(stage.name || stage.stage_name || stage.title);
            if (stageName) {
                lookup.set(stageName, stage);
            }
        });
        return lookup;
    }, [stagesArray]);

    const resolveStageLabelById = (stageId) => {
        const matchedById = stageLookupById.get(getIdString(stageId));
        if (matchedById) {
            return matchedById.name || matchedById.stage_name || matchedById.title || 'Unnamed Stage';
        }
        return 'Unnamed Stage';
    };

    const getContactId = (contact) => getIdString(contact?._id || contact?.id);

    useEffect(() => {
        if (!activeLeads.length) {
            return;
        }

        let isCancelled = false;

        const syncLatestStageOverrides = async () => {
            try {
                const stageRequests = activeLeads
                    .map((contact) => getContactId(contact))
                    .filter(Boolean)
                    .map(async (contactId) => {
                        try {
                            const response = await apiServiceHandler('GET', `contact-stage/list/${contactId}`);
                            const history = Array.isArray(response?.data) ? response.data : [];

                            if (history.length === 0) {
                                return { contactId, stageId: '' };
                            }

                            const latest = [...history].sort(
                                (a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
                            )[0];

                            const latestStageId = getIdString(latest?.new_stage_id);
                            return { contactId, stageId: latestStageId };
                        } catch {
                            return { contactId, stageId: '' };
                        }
                    });

                const results = await Promise.all(stageRequests);

                if (isCancelled) {
                    return;
                }

                const overrides = results.reduce((acc, item) => {
                    if (item?.contactId && item?.stageId) {
                        acc[item.contactId] = item.stageId;
                    }
                    return acc;
                }, {});

                setStageOverrideByContact((prev) => ({
                    ...prev,
                    ...overrides,
                }));
            } catch (syncError) {
                console.error('Failed to sync latest stage overrides:', syncError);
            }
        };

        syncLatestStageOverrides();

        return () => {
            isCancelled = true;
        };
    }, [activeLeads]);

    const resolveContactStage = (contact) => {
        const contactId = getContactId(contact);
        const overriddenStageId = stageOverrideByContact[contactId];
        if (overriddenStageId) {
            return {
                key: getIdString(overriddenStageId),
                label: resolveStageLabelById(overriddenStageId),
            };
        }

        const rawStage = contact.stage_id || contact.stage || contact.current_stage_id || contact.current_stage || contact.new_stage_id;

        if (rawStage && typeof rawStage === 'object') {
            const objectStageId = getIdString(rawStage._id || rawStage.id || rawStage);
            const objectStageName = rawStage.name || rawStage.stage_name || rawStage.title;
            if (objectStageId) {
                const matchedById = stageLookupById.get(objectStageId);
                if (matchedById) {
                    return {
                        key: getIdString(matchedById._id || matchedById.id),
                        label: matchedById.name || matchedById.stage_name || matchedById.title || 'Unnamed Stage',
                    };
                }
                return {
                    key: objectStageId,
                    label: objectStageName || 'Unnamed Stage',
                };
            }
            if (objectStageName) {
                const matchedByName = stageLookupByName.get(normalizeText(objectStageName));
                if (matchedByName) {
                    return {
                        key: getIdString(matchedByName._id || matchedByName.id),
                        label: matchedByName.name || matchedByName.stage_name || matchedByName.title || 'Unnamed Stage',
                    };
                }
                return {
                    key: normalizeText(objectStageName),
                    label: objectStageName,
                };
            }
        }

        const rawStageId = getIdString(rawStage);
        if (rawStageId) {
            const matchedById = stageLookupById.get(rawStageId);
            if (matchedById) {
                return {
                    key: getIdString(matchedById._id || matchedById.id),
                    label: matchedById.name || matchedById.stage_name || matchedById.title || 'Unnamed Stage',
                };
            }
        }

        const rawStageName = normalizeText(rawStage);
        if (rawStageName) {
            const matchedByName = stageLookupByName.get(rawStageName);
            if (matchedByName) {
                return {
                    key: getIdString(matchedByName._id || matchedByName.id),
                    label: matchedByName.name || matchedByName.stage_name || matchedByName.title || 'Unnamed Stage',
                };
            }
            return {
                key: rawStageName,
                label: String(rawStage),
            };
        }

        return {
            key: 'unassigned-stage',
            label: 'Unassigned',
        };
    };

    const stageGroups = useMemo(() => {
        const groupsMap = new Map();

        stagesArray.forEach((stage) => {
            const stageKey = getIdString(stage._id || stage.id) || normalizeText(stage.name || stage.stage_name || stage.title);
            if (stageKey) {
                groupsMap.set(stageKey, {
                    key: stageKey,
                    label: stage.name || stage.stage_name || stage.title || 'Unnamed Stage',
                    contacts: [],
                });
            }
        });

        activeLeads.forEach((contact) => {
            const resolvedStage = resolveContactStage(contact);
            if (!groupsMap.has(resolvedStage.key)) {
                groupsMap.set(resolvedStage.key, {
                    key: resolvedStage.key,
                    label: resolvedStage.label,
                    contacts: [],
                });
            }

            groupsMap.get(resolvedStage.key).contacts.push(contact);
        });

        const groups = Array.from(groupsMap.values());
        const unassignedGroup = groups.find((group) => group.key === 'unassigned-stage');
        const nonUnassignedGroups = groups.filter((group) => group.key !== 'unassigned-stage');

        if (unassignedGroup) {
            return [...nonUnassignedGroups, unassignedGroup];
        }

        return nonUnassignedGroups;
    }, [activeLeads, stagesArray, stageLookupById, stageLookupByName, stageOverrideByContact]);

    const stageStripItems = useMemo(() => {
        return stageGroups.filter((group) => group.key !== 'unassigned-stage');
    }, [stageGroups]);

    useEffect(() => {
        if (stageGroups.length > 0) {
            setOpenStageKey(stageGroups[0].key);
        } else {
            setOpenStageKey('');
        }
        setOpenContactMap({});
    }, [stageGroups.length]);

    const handleToggleStageAccordion = (stageKey) => {
        setOpenStageKey((previousKey) => (previousKey === stageKey ? '' : stageKey));
    };

    const handleToggleLeadAccordion = (stageKey, contactId) => {
        setOpenContactMap((prev) => ({
            ...prev,
            [stageKey]: prev[stageKey] === contactId ? null : contactId,
        }));

        if (openContactMap[stageKey] !== contactId) {
            fetchContactInsights(contactId);
        }
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) return 'N/A';
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';

        return parsedDate.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatActivityType = (activityType) => {
        const rawType = String(activityType || '').trim().toLowerCase();
        if (!rawType) return 'N/A';

        return rawType
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    };

    const formatLogNoteDateTime = (dateValue) => {
        if (!dateValue) return 'N/A';

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';

        const day = String(parsedDate.getDate()).padStart(2, '0');
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const year = parsedDate.getFullYear();

        let hours = parsedDate.getHours();
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
        const seconds = String(parsedDate.getSeconds()).padStart(2, '0');
        const meridiem = hours >= 12 ? 'pm' : 'am';

        hours = hours % 12;
        hours = hours === 0 ? 12 : hours;

        return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${meridiem}`;
    };

    const getDaysInCurrentStage = (contactId) => {
        const insights = contactInsightsMap[contactId];
        const movedDate = insights?.latestStageMovedAt;

        if (!movedDate) return 'N/A';

        const movedAt = new Date(movedDate);
        if (Number.isNaN(movedAt.getTime())) return 'N/A';

        const today = new Date();
        const diffMs = today.getTime() - movedAt.getTime();
        const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        return `${days} day${days === 1 ? '' : 's'}`;
    };

    const fetchContactInsights = async (contactId) => {
        if (!contactId) return;
        if (contactInsightsMap[contactId]?.loaded || contactInsightsMap[contactId]?.loading) return;

        setContactInsightsMap((prev) => ({
            ...prev,
            [contactId]: {
                ...(prev[contactId] || {}),
                loading: true,
                loaded: false,
            },
        }));

        try {
            const [messagesResponse, stagesResponse] = await Promise.all([
                apiServiceHandler('GET', `contact-message/list/${contactId}`),
                apiServiceHandler('GET', `contact-stage/list/${contactId}`),
            ]);

            const messages = Array.isArray(messagesResponse?.data) ? messagesResponse.data : [];
            const stageHistory = Array.isArray(stagesResponse?.data) ? stagesResponse.data : [];

            const latestLogNote = [...messages]
                .filter((message) => String(message?.msg_type || '').toLowerCase() === 'log_note')
                .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

            const callTrackers = [...messages]
                .filter((message) => String(message?.msg_type || '').toLowerCase() === 'schedule_activity')
                .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

            const latestStageChange = [...stageHistory]
                .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))[0] || null;

            setContactInsightsMap((prev) => ({
                ...prev,
                [contactId]: {
                    loading: false,
                    loaded: true,
                    logNotes: latestLogNote,
                    callTrackers,
                    latestStageMovedAt: latestStageChange?.createdAt || latestStageChange?.created_at || null,
                },
            }));
        } catch (insightsError) {
            setContactInsightsMap((prev) => ({
                ...prev,
                [contactId]: {
                    ...(prev[contactId] || {}),
                    loading: false,
                    loaded: true,
                    logNotes: [],
                    callTrackers: [],
                    latestStageMovedAt: null,
                },
            }));
        }
    };

    const handleShiftStage = async (contact, selectedStageId) => {
        const contactId = getContactId(contact);
        if (!contactId) return;

        if (!selectedStageId || selectedStageId === 'unassigned-stage') {
            toast.error('Please select a valid stage');
            return;
        }

        const currentStage = resolveContactStage(contact);
        if (selectedStageId === currentStage.key) {
            toast.error('Contact is already in this stage');
            return;
        }

        const oldStageObj = stageLookupById.get(currentStage.key);
        const newStageObj = stageLookupById.get(getIdString(selectedStageId));

        if (!newStageObj) {
            toast.error('Selected stage not found');
            return;
        }

        const fullName = [contact?.fname, contact?.mname, contact?.lname].filter(Boolean).join(' ').trim() || 'Unknown Contact';

        setShiftingContactMap((prev) => ({
            ...prev,
            [contactId]: true,
        }));

        try {
            await dispatch(createContactStage({
                contact_id: contactId,
                old_stage_id: oldStageObj?._id || oldStageObj?.id || currentStage.key,
                new_stage_id: newStageObj._id || newStageObj.id,
                old_stage_name: oldStageObj?.name || currentStage.label,
                new_stage_name: newStageObj.name || newStageObj.stage_name || newStageObj.title || 'Unnamed Stage',
                user_name: fullName,
                createdAt: new Date().toISOString(),
            })).unwrap();

            setStageOverrideByContact((prev) => ({
                ...prev,
                [contactId]: getIdString(newStageObj._id || newStageObj.id),
            }));

            setContactInsightsMap((prev) => ({
                ...prev,
                [contactId]: {
                    ...(prev[contactId] || {}),
                    latestStageMovedAt: new Date().toISOString(),
                    loaded: true,
                },
            }));

            toast.success(`Shifted to ${newStageObj.name || newStageObj.stage_name || newStageObj.title}`);
        } catch (shiftError) {
            toast.error(shiftError || 'Failed to shift stage');
        } finally {
            setShiftingContactMap((prev) => ({
                ...prev,
                [contactId]: false,
            }));
        }
    };

    const handleRequestStageShift = (contact, nextStageId) => {
        const nextStageLabel = resolveStageLabelById(nextStageId);
        setPendingStageChange({
            contact,
            nextStageId,
            nextStageLabel,
        });
    };

    const handleConfirmStageShift = async () => {
        if (!pendingStageChange) return;

        await handleShiftStage(pendingStageChange.contact, pendingStageChange.nextStageId);
        setPendingStageChange(null);
    };

    const handleMessageClick = (contactId) => {
        router.push(`/admin/messages?contactId=${contactId}`);
    };

    const handleEditClick = (contactId) => {
        router.push(`/admin/contacts/edit/${contactId}`);
    };

    return (
        <div className="contact-leads2-container">
            <div className="contact-leads2-header">
                <div className="contact-leads2-header-top">
                    <h1 className="page-title">Contact Leads</h1>
                    <div className="view2-toggle">
                        <button
                            type="button"
                            className={`view2-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                            onClick={() => setViewMode('card')}
                        >
                            <FaThLarge /> Grid
                        </button>
                        <button
                            type="button"
                            className={`view2-toggle-btn ${viewMode === 'accordion' ? 'active' : ''}`}
                            onClick={() => setViewMode('accordion')}
                        >
                            <FaBars /> List
                        </button>
                    </div>
                </div>
                <p className="page-subtitle">View leads grouped by stages</p>
            </div>

            <div className="leads2-toolbar">
                <div className="stage2-strip" aria-label="Lead stages">
                    {stageStripItems.map((stageGroup, index) => (
                        <div key={stageGroup.key} className={`stage2-strip-item stage2-strip-color-${(index % 10) + 1}`}>
                            <span className="stage2-strip-count">{stageGroup.contacts.length}</span>
                            <span className="stage2-strip-name">{stageGroup.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="leads2-list-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading leads...</p>
                    </div>
                ) : stageGroups.length === 0 ? (
                    <div className="empty-state">
                        <h3>No leads found</h3>
                        <p>No contacts are available for the configured stages.</p>
                    </div>
                ) : (
                    <div className="stage2-accordion-list">
                        {stageGroups.map((stageGroup) => {
                            const isStageOpen = openStageKey === stageGroup.key;

                            return (
                                <div key={stageGroup.key} className="stage2-accordion-item">
                                    <button
                                        type="button"
                                        className="stage2-accordion-header"
                                        onClick={() => handleToggleStageAccordion(stageGroup.key)}
                                    >
                                        <div className="stage2-main-info">
                                            <span className="stage2-name">{stageGroup.label}</span>
                                            <span className="stage2-count">({stageGroup.contacts.length})</span>
                                        </div>
                                        <span className="stage2-accordion-icon">{isStageOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                                    </button>

                                    {isStageOpen && (
                                        <div className="stage2-accordion-body">
                                            {stageGroup.contacts.length === 0 ? (
                                                <div className="stage2-empty">No leads in this stage.</div>
                                            ) : viewMode === 'card' ? (
                                                <div className="lead2-cards-grid">
                                                    {stageGroup.contacts.map((contact) => {
                                                        const contactId = contact._id || contact.id;
                                                        const fullName = [contact.fname, contact.mname, contact.lname].filter(Boolean).join(' ').trim();

                                                        return (
                                                            <div key={contactId} className="lead2-card-item">
                                                                <h3 className="lead2-card-title">{fullName || 'n/a'}</h3>
                                                                <div className="lead2-card-lines">
                                                                    <p className="lead2-line"><strong>Email:</strong> {contact.email || 'n/a'}</p>
                                                                    <p className="lead2-line"><strong>Phone:</strong> {contact.phone || 'n/a'}</p>
                                                                </div>

                                                                <div className="lead2-actions">
                                                                    <button
                                                                        type="button"
                                                                        className="btn-primary"
                                                                        onClick={() => handleMessageClick(contactId)}
                                                                    >
                                                                        <FaCommentDots /> Send Message
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="btn-secondary"
                                                                        onClick={() => handleEditClick(contactId)}
                                                                    >
                                                                        <FaEdit /> Edit Contact
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="lead2-accordion-list">
                                                    {stageGroup.contacts.map((contact) => {
                                                        const contactId = contact._id || contact.id;
                                                        const isLeadOpen = openContactMap[stageGroup.key] === contactId;
                                                        const fullName = [contact.fname, contact.mname, contact.lname].filter(Boolean).join(' ').trim();
                                                        const contactIdString = getIdString(contactId);
                                                        const insights = contactInsightsMap[contactIdString] || {};
                                                        const currentStage = resolveContactStage(contact);
                                                        const activeStages = stagesArray.filter((stage) => stage.status === 'active' || !stage.status);
                                                        const selectedStageId = currentStage.key;

                                                        return (
                                                            <div key={contactId} className="lead2-accordion-item">
                                                                <button
                                                                    type="button"
                                                                    className="lead2-accordion-header"
                                                                    onClick={() => handleToggleLeadAccordion(stageGroup.key, contactId)}
                                                                >
                                                                    <div className="lead2-main-info">
                                                                        <span className="lead2-name">{fullName || 'n/a'}</span>
                                                                        <span className="lead2-meta">
                                                                            <FaEnvelope /> {contact.email || 'n/a'}
                                                                        </span>
                                                                        <span className="lead2-meta">
                                                                            <FaPhone /> {contact.phone || 'n/a'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="lead2-accordion-icon">{isLeadOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                                                                </button>

                                                                {isLeadOpen && (
                                                                    <div className="lead2-accordion-body">
                                                                        <div className="lead2-columns-grid">
                                                                            <div className="lead2-column">
                                                                                <h4>Personal Details</h4>
                                                                                <ul className="lead2-column-list">
                                                                                    <li><strong>Name:</strong> {fullName || 'n/a'}</li>
                                                                                    <li><strong>Email:</strong> {contact.email || 'n/a'}</li>
                                                                                    <li><strong>Phone:</strong> {contact.phone || 'n/a'}</li>
                                                                                </ul>
                                                                            </div>

                                                                            <div className="lead2-column">
                                                                                <h4>Log Notes</h4>
                                                                                {insights.loading ? (
                                                                                    <p className="lead2-column-text">Loading...</p>
                                                                                ) : Array.isArray(insights.logNotes) && insights.logNotes.length > 0 ? (
                                                                                    <ul className="lead2-notes-list">
                                                                                        {insights.logNotes.map((noteItem) => (
                                                                                            <li key={noteItem._id || `${noteItem.message}-${noteItem.createdAt || noteItem.created_at}`}>
                                                                                                <span className="lead2-note-text">{noteItem.message || 'N/A'}</span>
                                                                                                <span className="lead2-note-time"> {formatLogNoteDateTime(noteItem.createdAt || noteItem.created_at)}</span>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <p className="lead2-column-text">No log note found</p>
                                                                                )}
                                                                            </div>

                                                                            <div className="lead2-column">
                                                                                <h4>Call Tracker</h4>
                                                                                {insights.loading ? (
                                                                                    <p className="lead2-column-text">Loading...</p>
                                                                                ) : Array.isArray(insights.callTrackers) && insights.callTrackers.length > 0 ? (
                                                                                    <ul className="lead2-tracker-list">
                                                                                        {insights.callTrackers.map((trackerItem) => (
                                                                                            <li key={trackerItem._id || `${trackerItem.message}-${trackerItem.createdAt || trackerItem.created_at}`} className="lead2-tracker-item">
                                                                                                <p className="lead2-tracker-head">
                                                                                                    {formatActivityType(trackerItem.activity_type)} - {formatLogNoteDateTime(trackerItem.due_date || trackerItem.createdAt || trackerItem.created_at)}
                                                                                                </p>
                                                                                                <p className="lead2-tracker-detail">{trackerItem.message || 'N/A'}</p>
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <p className="lead2-column-text">No call tracker found</p>
                                                                                )}
                                                                            </div>

                                                                            <div className="lead2-column">
                                                                                <h4>Stays In Stage</h4>
                                                                                <div className="lead2-column-stack">
                                                                                    <p className="lead2-column-text">{getDaysInCurrentStage(contactIdString)}</p>
                                                                                    <small>Current: {currentStage.label}</small>
                                                                                </div>
                                                                            </div>

                                                                            <div className="lead2-column">
                                                                                <h4>Actions</h4>
                                                                                <label className="lead2-shift-label">Shift to:</label>
                                                                                <div className="lead2-shift-row">
                                                                                    <select
                                                                                        className="lead2-shift-select"
                                                                                        value={selectedStageId}
                                                                                        disabled={!!shiftingContactMap[contactIdString]}
                                                                                        onChange={(event) => {
                                                                                            const nextStageId = event.target.value;
                                                                                            handleRequestStageShift(contact, nextStageId);
                                                                                        }}
                                                                                    >
                                                                                        {activeStages.map((stage) => {
                                                                                            const stageId = getIdString(stage._id || stage.id);
                                                                                            return (
                                                                                                <option key={stageId} value={stageId}>
                                                                                                    {stage.name || stage.stage_name || stage.title || 'Unnamed Stage'}
                                                                                                </option>
                                                                                            );
                                                                                        })}
                                                                                    </select>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className="lead2-actions">
                                                                            <button
                                                                                type="button"
                                                                                className="btn-primary"
                                                                                onClick={() => handleMessageClick(contactId)}
                                                                            >
                                                                                <FaCommentDots /> Send Message
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                className="btn-secondary"
                                                                                onClick={() => handleEditClick(contactId)}
                                                                            >
                                                                                <FaEdit /> Edit Contact
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {pendingStageChange && (
                <div className="lead2-modal-overlay" onClick={() => setPendingStageChange(null)}>
                    <div className="lead2-modal-content" onClick={(event) => event.stopPropagation()}>
                        <div className="lead2-modal-header">
                            <h3>Confirm Stage Change</h3>
                        </div>
                        <div className="lead2-modal-body">
                            <p>
                                Are you sure you want to move this contact to
                                <strong> {pendingStageChange.nextStageLabel}</strong> stage?
                            </p>
                        </div>
                        <div className="lead2-modal-footer">
                            <button
                                type="button"
                                className="lead2-btn-danger"
                                onClick={handleConfirmStageShift}
                            >
                                Update
                            </button>
                            <button
                                type="button"
                                className="lead2-btn-secondary"
                                onClick={() => setPendingStageChange(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactLeads;