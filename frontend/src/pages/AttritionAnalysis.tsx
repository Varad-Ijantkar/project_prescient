import React, { useState, useEffect, useMemo } from 'react';
import 'chart.js/auto';
import { Bar, Scatter } from 'react-chartjs-2';
import { ChartOptions, TooltipItem } from 'chart.js';
import { Search, Download, Filter, Users, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import Footer from "../components/layouts/footer";
import NavigationMenu from "../components/layouts/nav_menu";

// Define interfaces
interface Employee {
    employeeId: number;
    name: string;
    department: string;
    jobRole: string;
    attritionRisk: number;
    performanceRating: number;
    workLifeBalance: number;
    yearsAtCompany: number;
}

interface RiskLevel {
    level: string;
    color: string;
}

interface DepartmentData {
    name: string;
    atRiskCount: number;
    totalCount: number;
    riskPercentage: number;
}

interface JobRoleData {
    name: string;
    atRiskCount: number;
    totalCount: number;
    riskPercentage: number;
}

interface YearsVsRiskData {
    id: string;
    yearsAtCompany: number;
    riskScore: number;
    department: string;
}

interface ProcessedData {
    totalEmployees: number;
    atRiskCount: number;
    attritionRate: number;
    departmentData: DepartmentData[];
    jobRoleData: JobRoleData[];
    yearsVsRiskData: YearsVsRiskData[];
    employees: Employee[];
}

// Risk level classification
const getRiskLevel = (score: number): RiskLevel => {
    if (score > 75) return { level: 'High', color: '#ef4444' };
    if (score >= 45) return { level: 'Medium', color: '#f97316' };
    return { level: 'Low', color: '#22c55e' };
};

// Colors for charts
const colors = {
    primary: '#3b82f6',
    secondary: '#6366f1',
    danger: '#ef4444',
    warning: '#f97316',
    success: '#22c55e',
    info: '#06b6d4',
    light: '#f3f4f6',
    dark: '#1f2937',
    background: '#ffffff',
};

const AttritionAnalysis = () => {
    const [data, setData] = useState<ProcessedData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [selectedJobRole, setSelectedJobRole] = useState('All');
    const [riskRange, setRiskRange] = useState([0, 100]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);

    // Fetch and process employee data
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/employees');
                if (!response.ok) throw new Error('Failed to fetch employees');
                const employees: Employee[] = await response.json();
                console.log('Fetched employees:', employees);

                const totalEmployees = employees.length;
                const atRiskCount = employees.filter(e => e.attritionRisk >= 30).length; // Lowered to 30
                const attritionRate = Number(((atRiskCount / totalEmployees) * 100).toFixed(1));

                // Average risk per department
                const deptMap = new Map<string, { totalRisk: number; count: number }>();
                employees.forEach(emp => {
                    const dept = deptMap.get(emp.department) || { totalRisk: 0, count: 0 };
                    dept.totalRisk += emp.attritionRisk;
                    dept.count++;
                    deptMap.set(emp.department, dept);
                });
                const departmentData: DepartmentData[] = Array.from(deptMap.entries()).map(([name, stats]) => ({
                    name,
                    atRiskCount: employees.filter(e => e.department === name && e.attritionRisk >= 30).length,
                    totalCount: stats.count,
                    riskPercentage: Number((stats.totalRisk / stats.count).toFixed(1)), // Average risk
                }));
                console.log('Department Data:', departmentData);

                // Average risk per job role
                const roleMap = new Map<string, { totalRisk: number; count: number }>();
                employees.forEach(emp => {
                    const role = roleMap.get(emp.jobRole) || { totalRisk: 0, count: 0 };
                    role.totalRisk += emp.attritionRisk;
                    role.count++;
                    roleMap.set(emp.jobRole, role);
                });
                const jobRoleData: JobRoleData[] = Array.from(roleMap.entries()).map(([name, stats]) => ({
                    name,
                    atRiskCount: employees.filter(e => e.jobRole === name && e.attritionRisk >= 30).length,
                    totalCount: stats.count,
                    riskPercentage: Number((stats.totalRisk / stats.count).toFixed(1)), // Average risk
                }));
                console.log('Job Role Data:', jobRoleData);

                const yearsVsRiskData: YearsVsRiskData[] = employees.map(emp => ({
                    id: emp.employeeId.toString(),
                    yearsAtCompany: emp.yearsAtCompany,
                    riskScore: emp.attritionRisk,
                    department: emp.department,
                }));

                setData({
                    totalEmployees,
                    atRiskCount,
                    attritionRate,
                    departmentData,
                    jobRoleData,
                    yearsVsRiskData,
                    employees,
                });
                setFilteredEmployees(employees);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, []);

    // Apply filters
    useEffect(() => {
        if (!data) return;
        let filtered = data.employees;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.name.toLowerCase().includes(term) ||
                emp.employeeId.toString().includes(term)
            );
        }

        if (selectedDepartment !== 'All') {
            filtered = filtered.filter(emp => emp.department === selectedDepartment);
        }

        if (selectedJobRole !== 'All') {
            filtered = filtered.filter(emp => emp.jobRole === selectedJobRole);
        }

        filtered = filtered.filter(emp =>
            emp.attritionRisk >= riskRange[0] && emp.attritionRisk <= riskRange[1]
        );

        setFilteredEmployees(filtered);
    }, [searchTerm, selectedDepartment, selectedJobRole, riskRange, data]);

    // Department and job role options
    const departments = data ? ['All', ...new Set(data.departmentData.map(d => d.name))] : [];
    const jobRoles = data ? ['All', ...new Set(data.jobRoleData.map(r => r.name))] : [];

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Department', 'Job Role', 'Risk Score (%)', 'Performance Rating', 'Work-Life Balance'];
        const csvData = filteredEmployees.map(emp => [
            emp.employeeId,
            emp.name,
            emp.department,
            emp.jobRole,
            emp.attritionRisk,
            emp.performanceRating,
            emp.workLifeBalance,
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'high_risk_employees.csv');
        link.click();
    };

    // Chart Data and Options
    const departmentChartData = useMemo(() => {
        const chartData = {
            labels: data?.departmentData.map(d => d.name) || [],
            datasets: [
                {
                    label: 'Avg Risk (%)',
                    data: data?.departmentData.map(d => d.riskPercentage) || [],
                    backgroundColor: data?.departmentData.map(d => getRiskLevel(d.riskPercentage).color) || [],
                    borderWidth: 1,
                },
            ],
        };
        console.log('Department Chart Data:', chartData);
        return chartData;
    }, [data]);

    const departmentChartOptions: ChartOptions<'bar'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false, // Allow custom height
        scales: {
            y: {
                beginAtZero: true,
                max: 100, // Cap at 100% for clarity
                title: { display: true, text: 'Avg Risk (%)' },
            },
            x: { title: { display: true, text: 'Department' } },
        },
        plugins: { legend: { display: true }, tooltip: { callbacks: { label: (context) => `Avg Risk: ${context.parsed.y}%` } } },
    }), []);

    const jobRoleChartData = useMemo(() => {
        const chartData = {
            labels: data?.jobRoleData.map(d => d.name) || [],
            datasets: [
                {
                    label: 'Avg Risk (%)',
                    data: data?.jobRoleData.map(d => d.riskPercentage) || [],
                    backgroundColor: data?.jobRoleData.map(d => getRiskLevel(d.riskPercentage).color) || [],
                    borderWidth: 1,
                },
            ],
        };
        console.log('Job Role Chart Data:', chartData);
        return chartData;
    }, [data]);

    const jobRoleChartOptions: ChartOptions<'bar'> = useMemo(() => ({
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false, // Allow custom height
        scales: {
            x: {
                beginAtZero: true,
                max: 100, // Cap at 100%
                title: { display: true, text: 'Avg Risk (%)' },
            },
            y: { title: { display: true, text: 'Job Role' } },
        },
        plugins: { legend: { display: true }, tooltip: { callbacks: { label: (context) => `Avg Risk: ${context.parsed.x}%` } } },
    }), []);

    const scatterData = useMemo(() => ({
        datasets: [
            {
                label: 'Employees',
                data: data?.yearsVsRiskData.map(d => ({ x: d.yearsAtCompany, y: d.riskScore })) || [],
                backgroundColor: data?.yearsVsRiskData.map(d => getRiskLevel(d.riskScore).color) || [],
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
            },
        ],
    }), [data]);

    const scatterOptions: ChartOptions<'scatter'> = useMemo(() => ({
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                title: {
                    display: true,
                    text: 'Years at Company',
                },
                min: 0,
            },
            y: {
                title: {
                    display: true,
                    text: 'Risk Score (%)',
                },
                min: 0,
                max: 100,
            },
        },
        plugins: {
            legend: {
                display: true,
            },
            tooltip: {
                callbacks: {
                    label: function (context: TooltipItem<'scatter'>) {
                        const index = context.dataIndex;
                        const employeeId = data?.yearsVsRiskData[index]?.id || 'N/A';
                        const point = context.raw as { x: number; y: number };
                        return `Employee ID: ${employeeId}, Years: ${point.x}, Risk: ${point.y}%`;
                    },
                },
            },
        },
    }), [data]);

    if (!data) return <div>Loading...</div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <NavigationMenu isOpen={isNavMenuOpen} setIsOpen={setIsNavMenuOpen} />
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Brain className="h-8 w-8 text-blue-600" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            AttritionAI
                        </span>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Download size={18} className="mr-2" /> Export CSV
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 mr-4">
                                <Users size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Employees</p>
                                <h2 className="text-3xl font-bold text-gray-900">{data.totalEmployees}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-red-100 mr-4">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">At-Risk Employees</p>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {data.atRiskCount} <span className="text-sm text-gray-500 font-normal">({data.attritionRate}%)</span>
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 mr-4">
                                <TrendingUp size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Month-over-Month</p>
                                <h2 className="text-3xl font-bold text-gray-900">+0.2%</h2>
                                <p className="text-xs text-gray-500">from previous month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attrition Risk by Department</h3>
                        <div style={{ height: '300px' }}>
                            <Bar data={departmentChartData} options={departmentChartOptions} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution by Job Role</h3>
                        <div style={{ height: '300px' }}>
                            <Bar data={jobRoleChartData} options={jobRoleChartOptions} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Years at Company vs. Attrition Risk</h3>
                        <div style={{ height: '300px' }}>
                            <Scatter data={scatterData} options={scatterOptions} />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
                            <select
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={selectedJobRole}
                                onChange={(e) => setSelectedJobRole(e.target.value)}
                            >
                                {jobRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Risk Score</label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={riskRange[0]}
                                    onChange={(e) => setRiskRange([Number(e.target.value), riskRange[1]])}
                                >
                                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                                        <option key={value} value={value}>{value}%</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Risk Score</label>
                                <select
                                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    value={riskRange[1]}
                                    onChange={(e) => setRiskRange([riskRange[0], Number(e.target.value)])}
                                >
                                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => (
                                        <option key={value} value={value}>{value}%</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* High-Risk Employees Table */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">High-Risk Employees</h3>
                        <span className="text-sm text-gray-500">Showing {filteredEmployees.length} employees</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Job Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work-Life Balance</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {[...filteredEmployees]
                                .sort((a, b) => b.attritionRisk - a.attritionRisk)
                                .map((employee) => {
                                    const riskLevel = getRiskLevel(employee.attritionRisk);
                                    return (
                                        <tr key={employee.employeeId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 font-medium">{employee.name.split(' ').map(n => n[0]).join('')}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                                        <div className="text-sm text-gray-500">{employee.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{employee.department}</div>
                                                <div className="text-sm text-gray-500">{employee.jobRole}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span
                                                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                        style={{ backgroundColor: `${riskLevel.color}20`, color: riskLevel.color }}
                                                    >
                                                        {riskLevel.level}
                                                    </span>
                                                    <div className="ml-2 w-full max-w-24 bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className="h-2.5 rounded-full"
                                                            style={{ width: `${employee.attritionRisk}%`, backgroundColor: riskLevel.color }}
                                                        ></div>
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-600">{employee.attritionRisk}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-2 w-2 rounded-full mr-2"
                                                        style={{
                                                            backgroundColor: employee.performanceRating >= 4 ? colors.success :
                                                                employee.performanceRating >= 3 ? colors.warning : colors.danger
                                                        }}
                                                    ></div>
                                                    <span className="text-sm text-gray-600">{employee.performanceRating}/5</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-2 w-2 rounded-full mr-2"
                                                        style={{
                                                            backgroundColor: employee.workLifeBalance >= 4 ? colors.success :
                                                                employee.workLifeBalance >= 3 ? colors.warning : colors.danger
                                                        }}
                                                    ></div>
                                                    <span className="text-sm text-gray-600">{employee.workLifeBalance}/5</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-6">
                            <p className="text-gray-500">No employees match your current filters.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AttritionAnalysis;