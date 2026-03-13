'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchCountries, deleteCountry } from "@/redux/slices/countrySlice";
import toast from 'react-hot-toast';
import { FaSearch, FaGlobe, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import '../TagManagers/ListTagManagers.css';

const ListCountries = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { countries, loading, error, lastFetchedAt } = useAppSelector((state) => state.country);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        if (loading || lastFetchedAt > 0) return;

        const loadCountries = async () => {
            try {
                await dispatch(fetchCountries()).unwrap();
            } catch (err) {
                console.error('Error loading countries:', err);
            }
        };
        loadCountries();
    }, [dispatch, loading, lastFetchedAt]);

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
            toast.error('Please select at least one country to delete');
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
                deleteTargetIds.map((id) => dispatch(deleteCountry(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'Country deleted successfully' : `${successCount} countries deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 country' : `Failed to delete ${failedCount} countries`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete country');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/country/add');
    };

    const handleEditClick = (country) => {
        router.push(`/admin/country/edit/${country._id || country.id}`);
    };

    const handleShowClick = (country) => {
        router.push(`/admin/country/${country._id || country.id}`);
    };

    const countriesArray = Array.isArray(countries) ? countries : [];

    const filteredCountries = useMemo(() => {
        return countriesArray.filter((country) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                country.name?.toLowerCase().includes(searchLower) ||
                country.phonecode?.toLowerCase().includes(searchLower) ||
                country.iso3?.toLowerCase().includes(searchLower) ||
                country.iso2?.toLowerCase().includes(searchLower)
            );
        });
    }, [countriesArray, searchTerm]);

    const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCountries = filteredCountries.slice(indexOfFirstItem, indexOfLastItem);
    const currentCountryIds = currentCountries.map((country) => country._id || country.id).filter(Boolean);
    const isAllCurrentSelected = currentCountryIds.length > 0 && currentCountryIds.every((id) => selectedIds.includes(id));

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentCountryIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentCountryIds])));
    };

    useEffect(() => {
        const validIds = new Set(countriesArray.map((country) => country._id || country.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [countriesArray]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredCountries.length === 0) return null;

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
                    <h1 className="page-title">Countries</h1>
                    <p className="page-subtitle">Manage countries</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add Country
                    </button>
                </div>
            </div>

            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name, phonecode, iso3, iso2..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Add Country
                </button>
            </div>

            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading countries...</p>
                    </div>
                ) : filteredCountries.length === 0 ? (
                    <div className="empty-state">
                        <FaGlobe className="empty-icon" />
                        <h3>No record found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first country'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Add Your First Country
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
                                                aria-label="Select all current page countries"
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>phonecode</th>
                                        <th>iso3</th>
                                        <th>iso2</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCountries.map((country) => (
                                        <tr key={country._id || country.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(country._id || country.id)}
                                                    onChange={() => handleToggleSelect(country._id || country.id)}
                                                    aria-label="Select country row"
                                                />
                                            </td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaGlobe className="name-icon" />
                                                    <span
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(country)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {country.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{country.phonecode || 'N/A'}</td>
                                            <td>{country.iso3 || 'N/A'}</td>
                                            <td>{country.iso2 || 'N/A'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(country)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(country._id || country.id)}
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
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCountries.length)} of {filteredCountries.length} countr{filteredCountries.length !== 1 ? 'ies' : 'y'}
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} countries? This action cannot be undone.`
                                    : 'Are you sure you want to delete this country? This action cannot be undone.'}
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

export default ListCountries;