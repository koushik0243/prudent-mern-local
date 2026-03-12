'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContacts } from '@/redux/slices/contactsSlice';
import { fetchContactMails } from '@/redux/slices/contactMailSlice';
import { fetchContactMailSends, deleteContactMailSend } from '@/redux/slices/contactMailSendSlice';
import toast from 'react-hot-toast';
import { FaSearch, FaEnvelope, FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import '../TagManagers/ListTagManagers.css';

const ListContactMailSend = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { contactMailSends, loading, error } = useAppSelector((state) => state.contactMailSend);
    const { contacts } = useAppSelector((state) => state.contacts);
    const { contactMails } = useAppSelector((state) => state.contactMail);

    const [userId, setUserId] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [previewItem, setPreviewItem] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

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
            }
        }
    }, []);

    useEffect(() => {
        if (!loading && (!Array.isArray(contactMailSends) || contactMailSends.length === 0)) {
            dispatch(fetchContactMailSends());
        }

        if (!Array.isArray(contactMails) || contactMails.length === 0) {
            dispatch(fetchContactMails());
        }

        if (userId && (!Array.isArray(contacts) || contacts.length === 0)) {
            dispatch(fetchContacts(userId));
        }
    }, [dispatch, userId, loading, contactMailSends, contactMails, contacts]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const contactArray = Array.isArray(contacts) ? contacts : [];
    const contactMailArray = Array.isArray(contactMails) ? contactMails : [];
    const sendArray = Array.isArray(contactMailSends) ? contactMailSends : [];

    const resolveId = (value) => {
        if (!value) return '';
        if (typeof value === 'object') return value._id || value.id || '';
        return value;
    };

    const resolveContactIds = (item) => {
        const raw = item?.contact_id || item?.contactId || item?.contact_ids || [];
        if (Array.isArray(raw)) {
            return raw.map((value) => resolveId(value)).filter(Boolean);
        }
        const singleId = resolveId(raw);
        return singleId ? [singleId] : [];
    };

    const getContactEntries = (item) => {
        if (item?.contact && typeof item.contact === 'object') {
            const contactObj = item.contact;
            const fullName = `${contactObj.fname || ''} ${contactObj.lname || ''}`.trim();
            return [{
                name: fullName || 'N/A',
                email: contactObj.email || 'No email',
                phone: contactObj.phone || 'No phone',
            }];
        }

        const contactIds = resolveContactIds(item);
        if (contactIds.length === 0) return [];

        return contactIds
            .map((contactId) => {
                const contactObj = contactArray.find(
                    (contact) => (contact._id || contact.id) === contactId
                );
                if (!contactObj) return null;

                const fullName = `${contactObj.fname || ''} ${contactObj.lname || ''}`.trim();
                return {
                    name: fullName || 'N/A',
                    email: contactObj.email || 'No email',
                    phone: contactObj.phone || 'No phone',
                };
            })
            .filter(Boolean);
    };

    const getContactLabel = (item) => {
        const entries = getContactEntries(item);
        if (entries.length === 0) return 'N/A';

        return entries
            .map((entry) => `${entry.name} ${entry.email} ${entry.phone}`)
            .join(' ');
    };

    const getContactMailLabel = (item) => {
        if (item?.contact_mail && typeof item.contact_mail === 'object') {
            return item.contact_mail.subject || item.contact_mail.full_name || 'N/A';
        }

        const mailId = resolveId(item.mail_id || item.contact_mail_id || item.contactMailId);
        const mailObj = contactMailArray.find(
            (mail) => (mail._id || mail.id) === mailId
        );
        return mailObj ? (mailObj.subject || mailObj.full_name || 'N/A') : 'N/A';
    };

    const getMessagePreview = (item) => {
        if (item.message) return item.message;
        if (item?.contact_mail && typeof item.contact_mail === 'object') {
            return item.contact_mail.message || item.contact_mail.desc || 'N/A';
        }

        const mailId = resolveId(item.contact_mail_id || item.contactMailId);
        const mailObj = contactMailArray.find(
            (mail) => (mail._id || mail.id) === mailId
        );
        return mailObj ? (mailObj.message || mailObj.desc || 'N/A') : 'N/A';
    };

    const getBodyPreview = (value, limit = 100) => {
        if (!value) return { text: 'N/A', isTruncated: false };

        const normalizedText = String(value).trim();
        if (normalizedText.length <= limit) {
            return { text: normalizedText, isTruncated: false };
        }

        return {
            text: `${normalizedText.slice(0, limit)}...`,
            isTruncated: true,
        };
    };

    const filteredItems = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return sendArray.filter((item) => {
            const contactLabel = getContactLabel(item).toLowerCase();
            const mailLabel = getContactMailLabel(item).toLowerCase();
            const messageText = getMessagePreview(item).toLowerCase();
            return (
                contactLabel.includes(searchLower) ||
                mailLabel.includes(searchLower) ||
                messageText.includes(searchLower)
            );
        });
    }, [sendArray, searchTerm, contacts, contactMails]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const currentItemIds = currentItems.map((item) => item._id || item.id).filter(Boolean);
    const isAllCurrentSelected = currentItemIds.length > 0 && currentItemIds.every((id) => selectedIds.includes(id));

    useEffect(() => {
        const validIds = new Set(sendArray.map((item) => item._id || item.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [sendArray]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setDeleteTargetIds([id]);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one record to delete');
            return;
        }

        setDeleteTargetIds([...selectedIds]);
        setShowDeleteModal(true);
    };

    const handleToggleSelect = (id) => {
        if (!id) return;

        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((selectedId) => selectedId !== id);
            }
            return [...prev, id];
        });
    };

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentItemIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentItemIds])));
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetIds.length === 0) return;

        try {
            const results = await Promise.allSettled(
                deleteTargetIds.map((id) => dispatch(deleteContactMailSend(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(
                    successCount === 1
                        ? 'Contact mail send deleted successfully'
                        : `${successCount} contact mail sends deleted successfully`
                );
            }

            if (failedCount > 0) {
                toast.error(
                    failedCount === 1
                        ? 'Failed to delete 1 contact mail send'
                        : `Failed to delete ${failedCount} contact mail sends`
                );
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete contact mail send');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/contact-mail-send/add');
    };

    const handleShowClick = (item) => {
        router.push(`/admin/contact-mail-send/${item._id || item.id}`);
    };

    const formatCreatedAt = (dateValue) => {
        if (!dateValue) return 'N/A';

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return 'N/A';

        return parsedDate.toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderPagination = () => {
        if (filteredItems.length === 0) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            >
                Previous
            </button>
        );

        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => handlePageChange(1)} className="pagination-btn">1</button>
            );
            if (startPage > 2) {
                pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="pagination-btn"
                >
                    {totalPages}
                </button>
            );
        }

        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            >
                Next
            </button>
        );

        return <div className="pagination">{pages}</div>;
    };

    return (
        <div className="list-contacts-container">
            <div className="contacts-header">
                <div>
                    <h1 className="page-title">Contact Mail Send</h1>
                    <p className="page-subtitle">Manage contact mail send records</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Send Email
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by contact, subject, message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Send Email
                </button>
            </div>

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading contact mail sends...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="empty-state">
                        <FaEnvelope className="empty-icon" />
                        <h3>No record found</h3>
                        <p>{searchTerm ? 'Try adjusting your search terms' : 'Get started by sending your first mail'}</p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Send your first mail
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="contacts-table">
                                <colgroup>
                                    <col style={{ width: '4%' }} />
                                    <col style={{ width: '26%' }} />
                                    <col style={{ width: '22%' }} />
                                    <col style={{ width: '28%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={isAllCurrentSelected}
                                                onChange={handleToggleSelectAllCurrent}
                                                aria-label="Select all current page rows"
                                            />
                                        </th>
                                        <th>Contact</th>
                                        <th>Subject</th>
                                        <th>Mail Body</th>
                                        <th>Sent On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item) => {
                                        const messageText = getMessagePreview(item);
                                        const bodyPreview = getBodyPreview(messageText, 100);

                                        return (
                                        <tr key={item._id || item.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item._id || item.id)}
                                                    onChange={() => handleToggleSelect(item._id || item.id)}
                                                    aria-label="Select row"
                                                />
                                            </td>
                                            <td>
                                                <span className="contact-name-text" onClick={() => handleShowClick(item)} role="button" tabIndex="0">
                                                    {getContactEntries(item).length === 0
                                                        ? 'N/A'
                                                        : getContactEntries(item).map((entry, index) => (
                                                            <div key={`${entry.email}-${index}`}>
                                                                <div>{entry.name}</div>
                                                                <div>{entry.email}</div>
                                                                <div>{entry.phone}</div>
                                                            </div>
                                                        ))}
                                                </span>
                                            </td>
                                            <td>{getContactMailLabel(item)}</td>
                                            <td>
                                                <div className="mail-body-preview">
                                                    <span>{bodyPreview.text}</span>
                                                    {bodyPreview.isTruncated && (
                                                        <button
                                                            type="button"
                                                            className="see-more-link"
                                                            onClick={() => setPreviewItem(item)}
                                                        >
                                                            See more
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{formatCreatedAt(item.createdAt || item.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-icon btn-view" onClick={() => handleShowClick(item)} title="View">
                                                        <FaEye />
                                                    </button>
                                                    <button className="btn-icon btn-delete" onClick={() => handleDeleteClick(item._id || item.id)} title="Delete">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                        <div className="table-footer">
                            <div className="table-footer-left">
                                {selectedIds.length > 0 && (
                                    <button
                                        className="btn-danger"
                                        onClick={handleBulkDeleteClick}
                                        style={{
                                            padding: '0.55rem 1.1rem',
                                            borderRadius: '7px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            lineHeight: 1,
                                            height: '40px',
                                        }}
                                    >
                                        <FaTrash /> Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <p className="results-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} record{filteredItems.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {renderPagination()}
                        </div>
                    </>
                )}
            </div>

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                {deleteTargetIds.length > 1
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} contact mail send records? This action cannot be undone.`
                                    : 'Are you sure you want to delete this contact mail send record? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-danger" onClick={handleDeleteConfirm} disabled={loading}>Delete</button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteTargetIds([]);
                                }}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {previewItem && (
                <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Mail Details</h3>
                        </div>
                        <div className="modal-body mail-details-modal-body">
                            <div className="mail-details-field">
                                <label>Subject</label>
                                <div className="mail-details-value">{getContactMailLabel(previewItem)}</div>
                            </div>
                            <div className="mail-details-field">
                                <label>Mail Body</label>
                                <textarea
                                    className="mail-details-textarea"
                                    value={getMessagePreview(previewItem)}
                                    readOnly
                                    rows="8"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setPreviewItem(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListContactMailSend;
