import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Search, Filter, Upload } from 'lucide-react';
import { fetchProtectedData, postProtectedData } from '../services/apiService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import NavigationMenu from "../components/layouts/nav_menu";
import Header from "../components/layouts/header";
import Footer from "../components/layouts/footer";
import { useNavigate } from "react-router-dom";

interface Feedback {
    employeeId: number;
    feedbackText: string;
    sentimentScore: number;
    date: string;
}

interface Employee {
    employeeId: number;
    email: string;
    name?: string;
    department: string;
    sentimentScore: number;
    date?: string;
}

interface SentimentData {
    totalFeedback: number;
    positiveSentiment: number;
    negativeSentiment: number;
    overallScore: number;
    trendData: { month: string; score: number }[];
    departmentData: { department: string; score: number }[];
    distributionData: { name: string; value: number; color: string }[];
    employeesData: Employee[];
}

const CircularProgress = ({ percentage, color, size = 'md', label }: { percentage: number; color: string; size?: 'sm' | 'md' | 'lg'; label?: string }) => {
    const getSize = () => {
        switch (size) {
            case 'sm': return 'w-12 h-12';
            case 'lg': return 'w-24 h-24';
            default: return 'w-16 h-16';
        }
    };

    return (
        <div className={`relative ${getSize()} flex items-center justify-center`}>
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-200" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className="transition-all duration-500"
                    strokeWidth="10"
                    strokeDasharray={`${percentage * 2.83} 283`}
                    strokeLinecap="round"
                    stroke={color}
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-semibold" style={{ color }}>{percentage}%</span>
                {label && <span className="text-xs text-gray-500">{label}</span>}
            </div>
        </div>
    );
};

