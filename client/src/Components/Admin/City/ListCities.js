'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { deleteCity } from "@/redux/slices/citySlice";
import { fetchStates } from "@/redux/slices/stateSlice";
import { fetchCountries } from "@/redux/slices/countrySlice";
import apiServiceHandler from '@/service/apiService';
import toast from 'react-hot-toast';
import { FaCity, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import '../TagManagers/ListTagManagers.css';

const ListCities = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { loading: cityActionLoading, error } = useAppSelector((state) => state.cityMaster);
    const { states, error: stateError } = useAppSelector((state) => state.stateMaster);
    const { countries, error: countryError } = useAppSelector((state) => state.country);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedCountryId, setSelectedCountryId] = useState('');
    const [selectedStateId, setSelectedStateId] = useState('');
    const [stateCities, setStateCities] = useState([]);
    const [cityFetchLoading, setCityFetchLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);

    useEffect(() => {
        dispatch(fetchCountries());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedCountryId) return;
        dispatch(fetchStates());
    }, [dispatch, selectedCountryId]);

    const toCityRows = (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response)) return response;
        return [];
    };

    const fetchCitiesForState = async (stateId) => {
        if (!stateId) {
            setStateCities([]);
            return;
        }

        const encodedStateId = encodeURIComponent(String(stateId));
        const endpointCandidates = [
            `city/list?state_id=${encodedStateId}`,
            `city/list?stateId=${encodedStateId}`,
            `city/list/${encodedStateId}`,
        ];

        setCityFetchLoading(true);

        try {
            for (const endpoint of endpointCandidates) {
                try {
                    const response = await apiServiceHandler('GET', endpoint);
                    const cityRows = toCityRows(response);

                    // Keep first successful response to avoid calling heavy unfiltered city/list.
                    setStateCities(cityRows);
                    return;
                } catch (candidateError) {
                    // Try next endpoint candidate.
                }
            }

            setStateCities([]);
            // Avoid noisy user-facing errors when endpoint variants are unavailable.
        } finally {
            setCityFetchLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedCountryId || !selectedStateId) {
            setStateCities([]);
            return;
        }

        fetchCitiesForState(selectedStateId);
    }, [selectedCountryId, selectedStateId]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        if (stateError) {
            toast.error(stateError);
        }
    }, [stateError]);

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
            toast.error('Please select at least one city to delete');
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
                deleteTargetIds.map((id) => dispatch(deleteCity(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'City deleted successfully' : `${successCount} cities deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 city' : `Failed to delete ${failedCount} cities`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);

            if (selectedStateId) {
                fetchCitiesForState(selectedStateId);
            }
        } catch (err) {
            toast.error('Failed to delete city');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/city/add');
    };

    const handleEditClick = (item) => {
        router.push(`/admin/city/edit/${item._id || item.id}`);
    };

    const handleShowClick = (item) => {
        router.push(`/admin/city/${item._id || item.id}`);
    };

    const citiesArray = Array.isArray(stateCities) ? stateCities : [];
    const statesArray = Array.isArray(states) ? states : [];
    const countriesArray = Array.isArray(countries) ? countries : [];
    const hasCountrySelected = Boolean(selectedCountryId);
    const hasStateSelected = Boolean(selectedStateId);

    // Canonical FK chain: countries.id -> states.country_id -> cities.state_id
    const getCountryIdFromState = (stateItem) => {
        const rawCountryId = stateItem.country_id ?? stateItem.countryId ?? stateItem.country;
        if (rawCountryId && typeof rawCountryId === 'object') {
            return rawCountryId.id ?? rawCountryId._id;
        }
        return rawCountryId;
    };

    const getStateId = (stateItem) => stateItem.id ?? stateItem._id;

    const getStateIdFromCity = (cityItem) => {
        const rawStateId = cityItem.state_id ?? cityItem.stateId ?? cityItem.state;
        if (rawStateId && typeof rawStateId === 'object') {
            return rawStateId.id ?? rawStateId._id;
        }
        return rawStateId;
    };

    const selectedCountry = useMemo(() => {
        if (!hasCountrySelected) return null;

        return countriesArray.find((country) => (
            String(country.id) === String(selectedCountryId) ||
            String(country._id) === String(selectedCountryId)
        )) || null;
    }, [countriesArray, selectedCountryId, hasCountrySelected]);

    const filteredStatesByCountry = useMemo(() => {
        if (!hasCountrySelected) return [];

        const selectedCountryIds = new Set([
            String(selectedCountryId),
            selectedCountry?.id != null ? String(selectedCountry.id) : '',
            selectedCountry?._id != null ? String(selectedCountry._id) : '',
        ].filter(Boolean));

        const selectedCountryName = (selectedCountry?.name || '').trim().toLowerCase();

        return statesArray.filter((stateItem) => {
            const stateCountryId = getCountryIdFromState(stateItem);
            if (stateCountryId != null && selectedCountryIds.has(String(stateCountryId))) {
                return true;
            }

            const stateCountryName = (stateItem.country_name || stateItem.countryName || stateItem.country?.name || '').trim().toLowerCase();
            return selectedCountryName && stateCountryName === selectedCountryName;
        });
    }, [statesArray, selectedCountryId, hasCountrySelected, selectedCountry]);

    const selectedState = useMemo(() => {
        if (!hasStateSelected) return null;

        return filteredStatesByCountry.find((stateItem) => (
            String(stateItem.id) === String(selectedStateId) ||
            String(stateItem._id) === String(selectedStateId)
        )) || null;
    }, [filteredStatesByCountry, selectedStateId, hasStateSelected]);

    const filteredCities = useMemo(() => {
        if (!hasCountrySelected || !hasStateSelected) return [];

        const selectedStateIds = new Set([
            String(selectedStateId),
            selectedState?.id != null ? String(selectedState.id) : '',
            selectedState?._id != null ? String(selectedState._id) : '',
        ].filter(Boolean));

        const selectedStateName = (selectedState?.name || '').trim().toLowerCase();

        return citiesArray.filter((cityItem) => {
            const cityStateId = getStateIdFromCity(cityItem);
            if (cityStateId != null && selectedStateIds.has(String(cityStateId))) {
                return true;
            }

            const cityStateName = (cityItem.state_name || cityItem.stateName || cityItem.state?.name || '').trim().toLowerCase();
            return selectedStateName && cityStateName === selectedStateName;
        });
    }, [citiesArray, selectedCountryId, selectedStateId, hasCountrySelected, hasStateSelected, selectedState]);

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

    const totalPages = Math.ceil(filteredCities.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCities = filteredCities.slice(indexOfFirstItem, indexOfLastItem);
    const currentCityIds = currentCities.map((item) => item._id || item.id).filter(Boolean);
    const isAllCurrentSelected = currentCityIds.length > 0 && currentCityIds.every((id) => selectedIds.includes(id));

    useEffect(() => {
        setSelectedStateId('');
        setCurrentPage(1);
        setSelectedIds([]);
    }, [selectedCountryId]);

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [selectedStateId]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentCityIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentCityIds])));
    };

    useEffect(() => {
        const validIds = new Set(filteredCities.map((item) => item._id || item.id).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [filteredCities]);

    const handleCountryChange = (event) => {
        setSelectedCountryId(event.target.value);
    };

    const handleStateChange = (event) => {
        setSelectedStateId(event.target.value);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredCities.length === 0) return null;

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
                    <h1 className="page-title">Cities</h1>
                    <p className="page-subtitle">Manage cities</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={handleCreateClick}>
                        <FaPlus /> Add City
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
                        const countryId = country.id ?? country._id;
                        const optionKey = country.id ?? country._id ?? country.name;

                        return (
                            <option key={optionKey} value={countryId ?? ''}>
                                {country.name}
                            </option>
                        );
                    })}
                </select>
                <select
                    value={selectedStateId}
                    onChange={handleStateChange}
                    className="search-input"
                    disabled={!hasCountrySelected}
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
                    <option value="">Select State</option>
                    {filteredStatesByCountry.map((stateItem) => {
                        const stateId = getStateId(stateItem);
                        const optionKey = stateId ?? stateItem.name;

                        return (
                            <option key={optionKey} value={stateId ?? ''}>
                                {stateItem.name}
                            </option>
                        );
                    })}
                </select>
                <button className="btn-add-mobile" onClick={handleCreateClick}>
                    <FaPlus /> Add City
                </button>
            </div>

            <div className="table-card">
                {!hasCountrySelected || !hasStateSelected ? (
                    <div className="empty-state">
                        <FaCity className="empty-icon" />
                        <h3>Select country and state to view cities</h3>
                        <p>City list and pagination will appear only after both selections are made.</p>
                    </div>
                ) : (cityFetchLoading || cityActionLoading) ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading cities...</p>
                    </div>
                ) : filteredCities.length === 0 ? (
                    <div className="empty-state">
                        <FaCity className="empty-icon" />
                        <h3>No cities found</h3>
                        <p>No cities are available for the selected state.</p>
                        <button className="btn-primary" onClick={handleCreateClick}>
                            <FaPlus /> Add Your First City
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
                                                aria-label="Select all current page cities"
                                            />
                                        </th>
                                        <th>Country Name</th>
                                        <th>State Name</th>
                                        <th>City Name</th>
                                        <th>Created On</th>
                                        <th>Updated On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentCities.map((item) => (
                                        <tr key={item._id || item.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(item._id || item.id)}
                                                    onChange={() => handleToggleSelect(item._id || item.id)}
                                                    aria-label="Select city row"
                                                />
                                            </td>
                                            <td>{item.country_name || item.countryName || item.country?.name || 'N/A'}</td>
                                            <td>{item.state_name || item.stateName || item.state?.name || 'N/A'}</td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaCity className="name-icon" />
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
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCities.length)} of {filteredCities.length} cit{filteredCities.length !== 1 ? 'ies' : 'y'}
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} cities? This action cannot be undone.`
                                    : 'Are you sure you want to delete this city? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-danger"
                                onClick={handleDeleteConfirm}
                                disabled={cityActionLoading}
                            >
                                Delete
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteTargetIds([]);
                                }}
                                disabled={cityActionLoading}
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

export default ListCities;
