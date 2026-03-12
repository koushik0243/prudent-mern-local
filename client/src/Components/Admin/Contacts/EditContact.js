'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchContactById, updateContact, clearCurrentContact } from '@/redux/slices/contactsSlice';
import { fetchTagManagers } from '@/redux/slices/tagManagerSlice';
import { fetchStages } from '@/redux/slices/stagesSlice';
import { fetchCountries } from '@/redux/slices/countrySlice';
import { fetchStates } from '@/redux/slices/stateSlice';
import apiServiceHandler from '@/service/apiService';
import toast from 'react-hot-toast';
import { FaUser, FaBuilding, FaArrowLeft, FaTags, FaTimes } from 'react-icons/fa';
import './EditContact.css';

const EditContact = ({ id }) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentContact, loading } = useAppSelector((state) => state.contacts);
    const { tagManagers } = useAppSelector((state) => state.tagManager);
    const { stages } = useAppSelector((state) => state.stages);
    const { countries } = useAppSelector((state) => state.country);
    const { states } = useAppSelector((state) => state.stateMaster);

    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    const [formData, setFormData] = useState({
        fname: '',
        mname: '',
        lname: '',
        phone: '',
        alternate_phone: '',
        email: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        city_id: '',
        state_id: '',
        country_id: '',
        zipcode: '',
        personal_website: '',
        org_name: '',
        org_address: '',
        org_phone: '',
        org_website: '',
        total_lead_score: 0,
        lead_category: 'hot',
        form_status: 'completed',
        tries_count: 0,
        last_reminder_date: '',
        q1_label: '',
        q1_answer: '',
        q2_label: '',
        q2_answer: '',
        q3_label: '',
        q3_answer: '',
        q4_label: '',
        q4_answer: '',
        q5_label: '',
        q5_answer: '',
        q6_label: '',
        q6_answer: '',
        q7_label: '',
        q7_answer: '',
        q8_label: '',
        q8_answer: '',
        q9_label: '',
        q9_answer: '',
        q10_label: '',
        q10_answer: '',
        lead_source: '',
        referral: '',
        lead_type: 'qualified',
        stage_id: '',
        timezone: '',
        currency: '',
        priority: 'low',
        tags: []
    });

    const [tagInput, setTagInput] = useState('');
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const [errors, setErrors] = useState({});
    const [showQaSection, setShowQaSection] = useState(false);
    const [showOrgSection, setShowOrgSection] = useState(false);
    const [showAdditionalSection, setShowAdditionalSection] = useState(false);
    const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const hasHydratedFormRef = useRef(false);

    const toCityRows = (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.result)) return response.result;
        if (Array.isArray(response)) return response;
        return [];
    };

    const fetchCitiesByState = async (stateId) => {
        if (!stateId) {
            setCities([]);
            return;
        }

        const encodedStateId = encodeURIComponent(String(stateId));
        const endpointCandidates = [
            `city/list?state_id=${encodedStateId}`,
            `city/list?stateId=${encodedStateId}`,
            `city/list/${encodedStateId}`,
        ];

        setCitiesLoading(true);
        try {
            for (const endpoint of endpointCandidates) {
                try {
                    const response = await apiServiceHandler('GET', endpoint);
                    setCities(toCityRows(response));
                    return;
                } catch (candidateError) {
                    // Try next endpoint candidate.
                }
            }

            setCities([]);
        } finally {
            setCitiesLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            dispatch(fetchContactById(id));
            hasHydratedFormRef.current = false;
        }

        return () => {
            dispatch(clearCurrentContact());
        };
    }, [id, dispatch]);

    const getNameFromIdOrValue = (value, list) => {
        if (value === null || value === undefined || value === '') return '';

        if (typeof value === 'object') {
            if (value.name) return value.name;
            if (value.full_name) return value.full_name;
            const objectId = value.id || value._id;
            if (objectId !== undefined && objectId !== null) {
                const matched = (Array.isArray(list) ? list : []).find((item) => (
                    String(item?.id) === String(objectId) ||
                    String(item?._id) === String(objectId)
                ));
                if (matched?.name) return matched.name;
            }
            return '';
        }

        const valueStr = String(value);
        const matched = (Array.isArray(list) ? list : []).find((item) => (
            String(item?.id) === valueStr ||
            String(item?._id) === valueStr
        ));

        return matched?.name || valueStr;
    };

    const getIdFromIdOrName = (value, list) => {
        if (value === null || value === undefined || value === '') return '';

        if (typeof value === 'object') {
            return value.id || value._id || '';
        }

        const valueStr = String(value);
        const matchedById = (Array.isArray(list) ? list : []).find((item) => (
            String(item?.id) === valueStr ||
            String(item?._id) === valueStr
        ));

        if (matchedById) {
            return matchedById.id || matchedById._id;
        }

        const matchedByName = (Array.isArray(list) ? list : []).find((item) => (
            String(item?.name || '').toLowerCase() === valueStr.toLowerCase()
        ));

        if (matchedByName) {
            return matchedByName.id || matchedByName._id;
        }

        return value;
    };

    useEffect(() => {
        if (!Array.isArray(tagManagers) || tagManagers.length === 0) {
            dispatch(fetchTagManagers());
        }
        if (!Array.isArray(stages) || stages.length === 0) {
            dispatch(fetchStages());
        }
        if (!Array.isArray(countries) || countries.length === 0) {
            dispatch(fetchCountries());
        }
        if (!Array.isArray(states) || states.length === 0) {
            dispatch(fetchStates());
        }
    }, [dispatch, tagManagers, stages, countries, states]);

    useEffect(() => {
        if (!formData.state_id) {
            setCities([]);
            return;
        }

        fetchCitiesByState(formData.state_id);
    }, [formData.state_id]);

    useEffect(() => {
        if (currentContact && tagManagers && !hasHydratedFormRef.current) {
            // Map tag IDs to full tag objects
            let contactTags = [];
            if (currentContact.tags && Array.isArray(currentContact.tags)) {
                contactTags = currentContact.tags.map(tagIdOrObj => {
                    // If it's already a full object with _id, use it
                    if (typeof tagIdOrObj === 'object' && tagIdOrObj._id) {
                        return tagIdOrObj;
                    }
                    // Otherwise, it's just an ID, find the full object in tagManagers
                    const tagId = typeof tagIdOrObj === 'string' ? tagIdOrObj : tagIdOrObj.toString();
                    return tagManagers.find(tag => tag._id === tagId);
                }).filter(tag => tag !== undefined); // Remove any tags that weren't found
            }
            
            setFormData({
                fname: currentContact.fname || '',
                mname: currentContact.mname || '',
                lname: currentContact.lname || '',
                phone: currentContact.phone || '',
                alternate_phone: currentContact.alternate_phone || '',
                email: currentContact.email || '',
                address1: currentContact.address1 || '',
                address2: currentContact.address2 || '',
                city: getNameFromIdOrValue(currentContact.city, cities),
                state: getNameFromIdOrValue(currentContact.state, states),
                country: getNameFromIdOrValue(currentContact.country, countries),
                city_id: getIdFromIdOrName(currentContact.city, cities),
                state_id: getIdFromIdOrName(currentContact.state, states),
                country_id: getIdFromIdOrName(currentContact.country, countries),
                zipcode: currentContact.zipcode || '',
                personal_website: currentContact.personal_website || '',
                org_name: currentContact.org_name || '',
                org_address: currentContact.org_address || '',
                org_phone: currentContact.org_phone || '',
                org_website: currentContact.org_website || '',
                total_lead_score: currentContact.total_lead_score ?? 0,
                lead_category: currentContact.lead_category || 'hot',
                form_status: currentContact.form_status || 'completed',
                tries_count: currentContact.tries_count ?? 0,
                last_reminder_date: currentContact.last_reminder_date
                    ? new Date(currentContact.last_reminder_date).toISOString().split('T')[0]
                    : '',
                q1_label: currentContact.q1_label || '',
                q1_answer: currentContact.q1_answer || '',
                q2_label: currentContact.q2_label || '',
                q2_answer: currentContact.q2_answer || '',
                q3_label: currentContact.q3_label || '',
                q3_answer: currentContact.q3_answer || '',
                q4_label: currentContact.q4_label || '',
                q4_answer: currentContact.q4_answer || '',
                q5_label: currentContact.q5_label || '',
                q5_answer: currentContact.q5_answer || '',
                q6_label: currentContact.q6_label || '',
                q6_answer: currentContact.q6_answer || '',
                q7_label: currentContact.q7_label || '',
                q7_answer: currentContact.q7_answer || '',
                q8_label: currentContact.q8_label || '',
                q8_answer: currentContact.q8_answer || '',
                q9_label: currentContact.q9_label || '',
                q9_answer: currentContact.q9_answer || '',
                q10_label: currentContact.q10_label || '',
                q10_answer: currentContact.q10_answer || '',
                lead_source: currentContact.lead_source || '',
                referral: currentContact.referral || '',
                lead_type: currentContact.lead_type || 'qualified',
                stage_id: typeof currentContact.stage_id === 'object'
                    ? (currentContact.stage_id?._id || currentContact.stage_id?.id || '')
                    : (currentContact.stage_id || currentContact.stage || ''),
                timezone: currentContact.timezone || '',
                currency: currentContact.currency || '',
                priority: currentContact.priority || 'low',
                tags: contactTags
            });

            hasHydratedFormRef.current = true;
        }
    }, [currentContact, tagManagers, countries, states, cities]);

    useEffect(() => {
        const countryList = Array.isArray(countries) ? countries : [];
        if (!countryList.length) return;

        const lookupId = formData.country_id || formData.country;
        if (!lookupId) return;

        const matchedCountry = countryList.find((item) => (
            String(item?.id) === String(lookupId) ||
            String(item?._id) === String(lookupId)
        ));

        if (matchedCountry?.name && formData.country !== matchedCountry.name) {
            setFormData((prev) => ({
                ...prev,
                country: matchedCountry.name,
                country_id: prev.country_id || matchedCountry.id || matchedCountry._id || '',
            }));
        }
    }, [countries, formData.country, formData.country_id]);

    useEffect(() => {
        const stateList = Array.isArray(states) ? states : [];
        if (!stateList.length) return;

        const lookupId = formData.state_id || formData.state;
        if (!lookupId) return;

        const matchedState = stateList.find((item) => (
            String(item?.id) === String(lookupId) ||
            String(item?._id) === String(lookupId)
        ));

        if (matchedState?.name && formData.state !== matchedState.name) {
            setFormData((prev) => ({
                ...prev,
                state: matchedState.name,
                state_id: prev.state_id || matchedState.id || matchedState._id || '',
            }));
        }
    }, [states, formData.state, formData.state_id]);

    // Tag handling functions
    const filteredTags = Array.isArray(tagManagers) 
        ? tagManagers.filter(tag => 
            tag.full_name?.toLowerCase().includes(tagInput.toLowerCase()) &&
            !formData.tags.some(selectedTag => selectedTag._id === tag._id)
          )
        : [];

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
        setShowTagSuggestions(true);
    };

    const handleTagSelect = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, tag]
        }));
        setTagInput('');
        setShowTagSuggestions(false);
    };

    const handleTagRemove = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag._id !== tagId)
        }));
    };

    const countryOptions = Array.isArray(countries) ? countries : [];
    const stateOptions = Array.isArray(states) ? states : [];

    const selectedCountry = countryOptions.find((country) => (
        String(country?.id) === String(formData.country_id) ||
        String(country?._id) === String(formData.country_id)
    ));

    const filteredCountries = countryOptions
        .filter((country) => String(country?.name || '').toLowerCase().includes(String(formData.country || '').toLowerCase()))
        .slice(0, 5);

    const filteredStates = stateOptions
        .filter((stateItem) => {
            if (!formData.country_id) return false;

            const selectedCountryIds = [
                formData.country_id,
                selectedCountry?.id,
                selectedCountry?._id,
            ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value));

            const selectedCountryName = String(selectedCountry?.name || formData.country || '').toLowerCase();

            const relatedCountryIds = [
                stateItem.country_id,
                stateItem.countryId,
                stateItem.country?._id,
                stateItem.country?.id,
                stateItem.country_ref,
                stateItem.country_ref_id,
            ].filter((value) => value !== undefined && value !== null && value !== '').map((value) => String(value));

            const relatedCountryNames = [
                stateItem.country_name,
                stateItem.countryName,
                stateItem.country?.name,
            ].filter((value) => typeof value === 'string' && value.trim()).map((value) => value.toLowerCase());

            const matchesCountryById = relatedCountryIds.some((value) => selectedCountryIds.includes(value));
            const matchesCountryByName = selectedCountryName && relatedCountryNames.includes(selectedCountryName);
            const matchesCountry = matchesCountryById || matchesCountryByName;
            const matchesSearch = String(stateItem?.name || '').toLowerCase().includes(String(formData.state || '').toLowerCase());

            return matchesCountry && matchesSearch;
        })
        .slice(0, 5);

    const handleCountryInputChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            country: value,
            country_id: '',
            state: '',
            state_id: '',
            city: '',
            city_id: '',
        }));
        setShowCountrySuggestions(true);
        setShowStateSuggestions(false);
    };

    const handleCountrySelect = (country) => {
        setFormData((prev) => ({
            ...prev,
            country: country?.name || '',
            country_id: country?.id || country?._id || '',
            state: '',
            state_id: '',
            city: '',
            city_id: '',
        }));
        setShowCountrySuggestions(false);
    };

    const handleStateInputChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            state: value,
            state_id: '',
            city: '',
            city_id: '',
        }));
        setShowStateSuggestions(true);
    };

    const handleStateSelect = (stateItem) => {
        setFormData((prev) => ({
            ...prev,
            state: stateItem?.name || '',
            state_id: stateItem?.id || stateItem?._id || '',
            city: '',
            city_id: '',
        }));
        setShowStateSuggestions(false);
    };

    const handleCityInputChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            city: value,
            city_id: '',
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fname.trim()) {
            newErrors.fname = 'First name is required';
        }

        if (!formData.lname.trim()) {
            newErrors.lname = 'Last name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const contactData = {
                ...formData,
                country: getIdFromIdOrName(formData.country, countries),
                state: getIdFromIdOrName(formData.state, states),
                city: formData.city,
                contact_created: 'manual',
                total_lead_score: Number(formData.total_lead_score) || 0,
                tries_count: Number(formData.tries_count) || 0,
                last_reminder_date: formData.last_reminder_date || null,
                tags: formData.tags.map(tag => tag._id) // Convert tags to array of IDs
            };
            await dispatch(updateContact({ id, contactData })).unwrap();
            toast.success('Contact updated successfully');
            router.push('/admin/contacts');
        } catch (err) {
            toast.error(err || 'Failed to update contact');
        }
    };

    const handleCancel = () => {
        router.push('/admin/contacts');
    };

    if (loading && !currentContact) {
        return (
            <div className="show-contact-container">
                <div className="loading-state">
                    <div className="spinner-border" role="status"></div>
                    <p>Loading contact...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <button className="btn-back" onClick={handleCancel}>
                    <FaArrowLeft /> Back to Contacts
                </button>
                <div>
                    <h1 className="page-title">Edit Contact</h1>
                    <p className="page-subtitle">Update contact information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
                {/* Personal Information */}
                <div className="contact-card">
                    <div className="form-section">
                        <h2 className="section-title">
                            <FaUser style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                            Personal Information
                        </h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    First Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleChange}
                                    className={`form-input ${errors.fname ? 'error' : ''}`}
                                    placeholder="Enter first name"
                                    disabled={loading}
                                />
                                {errors.fname && <span className="error-text">{errors.fname}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Middle Name</label>
                                <input
                                    type="text"
                                    name="mname"
                                    value={formData.mname}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter middle name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Last Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleChange}
                                    className={`form-input ${errors.lname ? 'error' : ''}`}
                                    placeholder="Enter last name"
                                    disabled={loading}
                                />
                                {errors.lname && <span className="error-text">{errors.lname}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Email <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="Enter email address"
                                    disabled={loading}
                                />
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Phone <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`form-input ${errors.phone ? 'error' : ''}`}
                                    placeholder="Enter phone number"
                                    disabled={loading}
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Alternate Phone</label>
                                <input
                                    type="tel"
                                    name="alternate_phone"
                                    value={formData.alternate_phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter alternate phone"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Personal Website</label>
                                <input
                                    type="url"
                                    name="personal_website"
                                    value={formData.personal_website}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="https://example.com"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address1"
                                    value={formData.address1}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Street address"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Address Line 2</label>
                                <input
                                    type="text"
                                    name="address2"
                                    value={formData.address2}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Apartment, suite, etc."
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <div className="country-input-wrapper">
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleCountryInputChange}
                                        onFocus={() => setShowCountrySuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowCountrySuggestions(false), 200)}
                                        className="form-input"
                                        placeholder="Enter country"
                                        autoComplete="off"
                                        disabled={loading}
                                    />
                                    {showCountrySuggestions && filteredCountries.length > 0 && (
                                        <div className="country-suggestions-list">
                                            {filteredCountries.map((country) => (
                                                <button
                                                    key={country?._id || country?.id || country?.name}
                                                    type="button"
                                                    className="country-suggestion-item"
                                                    onClick={() => handleCountrySelect(country)}
                                                >
                                                    {country?.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">State</label>
                                <div className="country-input-wrapper">
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleStateInputChange}
                                        onFocus={() => formData.country_id && setShowStateSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowStateSuggestions(false), 200)}
                                        className="form-input"
                                        placeholder="Enter state"
                                        autoComplete="off"
                                        disabled={loading || !formData.country_id}
                                    />
                                    {showStateSuggestions && filteredStates.length > 0 && (
                                        <div className="country-suggestions-list">
                                            {filteredStates.map((stateItem) => (
                                                <button
                                                    key={stateItem?._id || stateItem?.id || stateItem?.name}
                                                    type="button"
                                                    className="country-suggestion-item"
                                                    onClick={() => handleStateSelect(stateItem)}
                                                >
                                                    {stateItem?.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">City</label>
                                <div className="country-input-wrapper">
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleCityInputChange}
                                        className="form-input"
                                        placeholder="Enter city"
                                        autoComplete="off"
                                        disabled={loading || !formData.state_id}
                                    />
                                    <p style={{ fontSize: "12px"}}>Enter city manually</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">

                            <div className="form-group">
                                <label className="form-label">Zipcode</label>
                                <input
                                    type="text"
                                    name="zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Enter zipcode"
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group"></div>
                            <div className="form-group"></div>
                            <div className="form-group"></div>
                        </div>
                    </div>

                    <hr className="section-divider" />

                    {/* Organization Information */}
                    <div className="form-section">
                        <div className="section-title-row">
                            <h2 className="section-title">
                                <FaBuilding style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                                Organization Information
                            </h2>
                            <button
                                type="button"
                                className="qa-toggle-btn"
                                onClick={() => setShowOrgSection((prev) => !prev)}
                                aria-expanded={showOrgSection}
                            >
                                {showOrgSection ? 'Hide Organization' : 'Show Organization'}
                            </button>
                        </div>

                        {!showOrgSection && (
                            <p className="qa-collapsed-hint">Organization fields are hidden by default.</p>
                        )}

                        {showOrgSection && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Organization Name</label>
                                    <input
                                        type="text"
                                        name="org_name"
                                        value={formData.org_name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter organization name"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organization Address</label>
                                    <input
                                        type="text"
                                        name="org_address"
                                        value={formData.org_address}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter organization address"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organization Phone</label>
                                    <input
                                        type="tel"
                                        name="org_phone"
                                        value={formData.org_phone}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter organization phone"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Organization Website</label>
                                    <input
                                        type="url"
                                        name="org_website"
                                        value={formData.org_website}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="https://company.com"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="section-divider" />

                    <div className="form-section">
                        <div className="section-title-row">
                            <h2 className="section-title">
                                <FaUser style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                                Question & Answer
                            </h2>
                            <button
                                type="button"
                                className="qa-toggle-btn"
                                onClick={() => setShowQaSection((prev) => !prev)}
                                aria-expanded={showQaSection}
                            >
                                {showQaSection ? 'Hide Questions' : 'Show Questions'}
                            </button>
                        </div>

                        {!showQaSection && (
                            <p className="qa-collapsed-hint">Question & Answer fields are hidden by default.</p>
                        )}

                        {showQaSection && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Total Lead Score</label>
                                        <input
                                            type="number"
                                            name="total_lead_score"
                                            value={formData.total_lead_score}
                                            onChange={handleChange}
                                            className="form-input"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Lead Category</label>
                                        <select
                                            name="lead_category"
                                            value={formData.lead_category}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="hot">Hot</option>
                                            <option value="warm">Warm</option>
                                            <option value="cold">Cold</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Form Status</label>
                                        <select
                                            name="form_status"
                                            value={formData.form_status}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="completed">Completed</option>
                                            <option value="not-completed">Not Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tries Count</label>
                                        <input
                                            type="number"
                                            name="tries_count"
                                            value={formData.tries_count}
                                            onChange={handleChange}
                                            className="form-input"
                                            min="0"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Last Reminder Date</label>
                                        <input
                                            type="date"
                                            name="last_reminder_date"
                                            value={formData.last_reminder_date}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="form-group"></div>
                                    <div className="form-group"></div>
                                    <div className="form-group"></div>
                                </div>

                                {Array.from({ length: 10 }).map((_, index) => {
                                    const questionNumber = index + 1;

                                    return (
                                        <div key={`qa-row-${questionNumber}`} className="form-row qa-pair-row">
                                            <div className="form-group">
                                                <label className="form-label">Q{questionNumber} Label</label>
                                                <input
                                                    type="text"
                                                    name={`q${questionNumber}_label`}
                                                    value={formData[`q${questionNumber}_label`]}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder={`Enter question ${questionNumber} label`}
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Q{questionNumber} Answer</label>
                                                <input
                                                    type="text"
                                                    name={`q${questionNumber}_answer`}
                                                    value={formData[`q${questionNumber}_answer`]}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder={`Enter question ${questionNumber} answer`}
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                    <hr className="section-divider" />

                    {/* Additional Information */}
                    <div className="form-section">
                        <div className="section-title-row">
                            <h2 className="section-title">
                                <FaUser style={{ marginRight: '0.5rem', color: '#b6110f' }} />
                                Additional Information
                            </h2>
                            <button
                                type="button"
                                className="qa-toggle-btn"
                                onClick={() => setShowAdditionalSection((prev) => !prev)}
                                aria-expanded={showAdditionalSection}
                            >
                                {showAdditionalSection ? 'Hide Additional' : 'Show Additional'}
                            </button>
                        </div>

                        {!showAdditionalSection && (
                            <p className="qa-collapsed-hint">Additional fields are hidden by default.</p>
                        )}

                        {showAdditionalSection && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Lead Source</label>
                                        <input
                                            type="text"
                                            name="lead_source"
                                            value={formData.lead_source}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter lead source"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Referral</label>
                                        <input
                                            type="text"
                                            name="referral"
                                            value={formData.referral}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="Enter referral"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Timezone</label>
                                        <select
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="">Select Timezone</option>
                                            <option value="America/New_York">America/New York (GMT - 05:00 Hrs)</option>
                                            <option value="America/Chicago">America/Chicago (GMT - 06:00 Hrs)</option>
                                            <option value="America/Denver">America/Denver (GMT - 07:00 Hrs)</option>
                                            <option value="America/Los_Angeles">America/Los Angeles (GMT - 08:00 Hrs)</option>
                                            <option value="America/Phoenix">America/Phoenix (GMT - 07:00 Hrs)</option>
                                            <option value="America/Toronto">America/Toronto (GMT - 05:00 Hrs)</option>
                                            <option value="Europe/London">Europe/London (GMT + 00:00 Hrs)</option>
                                            <option value="Europe/Paris">Europe/Paris (GMT + 01:00 Hrs)</option>
                                            <option value="Europe/Berlin">Europe/Berlin (GMT + 01:00 Hrs)</option>
                                            <option value="Europe/Moscow">Europe/Moscow (GMT + 03:00 Hrs)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GMT + 04:00 Hrs)</option>
                                            <option value="Asia/Kolkata">Asia/Kolkata (GMT + 05:30 Hrs)</option>
                                            <option value="Asia/Singapore">Asia/Singapore (GMT + 08:00 Hrs)</option>
                                            <option value="Asia/Hong_Kong">Asia/Hong Kong (GMT + 08:00 Hrs)</option>
                                            <option value="Asia/Tokyo">Asia/Tokyo (GMT + 09:00 Hrs)</option>
                                            <option value="Asia/Shanghai">Asia/Shanghai (GMT + 08:00 Hrs)</option>
                                            <option value="Australia/Sydney">Australia/Sydney (GMT + 11:00 Hrs)</option>
                                            <option value="Pacific/Auckland">Pacific/Auckland (GMT + 13:00 Hrs)</option>
                                            <option value="UTC">UTC (GMT + 00:00 Hrs)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Currency</label>
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="">Select Currency</option>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="INR">INR - Indian Rupee</option>
                                            <option value="CAD">CAD - Canadian Dollar</option>
                                            <option value="AUD">AUD - Australian Dollar</option>
                                            <option value="JPY">JPY - Japanese Yen</option>
                                            <option value="CNY">CNY - Chinese Yuan</option>
                                            <option value="CHF">CHF - Swiss Franc</option>
                                            <option value="NZD">NZD - New Zealand Dollar</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Stage Name</label>
                                        <select
                                            name="stage_id"
                                            value={formData.stage_id}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="">Select Stage</option>
                                            {Array.isArray(stages) && stages.map((stage) => (
                                                <option key={stage._id || stage.id} value={stage._id || stage.id}>
                                                    {stage.name || stage.stage_name || 'Unnamed Stage'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Lead Category</label>
                                        <select
                                            name="lead_category"
                                            value={formData.lead_category}
                                            onChange={handleChange}
                                            className="form-input"
                                            disabled={loading}
                                        >
                                            <option value="hot">Hot</option>
                                            <option value="warm">Warm</option>
                                            <option value="cold">Cold</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Tags Section */}
                                <div className="form-group">
                                    <label className="form-label">
                                        <FaTags style={{ marginRight: '0.5rem' }} />
                                        Tags
                                    </label>
                                    <div className="tags-container">
                                        {/* Selected Tags */}
                                        {formData.tags.length > 0 && (
                                            <div className="selected-tags">
                                                {formData.tags.map(tag => (
                                                    <span key={tag._id} className="tag-badge">
                                                        {tag.full_name}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTagRemove(tag._id)}
                                                            className="tag-remove"
                                                            disabled={loading}
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {/* Tag Input with Auto-suggest */}
                                        <div className="tag-input-wrapper" style={{ position: 'relative' }}>
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={handleTagInputChange}
                                                onFocus={() => setShowTagSuggestions(true)}
                                                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                                className="form-input"
                                                placeholder="Type to search and add tags..."
                                                disabled={loading}
                                            />
                                            {/* Auto-suggest dropdown */}
                                            {showTagSuggestions && tagInput && filteredTags.length > 0 && (
                                                <div className="tag-suggestions">
                                                    {filteredTags.map(tag => (
                                                        <div
                                                            key={tag._id}
                                                            className="tag-suggestion-item"
                                                            onClick={() => handleTagSelect(tag)}
                                                        >
                                                            <FaTags style={{ marginRight: '0.5rem', fontSize: '0.875rem' }} />
                                                            {tag.full_name}
                                                            {tag.desc && <span className="tag-desc"> - {tag.desc}</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">                        
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" style={{ marginRight: '0.5rem' }}></span>
                                    Updating...
                                </>
                            ) : (
                                'Update Contact'
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditContact;
