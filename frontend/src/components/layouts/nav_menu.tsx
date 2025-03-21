// src/components/layouts/nav_menu.tsx
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    TrendingDown,
    Brain,
    BarChart2,
    ScrollText,
    Settings,
    Shield,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavigationMenuProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, setIsOpen }) => {
    const [activePath, setActivePath] = useState<string>(window.location.pathname);
    const { user, logout } = useAuth();

    const menuItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Employee Management', href: '/employees', icon: Users },
        { name: 'Attrition Analysis', href: '/attrition', icon: TrendingDown },
        { name: 'Sentiment Analysis', href: '/sentiment', icon: Brain },
        { name: 'Reports Analytics', href: '/reports', icon: BarChart2 },
        { name: 'Logs', href: '/logs', icon: ScrollText },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Admin Panel', href: '/admin', icon: Shield },
    ];

    useEffect(() => {
        const handleRouteChange = () => {
            setActivePath(window.location.pathname);
        };

        window.addEventListener('popstate', handleRouteChange);
        return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

    const handleNavigation = (href: string) => {
        setActivePath(href);
        window.location.href = href;
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:bg-opacity-0 lg:hidden z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-md bg-white shadow-lg"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-gray-600" />
                ) : (
                    <Menu className="h-6 w-6 text-gray-600" />
                )}
            </button>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex fixed left-64 top-1/2 -translate-y-1/2 z-30 bg-blue-600 shadow-lg rounded-r-md p-1.5 transition-transform duration-300"
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(-256px)',
                }}
            >
                {isOpen ? (
                    <ChevronLeft className="h-5 w-5 text-white" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-white" />
                )}
            </button>

            <nav
                className={`bg-white border-r border-gray-200 w-64 fixed h-full z-30 transition-all duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex-grow p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activePath === item.href;

                                return (
                                    <li key={item.name}>
                                        <a
                                            href={item.href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavigation(item.href);
                                            }}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150 ${
                                                isActive
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 mr-3 ${
                                                    isActive ? 'text-blue-600' : 'text-gray-400'
                                                }`}
                                            />
                                            <span className="font-medium">{item.name}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.full_name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">HR Manager</p>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm text-gray-600 hover:text-red-600"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavigationMenu;