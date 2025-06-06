// src/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { Brain, ChevronRight, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast"; // Add toast for user feedback

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });

    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string>("");

    const navigate = useNavigate();
    const { login, logout, token } = useAuth();

    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
        // Only redirect to /dashboard if the user is not explicitly on /login
        if (token && window.location.pathname !== '/login') {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validateForm = () => {
        const newErrors = { email: '', password: '' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });
            const data = await response.json();
            if (response.ok) {
                login(data.token);
                if (formData.rememberMe) {
                    localStorage.setItem("rememberedEmail", formData.email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }
                setLoginError("");
                toast.success("Logged in successfully");
            } else {
                setLoginError(data.error || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoginError("An unexpected error occurred. Please try again.");
        }
    };

    const handleLogout = () => {
        logout();
        localStorage.removeItem('authToken'); // Ensure token is cleared
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            AttritionAI
                        </span>
                    </div>
                    <nav className="flex items-center space-x-4">
                        {token ? (
                            <>
                                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link>
                                <Link to="/solutions" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</Link>
                                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <main className="flex-grow bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full grid md:grid-cols-2">
                    <div className="hidden md:block bg-gradient-to-r from-blue-600 to-blue-800 text-white p-12 flex flex-col justify-center">
                        <div className="space-y-6">
                            <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                                <ShieldCheck className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold">Secure Access</h2>
                            <p className="text-white/80 leading-relaxed">
                                Log in to AttritionAI and gain powerful insights into your employee retention strategies.
                            </p>
                            <div className="flex items-center space-x-3 text-white/80">
                                <Lock className="h-5 w-5" />
                                <span>Confidential & Protected</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Welcome Back</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
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

                            <div>
                                <label className="block text-gray-600">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute top-2 right-3 text-gray-500"
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <label className="text-gray-600">Remember me</label>
                                </div>
                                <Link to="/forgot-password" className="text-blue-600 hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                                Login
                                <ChevronRight className="h-5 w-5"/>
                            </button>
                        </form>

                        <p className="text-gray-600 text-center mt-4">
                            Don't have an account? <Link to="/signup" className="text-blue-600 underline">Sign Up</Link>
                        </p>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Brain className="h-8 w-8 text-blue-400"/>
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

export default Login;