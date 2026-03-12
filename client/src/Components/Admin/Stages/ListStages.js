'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchStages, deleteStage, updateStage } from "@/redux/slices/stagesSlice";
import toast from 'react-hot-toast';
import { FaSearch, FaLayerGroup, FaPlus, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import './ListStages.css';

const ListStages = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { stages, loading, error } = useAppSelector((state) => state.stages);

    const stagesArray = Array.isArray(stages) ? stages : [];
    const sortOrderOptions = useMemo(
        () => Array.from({ length: stagesArray.length }, (_, index) => index + 1),
        [stagesArray.length]
    );
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [pendingSortUpdate, setPendingSortUpdate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [sortOrderInputs, setSortOrderInputs] = useState({});
    const [savingSortOrderMap, setSavingSortOrderMap] = useState({});

    useEffect(() => {
        if (loading || (Array.isArray(stages) && stages.length > 0)) return;

        const loadStages = async () => {
            try {
                await dispatch(fetchStages()).unwrap();
            } catch (err) {
                console.error('Error loading stages:', err);
            }
        };
        loadStages();
    }, [dispatch, stages, loading]);

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
            toast.error('Please select at least one stage to delete');
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
                deleteTargetIds.map((id) => dispatch(deleteStage(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'Stage deleted successfully' : `${successCount} stages deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 stage' : `Failed to delete ${failedCount} stages`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete stage');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/stages/add');
    };

    const handleEditClick = (stage) => {
        router.push(`/admin/stages/edit/${stage._id || stage.id}`);
    };

    const handleShowClick = (stage) => {
        router.push(`/admin/stages/${stage._id || stage.id}`);
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

    const getSortOrderInputValue = (stage) => {
        const stageId = stage._id || stage.id;
        if (Object.prototype.hasOwnProperty.call(sortOrderInputs, stageId)) {
            return sortOrderInputs[stageId];
        }
        return stage.sort_order ?? '';
    };

    const saveSortOrder = async (stage, nextValue) => {
        const stageId = stage._id || stage.id;
        const currentInput = nextValue ?? getSortOrderInputValue(stage);

        if (currentInput === '' || currentInput === null || currentInput === undefined) {
            toast.error('Sort Order is required');
            setSortOrderInputs((prev) => ({
                ...prev,
                [stageId]: stage.sort_order ?? '',
            }));
            return;
        }

        const parsedSortOrder = Number(currentInput);
        if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 1 || parsedSortOrder > stagesArray.length) {
            toast.error(`Sort Order must be between 1 and ${stagesArray.length}`);
            setSortOrderInputs((prev) => ({
                ...prev,
                [stageId]: stage.sort_order ?? '',
            }));
            return;
        }

        if (parsedSortOrder === Number(stage.sort_order ?? 0)) {
            return;
        }

        setPendingSortUpdate({
            stageId,
            stage,
            parsedSortOrder,
            previousSortOrder: stage.sort_order ?? '',
        });
    };

    const handleSortOrderChange = (stageId, value) => {
        setSortOrderInputs((prev) => ({
            ...prev,
            [stageId]: value,
        }));
    };

    const handleSortOrderSelect = (stage, value) => {
        const stageId = stage._id || stage.id;
        handleSortOrderChange(stageId, value);
        saveSortOrder(stage, value);
    };

    const handleCancelSortOrderUpdate = () => {
        if (pendingSortUpdate?.stageId) {
            setSortOrderInputs((prev) => ({
                ...prev,
                [pendingSortUpdate.stageId]: pendingSortUpdate.previousSortOrder,
            }));
        }
        setPendingSortUpdate(null);
    };

    const handleConfirmSortOrderUpdate = async () => {
        if (!pendingSortUpdate) return;

        const { stageId, stage, parsedSortOrder, previousSortOrder } = pendingSortUpdate;

        setSavingSortOrderMap((prev) => ({ ...prev, [stageId]: true }));
        try {
            await dispatch(
                updateStage({
                    id: stageId,
                    stageData: {
                        ...stage,
                        sort_order: parsedSortOrder,
                    },
                })
            ).unwrap();
            toast.success('Sort order updated');
        } catch (err) {
            toast.error(err || 'Failed to update sort order');
            setSortOrderInputs((prev) => ({
                ...prev,
                [stageId]: previousSortOrder,
            }));
        } finally {
            setSavingSortOrderMap((prev) => ({ ...prev, [stageId]: false }));
            setPendingSortUpdate(null);
        }
    };

    const filteredStages = useMemo(() => {
        return stagesArray.filter(stage => {
            const searchLower = searchTerm.toLowerCase();
            return (
                stage.name?.toLowerCase().includes(searchLower) ||
                stage.desc?.toLowerCase().includes(searchLower)
            );
        });
    }, [stagesArray, searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredStages.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStages = filteredStages.slice(indexOfFirstItem, indexOfLastItem);
    const currentStageIds = currentStages.map((stage) => stage._id || stage.id).filter(Boolean);
    const isAllCurrentSelected = currentStageIds.length > 0 && currentStageIds.every((id) => selectedIds.includes(id));

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const currentPageHasNoItems = filteredStages.length > 0 && indexOfFirstItem >= filteredStages.length;
        const noItemsRemain = filteredStages.length === 0 && currentPage !== 1;

        if (currentPageHasNoItems || noItemsRemain) {
            setCurrentPage(1);
        }
    }, [filteredStages.length, indexOfFirstItem, currentPage]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentStageIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentStageIds])));
    };

    useEffect(() => {
        const validIds = new Set(stagesArray.map((stage) => stage._id || stage.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [stagesArray]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredStages.length === 0) return null;

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
                    <h1 className="page-title">Stages</h1>
                    <p className="page-subtitle">Manage your stages</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add Stage
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <div className="search-field">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Table Card */}
            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading stages...</p>
                    </div>
                ) : filteredStages.length === 0 ? (
                    <div className="empty-state">
                        <FaLayerGroup className="empty-icon" />
                        <h3>No stages found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first stage'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Add Your First Stage
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
                                                aria-label="Select all current page stages"
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th>Sort Order</th>
                                        <th>Created On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStages.map((stage) => (
                                        <tr key={stage._id || stage.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(stage._id || stage.id)}
                                                    onChange={() => handleToggleSelect(stage._id || stage.id)}
                                                    aria-label="Select stage row"
                                                />
                                            </td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaLayerGroup className="name-icon" />
                                                    <span 
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(stage)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {stage.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{stage.desc || 'N/A'}</td>
                                            <td>
                                                <span className={`status-badge ${stage.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                                    {stage.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="sort-order-input"
                                                    value={getSortOrderInputValue(stage)}
                                                    onChange={(e) => handleSortOrderSelect(stage, e.target.value)}
                                                    disabled={Boolean(savingSortOrderMap[stage._id || stage.id])}
                                                >
                                                    <option value="">Select</option>
                                                    {sortOrderOptions.map((sortOrder) => (
                                                        <option key={sortOrder} value={sortOrder}>
                                                            {sortOrder}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>{formatCreatedOn(stage.createdAt || stage.created_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {/* <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => handleShowClick(stage)}
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button> */}
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(stage)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(stage._id || stage.id)}
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
                                <div className="results-info">
                                    <p>
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStages.length)} of {filteredStages.length} stage{filteredStages.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} stages? This action cannot be undone.`
                                    : 'Are you sure you want to delete this stage? This action cannot be undone.'}
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

            {pendingSortUpdate && (
                <div className="modal-overlay" onClick={handleCancelSortOrderUpdate}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirm Update</h3>
                        </div>
                        <div className="modal-body">
                            <p>Are you sure you want to update this sort order?</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-danger"
                                onClick={handleConfirmSortOrderUpdate}
                                disabled={Boolean(savingSortOrderMap[pendingSortUpdate.stageId])}
                            >
                                Update
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={handleCancelSortOrderUpdate}
                                disabled={Boolean(savingSortOrderMap[pendingSortUpdate.stageId])}
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

export default ListStages;
