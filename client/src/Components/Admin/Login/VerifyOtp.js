'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { requestLoginOtp, verifyLoginOtp, clearError } from '../../../redux/slices/userSlice';

const VerifyOtp = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useSelector((state) => state.user);

    const [otp, setOtp] = useState('');
    const [loginContext, setLoginContext] = useState(null);
    const [resendCooldown, setResendCooldown] = useState(60);

    const extractOtpValue = (payload) => {
        if (!payload) return null;

        if (typeof payload === 'number') {
            return String(payload);
        }

        if (typeof payload === 'string') {
            const fromText = payload.match(/\b\d{4,8}\b/);
            return fromText ? fromText[0] : null;
        }

        const queue = [payload];
        const visited = new Set();
        const otpKeyPattern = /(otp|passcode|verification.?code|code)/i;

        while (queue.length > 0) {
            const current = queue.shift();
            if (!current || typeof current !== 'object') {
                continue;
            }

            if (visited.has(current)) {
                continue;
            }
            visited.add(current);

            for (const [key, value] of Object.entries(current)) {
                if (value === null || value === undefined) continue;

                if (otpKeyPattern.test(key)) {
                    if (typeof value === 'number') {
                        return String(value);
                    }

                    if (typeof value === 'string') {
                        const directOtp = value.trim();
                        const digitsOnly = directOtp.match(/\b\d{4,8}\b/);
                        if (digitsOnly) return digitsOnly[0];
                        if (directOtp) return directOtp;
                    }
                }

                if (typeof value === 'string') {
                    const fromText = value.match(/\b\d{4,8}\b/);
                    if (fromText) return fromText[0];
                } else if (typeof value === 'object') {
                    queue.push(value);
                }
            }
        }

        return null;
    };

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const intervalId = setInterval(() => {
            setResendCooldown((previous) => {
                if (previous <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [resendCooldown]);

    useEffect(() => {
        const storedContext = sessionStorage.getItem('adminLogin2fa');

        if (!storedContext) {
            toast.error('Login session expired. Please login again.');
            router.push('/admin/login');
            return;
        }

        try {
            setLoginContext(JSON.parse(storedContext));
        } catch (parseError) {
            sessionStorage.removeItem('adminLogin2fa');
            toast.error('Invalid login session. Please login again.');
            router.push('/admin/login');
        }

        dispatch(clearError());
    }, [dispatch, router]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            sessionStorage.removeItem('adminLogin2fa');
            toast.success('Login successful!');
            router.push('/admin/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp.trim()) {
            toast.error('OTP is required');
            return;
        }

        if (!loginContext) {
            toast.error('Login session not found. Please login again.');
            router.push('/admin/login');
            return;
        }

        const verifyPayload = {
            email: loginContext.email,
            is_admin: loginContext.is_admin,
            otp: otp.trim(),
            challengeId: loginContext.challengeId,
            challenge_id: loginContext.challengeId,
        };

        try {
            await dispatch(verifyLoginOtp(verifyPayload)).unwrap();
        } catch (verifyError) {
            console.error('OTP verification failed:', verifyError);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) {
            return;
        }

        if (!loginContext) {
            toast.error('Login session not found. Please login again.');
            router.push('/admin/login');
            return;
        }

        if (!loginContext.password) {
            toast.error('Login session expired. Please login again.');
            sessionStorage.removeItem('adminLogin2fa');
            router.push('/admin/login');
            return;
        }

        try {
            const resendPayload = {
                email: loginContext.email,
                password: loginContext.password,
                is_admin: loginContext.is_admin,
                otp_channels: loginContext.otp_channels || { email: true, sms: false },
            };

            const response = await dispatch(requestLoginOtp(resendPayload)).unwrap();
            const nextChallengeId = response.challengeId || response.challenge_id || response.requestId || loginContext.challengeId || null;
            const nextOtp = extractOtpValue(response);

            const updatedContext = {
                ...loginContext,
                challengeId: nextChallengeId,
                testingOtp: nextOtp ? String(nextOtp) : null,
            };

            setLoginContext(updatedContext);
            sessionStorage.setItem('adminLogin2fa', JSON.stringify(updatedContext));
            toast.success('OTP resent successfully');
            setResendCooldown(60);
        } catch (resendError) {
            console.error('OTP resend failed:', resendError);
        }
    };

    const formatCooldown = (seconds) => {
        const minutesPart = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const secondsPart = (seconds % 60).toString().padStart(2, '0');
        return `${minutesPart}:${secondsPart}`;
    };

    const displayedOtp = loginContext?.testingOtp || null;

    return (
        <div className="simple-wrapper col-lg-12">
            <div className="login-section">
                <div className="form-wrapper">
                    <h3 style={{ whiteSpace: 'nowrap', fontSize: '32px' }}>Verify OTP</h3>
                    <p className="text-dark">Enter the OTP sent to your Email and SMS.</p>

                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-area">
                            <div className="form-group mb-3" style={{ display: 'block' }}>
                                <input
                                    type="text"
                                    id="otp"
                                    name="otp"
                                    placeholder="Enter OTP"
                                    className="form-control"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    disabled={loading}
                                />
                                <small className="form-text text-muted d-block mt-1">
                                    {displayedOtp
                                        ? `Your otp: ${displayedOtp} (testing purpose)`
                                        : 'Your otp: N/A (testing purpose)'}
                                </small>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>

                            <div className="mt-3 text-center d-flex justify-content-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={loading || resendCooldown > 0}
                                    className="btn btn-link p-0"
                                    style={{
                                        color: resendCooldown > 0 ? '#9a9a9a' : '#731111',
                                        fontWeight: '500',
                                        textDecoration: 'none',
                                        opacity: resendCooldown > 0 ? 0.7 : 1,
                                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {resendCooldown > 0
                                        ? `Resend OTP (${formatCooldown(resendCooldown)})`
                                        : 'Resend OTP'}
                                </button>
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

export default VerifyOtp;
