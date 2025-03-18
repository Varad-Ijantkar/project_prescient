import React, { useState, useEffect, useMemo } from 'react';
import { Users, AlertTriangle, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart, Pie, Cell, Legend as PieLegend, Tooltip as RechartsTooltip } from 'recharts';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import NavigationMenu from '../components/layouts/nav_menu';
import { useAuth } from '../context/AuthContext';
import { fetchProtectedData } from '../services/apiService';

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
    sentimentScore: number;
    attritionRisk?: number;
}

interface DepartmentRisk {
    department: string;
    lowRiskPercentage: number;
    mediumRiskPercentage: number;
    highRiskPercentage: number;
}

interface SentimentScore {
    averageScore: number;
    trend: number;
}

interface AttritionRisk {
    riskLevel: string;
    trend: string;
}

interface TrendItem {
    month: string;
    score: number;
}

interface DepartmentAvgRisk {
    name: string;
    value: number;
}

interface RiskDistributionData {
    department: string;
    low: number;
    medium: number;
    high: number;
}

interface DashboardProps {
    className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
    const [highRiskEmployees, setHighRiskEmployees] = useState<Employee[]>([]);
    const [totalEmployees, setTotalEmployees] = useState<number>(0);
    const [departmentRiskData, setDepartmentRiskData] = useState<DepartmentRisk[]>([]);
    const [sentimentScore, setSentimentScore] = useState<SentimentScore>({ averageScore: 0, trend: 0 });
    const [attritionRisk, setAttritionRisk] = useState<AttritionRisk>({ riskLevel: 'Low', trend: 'No change' });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

    // Filter states
    const [departmentFilter, setDepartmentFilter] = useState<string>('All');
    const [riskLevelFilter, setRiskLevelFilter] = useState<string>('All');
    const [sentimentTagFilter, setSentimentTagFilter] = useState<string>('All');
    const [nameFilter, setNameFilter] = useState<string>('');

    const { token } = useAuth();

    // Convert -1 to 1 scale to 0 to 10 scale (used for Sentiment Score card)
    const convertSentimentToTenScale = (score: number): number => {
        const converted = ((score + 1) / 2) * 10; // Maps -1 -> 0, 0 -> 5, 1 -> 10
        return converted;
    };

    // Map raw sentiment score to a tag
    const getSentimentTag = (score: number): string => {
        if (score <= -0.6) return 'Negative';
        if (score <= -0.2) return 'Slightly Negative';
        if (score <= 0.2) return 'Neutral';
        if (score <= 0.6) return 'Slightly Positive';
        return 'Positive';
    };

    // Get unique departments for the filter dropdown
    const departments = useMemo(() => {
        const uniqueDepartments = new Set<string>(allEmployees.map(emp => emp.department).filter(Boolean));
        return ['All', ...Array.from(uniqueDepartments)];
    }, [allEmployees]);

    // Get risk levels and sentiment tags for filter dropdowns
    const riskLevels = ['All', 'High', 'Medium', 'Low'];
    const sentimentTags = ['All', 'Negative', 'Slightly Negative', 'Neutral', 'Slightly Positive', 'Positive'];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch sentiment data
                const sentimentResponse = await fetchProtectedData('/api/employees/sentiment?type=all');
                console.log('Sentiment Response:', sentimentResponse);
                const trendData = sentimentResponse.trendData || [];
                const normalizedTrendData = trendData.length === 0
                    ? [
                        { month: 'Jan 2025', score: 4 },
                        { month: 'Feb 2025', score: 6 },
                        { month: 'Mar 2025', score: 8 },
                    ]
                    : trendData.map((item: TrendItem) => ({
                        month: item.month || `Month ${trendData.indexOf(item) + 1}`,
                        score: item.score > 10 ? item.score / 10 : item.score * 10,
                    }));
                setSentimentData(normalizedTrendData);

