'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
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
import './ContactLeads.css';

const normalizeLeadType = (leadType) => String(leadType || '').toLowerCase().replace(/[^a-z]/g, '');

const ContactLeads = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { contacts, loading, error } = useAppSelector((state) => state.contacts);

    const [activeTab, setActiveTab] = useState('qualified');
    const [viewMode, setViewMode] = useState('accordion');
    const [openContactId, setOpenContactId] = useState(null);
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

    const qualifiedLeads = useMemo(() => {
        return contactsArray.filter((contact) => normalizeLeadType(contact.lead_type) === 'qualified');
    }, [contactsArray]);

    const disqualifiedLeads = useMemo(() => {
        return contactsArray.filter((contact) => normalizeLeadType(contact.lead_type) === 'disqualified');
    }, [contactsArray]);

    const activeLeads = activeTab === 'qualified' ? qualifiedLeads : disqualifiedLeads;

    const handleToggleAccordion = (contactId) => {
        setOpenContactId((previousId) => (previousId === contactId ? null : contactId));
    };

    const handleMessageClick = (contactId) => {
        router.push(`/admin/messages?contactId=${contactId}`);
    };

    const handleEditClick = (contactId) => {
        router.push(`/admin/contacts/edit/${contactId}`);
    };

    return (
        <div className="contact-leads-container">
            <div className="contact-leads-header">
                <h1 className="page-title">Contact Leads</h1>
                <p className="page-subtitle">View and manage qualified and disqualified leads</p>
            </div>

            <div className="leads-toolbar">
                <div className="leads-tabs">
                    <button
                        type="button"
                        className={`lead-tab ${activeTab === 'qualified' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('qualified');
                            setOpenContactId(null);
                        }}
                    >
                        <FaCheckCircle /> Qualified Leads ({qualifiedLeads.length})
                    </button>
                    <button
                        type="button"
                        className={`lead-tab ${activeTab === 'disqualified' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('disqualified');
                            setOpenContactId(null);
                        }}
                    >
                        <FaTimesCircle /> Disqualified Leads ({disqualifiedLeads.length})
                    </button>
                </div>

                <div className="view-toggle">
                    <button
                        type="button"
                        className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                        onClick={() => setViewMode('card')}
                    >
                        <FaThLarge /> Grid
                    </button>
                    <button
                        type="button"
                        className={`view-toggle-btn ${viewMode === 'accordion' ? 'active' : ''}`}
                        onClick={() => setViewMode('accordion')}
                    >
                        <FaBars /> List
                    </button>
                </div>
            </div>

            <div className="leads-list-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading leads...</p>
                    </div>
                ) : activeLeads.length === 0 ? (
                    <div className="empty-state">
                        <h3>No {activeTab} leads found</h3>
                        <p>
                            {activeTab === 'qualified'
                                ? 'No contacts currently marked as qualified.'
                                : 'No contacts currently marked as disqualified.'}
                        </p>
                    </div>
                ) : viewMode === 'card' ? (
                    <div className="lead-cards-grid">
                        {activeLeads.map((contact) => {
                            const contactId = contact._id || contact.id;
                            const fullName = [contact.fname, contact.mname, contact.lname].filter(Boolean).join(' ').trim();

                            return (
                                <div key={contactId} className="lead-card-item">
                                    <h3 className="lead-card-title">{fullName || 'n/a'}</h3>
                                    <div className="lead-card-lines">
                                        <p className="lead-line"><strong>Email:</strong> {contact.email || 'n/a'}</p>
                                        <p className="lead-line"><strong>Phone:</strong> {contact.phone || 'n/a'}</p>
                                        <p className="lead-line"><strong>Organization:</strong> {contact.org_name || 'n/a'}</p>
                                        <p className="lead-line"><strong>Lead Type:</strong> {contact.lead_type || 'n/a'}</p>
                                    </div>

                                    <div className="accordion-actions">
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
                    <div className="accordion-list">
                        {activeLeads.map((contact) => {
                            const contactId = contact._id || contact.id;
                            const isOpen = openContactId === contactId;
                            const fullName = [contact.fname, contact.mname, contact.lname].filter(Boolean).join(' ').trim();

                            return (
                                <div key={contactId} className="accordion-item">
                                    <button
                                        type="button"
                                        className="accordion-header"
                                        onClick={() => handleToggleAccordion(contactId)}
                                    >
                                        <div className="lead-main-info">
                                            <span className="lead-name">{fullName || 'n/a'}</span>
                                            <span className="lead-meta">
                                                <FaEnvelope /> {contact.email || 'n/a'}
                                            </span>
                                            <span className="lead-meta">
                                                <FaPhone /> {contact.phone || 'n/a'}
                                            </span>
                                        </div>
                                        <span className="accordion-icon">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                                    </button>

                                    {isOpen && (
                                        <div className="accordion-body">
                                            <div className="lead-details-grid">
                                                <div className="lead-detail">
                                                    <label><FaUser /> Name</label>
                                                    <span>{fullName || 'n/a'}</span>
                                                </div>
                                                <div className="lead-detail">
                                                    <label><FaEnvelope /> Email</label>
                                                    <span>{contact.email || 'n/a'}</span>
                                                </div>
                                                <div className="lead-detail">
                                                    <label><FaPhone /> Phone</label>
                                                    <span>{contact.phone || 'n/a'}</span>
                                                </div>
                                                <div className="lead-detail">
                                                    <label><FaBuilding /> Organization</label>
                                                    <span>{contact.org_name || 'n/a'}</span>
                                                </div>
                                            </div>

                                            <div className="accordion-actions">
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
        </div>
    );
};

export default ContactLeads;
