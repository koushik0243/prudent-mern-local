'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaFileImport } from 'react-icons/fa';
import toast from 'react-hot-toast';
import apiServiceHandler from '@/service/apiService';
import './AddContact.css';

const CONTACT_CSV_HEADERS = [
    'fname',
    'mname',
    'lname',
    'phone',
    'alternate_phone',
    'email',
    'address1',
    'address2',
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
    'timezone',
    'currency',
    'priority',
    'stage_id',
];

const SAMPLE_CONTACT_ROWS = [
    {
        fname: 'Demo 1',
        mname: 'null',
        lname: 'contact',
        phone: '111111111',
        alternate_phone: 'null',
        email: 'demo1@email.com',
        address1: 'null',
        address2: 'null',
        zipcode: '0',
        personal_website: 'null',
        org_name: 'null',
        org_address: 'null',
        org_phone: 'null',
        org_website: 'null',
        total_lead_score: '0',
        lead_category: 'warm',
        form_status: 'completed',
        tries_count: '0',
        last_reminder_date: '01-03-2026',
        q1_label: 'null',
        q1_answer: 'null',
        q2_label: 'null',
        q2_answer: 'null',
        q3_label: 'null',
        q3_answer: 'null',
        q4_label: 'null',
        q4_answer: 'null',
        q5_label: 'null',
        q5_answer: 'null',
        q6_label: 'null',
        q6_answer: 'null',
        q7_label: 'null',
        q7_answer: 'null',
        q8_label: 'null',
        q8_answer: 'null',
        q9_label: 'null',
        q9_answer: 'null',
        q10_label: 'null',
        q10_answer: 'null',
        lead_source: 'Website',
        referral: 'Google',
        timezone: 'null',
        currency: 'INR',
        priority: 'medium',
        stage_id: 'New',
    },
    {
        fname: 'Demo 2',
        mname: 'null',
        lname: 'contact',
        phone: '222222222',
        alternate_phone: 'null',
        email: 'demo2@email.com',
        address1: 'null',
        address2: 'null',
        zipcode: '0',
        personal_website: 'null',
        org_name: 'null',
        org_address: 'null',
        org_phone: 'null',
        org_website: 'null',
        total_lead_score: '0',
        lead_category: 'warm',
        form_status: 'completed',
        tries_count: '0',
        last_reminder_date: '01-03-2026',
        q1_label: 'null',
        q1_answer: 'null',
        q2_label: 'null',
        q2_answer: 'null',
        q3_label: 'null',
        q3_answer: 'null',
        q4_label: 'null',
        q4_answer: 'null',
        q5_label: 'null',
        q5_answer: 'null',
        q6_label: 'null',
        q6_answer: 'null',
        q7_label: 'null',
        q7_answer: 'null',
        q8_label: 'null',
        q8_answer: 'null',
        q9_label: 'null',
        q9_answer: 'null',
        q10_label: 'null',
        q10_answer: 'null',
        lead_source: 'Website',
        referral: 'Google',
        timezone: 'null',
        currency: 'INR',
        priority: 'medium',
        stage_id: 'New',
    },
    {
        fname: 'Demo 3',
        mname: 'null',
        lname: 'contact',
        phone: '333333333',
        alternate_phone: 'null',
        email: 'demo3@email.com',
        address1: 'null',
        address2: 'null',
        zipcode: '0',
        personal_website: 'null',
        org_name: 'null',
        org_address: 'null',
        org_phone: 'null',
        org_website: 'null',
        total_lead_score: '0',
        lead_category: 'warm',
        form_status: 'completed',
        tries_count: '0',
        last_reminder_date: '01-03-2026',
        q1_label: 'null',
        q1_answer: 'null',
        q2_label: 'null',
        q2_answer: 'null',
        q3_label: 'null',
        q3_answer: 'null',
        q4_label: 'null',
        q4_answer: 'null',
        q5_label: 'null',
        q5_answer: 'null',
        q6_label: 'null',
        q6_answer: 'null',
        q7_label: 'null',
        q7_answer: 'null',
        q8_label: 'null',
        q8_answer: 'null',
        q9_label: 'null',
        q9_answer: 'null',
        q10_label: 'null',
        q10_answer: 'null',
        lead_source: 'Website',
        referral: 'Google',
        timezone: 'null',
        currency: 'INR',
        priority: 'medium',
        stage_id: 'New',
    },
    {
        fname: 'Demo 4',
        mname: 'null',
        lname: 'contact',
        phone: '444444444',
        alternate_phone: 'null',
        email: 'demo4@email.com',
        address1: 'null',
        address2: 'null',
        zipcode: '0',
        personal_website: 'null',
        org_name: 'null',
        org_address: 'null',
        org_phone: 'null',
        org_website: 'null',
        total_lead_score: '0',
        lead_category: 'warm',
        form_status: 'completed',
        tries_count: '0',
        last_reminder_date: '01-03-2026',
        q1_label: 'null',
        q1_answer: 'null',
        q2_label: 'null',
        q2_answer: 'null',
        q3_label: 'null',
        q3_answer: 'null',
        q4_label: 'null',
        q4_answer: 'null',
        q5_label: 'null',
        q5_answer: 'null',
        q6_label: 'null',
        q6_answer: 'null',
        q7_label: 'null',
        q7_answer: 'null',
        q8_label: 'null',
        q8_answer: 'null',
        q9_label: 'null',
        q9_answer: 'null',
        q10_label: 'null',
        q10_answer: 'null',
        lead_source: 'Website',
        referral: 'Google',
        timezone: 'null',
        currency: 'INR',
        priority: 'medium',
        stage_id: 'New',
    },
    {
        fname: 'Demo 5',
        mname: 'null',
        lname: 'contact',
        phone: '555555555',
        alternate_phone: 'null',
        email: 'demo5@email.com',
        address1: 'null',
        address2: 'null',
        zipcode: '0',
        personal_website: 'null',
        org_name: 'null',
        org_address: 'null',
        org_phone: 'null',
        org_website: 'null',
        total_lead_score: '0',
        lead_category: 'warm',
        form_status: 'completed',
        tries_count: '0',
        last_reminder_date: '01-03-2026',
        q1_label: 'null',
        q1_answer: 'null',
        q2_label: 'null',
        q2_answer: 'null',
        q3_label: 'null',
        q3_answer: 'null',
        q4_label: 'null',
        q4_answer: 'null',
        q5_label: 'null',
        q5_answer: 'null',
        q6_label: 'null',
        q6_answer: 'null',
        q7_label: 'null',
        q7_answer: 'null',
        q8_label: 'null',
        q8_answer: 'null',
        q9_label: 'null',
        q9_answer: 'null',
        q10_label: 'null',
        q10_answer: 'null',
        lead_source: 'Website',
        referral: 'Google',
        timezone: 'null',
        currency: 'INR',
        priority: 'medium',
        stage_id: 'New',
    },
];