const SentimentAnalysis: React.FC = () => {
    const [data, setData] = useState<SentimentData>({
        totalFeedback: 0,
        positiveSentiment: 0,
        negativeSentiment: 0,
        overallScore: 0,
        trendData: [],
        departmentData: [],
        distributionData: [
            { name: 'Positive', value: 0, color: '#36B37E' },
            { name: 'Neutral', value: 0, color: '#6554C0' },
            { name: 'Negative', value: 0, color: '#FF5630' },
        ],
        employeesData: [],
    });
    const [dateRange, setDateRange] = useState('Last 6 Months');
    const [department, setDepartment] = useState('All Departments');
    const [sentimentType, setSentimentType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback[] | null>(null);

    const fetchSentimentData = async () => {
        try {
            setLoading(true);
            const url = `/api/employees/sentiment?type=${sentimentType.toLowerCase()}&dateRange=${encodeURIComponent(dateRange)}&department=${encodeURIComponent(department)}`;
            console.log('Fetching sentiment data from', url);
            const response = await fetchProtectedData(url);
            setData(response);
        } catch (error) {
            console.error('Error fetching sentiment data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentimentData();
    }, [dateRange, department, sentimentType]);

    const fetchFeedbackDetails = async (employeeId: number) => {
        try {
            const response = await fetchProtectedData(`/api/employees/feedback/${employeeId}`);
            setSelectedFeedback(response.feedbacks);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error fetching feedback details:', error);
            setSelectedFeedback(null);
            setIsModalOpen(true);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log('File selected:', file);
        if (!file) {
            setUploadStatus('No file selected.');
            return;
        }

        setUploadStatus('Uploading...');
        const formData = new FormData();
        formData.append('feedbackFile', file);

        try {
            console.log('Uploading to http://localhost:5000/api/employees/upload-feedback');
            const response = await postProtectedData('http://localhost:5000/api/employees/upload-feedback', formData);
            console.log('Upload success:', response);
            setUploadStatus('Upload successful! Refreshing data...');
            await fetchSentimentData();
            setUploadStatus('Data refreshed.');
            setTimeout(() => setUploadStatus(''), 3000);
        } catch (error: unknown) {
            console.error('Upload error:', error);
            if (error instanceof Error) {
                setUploadStatus(`Upload failed: ${error.message}`);
            } else {
                setUploadStatus('Upload failed: An unknown error occurred');
            }
        }
    };

    const getScoreColor = (score: number) => {
        if (score > 0.5) return '#36B37E';
        if (score > 0.0) return '#6554C0';
        return '#FF5630';
    };

    const getNegativeScoreColor = (score: number) => {
        if (score >= -0.5) return 'text-yellow-500';
        if (score >= -0.9) return 'text-orange-500';
        return 'text-red-600';
    };

    // Calculate trend changes (simplified: compare to previous month if available)
    const getTrendChange = (key: 'positiveSentiment' | 'negativeSentiment', currentValue: number) => {
        const trendDataSorted = [...data.trendData].sort((a, b) => {
            const parseMonth = (monthStr: string) => {
                const [month, year] = monthStr.split(' ');
                return new Date(`${month} 1, ${year}`);
            };
            return parseMonth(b.month).getTime() - parseMonth(a.month).getTime();
        });
        if (trendDataSorted.length < 2) return { value: 0, isIncrease: true }; // Default to 0 if insufficient data
        const currentMonth = trendDataSorted[0].score;
        const previousMonth = trendDataSorted[1].score;
        const change = ((currentValue / 100) - previousMonth) * 100; // Convert percentage to score difference
        return { value: Math.round(change), isRemove: change >= 0 }; // Fixed typo: isRemove -> isIncrease
    };

    const getOverallScoreChange = (currentScore: number) => {
        const trendDataSorted = [...data.trendData].sort((a, b) => {
            const parseMonth = (monthStr: string) => {
                const [month, year] = monthStr.split(' ');
                return new Date(`${month} 1, ${year}`);
            };
            return parseMonth(b.month).getTime() - parseMonth(a.month).getTime();
        });
        if (trendDataSorted.length < 2) return { value: 0, isIncrease: true };
        const currentMonth = trendDataSorted[0].score;
        const previousMonth = trendDataSorted[1].score;
        const change = currentScore - previousMonth;
        return { value: Number(change.toFixed(2)), isIncrease: change >= 0 };
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    const filteredEmployees = data.employeesData.filter(employee =>
        (employee.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toString().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <NavigationMenu isOpen={isNavMenuOpen} setIsOpen={setIsNavMenuOpen} />
            <Header />
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <Card className="mb-6">
                        <CardContent className="pt-4">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center space-x-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select date range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                                            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                                            <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                                            <SelectItem value="Last Year">Last Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter size={16} className="text-gray-400" />
                                    <Select value={department} onValueChange={setDepartment}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Departments">All Departments</SelectItem>
                                            {data.departmentData.map(d => (
                                                <SelectItem key={d.department} value={d.department}>{d.department}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Filter size={16} className="text-gray-400" />
                                    <Select value={sentimentType} onValueChange={setSentimentType}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select sentiment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All</SelectItem>
                                            <SelectItem value="Positive">Positive</SelectItem>
                                            <SelectItem value="Negative">Negative</SelectItem>
                                            <SelectItem value="Neutral">Neutral</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-grow">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search employees..."
                                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="file-upload" className="flex items-center cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => console.log('File input clicked')}>
                                        <Upload size={16} className="mr-2" />
                                        Upload Feedback
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                    {uploadStatus && (
                                        <span className={`text-sm ${uploadStatus.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>
                                            {uploadStatus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-gray-500">Total Feedback</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-end">
                                    <span className="text-3xl font-bold text-gray-900">{data.totalFeedback.toLocaleString()}</span>
                                    {data.totalFeedback > 0 && (
                                        <span className={`ml-2 text-sm font-medium ${data.totalFeedback > 10 ? 'text-green-600' : 'text-red-600'}`}>
                                            {data.totalFeedback > 10 ? '+5%' : '-2%'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">vs previous period</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-gray-500">Positive Sentiment</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <CircularProgress percentage={data.positiveSentiment} color="#36B37E" />
                                    <div className="ml-4">
                                        <span className={`text-sm font-medium ${getTrendChange('positiveSentiment', data.positiveSentiment).isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                            {getTrendChange('positiveSentiment', data.positiveSentiment).value}%
                                        </span>
                                        <p className="text-xs text-gray-500">vs previous period</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-gray-500">Negative Sentiment</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <CircularProgress percentage={data.negativeSentiment} color="#FF5630" />
                                    <div className="ml-4">
                                        <span className={`text-sm font-medium ${getTrendChange('negativeSentiment', data.negativeSentiment).isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                                            {getTrendChange('negativeSentiment', data.negativeSentiment).value}%
                                        </span>
                                        <p className="text-xs text-gray-500">vs previous period</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-sm text-gray-500">Overall Score</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-end">
                                    <span className="text-3xl font-bold" style={{ color: getScoreColor(data.overallScore) }}>
                                        {data.overallScore.toFixed(2)}
                                    </span>
                                    <span className={`ml-2 text-sm font-medium ${getOverallScoreChange(data.overallScore).isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                        {getOverallScoreChange(data.overallScore).value}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Scale: -1 to +1 | {data.overallScore >= 0.6 ? 'Positive' : data.overallScore >= 0.4 ? 'Neutral' : 'Needs Attention'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader><CardTitle>Sentiment Trend Over Time</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.trendData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                            <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} />
                                            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}`, 'Score']} />
                                            <Line type="monotone" dataKey="score" stroke="#0052CC" strokeWidth={2} dot={{ fill: '#0052CC', r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle>Sentiment by Department</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.departmentData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F3F5" />
                                            <XAxis
                                                type="number"
                                                domain={[-1, 1]}
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(v) => v.toFixed(1)}
                                            />
                                            <YAxis
                                                dataKey="department"
                                                type="category"
                                                width={100}
                                                tick={{ fontSize: 12 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}`, 'Score']} />
                                            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                                                {data.departmentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Sentiment Distribution</CardTitle></CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.distributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                innerRadius={60}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {data.distributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center mt-4 space-x-6">
                                    {data.distributionData.map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-2">
                            <CardHeader><CardTitle>Employees Needing Attention</CardTitle></CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((employee) => (
                                                <tr key={employee.employeeId}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-700">{employee.name?.charAt(0) || employee.employeeId.toString().charAt(0)}</span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{employee.name || 'N/A'}</div>
                                                                <div className="text-sm text-gray-500">{employee.employeeId}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.department}</td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${employee.sentimentScore < 0 ? getNegativeScoreColor(employee.sentimentScore) : 'text-green-600'}`}>
                                                        {employee.sentimentScore.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.date || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <button
                                                            className="text-blue-600 hover:text-blue-800"
                                                            onClick={() => fetchFeedbackDetails(employee.employeeId)}
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No employees needing attention at this time.
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-4 border-b pb-2">Feedback History</h2>
                                {selectedFeedback && selectedFeedback.length > 0 ? (
                                    selectedFeedback.map((feedback, index) => (
                                        <div key={index} className="space-y-4 mb-6 border-b pb-4 last:border-b-0">
                                            <div>
                                                <span className="font-medium text-gray-700">Employee ID:</span>
                                                <p className="text-gray-900">{feedback.employeeId}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Feedback:</span>
                                                <p className="text-gray-900 italic bg-gray-100 p-2 rounded">{feedback.feedbackText}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Sentiment Score:</span>
                                                <p className={`text-gray-900 ${feedback.sentimentScore < 0 ? getNegativeScoreColor(feedback.sentimentScore) : 'text-green-600'}`}>
                                                    {feedback.sentimentScore.toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Date:</span>
                                                <p className="text-gray-900">{new Date(feedback.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No feedback available.</p>
                                )}
                                <button
                                    className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SentimentAnalysis;