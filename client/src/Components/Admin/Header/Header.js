"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import apiServiceHandler from '@/service/apiService';
import Image from 'next/image';
import search from "@/assets/images/Icon-search.svg";
import user from "@/assets/images/user.svg";
import bell from "@/assets/images/bell.svg";
import { useSidebar } from '@/contexts/SidebarContext';
import { useRouter } from 'next/navigation';
import { FaBell, FaCalendarAlt, FaEnvelope, FaPhoneAlt, FaRegClock, FaTasks } from 'react-icons/fa';
import './Header.css';

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const getContactId = (contact) => String(contact?._id || contact?.id || '').trim();

const getContactFullName = (contact) => {
    const parts = [contact?.fname, contact?.mname, contact?.lname]
        .map((part) => String(part ?? '').trim())
        .filter((part) => part && normalizeText(part) !== 'null');

    return parts.join(' ').trim() || 'Unknown Contact';
};

const isSameLocalDate = (leftDate, rightDate) => (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
);

const formatActivityType = (value) => {
    const raw = normalizeText(value);
    if (!raw) return 'Task';

    return raw
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const formatNotificationTime = (dateValue) => {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return 'Time not set';

    return parsedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const Header = () => {
    const { toggleSidebar } = useSidebar();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [todayNotifications, setTodayNotifications] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(false);
    const userDropdownRef = useRef(null);
    const notificationDropdownRef = useRef(null);
    const router = useRouter();

    const notificationCount = todayNotifications.length;

    const notificationSummaryLabel = useMemo(() => {
        if (notificationCount === 0) return 'No schedules today';
        if (notificationCount === 1) return '1 schedule for today';
        return `${notificationCount} schedules for today`;
    }, [notificationCount]);

    const handleSidebarToggle = (e) => {
        e.preventDefault();
        toggleSidebar();
    };

    const handleUserIconClick = (e) => {
        e.preventDefault();
        setShowNotificationDropdown(false);
        setShowUserDropdown((prev) => !prev);
    };

    const fetchTodayScheduleNotifications = async (showLoader = true) => {
        if (showLoader) {
            setNotificationLoading(true);
        }

        try {
            const contactsResponse = await apiServiceHandler('GET', 'contact/list');
            const contacts = Array.isArray(contactsResponse?.data)
                ? contactsResponse.data
                : (Array.isArray(contactsResponse) ? contactsResponse : []);

            const today = new Date();

            const scheduleRowsByContact = await Promise.all(
                contacts.map(async (contact) => {
                    const contactId = getContactId(contact);
                    if (!contactId) return [];

                    try {
                        const messageResponse = await apiServiceHandler('GET', `contact-message/list/${contactId}`);
                        const messages = Array.isArray(messageResponse?.data)
                            ? messageResponse.data
                            : (Array.isArray(messageResponse) ? messageResponse : []);

                        return messages
                            .filter((message) => normalizeText(message?.msg_type) === 'schedule_activity')
                            .filter((message) => message?.due_date)
                            .map((message) => {
                                const dueDate = new Date(message.due_date);
                                if (Number.isNaN(dueDate.getTime()) || !isSameLocalDate(dueDate, today)) {
                                    return null;
                                }

                                const messageId = String(message?._id || message?.id || `${contactId}-${message.due_date}`);

                                return {
                                    id: `${contactId}-${messageId}`,
                                    contactId,
                                    contactName: getContactFullName(contact),
                                    activityType: formatActivityType(message.activity_type),
                                    description: String(message.message || '').trim() || 'No description provided',
                                    dueDate: message.due_date,
                                };
                            })
                            .filter(Boolean);
                    } catch {
                        return [];
                    }
                })
            );

            const mergedSchedules = scheduleRowsByContact
                .flat()
                .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate));

            setTodayNotifications(mergedSchedules);
        } catch {
            setTodayNotifications([]);
        } finally {
            if (showLoader) {
                setNotificationLoading(false);
            }
        }
    };

    const handleNotificationClick = async (e) => {
        e.preventDefault();

        setShowUserDropdown(false);
        const nextVisible = !showNotificationDropdown;
        setShowNotificationDropdown(nextVisible);

        if (nextVisible) {
            await fetchTodayScheduleNotifications(true);
        }
    };

    const handleNotificationItemClick = (contactId) => {
        setShowNotificationDropdown(false);
        router.push(`/admin/messages?contactId=${contactId}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    const handleDashboard = () => {
        setShowUserDropdown(false);
        router.push('/admin/dashboard');
    };

    const handleChangePassword = () => {
        setShowUserDropdown(false);
        router.push('/admin/change-password');
    };

    useEffect(() => {
        fetchTodayScheduleNotifications(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }

            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setShowNotificationDropdown(false);
            }
        };

        if (showUserDropdown || showNotificationDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserDropdown, showNotificationDropdown]);

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <div className="header-left">
                        <button
                            type="button"
                            className="sidebar-toggle-btn"
                            id="sidebar-toggle"
                            aria-label="Toggle sidebar"
                            onClick={handleSidebarToggle}
                        >
                            <i className="fa fa-bars" aria-hidden="true"></i>
                        </button>

                        {/* <div className="header-search-wrap" role="search" aria-label="Global search">
                            <Image src={search} width={16} height={16} alt={"search"} className="header-search-icon" />
                            <input
                                type="text"
                                className="header-search-input"
                                placeholder="Search..."
                                aria-label="Search"
                            />
                        </div> */}
                    </div>

                    <div className="header-right">
                        <ul>
                            <li className="notification-dropdown-container" ref={notificationDropdownRef}>
                                <a href="#" onClick={handleNotificationClick} className="header-icon-btn notification-icon-btn" aria-label="Notifications">
                                    <Image src={bell} width={20} height={20} alt={"bell"} />
                                    {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
                                </a>

                                {showNotificationDropdown && (
                                    <div className="notification-dropdown-menu">
                                        <div className="notification-dropdown-header">
                                            <div>
                                                <h4>Notifications</h4>
                                                <p>{notificationSummaryLabel}</p>
                                            </div>
                                            <span className="notification-chip">Today</span>
                                        </div>

                                        <div className="notification-dropdown-body">
                                            {notificationLoading ? (
                                                <div className="notification-empty-state">Loading notifications...</div>
                                            ) : todayNotifications.length === 0 ? (
                                                <div className="notification-empty-state">
                                                    <FaBell />
                                                    <span>No scheduled activities for today.</span>
                                                </div>
                                            ) : (
                                                todayNotifications.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        className="notification-item"
                                                        onClick={() => handleNotificationItemClick(item.contactId)}
                                                    >
                                                        <div className="notification-item-icon">
                                                            {normalizeText(item.activityType) === 'call'
                                                                ? <FaPhoneAlt />
                                                                : normalizeText(item.activityType) === 'email'
                                                                    ? <FaEnvelope />
                                                                    : normalizeText(item.activityType) === 'task'
                                                                        ? <FaTasks />
                                                                        : <FaCalendarAlt />}
                                                        </div>
                                                        <div className="notification-item-content">
                                                            <div className="notification-item-title-row">
                                                                <strong>{item.activityType}</strong>
                                                                <span className="notification-time"><FaRegClock /> {formatNotificationTime(item.dueDate)}</span>
                                                            </div>
                                                            <p className="notification-item-contact">{item.contactName}</p>
                                                            <p className="notification-item-description">{item.description}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>

                            <li className="user-dropdown-container" ref={userDropdownRef} style={{ position: 'relative' }}>
                                <a href="#" onClick={handleUserIconClick} className="header-icon-btn">
                                    <Image src={user} width={20} height={20} alt={"user"} />
                                </a>
                                {showUserDropdown && (
                                    <div
                                        className="user-dropdown-menu"
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 10px)',
                                            right: '0',
                                            background: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                            minWidth: '180px',
                                            zIndex: 99999,
                                            padding: '8px 0',
                                            listStyle: 'none'
                                        }}
                                    >
                                        <button
                                            onClick={handleDashboard}
                                            className="dropdown-item"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '12px 20px',
                                                textAlign: 'left',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#333'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                                e.target.style.color = '#b6110f';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#333';
                                            }}
                                        >
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={handleChangePassword}
                                            className="dropdown-item"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '12px 20px',
                                                textAlign: 'left',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#333'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                                e.target.style.color = '#b6110f';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#333';
                                            }}
                                        >
                                            Change Password
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="dropdown-item"
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '12px 20px',
                                                textAlign: 'left',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#333'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                                e.target.style.color = '#b6110f';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#333';
                                            }}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