const escapeCsvCell = (value) => {
    const normalizedValue = value ?? '';
    const text = String(normalizedValue);
    if (text.includes('"') || text.includes(',') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
};

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const char = line[index];

        if (char === '"') {
            if (inQuotes && line[index + 1] === '"') {
                current += '"';
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
};

const parseCsvImportRows = (csvText) => {
    const lines = csvText
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);

    if (lines.length <= 1) return [];

    const headers = parseCsvLine(lines[0]).map((header) => header.trim());

    return lines.slice(1).map((line, lineIndex) => {
        const values = parseCsvLine(line);
        const row = headers.reduce((accumulator, header, headerIndex) => {
            accumulator[header] = values[headerIndex] ?? '';
            return accumulator;
        }, {});

        const fullName = [row.fname, row.mname, row.lname]
            .map((part) => String(part || '').trim())
            .filter((part) => part.length > 0)
            .join(' ');

        return {
            rowNumber: lineIndex + 1,
            name: fullName || row.name || 'N/A',
            email: row.email || 'N/A',
            phone: row.phone || 'N/A',
            status: 'adding',
        };
    });
};

const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const ImportContact = () => {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState(null);
    const [recordCount, setRecordCount] = useState(null);
    const [errorText, setErrorText] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importStatuses, setImportStatuses] = useState([]);
    const [showImportCompleteMessage, setShowImportCompleteMessage] = useState(false);

    const handleBack = () => {
        router.push('/admin/contacts');
    };

    const getCsvRecordCount = (csvText) => {
        const lines = csvText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length <= 1) return 0;
        return lines.length - 1;
    };

    const resetImportView = () => {
        setSelectedFile(null);
        setRecordCount(null);
        setErrorText('');
        setImportStatuses([]);
        setShowImportCompleteMessage(false);
    };

    const handleFileInputClick = (event) => {
        // Clearing input value ensures selecting the same file triggers onChange.
        event.currentTarget.value = '';
        resetImportView();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];

        resetImportView();

        if (!file) return;

        const isCsvFile = file.name.toLowerCase().endsWith('.csv');
        if (!isCsvFile) {
            setErrorText('Please select a .csv file only.');
            event.target.value = '';
            return;
        }

        try {
            setIsParsing(true);
            const fileText = await file.text();
            const totalRecords = getCsvRecordCount(fileText);

            setSelectedFile(file);
            setRecordCount(totalRecords);
        } catch (error) {
            setErrorText('Unable to read the selected file. Please try again.');
            event.target.value = '';
        } finally {
            setIsParsing(false);
        }
    };

    const handleImportSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile || isImporting) return;

        try {
            setIsImporting(true);
            setShowImportCompleteMessage(false);
            const csvText = await selectedFile.text();
            const csvRows = parseCsvImportRows(csvText);

            if (csvRows.length === 0) {
                toast.error('No records found in CSV file');
                setImportStatuses([]);
                return;
            }

            setImportStatuses(csvRows);

            const existingContactsResponse = await apiServiceHandler('GET', 'contact/list');
            const existingContacts = Array.isArray(existingContactsResponse?.data)
                ? existingContactsResponse.data
                : Array.isArray(existingContactsResponse)
                    ? existingContactsResponse
                    : [];

            const knownEmails = new Set(
                existingContacts
                    .map((contact) => normalizeText(contact?.email))
                    .filter((email) => email.length > 0)
            );

            const knownPhones = new Set(
                existingContacts
                    .map((contact) => normalizeText(contact?.phone))
                    .filter((phone) => phone.length > 0)
            );

            const payload = new FormData();
            payload.append('file', selectedFile);

            // Apply requested defaults for imported contacts.
            payload.append('city', '0');
            payload.append('state', '0');
            payload.append('country', '0');
            payload.append('stage_id', 'null');
            payload.append('tags', '[]');

            await apiServiceHandler('POST', 'contact/import', payload);

            for (let rowIndex = 0; rowIndex < csvRows.length; rowIndex += 1) {
                const currentRow = csvRows[rowIndex];
                const rowEmail = normalizeText(currentRow?.email);
                const rowPhone = normalizeText(currentRow?.phone);

                const emailExists = rowEmail.length > 0 && knownEmails.has(rowEmail);
                const phoneExists = rowPhone.length > 0 && knownPhones.has(rowPhone);
                const nextStatus = emailExists || phoneExists ? 'already-exist' : 'added';

                setImportStatuses((prev) => prev.map((item, index) => (
                    index === rowIndex ? { ...item, status: nextStatus } : item
                )));

                if (rowEmail.length > 0) {
                    knownEmails.add(rowEmail);
                }

                if (rowPhone.length > 0) {
                    knownPhones.add(rowPhone);
                }

                await wait(120);
            }

            setShowImportCompleteMessage(true);

            toast.success('Contacts imported successfully');
        } catch (error) {
            setImportStatuses((prev) => prev.map((item) => (
                item.status === 'adding' ? { ...item, status: 'failed' } : item
            )));
            toast.error(error?.message || 'Failed to import contacts');
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadSampleCsv = () => {
        const headerLine = CONTACT_CSV_HEADERS.join(',');
        const sampleLines = SAMPLE_CONTACT_ROWS.map((row) => (
            CONTACT_CSV_HEADERS.map((header) => escapeCsvCell(row[header])).join(',')
        ));

        const csvContent = [headerLine, ...sampleLines].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = downloadUrl;
        link.setAttribute('download', 'contacts_sample_format.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    };

    return (
        <div className="show-contact-container">
            <div className="show-contact-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button className="btn-back" onClick={handleBack}>
                        <FaArrowLeft /> Back to Contacts
                    </button>
                    <button
                        type="button"
                        className="btn-back"
                        onClick={handleDownloadSampleCsv}
                    >
                        Download Sample CSV Format
                    </button>
                </div>
                <div>
                    <h1 className="page-title">Import Contact</h1>
                    <p className="page-subtitle">Upload and import contacts into your CRM</p>
                </div>
            </div>

            <div className="contact-card">
                <form onSubmit={handleImportSubmit} className="form-section" style={{ padding: '2rem 1rem' }}>
                    <div style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center' }}>
                        <FaFileImport style={{ fontSize: '2rem', color: '#b6110f', marginBottom: '0.75rem' }} />
                        <h2 className="section-title" style={{ justifyContent: 'center', marginBottom: '0.9rem' }}>Import Contacts</h2>

                        <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                            <input
                                type="file"
                                accept=".csv"
                                onClick={handleFileInputClick}
                                onChange={handleFileChange}
                                disabled={isParsing || isImporting}
                                className="import-file-input"
                                style={{
                                    width: '100%',
                                    border: '2px solid #e9ecef',
                                    borderRadius: '8px',
                                    padding: '0.55rem 0.7rem',
                                    fontSize: '0.9rem',
                                    backgroundColor: '#fff',
                                    color: '#495057',
                                    cursor: 'pointer',
                                }}
                            />
                        </div>

                        {selectedFile && !errorText && (
                            <p style={{ color: '#495057', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                                File: <strong>{selectedFile.name}</strong>
                            </p>
                        )}

                        {errorText && (
                            <p className="error-text" style={{ marginBottom: '0.55rem' }}>{errorText}</p>
                        )}

                        {recordCount !== null && !errorText && (
                            <p style={{ color: '#495057', marginBottom: '1rem', fontSize: '0.95rem' }}>
                                Total records: <strong>{recordCount}</strong>
                            </p>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={!selectedFile || !!errorText || isParsing || isImporting}
                                style={{
                                    minWidth: '170px',
                                    height: '40px',
                                }}
                            >
                                {isImporting ? 'Importing...' : 'Import Contact'}
                            </button>
                        </div>

                        {importStatuses.length > 0 && (
                            <>
                                <hr style={{ border: 0, borderTop: '2px solid #000', margin: '1rem 0 0.85rem' }} />
                                <div style={{ textAlign: 'left', display: 'grid', gap: '0.45rem' }}>
                                    {importStatuses.map((item, index) => {
                                        const statusText = item.status === 'added'
                                            ? 'added to contact.'
                                            : item.status === 'already-exist'
                                                ? 'already exist. Not added.'
                                            : item.status === 'failed'
                                                ? 'failed to add.'
                                                : 'adding...';

                                        const statusColor = item.status === 'added'
                                            ? '#2e7d32'
                                            : item.status === 'already-exist'
                                                ? '#c62828'
                                                : '#495057';

                                        const isLastRecord = index === importStatuses.length - 1;

                                        return (
                                            <div key={`${item.rowNumber}-${index}`} style={{ color: '#495057', fontSize: '0.92rem', borderBottom: isLastRecord ? 'none' : '1px solid #d1d1d1', borderRadius: '6px', padding: '0.45rem 0.65rem' }}>
                                                {index + 1}) {item.name}, {item.email}, {item.phone} - <span style={{ color: statusColor, fontWeight: 600 }}>{statusText}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {showImportCompleteMessage && (
                                    <>
                                        <hr style={{ border: 0, borderTop: '2px solid #000', margin: '1rem 0 0.85rem' }} />
                                        <div style={{ color: '#2e7d32', fontSize: '0.95rem', fontWeight: 600, textAlign: 'left' }}>
                                            All contact data imported successfully. 
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ImportContact;
