'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchContacts, deleteContact } from "@/redux/slices/contactsSlice";
import { fetchStages } from "@/redux/slices/stagesSlice";
import { fetchTagManagers } from "@/redux/slices/tagManagerSlice";
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import { FaSearch, FaEnvelope, FaPhone, FaUser, FaPlus, FaTrash, FaEdit, FaEye, FaCommentDots } from 'react-icons/fa';
import './ListContacts.css';

const ListContacts = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { contacts, loading, error } = useAppSelector((state) => state.contacts);
    const { stages } = useAppSelector((state) => state.stages);
    const { tagManagers } = useAppSelector((state) => state.tagManager);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetIds, setDeleteTargetIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeadCategory, setSelectedLeadCategory] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [selectedPriority, setSelectedPriority] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [userId, setUserId] = useState('');

    const getContactId = (contact) => String(contact?._id || contact?.id || '').trim();

    useEffect(() => {
        // Get userId from token
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
        if (userId) {
            if (loading || (Array.isArray(contacts) && contacts.length > 0)) return;

            const loadContacts = async () => {
                try {
                    await dispatch(fetchContacts(userId)).unwrap();
                } catch (err) {
                    console.error('Error loading contacts:', err);
                }
            };
            loadContacts();
        }
    }, [dispatch, userId, contacts, loading]);

    useEffect(() => {
        if (!Array.isArray(stages) || stages.length === 0) {
            dispatch(fetchStages());
        }
        if (!Array.isArray(tagManagers) || tagManagers.length === 0) {
            dispatch(fetchTagManagers());
        }
    }, [dispatch, stages, tagManagers]);

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
            toast.error('Please select at least one contact to delete');
            return;
        }

        setDeleteTargetIds([...selectedIds]);
        setShowDeleteModal(true);
    };

    const handleToggleSelect = (id) => {
        const normalizedId = String(id || '').trim();
        if (!normalizedId) return;

        setSelectedIds((prev) => {
            if (prev.includes(normalizedId)) {
                return prev.filter((selectedId) => selectedId !== normalizedId);
            }
            return [...prev, normalizedId];
        });
    };

    const handleDeleteConfirm = async () => {
        if (deleteTargetIds.length === 0) return;

        try {
            const results = await Promise.allSettled(
                deleteTargetIds.map((id) => dispatch(deleteContact(id)).unwrap())
            );

            const successCount = results.filter((result) => result.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(successCount === 1 ? 'Contact deleted successfully' : `${successCount} contacts deleted successfully`);
            }

            if (failedCount > 0) {
                toast.error(failedCount === 1 ? 'Failed to delete 1 contact' : `Failed to delete ${failedCount} contacts`);
            }

            setSelectedIds((prev) => prev.filter((id) => !deleteTargetIds.includes(id)));
            setShowDeleteModal(false);
            setDeleteTargetIds([]);
        } catch (err) {
            toast.error('Failed to delete contact');
        }
    };

    const handleCreateClick = () => {
        router.push('/admin/contacts/add');
    };

    const handleEditClick = (contact) => {
        router.push(`/admin/contacts/edit/${contact._id || contact.id}`);
    };

    const handleShowClick = (contact) => {
        router.push(`/admin/contacts/${contact._id || contact.id}`);
    };

    const handleMessageClick = (contact) => {
        // Navigate to message page or open message modal
        router.push(`/admin/messages?contactId=${contact._id || contact.id}`);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedLeadCategory('');
        setSelectedStage('');
        setSelectedPriority('');
        setCurrentPage(1);
    };

    // Ensure contacts is an array before filtering
    const contactsArray = Array.isArray(contacts) ? contacts : [];

    const preferredFieldOrder = [
        'id',
        'fname',
        'mname',
        'lname',
        'phone',
        'alternate_phone',
        'email',
        'address1',
        'address2',
        'city',
        'state',
        'country',
        'zipcode',
        'personal_website',
        'org_name',
        'org_address',
        'org_phone',
        'org_website',
        'total_lead_score',
        'lead_category',
        'form_status',
        'tries_count',
        'last_reminder_date',
        'q1_label',
        'q1_answer',
        'q2_label',
        'q2_answer',
        'q3_label',
        'q3_answer',
        'q4_label',
        'q4_answer',
        'q5_label',
        'q5_answer',
        'q6_label',
        'q6_answer',
        'q7_label',
        'q7_answer',
        'q8_label',
        'q8_answer',
        'q9_label',
        'q9_answer',
        'q10_label',
        'q10_answer',
        'lead_source',
        'referral',
        'lead_type',
        'timezone',
        'currency',
        'priority',
        'stage_name',
        'tags',
        'status',
        'userId',
        'createdAt',
        'updatedAt',
        'created_at',
        'updated_at',
    ];

    const toDateObject = (value) => {
        if (!value) return null;

        const parsedDate = value instanceof Date ? value : new Date(value);
        return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const formatDateForCsv = (value) => {
        const dateObject = toDateObject(value);
        if (!dateObject) return '';

        const monthName = dateObject.toLocaleString('en-US', { month: 'long' });
        const day = dateObject.getDate();
        const year = dateObject.getFullYear();
        const hour24 = dateObject.getHours();
        const hour12 = hour24 % 12 || 12;
        const minute = String(dateObject.getMinutes()).padStart(2, '0');
        const second = String(dateObject.getSeconds()).padStart(2, '0');
        const meridiem = hour24 >= 12 ? 'pm' : 'am';

        return `${monthName} ${day}, ${year} ${String(hour12).padStart(2, '0')}:${minute}:${second} ${meridiem}`;
    };

    const isDateLikeField = (field, value) => {
        if (!field) return false;
        const looksLikeDateField = /(date|_at|At)$/i.test(field);
        if (!looksLikeDateField) return false;
        return !!toDateObject(value);
    };

    const tagManagersArray = Array.isArray(tagManagers) ? tagManagers : [];

    const resolveTagName = (tagValue) => {
        if (!tagValue) return '';

        if (typeof tagValue === 'object') {
            const fromObject = String(tagValue.full_name || tagValue.name || '').trim();
            if (fromObject) return fromObject;

            const objectId = String(tagValue._id || tagValue.id || '').trim();
            if (!objectId) return '';
            const matchedByObjectId = tagManagersArray.find((tag) => String(tag._id || tag.id || '').trim() === objectId);
            return matchedByObjectId ? String(matchedByObjectId.full_name || matchedByObjectId.name || '').trim() : '';
        }

        const tagId = String(tagValue).trim();
        if (!tagId) return '';
        const matchedTag = tagManagersArray.find((tag) => String(tag._id || tag.id || '').trim() === tagId);
        return matchedTag ? String(matchedTag.full_name || matchedTag.name || '').trim() : tagId;
    };

    const resolveTagsForCsv = (tagsValue) => {
        if (!tagsValue) return '';

        if (!Array.isArray(tagsValue)) {
            return resolveTagName(tagsValue);
        }

        return tagsValue
            .map((tag) => resolveTagName(tag))
            .filter(Boolean)
            .join(', ');
    };

    const serializeCsvCell = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const getOrderedExportFields = (rows) => {
        const fieldSet = new Set();
        const orderedFields = [];
        const excludedFields = new Set(['_id', '__v', 'stage_id']);

        preferredFieldOrder.forEach((field) => {
            const existsInData = rows.some((row) => Object.prototype.hasOwnProperty.call(row, field));
            if (existsInData && !fieldSet.has(field)) {
                fieldSet.add(field);
                orderedFields.push(field);
            }
        });

        rows.forEach((row) => {
            Object.keys(row).forEach((field) => {
                if (!excludedFields.has(field) && !fieldSet.has(field)) {
                    fieldSet.add(field);
                    orderedFields.push(field);
                }
            });
        });

        if (rows.some((row) => Object.prototype.hasOwnProperty.call(row, 'stage_id')) && !fieldSet.has('stage_name')) {
            const tagsIndex = orderedFields.indexOf('tags');
            if (tagsIndex >= 0) {
                orderedFields.splice(tagsIndex, 0, 'stage_name');
            } else {
                orderedFields.push('stage_name');
            }
            fieldSet.add('stage_name');
        }

        return orderedFields;
    };

    const getExportCellValue = (row, field) => {
        if (field === 'stage_name') {
            return resolveContactStageLabel(row);
        }

        if (field === 'tags') {
            return resolveTagsForCsv(row.tags);
        }

        const fieldValue = row[field];
        if (isDateLikeField(field, fieldValue)) {
            return formatDateForCsv(fieldValue);
        }

        return serializeCsvCell(fieldValue);
    };

    const escapeCsvValue = (value) => {
        const stringValue = String(value ?? '');
        if (/[",\n\r]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvHeaderLabelMap = {
        __sl__: 'Sl.',
        id: 'Id',
        fname: 'First Name',
        mname: 'Middle Name',
        lname: 'Last Name',
        phone: 'Phone No',
        alternate_phone: 'Alternate Phone No',
        email: 'Email Id',
        address1: 'Address 1',
        address2: 'Address 2',
        city: 'City',
        state: 'State',
        country: 'Country',
        zipcode: 'Zipcode',
        personal_website: 'Personal Website',
        org_name: 'Organization Name',
        org_address: 'Organization Address',
        org_phone: 'Organization Phone No',
        org_website: 'Organization Website',
        total_lead_score: 'Total Lead Score',
        lead_category: 'Lead Category',
        form_status: 'Form Status',
        tries_count: 'Tries Count',
        last_reminder_date: 'Last Reminder Date',
        lead_source: 'Lead Source',
        referral: 'Referral',
        lead_type: 'Lead Type',
        timezone: 'Timezone',
        currency: 'Currency',
        priority: 'Priority',
        stage_name: 'Stage Name',
        tags: 'Tags',
        userId: 'User Id',
        createdAt: 'Created At',
        updatedAt: 'Updated At',
        created_at: 'Created At',
        updated_at: 'Updated At',
    };

    const formatFieldAsHeader = (field) => {
        if (csvHeaderLabelMap[field]) return csvHeaderLabelMap[field];

        return String(field)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const handleExportContacts = () => {
        const filteredSelectionSet = new Set(selectedFilteredIds);
        const selectedContacts = filteredContacts.filter((contact) => filteredSelectionSet.has(getContactId(contact)));

        if (!selectedContacts.length) {
            toast.error('Please select at least one contact from the current filtered list to export');
            return;
        }

        const contactRecords = selectedContacts.map((contact) => {
            if (contact && typeof contact === 'object' && !Array.isArray(contact)) {
                return contact;
            }
            return {};
        });
        const allFields = getOrderedExportFields(contactRecords);
        const firstNameIndex = allFields.indexOf('fname');
        const exportFields = [...allFields];

        if (!exportFields.includes('__sl__')) {
            if (firstNameIndex >= 0) {
                exportFields.splice(firstNameIndex, 0, '__sl__');
            } else {
                exportFields.unshift('__sl__');
            }
        }

        const csvHeader = exportFields.map((field) => escapeCsvValue(formatFieldAsHeader(field))).join(',');
        const csvRows = contactRecords.map((row, rowIndex) => (
            exportFields.map((field) => {
                if (field === '__sl__') {
                    return escapeCsvValue(String(rowIndex + 1));
                }
                return escapeCsvValue(getExportCellValue(row, field));
            }).join(',')
        ));

        const csvContent = [csvHeader, ...csvRows].join('\r\n');
        const csvBlob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(csvBlob);

        const now = new Date();
        const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timePart = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `contacts-export-${datePart}-${timePart}.csv`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        toast.success(`${selectedContacts.length} contact${selectedContacts.length === 1 ? '' : 's'} exported successfully`);
    };

    const handleImportContacts = () => {
        router.push('/admin/contacts/import');
    };

    const normalizeText = (value) => String(value || '').trim().toLowerCase();
    const normalizeId = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
            return String(value._id || value.id || '').trim();
        }
        return String(value).trim();
    };

    const stageOptionData = useMemo(() => {
        const list = Array.isArray(stages) ? stages : [];
        const options = [];
        const stageIdToLabel = new Map();
        const stageNameToId = new Map();

        list.forEach((stage) => {
            const stageId = normalizeId(stage?._id || stage?.id);
            const stageLabel = String(stage?.name || stage?.stage_name || stage?.title || '').trim();

            if (!stageId || !stageLabel) return;

            if (!stageIdToLabel.has(stageId)) {
                stageIdToLabel.set(stageId, stageLabel);
                options.push({ value: stageId, label: stageLabel });
            }

            const normalizedName = normalizeText(stageLabel);
            if (normalizedName && !stageNameToId.has(normalizedName)) {
                stageNameToId.set(normalizedName, stageId);
            }
        });

        return { options, stageIdToLabel, stageNameToId };
    }, [stages]);

    const leadCategoryOptions = [
        { value: 'hot', label: 'Hot' },
        { value: 'cold', label: 'Cold' },
        { value: 'warm', label: 'Warm' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
    ];

    const resolveContactStageId = (contact) => {
        const rawStage = contact?.stage_id || contact?.stage || contact?.current_stage_id || contact?.current_stage || contact?.new_stage_id;

        if (!rawStage) return '';

        if (typeof rawStage === 'object') {
            const objectStageId = normalizeId(rawStage?._id || rawStage?.id || rawStage);
            if (objectStageId && stageOptionData.stageIdToLabel.has(objectStageId)) {
                return objectStageId;
            }

            const objectStageName = normalizeText(rawStage?.name || rawStage?.stage_name || rawStage?.title);
            return stageOptionData.stageNameToId.get(objectStageName) || '';
        }

        const rawStageId = normalizeId(rawStage);
        if (rawStageId && stageOptionData.stageIdToLabel.has(rawStageId)) {
            return rawStageId;
        }

        const rawStageName = normalizeText(rawStage);
        return stageOptionData.stageNameToId.get(rawStageName) || '';
    };

    const resolveContactStageLabel = (contact) => {
        const rawStage = contact?.stage_id || contact?.stage || contact?.current_stage_id || contact?.current_stage || contact?.new_stage_id;

        if (!rawStage) return 'N/A';

        if (typeof rawStage === 'object') {
            return String(rawStage.name || rawStage.stage_name || rawStage.title || 'N/A').trim() || 'N/A';
        }

        const resolvedStageId = resolveContactStageId(contact);
        if (resolvedStageId && stageOptionData.stageIdToLabel.has(resolvedStageId)) {
            return stageOptionData.stageIdToLabel.get(resolvedStageId);
        }

        return String(rawStage).trim() || 'N/A';
    };

    const formatLeadCategory = (categoryValue) => {
        if (!categoryValue) return 'N/A';

        const normalized = normalizeText(categoryValue);
        const matchedOption = leadCategoryOptions.find((option) => option.value === normalized);

        return matchedOption ? matchedOption.label : String(categoryValue);
    };

    const formatPriority = (priorityValue) => {
        if (!priorityValue) return 'N/A';

        const normalized = normalizeText(priorityValue);
        const matchedOption = priorityOptions.find((option) => option.value === normalized);

        return matchedOption ? matchedOption.label : String(priorityValue);
    };

    const formatCreatedFrom = (createdFromValue) => {
        if (!createdFromValue) return 'N/A';

        const normalized = normalizeText(createdFromValue);
        if (!normalized) return 'N/A';

        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

    const filteredContacts = useMemo(() => {
        return contactsArray.filter(contact => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                contact.fname?.toLowerCase().includes(searchLower) ||
                contact.lname?.toLowerCase().includes(searchLower) ||
                contact.email?.toLowerCase().includes(searchLower) ||
                contact.phone?.includes(searchTerm)
            );

            const matchesLeadCategory = !selectedLeadCategory || normalizeText(contact?.lead_category) === selectedLeadCategory;
            const matchesStage = !selectedStage || resolveContactStageId(contact) === selectedStage;
            const matchesPriority = !selectedPriority || normalizeText(contact?.priority) === selectedPriority;

            return matchesSearch && matchesLeadCategory && matchesStage && matchesPriority;
        });
    }, [contactsArray, searchTerm, selectedLeadCategory, selectedStage, selectedPriority, stageOptionData]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentContacts = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
    const currentContactIds = currentContacts.map((contact) => getContactId(contact)).filter(Boolean);
    const filteredContactIds = filteredContacts.map((contact) => getContactId(contact)).filter(Boolean);
    const selectedFilteredIds = selectedIds.filter((id) => filteredContactIds.includes(id));
    const isAllFilteredSelected = filteredContactIds.length > 0 && filteredContactIds.every((id) => selectedIds.includes(id));
    const isAllCurrentSelected = currentContactIds.length > 0 && currentContactIds.every((id) => selectedIds.includes(id));

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLeadCategory, selectedStage, selectedPriority]);

    const handleToggleSelectAllCurrent = () => {
        if (isAllCurrentSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentContactIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentContactIds])));
    };

    const handleToggleSelectAllFiltered = () => {
        if (isAllFilteredSelected) {
            setSelectedIds((prev) => prev.filter((id) => !filteredContactIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredContactIds])));
    };

    useEffect(() => {
        const validIds = new Set(contactsArray.map((contact) => getContactId(contact)).filter(Boolean));
        setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
    }, [contactsArray]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (filteredContacts.length === 0) return null;

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
                pages.push(<span key="dots1" className="pagination-dots">...</span>);
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
                pages.push(<span key="dots2" className="pagination-dots">...</span>);
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
        <div className="contacts-container">
            <div className="contacts-header">
                <div className="header-content">
                    <h1 className="page-title">Contacts</h1>
                    <p className="page-subtitle">Manage your contact list</p>
                </div>
                <div className="header-actions">
                    <button className="btn-add" onClick={handleImportContacts}>
                        <FaPlus /> Import Contact
                    </button>
                    <button className="btn-add" onClick={handleCreateClick}>
                        <FaPlus /> Add Contact
                    </button>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="actions-bar">
                <div className="filters-row">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <select
                        className="filter-select"
                        value={selectedLeadCategory}
                        onChange={(e) => setSelectedLeadCategory(e.target.value)}
                    >
                        <option value="">All Lead Category</option>
                        {leadCategoryOptions.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                    >
                        <option value="">All Stages</option>
                        {stageOptionData.options.map((stageOption) => (
                            <option key={stageOption.value} value={stageOption.value}>
                                {stageOption.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                    >
                        <option value="">All Priority</option>
                        {priorityOptions.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                                {priority.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="btn-clear-filter"
                        onClick={handleClearFilters}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="table-card">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-border" role="status"></div>
                        <p>Loading contacts...</p>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="empty-state">
                        <FaUser className="empty-icon" />
                        <h3>No contacts found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Get started by adding your first contact'}
                        </p>
                        {!searchTerm && (
                            <button className="btn-primary" onClick={handleCreateClick}>
                                <FaPlus /> Add Your First Contact
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {selectedFilteredIds.length > 0 && (
                            <div className="selection-toolbar">
                                <p className="selection-toolbar-text">
                                    {selectedFilteredIds.length} contact(s) selected
                                </p>
                                <div className="selection-toolbar-actions">
                                    <button type="button" className="btn-selection" onClick={handleToggleSelectAllFiltered}>
                                        {isAllFilteredSelected
                                            ? `Unselect all contact(s) (${filteredContactIds.length})`
                                            : `Select all contact(s) (${filteredContactIds.length})`}
                                    </button>
                                    <button type="button" className="btn-selection btn-selection-clear" onClick={() => setSelectedIds([])}>
                                        Clear Selection
                                    </button>
                                    <button type="button" className="btn-selection btn-selection-export" onClick={handleExportContacts}>
                                        Export Selection
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="table-responsive">
                            <table className="contacts-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={isAllCurrentSelected}
                                                onChange={handleToggleSelectAllCurrent}
                                                aria-label="Select all current page contacts"
                                            />
                                        </th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Created From</th>
                                        <th>Lead Category</th>
                                        <th>Stage</th>
                                        <th>Priority</th>
                                        <th>Created On</th>
                                        <th>Updated On</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentContacts.map((contact) => (
                                        <tr key={getContactId(contact)}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(getContactId(contact))}
                                                    onChange={() => handleToggleSelect(getContactId(contact))}
                                                    aria-label="Select contact row"
                                                />
                                            </td>
                                            <td>
                                                <div className="contact-name">
                                                    <FaUser className="name-icon" />
                                                    <span 
                                                        className="contact-name-text"
                                                        onClick={() => handleShowClick(contact)}
                                                        role="button"
                                                        tabIndex="0"
                                                    >
                                                        {contact.fname || contact.lname 
                                                            ? `${contact.fname || ''} ${contact.mname ? contact.mname + ' ' : ''}${contact.lname || ''}`.trim() 
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-email">
                                                    <FaEnvelope className="email-icon" />
                                                    {contact.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="contact-phone">
                                                    <FaPhone className="phone-icon" />
                                                    {contact.phone || 'N/A'}
                                                </div>
                                            </td>
                                            <td>{formatCreatedFrom(contact.contact_created)}</td>
                                            <td>{formatLeadCategory(contact.lead_category)}</td>
                                            <td>{resolveContactStageLabel(contact)}</td>
                                            <td>{formatPriority(contact.priority)}</td>
                                            <td>{formatCreatedOn(contact.createdAt || contact.created_at)}</td>
                                            <td>{formatCreatedOn(contact.updatedAt || contact.updated_at)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon btn-message"
                                                        onClick={() => handleMessageClick(contact)}
                                                        title="Message"
                                                    >
                                                        <FaCommentDots />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-view"
                                                        onClick={() => handleShowClick(contact)}
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-edit"
                                                        onClick={() => handleEditClick(contact)}
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="btn-icon btn-delete"
                                                        onClick={() => handleDeleteClick(getContactId(contact))}
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

                        {/* Results Info */}
                        <div className="table-footer">
                            <div className="table-footer-left">
                                {selectedIds.length > 0 && (
                                    <button className="btn-add" onClick={handleBulkDeleteClick} style={{ background: '#dc3545' }}>
                                        <FaTrash /> Delete Selected ({selectedIds.length})
                                    </button>
                                )}
                                <p className="results-info">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredContacts.length)} of {filteredContacts.length} contacts
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
                                    ? `Are you sure you want to delete ${deleteTargetIds.length} contacts? This action cannot be undone.`
                                    : 'Are you sure you want to delete this contact? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn-danger"
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteTargetIds([]);
                                }}
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

export default ListContacts;
