'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchStages } from '@/redux/slices/stagesSlice';
import toast from 'react-hot-toast';
import {
    FaCheckCircle,
    FaTimesCircle,
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
import './ContactLeads2.css';

const normalizeLeadType = (leadType) => String(leadType || '').toLowerCase().replace(/[^a-z]/g, '');
const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getIdString = (value) => {
    if (!value) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'object') {
        return String(value._id || value.id || value.$oid || '');
    }
    return '';
};

const ContactLeads2 = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { contacts, loading, error } = useAppSelector((state) => state.contacts);
    const { stages } = useAppSelector((state) => state.stages);

    const [activeTab, setActiveTab] = useState('qualified');
    const [viewMode, setViewMode] = useState('accordion');
    const [openStageKey, setOpenStageKey] = useState('');
    const [openContactMap, setOpenContactMap] = useState({});
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

    const qualifiedLeads = useMemo(() => {
        return contactsArray.filter((contact) => normalizeLeadType(contact.lead_type) === 'qualified');
    }, [contactsArray]);

    const disqualifiedLeads = useMemo(() => {
        return contactsArray.filter((contact) => normalizeLeadType(contact.lead_type) === 'disqualified');
    }, [contactsArray]);

    const activeLeads = activeTab === 'qualified' ? qualifiedLeads : disqualifiedLeads;

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

    const resolveContactStage = (contact) => {
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
    }, [activeLeads, stagesArray, stageLookupById, stageLookupByName]);

    useEffect(() => {
        if (stageGroups.length > 0) {
            setOpenStageKey(stageGroups[0].key);
        } else {
            setOpenStageKey('');
        }
        setOpenContactMap({});
    }, [activeTab, stageGroups.length]);

    const handleToggleStageAccordion = (stageKey) => {
        setOpenStageKey((previousKey) => (previousKey === stageKey ? '' : stageKey));
    };

    const handleToggleLeadAccordion = (stageKey, contactId) => {
        setOpenContactMap((prev) => ({
            ...prev,
            [stageKey]: prev[stageKey] === contactId ? null : contactId,
        }));
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
                <h1 className="page-title">Contact Leads 2</h1>
                <p className="page-subtitle">View leads grouped by stages under qualified and disqualified tabs</p>
            </div>

            <div className="leads2-toolbar">
                <div className="leads2-tabs">
                    <button
                        type="button"
                        className={`lead2-tab ${activeTab === 'qualified' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('qualified');
                            setOpenContactMap({});
                        }}
                    >
                        <FaCheckCircle /> Qualified Leads ({qualifiedLeads.length})
                    </button>
                    <button
                        type="button"
                        className={`lead2-tab ${activeTab === 'disqualified' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('disqualified');
                            setOpenContactMap({});
                        }}
                    >
                        <FaTimesCircle /> Disqualified Leads ({disqualifiedLeads.length})
                    </button>
                </div>

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

            <div className="leads2-list-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading leads...</p>
                    </div>
                ) : stageGroups.length === 0 ? (
                    <div className="empty-state">
                        <h3>No {activeTab} leads found</h3>
                        <p>
                            {activeTab === 'qualified'
                                ? 'No contacts currently marked as qualified.'
                                : 'No contacts currently marked as disqualified.'}
                        </p>
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
                                                                    <p className="lead2-line"><strong>Organization:</strong> {contact.org_name || 'n/a'}</p>
                                                                    <p className="lead2-line"><strong>Lead Type:</strong> {contact.lead_type || 'n/a'}</p>
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
                                                                        <div className="lead2-details-grid">
                                                                            <div className="lead2-detail">
                                                                                <label><FaUser /> Name</label>
                                                                                <span>{fullName || 'n/a'}</span>
                                                                            </div>
                                                                            <div className="lead2-detail">
                                                                                <label><FaEnvelope /> Email</label>
                                                                                <span>{contact.email || 'n/a'}</span>
                                                                            </div>
                                                                            <div className="lead2-detail">
                                                                                <label><FaPhone /> Phone</label>
                                                                                <span>{contact.phone || 'n/a'}</span>
                                                                            </div>
                                                                            <div className="lead2-detail">
                                                                                <label><FaBuilding /> Organization</label>
                                                                                <span>{contact.org_name || 'n/a'}</span>
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
        </div>
    );
};

export default ContactLeads2;
