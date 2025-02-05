import React from 'react';
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
    ChevronRight
} from 'lucide-react';

interface NavigationMenuProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({ isOpen, setIsOpen }) => {
    const [activePath, setActivePath] = React.useState('/dashboard');

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

    return (
        <>
            {/* Overlay for mobile only */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 lg:bg-opacity-0 lg:hidden z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Toggle Button */}
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

            {/* Desktop Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:flex fixed left-64 top-1/2 -translate-y-1/2 z-30 bg-white shadow-lg rounded-r-md p-1.5 transition-transform duration-300"
                style={{
                    transform: isOpen ? 'translateX(0)' : 'translateX(-256px)'
                }}
            >
                {isOpen ? (
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
            </button>

            <nav className={`bg-white border-r border-gray-200 w-64 fixed h-full z-30 transition-all duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex flex-col h-full">
                    {/* Header with Logo */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Brain className="h-8 w-8 text-blue-600" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                    AttritionAI
                                </span>
                            </div>
                        </div>
                    </div>

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
                                                setActivePath(item.href);
                                                if (window.innerWidth < 1024) {
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-150 ${
                                                isActive
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 mr-3 ${
                                                isActive ? 'text-blue-600' : 'text-gray-400'
                                            }`} />
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
                                <span className="text-sm font-medium text-gray-600">JD</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">John Doe</p>
                                <p className="text-xs text-gray-500">HR Manager</p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default NavigationMenu;