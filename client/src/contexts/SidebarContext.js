"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};

export const SidebarProvider = ({ children }) => {
    // Start with sidebar closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        // Check if we're on mobile/tablet and close sidebar initially
        const checkMobile = () => {
            if (typeof window !== 'undefined' && window.innerWidth <= 990) {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
            {children}
        </SidebarContext.Provider>
    );
};