                // Fetch high-risk employees
                const highRiskResponse = await fetchProtectedData('/api/employees/high-risk');
                console.log('High Risk Response:', highRiskResponse);
                const highRiskData: Employee[] = highRiskResponse.data || [];
                console.log('High Risk Employees Count:', highRiskData.length);
                console.log('High Risk Employees Details:', highRiskData);
                highRiskData.forEach(emp => console.log(`High Risk Employee: ${emp.name}, Attrition Risk: ${emp.attritionRisk}, Sentiment Score: ${emp.sentimentScore}, Tag: ${getSentimentTag(emp.sentimentScore)}`));
                setHighRiskEmployees(highRiskData);

                // Fetch total employees
                const totalResponse = await fetchProtectedData('/api/employees/total');
                console.log('Total Response:', totalResponse);
                console.log('Total Employees Count:', totalResponse.total);
                setTotalEmployees(totalResponse.total || 0);

                // Fetch department risk distribution
                const riskDistResponse = await fetchProtectedData('/api/employees/risk-distribution');
                console.log('Risk Distribution Response:', riskDistResponse);
                setDepartmentRiskData(riskDistResponse.data || []);

                // Fetch average sentiment score and trend
                const sentimentScoreResponse = await fetchProtectedData('/api/employees/sentiment-score');
                console.log('Sentiment Score Response:', sentimentScoreResponse);
                setSentimentScore({
                    averageScore: sentimentScoreResponse.averageScore || 0,
                    trend: sentimentScoreResponse.trend || 0,
                });

                // Fetch average attrition risk and trend
                const attritionRiskResponse = await fetchProtectedData('/api/employees/attrition-risk');
                console.log('Attrition Risk Response:', attritionRiskResponse);
                setAttritionRisk({
                    riskLevel: attritionRiskResponse.riskLevel || 'Low',
                    trend: attritionRiskResponse.trend || 'No change',
                });

