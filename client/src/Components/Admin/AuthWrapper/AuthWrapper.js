'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthWrapper = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');

            if (!token) {
                // No token found, redirect to login
                window.location.href = '/admin/login';
                return;
            }

            // Token exists, user is authenticated
            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [pathname]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: '#f8f9fa'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>Loading...</p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default AuthWrapper;
