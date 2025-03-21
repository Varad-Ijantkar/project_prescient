// src/components/layouts/Header.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Brain, Bell, ChevronDown, User, LogOut, Settings, Sun, Moon, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import AuthContext to access user data and logout
import { toast } from "react-hot-toast"; // For user feedback on actions

interface Notification {
    id: number;
    message: string;
    isRead: boolean;
}

const Header: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Access user data and logout function from AuthContext
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, message: "5 employees flagged as high risk.", isRead: false },
        { id: 2, message: "New attrition report available.", isRead: false },
        { id: 3, message: "Sentiment analysis updated.", isRead: false },
    ]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        // Initialize dark mode based on localStorage or system preference
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
            return savedMode === 'true';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Apply dark mode to the document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
        toast.success(`Switched to ${!isDarkMode ? 'Dark' : 'Light'} Mode`);
    };

    // Mark a notification as read
    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(note =>
                note.id === id ? { ...note, isRead: true } : note
            )
        );
        toast.success("Notification marked as read");
    };

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(note => ({ ...note, isRead: true }))
        );
        toast.success("All notifications marked as read");
    };

    // Handle logout
    const handleLogout = () => {
        logout(); // Use AuthContext logout, which clears token and redirects to landing page (/)
        setShowDropdown(false);
        toast.success("Logged out successfully");
    };

    // Navigate to different pages
    const handleNavigation = (path: string) => {
        navigate(path);
        setShowDropdown(false);
    };


    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <div
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                        AttritionAI
                    </span>
                </div>

                {/* Right Section: Dark Mode Toggle, Notifications, Profile */}
                <div className="flex items-center space-x-6">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            <Sun className="h-6 w-6 text-yellow-500" />
                        ) : (
                            <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>


                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            aria-label="User Menu"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-full">
                                <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {user?.full_name || "User"}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email || "user@example.com"}
                                </span>
                            </div>
                            <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 border rounded-lg shadow-lg z-10">
                                <ul className="py-2">
                                    <li
                                        onClick={() => handleNavigation('/dashboard')}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </li>
                                    <li
                                        onClick={() => handleNavigation('/profile')}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2"
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span>Profile Settings</span>
                                    </li>
                                    <li
                                        onClick={handleLogout}
                                        className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center space-x-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;