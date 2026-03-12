'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchStates, deleteState } from "@/redux/slices/stateSlice";
import { fetchCountries } from "@/redux/slices/countrySlice";
import toast from 'react-hot-toast';
import { FaMapMarkedAlt, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import '../TagManagers/ListTagManagers.css';

const ListStates = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { states, loading, error } = useAppSelector((state) => state.stateMaster);
    const { countries, error: countryError } = useAppSelector((state) => state.country);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        if (Array.isArray(countries) && countries.length > 0) return;
        dispatch(fetchCountries());
    }, [dispatch, countries]);

    useEffect(() => {
        if (!selectedCountryId || (Array.isArray(states) && states.length > 0)) return;

        const loadStates = async () => {
            try {
                await dispatch(fetchStates()).unwrap();
            } catch (err) {
                console.error('Error loading states:', err);
            }
        };

        loadStates();
    }, [dispatch, selectedCountryId, states]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (countryError) {
            toast.error(countryError);
        }
    }, [countryError]);

    const handleDeleteClick = (id) => {
        setDeleteTargetIds([id]);
        setShowDeleteModal(true);
    };

    const handleBulkDeleteClick = () => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one state to delete');
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
                deleteTargetIds.map((id) => dispatch(deleteState(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'State deleted successfully' : `${successCount} states deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 state' : `Failed to delete ${failedCount} states`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete state');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/state/add');
    };

    const handleEditClick = (item) => {
        router.push(`/admin/state/edit/${item._id || item.id}`);
    };

    const handleShowClick = (item) => {
        router.push(`/admin/state/${item._id || item.id}`);
    };

    const statesArray = Array.isArray(states) ? states : [];
    const countriesArray = Array.isArray(countries) ? countries : [];
    const hasCountrySelected = Boolean(selectedCountryId);

    const getCountryId = (item) => item.country_id || item.countryId || item.country?._id || item.country?.id;

    const selectedCountry = useMemo(() => {
        if (!selectedCountryId) return null;

        return countriesArray.find((country) => {
            const countryId = country.id;
            const countryObjectId = country._id;

            return String(countryId) === String(selectedCountryId) || String(countryObjectId) === String(selectedCountryId);
        }) || null;
    }, [countriesArray, selectedCountryId]);

    const filteredStates = useMemo(() => {
        if (!hasCountrySelected) return [];

        const selectedIds = new Set([
            String(selectedCountryId),
            selectedCountry?.id != null ? String(selectedCountry.id) : '',
            selectedCountry?._id != null ? String(selectedCountry._id) : '',
        ].filter(Boolean));

        const selectedCountryName = (selectedCountry?.name || '').trim().toLowerCase();

        return statesArray.filter((item) => {
            const stateCountryId = getCountryId(item);

            if (stateCountryId != null && selectedIds.has(String(stateCountryId))) {
                return true;
            }

            const stateCountryName = (item.country_name || item.countryName || item.country?.name || '').trim().toLowerCase();
            return selectedCountryName && stateCountryName === selectedCountryName;
        });
    }, [statesArray, selectedCountryId, hasCountrySelected, selectedCountry]);

    const formatDate = (dateValue) => {
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

    const totalPages = Math.ceil(filteredStates.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentStates = filteredStates.slice(indexOfFirstItem, indexOfLastItem);
    const currentStateIds = currentStates.map((item) => item._id || item.id).filter(Boolean);
    const isAllCurrentSelected = currentStateIds.length > 0 && currentStateIds.every((id) => selectedIds.includes(id));

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [selectedCountryId]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentStateIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentStateIds])));
    };

    useEffect(() => {
        const validIds = new Set(filteredStates.map((item) => item._id || item.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [filteredStates]);

    const handleCountryChange = (event) => {
        setSelectedCountryId(event.target.value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredStates.length === 0) return null;

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
                    <h1 className="page-title">States</h1>
                    <p className="page-subtitle">Manage states</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add State
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <select
                    value={selectedCountryId}
                    onChange={handleCountryChange}
                    className="search-input"
                    style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'%3E%3Cpath fill=\'%236c757d\' d=\'M5 6 0 0h10z\'/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '10px 6px',
                        paddingRight: '2rem',
                    }}
                >
                    <option value="">Select Country</option>
                    {countriesArray.map((country) => {
                        const optionValue = country.id || country._id || '';
                        const optionKey = country.id || country._id || country.name;
                        return (
                            <option key={optionKey} value={optionValue}>
                                {country.name}
                            </option>
                        );
                    })}
                </select>
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Add State
                </button>
            </div>

            <div className="table-card">
                {!hasCountrySelected ? (
                    <div className="empty-state">
                        <FaMapMarkedAlt className="empty-icon" />
                        <h3>Select a country to view states</h3>
                        <p>State list and pagination will appear after you choose a country.</p>
                    </div>
                ) : loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading states...</p>
                    </div>
                ) : filteredStates.length === 0 ? (
                    <div className="empty-state">
                        <FaMapMarkedAlt className="empty-icon" />
                        <h3>No states found</h3>
                        <p>No states are available for the selected country.</p>
                        <button className="btn-primary" onClick={handleCreateClick}>
                            <FaPlus /> Add Your First State
                        </button>
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
                                                aria-label="Select all current page states"
                                            />
                                        </th>
                                        <th>Country Name</th>
                                        <th>State Name</th>
                                        <th>Created On</th>
                                        <th>Updated On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStates.map((item) => (
                                        <tr key={item._id || item.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item._id || item.id)}
                                                    onChange={() => handleToggleSelect(item._id || item.id)}
                                                    aria-label="Select state row"
                                                />
                                            </td>
                                            <td>{item.country_name || item.countryName || item.country?.name || 'N/A'}</td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaMapMarkedAlt className="name-icon" />
                                                    <span
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(item)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {item.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{formatDate(item.createdAt || item.created_at)}</td>
                                            <td>{formatDate(item.updatedAt || item.updated_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(item)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(item._id || item.id)}
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
                                    <button className="btn-danger" onClick={handleBulkDeleteClick} style={{ padding: '0.55rem 1.1rem', borderRadius: '7px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', lineHeight: 1, height: '40px' }}>
                                        <FaTrash /> Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <p className="results-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStates.length)} of {filteredStates.length} state{filteredStates.length !== 1 ? 's' : ''}
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} states? This action cannot be undone.`
                                    : 'Are you sure you want to delete this state? This action cannot be undone.'}
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

export default ListStates;
