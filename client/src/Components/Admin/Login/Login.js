'use client';

import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useDispatch, useSelector } from "react-redux";
import { requestLoginOtp, clearError, clearOtpState } from "../../../redux/slices/userSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useSelector((state) => state.user);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        is_admin: 1
    });
    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [otpOptions, setOtpOptions] = useState({
        email: true,
        sms: false,
    });

    useEffect(() => {
        // Clear any previous errors when component mounts
        dispatch(clearError());
        dispatch(clearOtpState());
    }, [dispatch]);

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
        if (isAuthenticated) {
            toast.success("Login successful!");
            router.replace("/admin/dashboard");
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        // Show error toast if there's an error from Redux
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        // Email validation
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "Please enter a valid email";
        }

        // Password validation
        if (!formData.password.trim()) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!otpOptions.email && !otpOptions.sms) {
            toast.error("Select at least one OTP option");
            return;
        }

        try {
            const otpPayload = {
                ...formData,
                otp_channels: {
                    email: otpOptions.email,
                    sms: otpOptions.sms,
                },
            };

            const result = await dispatch(requestLoginOtp(otpPayload)).unwrap();

            const challengeId = result.challengeId || result.challenge_id || result.requestId || null;
            const otpValue = extractOtpValue(result);
            sessionStorage.setItem(
                "adminLogin2fa",
                JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    is_admin: formData.is_admin,
                    otp_channels: otpPayload.otp_channels,
                    challengeId,
                    testingOtp: otpValue ? String(otpValue) : null,
                })
            );

            toast.success("OTP sent to selected channels");
            router.push("/admin/verify-otp");
        } catch (err) {
            console.error("OTP request failed:", err);
        }
    };

    const handleOtpOptionChange = (e) => {
        const { name, checked } = e.target;
        setOtpOptions((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        
            <>

            <div className="simple-wrapper">
        
                <div className="login-section">
                    <div className="form-wrapper">
                        <h3>Login</h3>
                        <p>Please login to your account</p>
                           <form onSubmit={handleSubmit}>
                        <div className="form-area">

                            <div className="form-group">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={formErrors.email ? styles.error_input + " form-control" : "form-control"}
                                />
                                {formErrors.email && (
                                    <span className={styles.error_text}>{formErrors.email}</span>
                                )}
                            </div>

                            <div className="form-group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={formErrors.password ? styles.error_input + " form-control" : " form-control"}
                                />
                                <span className={styles.icon} onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </span>
                            </div>

                            


                            <div className="form-group remember-ps otp-line">
                                <label htmlFor="otp-email" className="mb-0">2FA OTP:</label>
                                <div className="otp-options">
                                    <div className="otp-option">
                                        <input
                                            id="otp-email"
                                            type="checkbox"
                                            name="email"
                                            checked={otpOptions.email}
                                            onChange={handleOtpOptionChange}
                                            disabled
                                        />
                                        <label htmlFor="otp-email" className="mb-0">Email</label>
                                    </div>
                                    {/* <div className="otp-option">
                                        <input
                                            id="otp-sms"
                                            type="checkbox"
                                            name="sms"
                                            checked={otpOptions.sms}
                                            onChange={handleOtpOptionChange}
                                        />
                                        <label htmlFor="otp-sms" className="mb-0">SMS</label>
                                    </div> */}
                                </div>
                            </div>

                            


                            {/* <div class="form-group remember-ps">
                                <input class="form-check-input mt-0" type="checkbox" value="Remember Me" id="Remember" />
                                <label for="Remember">Remember Me</label>
                            </div> */}

                            <button type="submit" disabled={loading} className="btn btn-primary">
                                {loading ? "Logging in..." : "Log in"}
                            </button>
                            <span><Link href="/admin/forgot-password">Forget Password</Link></span>

                            {/* <h6>Don't have a account <a href="#">Register</a></h6> */}
                        </div>
                            </form>
                    </div>
                </div>

            </div>

























            {/* <div className={styles.login_left}>
                <div className={styles.login_left_header}>
                    <div className={styles.brand_logo}>
                        <Image
                            src="/assets/logo.png"
                            alt="Logo"
                            width={120}
                            height={120}
                        />
                    </div>
                </div>
                <div className={styles.ellipses}>
                    <div className={styles.ellipses_main}>
                        <Image
                            src="/assets/ellipses.png"
                            alt="Ellipses"
                            width={300}
                            height={300}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.login_right}>
                <form className={styles.login_form} onSubmit={handleSubmit}>
                    <div className={styles.login_form_heading}>
                        <h2>Welcome Back!</h2>
                        <p>Please login to your account</p>
                    </div>

                    <div className={styles.textField}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={formErrors.email ? styles.error_input : ""}
                        />
                        {formErrors.email && (
                            <span className={styles.error_text}>{formErrors.email}</span>
                        )}
                    </div>

                    <div className={styles.textField}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.password_textField}>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className={formErrors.password ? styles.error_input : ""}
                            />
                            <span className={styles.icon} onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {formErrors.password && (
                            <span className={styles.error_text}>{formErrors.password}</span>
                        )}
                    </div>

                    <div className={styles.forgot_password}>
                        <Link href="/admin/forgot-password">Forgot Password?</Link>
                    </div>

                    <div className={styles.button}>
                        <button type="submit" disabled={loading} className="btn btn-success" style={{ backgroundColor: "#000" }}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>

                    <div className={styles.dont_have_account}>
                        <span>Don't have an account?</span>
                        <Link href="/admin/signup" className={styles.signup_option}>
                            Sign Up
                        </Link>
                    </div>
                </form>
            </div> */}
            </>
       
    );
};

export default Login;
