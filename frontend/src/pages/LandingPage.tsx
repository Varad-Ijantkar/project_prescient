import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart, Users, Brain, Shield, TrendingUp, MessageCircle, Menu, X, ChevronRight } from 'lucide-react';
import { Link } from "react-router-dom";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Header scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Enhanced Header/Navigation with smooth transition */}
            <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
            }`}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center group">
                            <Brain className="h-8 w-8 text-blue-600 transform group-hover:rotate-12 transition-transform"/>
                            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                AttritionAI
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#solutions" className="text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
                            <a href="#resources" className="text-gray-600 hover:text-blue-600 transition-colors">Resources</a>
                            <button className="text-gray-600 hover:text-blue-600 transition-colors">Request Demo</button>
                            <Link to="/signup"><button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all">
                                Sign Up
                            </button></Link>
                             <Link to="/login"><button className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                                Login
                             </button></Link>
                        </nav>

                        {/* Mobile Menu Button with animation */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
                        </button>
                    </div>

                    {/* Enhanced Mobile Navigation with smooth transition */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ${
                        isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="py-4 space-y-4">
                            <a href="#solutions" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Solutions</a>
                            <a href="#resources" className="block py-2 text-gray-600 hover:text-blue-600 transition-colors">Resources</a>
                            <button className="block py-2 text-gray-600 hover:text-blue-600 transition-colors w-full text-left">Request Demo</button>
                            <button className="block w-full bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors">
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="pt-20">
                {/* Enhanced Hero Section with gradient animation */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
                    {/* Animated background shapes */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -inset-x-40 -inset-y-40">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute rounded-full bg-blue-400 w-96 h-96 -top-20 -left-20 animate-pulse"/>
                                <div className="absolute rounded-full bg-blue-500 w-96 h-96 -bottom-20 -right-20 animate-pulse delay-100"/>
                            </div>
                        </div>
                    </div>

                    <div className="relative max-w-6xl mx-auto px-4 py-32">
                        <h1 className="text-6xl font-bold mb-6 leading-tight">
                            Transform Your <span className="text-blue-200">Employee Retention</span> Strategy
                        </h1>
                        <p className="text-xl mb-8 max-w-2xl text-blue-100">
                            Harness the power of AI and sentiment analysis to predict, understand, and prevent employee turnover
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center">
                                Get Started
                                <ChevronRight className="ml-2 transform group-hover:translate-x-1 transition-transform"/>
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105">
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Key Features Section */}
                <div className="max-w-6xl mx-auto px-4 py-24">
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <Brain className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Sentiment Analysis</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Advanced LLM models analyze employee feedback, communications, and surveys to gauge satisfaction levels
                            </p>
                        </Card>

                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Predictive Analytics</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Early warning system identifies attrition risks before they lead to turnover
                            </p>
                        </Card>

                        <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 border-t-blue-600">
                            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                                <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                            <CardTitle className="text-2xl mb-4">Privacy-First</CardTitle>
                            <p className="text-gray-600 leading-relaxed">
                                Enterprise-grade security with encrypted data processing and anonymized insights
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Enhanced Footer */}
                <footer className="bg-gray-900 text-white py-24">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-12">
                            <div>
                                <div className="flex items-center mb-6 group">
                                    <Brain className="h-8 w-8 text-blue-400 transform group-hover:rotate-12 transition-transform" />
                                    <span className="ml-2 text-2xl font-bold">AttritionAI</span>
                                </div>
                                <p className="text-gray-400 leading-relaxed">
                                    Transforming employee retention through AI-powered insights
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Solutions</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Sentiment Analysis</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Predictive Analytics</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">HR Dashboard</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Integration API</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Resources</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Documentation</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Case Studies</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Blog</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Webinars</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-xl mb-6">Company</h3>
                                <ul className="space-y-4 text-gray-400">
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Contact</li>
                                    <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Policy</li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-16 pt-8 text-center text-gray-400">
                            <p>© 2025 AttritionAI. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;