'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchTagManagers, deleteTagManager } from "@/redux/slices/tagManagerSlice";
import toast from 'react-hot-toast';
import { FaSearch, FaTags, FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import './ListTagManagers.css';

const ListTagManagers = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { tagManagers, loading, error } = useAppSelector((state) => state.tagManager);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        if (loading || (Array.isArray(tagManagers) && tagManagers.length > 0)) return;

        const loadTagManagers = async () => {
            try {
                await dispatch(fetchTagManagers()).unwrap();
            } catch (err) {
                console.error('Error loading tag managers:', err);
            }
        };
        loadTagManagers();
    }, [dispatch, tagManagers, loading]);

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
            toast.error('Please select at least one tag manager to delete');
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
                deleteTargetIds.map((id) => dispatch(deleteTagManager(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'Tag manager deleted successfully' : `${successCount} tag managers deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 tag manager' : `Failed to delete ${failedCount} tag managers`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete tag manager');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/tag-managers/add');
    };

    const handleEditClick = (tag) => {
        router.push(`/admin/tag-managers/edit/${tag._id || tag.id}`);
    };

    const handleShowClick = (tag) => {
        router.push(`/admin/tag-managers/${tag._id || tag.id}`);
    };

    const formatCreatedOn = (dateValue) => {
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

    // Ensure tagManagers is an array before filtering
    const tagManagersArray = Array.isArray(tagManagers) ? tagManagers : [];

    const filteredTagManagers = useMemo(() => {
        return tagManagersArray.filter(tag => {
            const searchLower = searchTerm.toLowerCase();
            return (
                tag.full_name?.toLowerCase().includes(searchLower) ||
                tag.desc?.toLowerCase().includes(searchLower)
            );
        });
    }, [tagManagersArray, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredTagManagers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTags = filteredTagManagers.slice(indexOfFirstItem, indexOfLastItem);
    const currentTagIds = currentTags.map((tag) => tag._id || tag.id).filter(Boolean);
    const isAllCurrentSelected = currentTagIds.length > 0 && currentTagIds.every((id) => selectedIds.includes(id));

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentTagIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentTagIds])));
    };

    useEffect(() => {
        const validIds = new Set(tagManagersArray.map((tag) => tag._id || tag.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [tagManagersArray]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredTagManagers.length === 0) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
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

        // First page
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

        // Page numbers
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

        // Last page
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

        // Next button
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
            {/* Header Section */}
            <div className="contacts-header">
                <div>
                    <h1 className="page-title">Tag Managers</h1>
                    <p className="page-subtitle">Manage system tags</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add Tag
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name, description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Add Tag
                </button>
            </div>

            {/* Table Card */}
            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading tag managers...</p>
                    </div>
                ) : filteredTagManagers.length === 0 ? (
                    <div className="empty-state">
                        <FaTags className="empty-icon" />
                        <h3>No tag managers found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first tag manager'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Add Your First Tag
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="contacts-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={isAllCurrentSelected}
                                                onChange={handleToggleSelectAllCurrent}
                                                aria-label="Select all current page tag managers"
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Created On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTags.map((tag) => (
                                        <tr key={tag._id || tag.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(tag._id || tag.id)}
                                                    onChange={() => handleToggleSelect(tag._id || tag.id)}
                                                    aria-label="Select tag row"
                                                />
                                            </td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaTags className="name-icon" />
                                                    <span 
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(tag)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {tag.full_name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{tag.desc || 'N/A'}</td>
                                            <td>{formatCreatedOn(tag.createdAt || tag.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {/* <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => handleShowClick(tag)}
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button> */}
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(tag)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(tag._id || tag.id)}
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
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
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTagManagers.length)} of {filteredTagManagers.length} tag{filteredTagManagers.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {renderPagination()}
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Delete</h3>
                        </div>
                        <div className="modal-body">
                            <p>
                                {deleteTargetIds.length > 1
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} tag managers? This action cannot be undone.`
                                    : 'Are you sure you want to delete this tag manager? This action cannot be undone.'}
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
        </div>
    );
};

export default ListTagManagers;
