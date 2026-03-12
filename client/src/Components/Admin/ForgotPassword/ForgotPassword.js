'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from '@/lib/constant';
import Link from "next/link";
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Email is required!");
            return;
        }

        setIsLoading(true);
        setSuccessMessage("");

        try {
            const response = await fetch(`${API_URL}/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email.trim(), is_admin: 1 }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("A new password has been sent to your email. Please check your inbox.");
                toast.success("Password reset email sent successfully!");
                setEmail("");

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/admin/login');
                }, 3000);
            } else {
                toast.error(data.message || "Failed to reset password. Please try again.");
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };    

    return (
        <div className="simple-wrapper col-lg-12">
            <div className="login-section">
                <div className="form-wrapper">
                    <h3 style={{ whiteSpace: 'nowrap', fontSize: '32px' }}>Forgot Password</h3>
                    <p className="text-dark">Enter your email address to receive a new password.</p>

                    {successMessage && (
                        <div className="alert alert-success" role="alert">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-area">
                            <div className="form-group mb-3">                                
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Sending...
                                    </>
                                ) : (
                                    'Send New Password'
                                )}
                            </button>

                            <div className="mt-3 text-center">
                                <Link href="/admin/login" className="text-decoration-none" style={{ color: '#731111', fontWeight: '500' }}>
                                    &lt;&lt; Back to login
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
