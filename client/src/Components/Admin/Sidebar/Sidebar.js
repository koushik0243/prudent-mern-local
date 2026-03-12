"use client";

import React, { useEffect, useState } from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import { FaCog } from 'react-icons/fa';
import menuIcon from "@/assets/images/dashboard.svg";
import { useSidebar } from '@/contexts/SidebarContext';
import "./Sidebar.css";
import { formatTodayDate } from '@/utils/Common';
import dashIcon from "@/assets/images/dashboard.png";
import contactIcon from "@/assets/images/user.svg";
import tagIcon from "@/assets/images/icon-category.svg";
import mailIcon from "@/assets/images/mails.png";


function Sidebar() {
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar } = useSidebar();

    useEffect(() => {
        const wrapperElement = document.getElementById('wrapper');
        if (wrapperElement) {
            if (!isSidebarOpen) {
                wrapperElement.classList.add('sidebar-closed');
            } else {
                wrapperElement.classList.remove('sidebar-closed');
            }
        }
    }, [isSidebarOpen]);

    // Handle link click to close sidebar on mobile/tablet
    const handleLinkClick = () => {
        if (typeof window !== 'undefined' && window.innerWidth <= 990) {
            toggleSidebar();
        }
    }; 

    const isDashboardActive =  pathname === "/admin/dashboard" || pathname.startsWith("/admin/dashboard");
    const isTagManagersActive =  pathname === "/admin/tag-managers" || pathname.startsWith("/admin/tag-managers");
    const isStagesActive =  pathname === "/admin/stages" || pathname.startsWith("/admin/stages");
    const isContactsActive =  pathname === "/admin/contacts" || pathname.startsWith("/admin/contacts") || pathname === "/admin/messages" || pathname.startsWith("/admin/messages");
    const isContactLeadsActive =  pathname === "/admin/contact-leads" || pathname.startsWith("/admin/contact-leads");
    const isMessagesActive =  pathname === "/admin/messages" || pathname.startsWith("/admin/messages");
    const isContactMailActive =  pathname === "/admin/contact-mail" || pathname.startsWith("/admin/contact-mail/");
    const isContactMailSendActive =  pathname === "/admin/contact-mail-send" || pathname.startsWith("/admin/contact-mail-send");
    const isCountryActive = pathname === "/admin/country" || pathname.startsWith("/admin/country");
    const isStateActive = pathname === "/admin/state" || pathname.startsWith("/admin/state");
    const isCityActive = pathname === "/admin/city" || pathname.startsWith("/admin/city");
    const isUsersActive =  pathname === "/admin/users" || pathname.startsWith("/admin/users");

    const isContactsSectionActive = isContactsActive || isMessagesActive || isContactLeadsActive || isContactMailActive || isContactMailSendActive;
    const isCountrySectionActive = isCountryActive || isStateActive || isCityActive;
    const isSettingsSectionActive = isTagManagersActive || isStagesActive || isUsersActive;

    const [isContactsOpen, setIsContactsOpen] = useState(isContactsSectionActive);
    const [isCountryOpen, setIsCountryOpen] = useState(isCountrySectionActive);
    const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsSectionActive);

    useEffect(() => {
        if (isContactsSectionActive) {
            setIsContactsOpen(true);
            setIsCountryOpen(false);
            setIsSettingsOpen(false);
            return;
        }

        if (isCountrySectionActive) {
            setIsCountryOpen(true);
            setIsContactsOpen(false);
            setIsSettingsOpen(false);
            return;
        }

        if (isSettingsSectionActive) {
            setIsSettingsOpen(true);
            setIsCountryOpen(false);
            setIsContactsOpen(false);
        }
    }, [isContactsSectionActive, isCountrySectionActive, isSettingsSectionActive]);

    const handleContactsToggle = () => {
        setIsContactsOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsCountryOpen(false);
                setIsSettingsOpen(false);
            }
            return next;
        });
    };

    const handleCountryToggle = () => {
        setIsCountryOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsContactsOpen(false);
                setIsSettingsOpen(false);
            }
            return next;
        });
    };

    const handleSettingsToggle = () => {
        setIsSettingsOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsContactsOpen(false);
                setIsCountryOpen(false);
            }
            return next;
        });
    };

    return (
        <>

        <div className={`col-auto dashboard-pannel ${isSidebarOpen ? '' : 'sidebar-collapsed'}`} id="sidebar-wrapper">
                        <div className="title-part mt-2">
                            <h2>
                            <span className="text-dark border border-2 border-white rounded p-1 fw-bold" style={{ fontSize: '14px', backgroundColor: "#dfdfdd" }}>
                                {formatTodayDate()}
                            </span>
                            </h2>
                        </div>

                        <ul className='sidebar-link'>
                        <li>
                            <Link
                                href="/admin/dashboard"
                                className={isDashboardActive ? "nav-link active" : "nav-link"}
                                style={{ cursor: "pointer" }}
                                onClick={handleLinkClick}>
                                <Image src={ dashIcon } width={20} height={20} alt="" style={{ maxHeight: "20px" }} unoptimized />
                                <span className='fw-bold' style={{ marginLeft: "0px" }}>Dashboard</span>
                            </Link>
                        </li>

                        <li>
                            <button
                                type="button"
                                className={isContactsSectionActive ? "sidebar-section-title sidebar-section-toggle active" : "sidebar-section-title sidebar-section-toggle"}
                                onClick={handleContactsToggle}
                            >
                                <span className="sidebar-section-label">
                                    <Image src={contactIcon} width={16} height={16} alt="" className="sidebar-section-icon" unoptimized />
                                    <span>Contacts</span>
                                </span>
                                <span className="sidebar-toggle-icon">{isContactsOpen ? "−" : "+"}</span>
                            </button>
                        </li>
                        {isContactsOpen && (
                            <>
                                <li>
                                    <Link
                                        href="/admin/contacts"
                                        className={isContactsActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Contacts</span>
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link
                                        href="/admin/messages"
                                        className={isMessagesActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ mailIcon } width={20} height={20} alt="" style={{ maxHeight: "20px" }} unoptimized />
                                        <span>Messages</span>
                                    </Link>
                                </li> */}
                                <li>
                                    <Link
                                        href="/admin/contact-mail"
                                        className={isContactMailActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ mailIcon } width={20} height={20} alt="" style={{ maxHeight: "20px" }} unoptimized />
                                        <span>Contact Mail Template</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/contact-mail-send"
                                        className={isContactMailSendActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ mailIcon } width={20} height={20} alt="" style={{ maxHeight: "20px" }} unoptimized />
                                        <span>Contact Mail Send</span>
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link
                                        href="/admin/contact-leads"
                                        className={isContactLeadsActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Contact Leads</span>
                                    </Link>
                                </li> */}
                            </>
                        )}

                        <li>
                            <button
                                type="button"
                                className={isCountrySectionActive ? "sidebar-section-title sidebar-section-toggle active" : "sidebar-section-title sidebar-section-toggle"}
                                onClick={handleCountryToggle}
                            >
                                <span className="sidebar-section-label">
                                    <Image src={contactIcon} width={16} height={16} alt="" className="sidebar-section-icon" unoptimized />
                                    <span>Country/State</span>
                                </span>
                                <span className="sidebar-toggle-icon">{isCountryOpen ? "−" : "+"}</span>
                            </button>
                        </li>
                        {isCountryOpen && (
                            <>
                                <li>
                                    <Link
                                        href="/admin/country"
                                        className={isCountryActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Country</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/state"
                                        className={isStateActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>State</span>
                                    </Link>
                                </li>
                                {/* <li>
                                    <Link
                                        href="/admin/city"
                                        className={isCityActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>City</span>
                                    </Link>
                                </li> */}
                            </>
                        )}

                        <li>
                            <button
                                type="button"
                                className={isSettingsSectionActive ? "sidebar-section-title sidebar-section-toggle active" : "sidebar-section-title sidebar-section-toggle"}
                                onClick={handleSettingsToggle}
                            >
                                <span className="sidebar-section-label">
                                    <FaCog className="sidebar-section-icon" aria-hidden="true" />
                                    <span>Settings</span>
                                </span>
                                <span className="sidebar-toggle-icon">{isSettingsOpen ? "−" : "+"}</span>
                            </button>
                        </li>
                        {isSettingsOpen && (
                            <>
                                <li>
                                    <Link
                                        href="/admin/tag-managers"
                                        className={isTagManagersActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ tagIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Tag Managers</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/stages"
                                        className={isStagesActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ tagIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Stages</span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/users"
                                        className={isUsersActive ? "nav-link active sidebar-sub-link" : "nav-link sidebar-sub-link"}
                                        style={{ cursor: "pointer" }}
                                        onClick={handleLinkClick}>
                                        <Image src={ contactIcon } width={20} height={20} alt="" style={{ maxHeight: "20px", filter: "brightness(0) invert(1)" }} unoptimized />
                                        <span>Users</span>
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                    </div>

        </>
    )
}

export default Sidebar;