                // Fetch all employees
                const allEmployeesResponse = await fetchProtectedData('/api/employees');
                console.log('All Employees Response:', allEmployeesResponse);
                console.log('All Employees Count:', allEmployeesResponse.length);
                setAllEmployees(allEmployeesResponse || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    // Calculate normalized department risk for pie chart
    const departmentRiskDistribution: DepartmentAvgRisk[] = useMemo(() => {
        const distribution: DepartmentAvgRisk[] = [];
        const departmentMap: { [key: string]: { totalRisk: number; count: number } } = {};

        allEmployees.forEach((employee) => {
            if (employee.department && typeof employee.attritionRisk === 'number') {
                if (!departmentMap[employee.department]) {
                    departmentMap[employee.department] = { totalRisk: 0, count: 0 };
                }
                departmentMap[employee.department].totalRisk += employee.attritionRisk;
                departmentMap[employee.department].count += 1;
            }
        });

        const totalCompanyRisk = Object.values(departmentMap).reduce((sum, dept) => sum + (dept.totalRisk / dept.count), 0);

        Object.keys(departmentMap).forEach((dept) => {
            const avgRisk = departmentMap[dept].totalRisk / departmentMap[dept].count;
            const normalizedRisk = totalCompanyRisk > 0 ? (avgRisk / totalCompanyRisk) * 100 : 0;
            distribution.push({ name: dept, value: normalizedRisk });
        });

        return distribution;
    }, [allEmployees]);

    // Calculate risk distribution for bar chart
    const riskDistribution: RiskDistributionData[] = useMemo(() => {
        const distribution: RiskDistributionData[] = [];
        const riskMap: { [key: string]: { low: number; medium: number; high: number } } = {};

        allEmployees.forEach((employee) => {
            if (employee.department && typeof employee.attritionRisk === 'number') {
                if (!riskMap[employee.department]) {
                    riskMap[employee.department] = { low: 0, medium: 0, high: 0 };
                }
                if (employee.attritionRisk >= 50) {
                    riskMap[employee.department].high += 1;
                } else if (employee.attritionRisk >= 45) {
                    riskMap[employee.department].medium += 1;
                } else {
                    riskMap[employee.department].low += 1;
                }
            }
        });

        Object.keys(riskMap).forEach((dept) => {
            distribution.push({
                department: dept,
                low: riskMap[dept].low,
                medium: riskMap[dept].medium,
                high: riskMap[dept].high,
            });
        });

        return distribution;
    }, [allEmployees]);

    // Filter risk distribution data for the bar chart based on department
    const filteredRiskDistribution = useMemo(() => {
        if (departmentFilter === 'All') return riskDistribution;
        return riskDistribution.filter(data => data.department === departmentFilter);
    }, [riskDistribution, departmentFilter]);

    // Filter department risk distribution for the pie chart
    const filteredDepartmentRiskDistribution = useMemo(() => {
        if (departmentFilter === 'All') return departmentRiskDistribution;
        return departmentRiskDistribution.filter(data => data.name === departmentFilter);
    }, [departmentRiskDistribution, departmentFilter]);

    // Filter employees based on selected filters, using allEmployees instead of highRiskEmployees
    const filteredEmployees = useMemo(() => {
        return allEmployees.filter(employee => {
            // Department filter
            const matchesDepartment = departmentFilter === 'All' || employee.department === departmentFilter;

            // Risk level filter
            const employeeRiskLevel =
                employee.attritionRisk && employee.attritionRisk >= 50
                    ? 'High'
                    : employee.attritionRisk && employee.attritionRisk >= 45
                        ? 'Medium'
                        : 'Low';
            const matchesRiskLevel = riskLevelFilter === 'All' || employeeRiskLevel === riskLevelFilter;

            // Sentiment tag filter
            const employeeSentimentTag = getSentimentTag(employee.sentimentScore);
            const matchesSentimentTag = sentimentTagFilter === 'All' || employeeSentimentTag === sentimentTagFilter;

            // Name filter (case-insensitive)
            const matchesName = employee.name.toLowerCase().includes(nameFilter.toLowerCase());

            return matchesDepartment && matchesRiskLevel && matchesSentimentTag && matchesName;
        });
    }, [allEmployees, departmentFilter, riskLevelFilter, sentimentTagFilter, nameFilter]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    }

    // Calculate the actual number of high-risk employees (attritionRisk >= 50)
    const actualHighRiskCount = highRiskEmployees.filter(emp => emp.attritionRisk && emp.attritionRisk >= 50).length;
    const highRiskPercentage = totalEmployees > 0 ? ((actualHighRiskCount / totalEmployees) * 100).toFixed(1) : '0';

    // Colors
    const VIBRANT_COLORS = [
        '#FF2D55', // Vivid Red (Engineering)
        '#00D4B9', // Vivid Cyan (Marketing)
        '#FF9500', // Vivid Orange (HR)
        '#5856D6', // Vivid Purple (fallback)
        '#FF2ABF', // Vivid Pink (fallback)
        '#00C7FF', // Vivid Sky Blue (fallback)
    ];

    const RISK_COLORS = {
        low: '#00E676',
        medium: '#FFEA00',
        high: '#FF1744',
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            <NavigationMenu isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className={`flex flex-col flex-grow transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'ml-0'}`}>
                <Header />
                <main className="flex-grow p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Employees</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{totalEmployees.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 mt-3">No trend data</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">High Risk %</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{highRiskPercentage}%</p>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-red-600 mt-3">{actualHighRiskCount} High Risk Employees</p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Sentiment Score</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">
                                            {convertSentimentToTenScale(sentimentScore.averageScore).toFixed(1)}/10
                                        </p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-green-600 mt-3">
                                    {sentimentScore.trend >= 0 ? '↑' : '↓'} {Math.abs(sentimentScore.trend)} from last month
                                </p>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Attrition Risk</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{attritionRisk.riskLevel}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <BarChartIcon className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                                <p className="text-sm text-yellow-600 mt-3">{attritionRisk.trend} from last month</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution by Department</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={filteredRiskDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                            <XAxis
                                                dataKey="department"
                                                tick={{ fontSize: 12, fill: '#666' }}
                                                axisLine={{ stroke: '#ccc' }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#666' }}
                                                axisLine={{ stroke: '#ccc' }}
                                                tickLine={false}
                                                label={{
                                                    value: 'Number of Employees',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    offset: -15,
                                                    fill: '#666',
                                                    fontSize: 12,
                                                }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: 8,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                }}
                                                itemStyle={{ color: '#333' }}
                                                formatter={(value: number, name: string) => [`${value} Employees`, name.charAt(0).toUpperCase() + name.slice(1)]}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{ paddingTop: '10px', fontSize: 12 }}
                                            />
                                            <Bar dataKey="low" stackId="a" fill={RISK_COLORS.low} name="Low Risk" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="medium" stackId="a" fill={RISK_COLORS.medium} name="Medium Risk" />
                                            <Bar dataKey="high" stackId="a" fill={RISK_COLORS.high} name="High Risk" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Contribution to Company Attrition Risk</h2>
                                <div className="h-64 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={filteredDepartmentRiskDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                dataKey="value"
                                                paddingAngle={5}
                                                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                                                labelLine={{ stroke: '#666', strokeWidth: 1 }}
                                                animationDuration={1000}
                                                animationBegin={0}
                                                animationEasing="ease-in-out"
                                            >
                                                {filteredDepartmentRiskDistribution.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]}
                                                        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.2))' }}
                                                    />
                                                ))}
                                            </Pie>
                                            <PieLegend
                                                layout="horizontal"
                                                align="center"
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                wrapperStyle={{ paddingTop: '10px', fontSize: 12 }}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: 8,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    padding: '8px 12px',
                                                }}
                                                formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-[38%] left-[42%] transform -translate-x-1/2 -translate-y-1/2 text-center animate-fadeIn">
                                        <p className="text-sm font-semibold text-gray-700 leading-tight">Company Risk</p>
                                        <p className="text-xs text-gray-500 leading-tight">by Department</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800">Employees</h2>
                            </div>
                            {/* Filters Section */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Department Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                        <select
                                            value={departmentFilter}
                                            onChange={(e) => setDepartmentFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {departments.map((dept) => (
                                                <option key={dept} value={dept}>
                                                    {dept}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Risk Level Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                                        <select
                                            value={riskLevelFilter}
                                            onChange={(e) => setRiskLevelFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {riskLevels.map((level) => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sentiment Tag Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment Tag</label>
                                        <select
                                            value={sentimentTagFilter}
                                            onChange={(e) => setSentimentTagFilter(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {sentimentTags.map((tag) => (
                                                <option key={tag} value={tag}>
                                                    {tag}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Name Search Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
                                        <input
                                            type="text"
                                            value={nameFilter}
                                            onChange={(e) => setNameFilter(e.target.value)}
                                            placeholder="Enter employee name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{employee.department}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            employee.attritionRisk && employee.attritionRisk >= 50
                                                                ? 'bg-red-100 text-red-800'
                                                                : employee.attritionRisk && employee.attritionRisk >= 45
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {employee.attritionRisk && employee.attritionRisk >= 50
                                                            ? 'High'
                                                            : employee.attritionRisk && employee.attritionRisk >= 45
                                                                ? 'Medium'
                                                                : 'Low'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            employee.sentimentScore <= -0.6
                                                                ? 'bg-red-100 text-red-800'
                                                                : employee.sentimentScore <= -0.2
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : employee.sentimentScore <= 0.2
                                                                        ? 'bg-gray-100 text-gray-800'
                                                                        : employee.sentimentScore <= 0.6
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-green-100 text-green-800'
                                                        }`}
                                                    >
                                                        {getSentimentTag(employee.sentimentScore)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No employees match the selected filters.
                                            </td>
                                        </tr>
                                    )}
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