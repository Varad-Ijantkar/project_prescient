import React, { useState } from "react";
import { Brain, Bell, ChevronDown, User, Search } from "lucide-react";

const Header: React.FC = () => {
    const [notifications] = useState([
        "5 employees flagged as high risk.",
        "New attrition report available.",
        "Sentiment analysis updated.",
    ]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const userImage = ""; // Replace with actual user image URL if available

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                    <Brain className="h-8 w-8 text-blue-600" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        AttritionAI
                    </span>
                </div>

                {/* Search Bar (Increased Width) */}
                <div className="relative w-[500px]">
                    <input
                        type="text"
                        placeholder="Search employees, reports, or trends..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600"
                    />
                    <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                </div>

                {/* Right Section: Notifications, Profile */}
                <div className="flex items-center space-x-6">
                    {/* Notification Bell with Dropdown */}
                    <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell className="h-6 w-6 text-gray-600" />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                                {notifications.length}
                            </span>
                        )}

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg">
                                <ul className="py-2">
                                    {notifications.map((note, index) => (
                                        <li key={index} className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <div
                            className="flex items-center cursor-pointer space-x-2"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {userImage ? (
                                <img
                                    src={userImage}
                                    alt="User"
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full">
                                    <User className="h-6 w-6 text-gray-600" />
                                </div>
                            )}
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                        </div>

                        {/* Profile Dropdown Menu */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                                <ul className="py-2">
                                    <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        View Dashboard
                                    </li>
                                    <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        Help & Support
                                    </li>
                                    <li className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        Logout
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
