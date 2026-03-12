'use client';

import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../../../redux/slices/userSlice";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

    useEffect(() => {
        // Clear any previous errors when component mounts
        dispatch(clearError());
    }, [dispatch]);

    useEffect(() => {
        console.log("isAuthenticated:", isAuthenticated);
        // Redirect if authenticated
        if (isAuthenticated) {
            console.log("Redirecting...");
            toast.success("Login successful!");
            router.push("/admin/dashboard");
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
        if (!formData.password) {
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

        try {
            const result = await dispatch(loginUser(formData)).unwrap();
            console.log("Login successful:", result);
        } catch (err) {
            // Error is already handled by Redux and useEffect with toast
            console.error("Login failed:", err);
        }
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
