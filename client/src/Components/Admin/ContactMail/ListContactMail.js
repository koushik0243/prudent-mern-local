'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchContactMails, deleteContactMail } from "@/redux/slices/contactMailSlice";
import toast from 'react-hot-toast';
import { FaSearch, FaEnvelope, FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import '../TagManagers/ListTagManagers.css';

const ListContactMail = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { contactMails, loading, error } = useAppSelector((state) => state.contactMail);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [previewMail, setPreviewMail] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        if (loading || (Array.isArray(contactMails) && contactMails.length > 0)) return;

        const loadContactMails = async () => {
            try {
                await dispatch(fetchContactMails()).unwrap();
            } catch (err) {
                console.error('Error loading contact mails:', err);
            }
        };
        loadContactMails();
    }, [dispatch, contactMails, loading]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleDeleteClick = (id) => {
        setDeleteTargetIds([id]);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one contact mail to delete');
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

    const handleDeleteConfirm = async () => {
        if (deleteTargetIds.length === 0) return;

        try {
            const results = await Promise.allSettled(
                deleteTargetIds.map((id) => dispatch(deleteContactMail(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'Contact mail deleted successfully' : `${successCount} contact mail records deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 contact mail record' : `Failed to delete ${failedCount} contact mail records`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete contact mail');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/contact-mail/add');
    };

    const handleEditClick = (mail) => {
        router.push(`/admin/contact-mail/edit/${mail._id || mail.id}`);
    };

    const handleShowClick = (mail) => {
        router.push(`/admin/contact-mail/${mail._id || mail.id}`);
    };

    const contactMailsArray = Array.isArray(contactMails) ? contactMails : [];

    const filteredContactMails = useMemo(() => {
        return contactMailsArray.filter((mail) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (mail.subject || mail.full_name || '').toLowerCase().includes(searchLower) ||
                (mail.message || mail.desc || '').toLowerCase().includes(searchLower)
            );
        });
    }, [contactMailsArray, searchTerm]);

    const totalPages = Math.ceil(filteredContactMails.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMails = filteredContactMails.slice(indexOfFirstItem, indexOfLastItem);
    const currentMailIds = currentMails.map((mail) => mail._id || mail.id).filter(Boolean);
    const isAllCurrentSelected = currentMailIds.length > 0 && currentMailIds.every((id) => selectedIds.includes(id));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentMailIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentMailIds])));
    };

    useEffect(() => {
        const validIds = new Set(contactMailsArray.map((mail) => mail._id || mail.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [contactMailsArray]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const renderPagination = () => {
        if (filteredContactMails.length === 0) return null;

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
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="pagination-btn"
                >
                    1
                </button>
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
                    <h1 className="page-title">Contact Mail Template</h1>
                    <p className="page-subtitle">Manage contact mail records</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add Contact Mail Template
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by subject, mail body..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Add Contact Mail
                </button>
            </div>

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading contact mail records...</p>
                    </div>
                ) : filteredContactMails.length === 0 ? (
                    <div className="empty-state">
                        <FaEnvelope className="empty-icon" />
                        <h3>No contact mail records found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first contact mail record'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Add Your First Contact Mail
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="contacts-table">
                                <colgroup>
                                    <col style={{ width: '4%' }} />
                                    <col style={{ width: '30%' }} />
                                    <col style={{ width: '30%' }} />
                                    <col style={{ width: '16%' }} />
                                    <col style={{ width: '12%' }} />
                                    <col style={{ width: '10%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={isAllCurrentSelected}
                                                onChange={handleToggleSelectAllCurrent}
                                                aria-label="Select all current page contact mails"
                                            />
                                        </th>
                                        <th>Subject</th>
                                        <th>Mail Body</th>
                                        <th>Created On</th>
                                        <th>Updated On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentMails.map((mail) => {
                                        const messageText = mail.message || mail.desc || '';
                                        const bodyPreview = getBodyPreview(messageText, 100);

                                        return (
                                        <tr key={mail._id || mail.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(mail._id || mail.id)}
                                                    onChange={() => handleToggleSelect(mail._id || mail.id)}
                                                    aria-label="Select contact mail row"
                                                />
                                            </td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaEnvelope className="name-icon" />
                                                    <span
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(mail)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {mail.subject || mail.full_name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="mail-body-preview">
                                                    <span>{bodyPreview.text}</span>
                                                    {bodyPreview.isTruncated && (
                                                        <button
                                                            type="button"
                                                            className="see-more-link"
                                                            onClick={() => setPreviewMail(mail)}
                                                        >
                                                            See more
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td>{formatCreatedAt(mail.createdAt || mail.created_at)}</td>
                                            <td>{formatCreatedAt(mail.updatedAt || mail.updated_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => handleShowClick(mail)}
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(mail)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(mail._id || mail.id)}
                                                        title="Delete"
                                                    >
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
                                    <button className="btn-danger" onClick={handleBulkDeleteClick} style={{ padding: '0.55rem 1.1rem', borderRadius: '7px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', lineHeight: 1, height: "40px" }}>
                                        <FaTrash /> Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <p className="results-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredContactMails.length)} of {filteredContactMails.length} record{filteredContactMails.length !== 1 ? 's' : ''}
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} contact mail records? This action cannot be undone.`
                                    : 'Are you sure you want to delete this contact mail record? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-danger"
                                onClick={handleDeleteConfirm}
                                disabled={loading}
                            >
                                Delete
                            </button>
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

            {previewMail && (
                <div className="modal-overlay" onClick={() => setPreviewMail(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Mail Details</h3>
                        </div>
                        <div className="modal-body mail-details-modal-body">
                            <div className="mail-details-field">
                                <label>Subject</label>
                                <div className="mail-details-value">{previewMail.subject || previewMail.full_name || 'N/A'}</div>
                            </div>
                            <div className="mail-details-field">
                                <label>Mail Body</label>
                                <textarea
                                    className="mail-details-textarea"
                                    value={previewMail.message || previewMail.desc || 'N/A'}
                                    readOnly
                                    rows="8"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-secondary"
                                onClick={() => setPreviewMail(null)}
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

export default ListContactMail;
