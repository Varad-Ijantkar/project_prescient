import React, { useState } from 'react';
import { Brain, Users, AlertTriangle, TrendingUp, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import NavigationMenu from '../components/layouts/nav_menu';

// Define TypeScript interfaces
interface SentimentData {
    month: string;
    score: number;
}

interface Employee {
    id: number;
    name: string;
    department: string;
    risk: string;
    sentiment: number;
}

interface DashboardProps {
    className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Sample data with proper typing
    const sentimentData: SentimentData[] = [
        { month: 'Jan', score: 7.2 },
        { month: 'Feb', score: 7.5 },
        { month: 'Mar', score: 7.1 },
        { month: 'Apr', score: 7.8 },
        { month: 'May', score: 7.4 },
        { month: 'Jun', score: 7.9 }
    ];

    const highRiskEmployees: Employee[] = [
        { id: 1, name: 'John Doe', department: 'Engineering', risk: 'High', sentiment: 4.2 },
        { id: 2, name: 'Jane Smith', department: 'Sales', risk: 'High', sentiment: 4.5 },
        { id: 3, name: 'Mike Johnson', department: 'Marketing', risk: 'High', sentiment: 4.1 },
        { id: 4, name: 'Sarah Williams', department: 'Product', risk: 'High', sentiment: 4.3 },
    ];

    return (
        <div className="min-h-screen flex">
            <NavigationMenu isOpen={isOpen} setIsOpen={setIsOpen} />
            
            {/* Wrapper for content that shifts with the sidebar */}
            <div className={`flex flex-col flex-grow transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'ml-0'}`}>
                <Header />
                {/* Main Content - Adjusted for sidebar */}
                <main className="flex-grow bg-gray-50 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Page Title */}
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4 lg:mb-6">Dashboard Overview</h1>

                        {/* Metrics Grid - Adjusted columns for different breakpoints */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                            {/* Total Employees */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Employees</p>
                                        <p className="text-xl lg:text-2xl font-bold text-gray-800">1,234</p>
                                    </div>
                                    <div className="bg-blue-100 p-2 lg:p-3 rounded-full">
                                        <Users className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 mt-2">↑ 2.5% from last month</p>
                            </div>

                            {/* High Risk Percent */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">High Risk %</p>
                                        <p className="text-xl lg:text-2xl font-bold text-gray-800">15.2%</p>
                                    </div>
                                    <div className="bg-red-100 p-2 lg:p-3 rounded-full">
                                        <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-red-600 mt-2">↑ 1.2% from last month</p>
                            </div>

                            {/* Sentiment Score */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Sentiment Score</p>
                                        <p className="text-xl lg:text-2xl font-bold text-gray-800">7.4/10</p>
                                    </div>
                                    <div className="bg-green-100 p-2 lg:p-3 rounded-full">
                                        <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 mt-2">↑ 0.3 from last month</p>
                            </div>

                            {/* Attrition Risk */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Attrition Risk</p>
                                        <p className="text-xl lg:text-2xl font-bold text-gray-800">Medium</p>
                                    </div>
                                    <div className="bg-yellow-100 p-2 lg:p-3 rounded-full">
                                        <BarChart className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-yellow-600 mt-2">No change from last month</p>
                            </div>
                        </div>

                        {/* Charts Section - Adjusted for responsiveness */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                            {/* Employee Sentiment Chart */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">Employee Sentiment Trend</h2>
                                <div className="h-48 lg:h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sentimentData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[0, 10]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Department Risk Distribution */}
                            <div className="bg-white rounded-lg shadow p-4 lg:p-6">
                                <h2 className="text-base lg:text-lg font-semibold text-gray-800 mb-4">Department Risk Distribution</h2>
                                <div className="space-y-4">
                                    {/* Risk bars */}
                                    {[
                                        { department: 'Engineering', percentage: 15 },
                                        { department: 'Sales', percentage: 25 },
                                        { department: 'Marketing', percentage: 10 }
                                    ].map((item) => (
                                        <div key={item.department}>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-gray-600">{item.department}</span>
                                                <span className="text-sm text-gray-600">{item.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* High Risk Employees Table - Made responsive */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 lg:p-6 border-b border-gray-200">
                                <h2 className="text-base lg:text-lg font-semibold text-gray-800">High Risk Employees</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment Score</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {highRiskEmployees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{employee.department}</div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        {employee.risk}
                                                    </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {employee.sentiment}/10
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default Dashboard;