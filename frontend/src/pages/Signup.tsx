import React, { useState } from "react";
import { Brain, ChevronRight, Shield, Lock } from 'lucide-react';

const Signup: React.FC = () => {
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false
    });

    // Validation errors state
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: ''
    });

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: ''
        };

        // Full Name validation
        if (formData.fullName.trim().length < 3) {
            newErrors.fullName = "Full Name must be at least 3 characters";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }

        // Password validation
        if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        // Confirm Password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Terms validation
        if (!formData.terms) {
            newErrors.terms = "You must accept the terms";
        }

        setErrors(newErrors);

        // Return true if no errors
        return Object.values(newErrors).every(error => error === '');
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                // Show loading state
                console.log("Sending signup request...");

                // Backend API endpoint
                const apiUrl = "http://localhost:5000/api/auth/signup"; // Replace with your API endpoint

                // Make the POST request
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        full_name: formData.fullName,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                // Check response
                if (response.ok) {
                    const data = await response.json();
                    console.log("Signup successful:", data);

                    // Show success message
                    alert("Signup successful! You can now log in.");
                    // Redirect to login page (if needed)
                    window.location.href = "/login";
                } else {
                    // Handle errors
                    const errorData = await response.json();
                    console.error("Signup error:", errorData);
                    alert(errorData.message || "Signup failed. Please try again.");
                }
            } catch (error) {
                console.error("Error during signup:", error);
                alert("An unexpected error occurred. Please try again.");
            }
        }
    };


    return (
        <div className="min-h-screen flex flex-col">
            {/* Enhanced Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            AttritionAI
                        </span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</a>
                        <a href="/solutions" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
                        <a href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
                    {/* Decorative Left Side */}
                    <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                                <Shield className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold">Secure Your Future</h2>
                            <p className="text-white/80 leading-relaxed">
                                Join AttritionAI and unlock powerful insights to transform your employee retention strategy.
                            </p>
                            <div className="flex items-center space-x-3 text-white/80">
                                <Lock className="h-5 w-5" />
                                <span>100% Secure & Confidential</span>
                            </div>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Create Account</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-gray-600">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-gray-600">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-gray-600">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-gray-600">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label className="text-gray-600">
                                    I agree to the <a href="#" className="text-blue-600 underline">Terms & Conditions</a>
                                </label>
                            </div>
                            {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
                            >
                                Sign Up
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </form>

                        <p className="text-gray-600 text-center mt-4">
                            Already have an account? <a href="/login" className="text-blue-600 underline">Login</a>
                        </p>
                    </div>
                </div>
            </main>

            {/* Enhanced Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Brain className="h-8 w-8 text-blue-400" />
                                <span className="ml-2 text-xl font-bold">AttritionAI</span>
                            </div>
                            <p className="text-gray-400">
                                Transforming employee retention through AI-powered insights
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Solutions</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Sentiment Analysis</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Predictive Analytics</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">HR Dashboard</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Resources</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Case Studies</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-6 text-center">
                        <p className="text-gray-400">© 2025 AttritionAI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Signup;