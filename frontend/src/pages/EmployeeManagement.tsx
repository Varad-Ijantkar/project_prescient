import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Search, Upload, Download, Plus, Pencil, Trash2 } from 'lucide-react';
import { Label } from "../components/ui/label";
import Papa from 'papaparse';
import { toast } from "react-hot-toast";
import NavigationMenu from "../components/layouts/nav_menu";
import Footer from "../components/layouts/footer";
import Header from "../components/layouts/header";

interface Employee {
    employeeId: number;
    name: string;
    email: string;
    age: number;
    department: string;
    jobRole: string;
    businessTravel: string;
    dailyRate: number;
    distanceFromHome: number;
    education: number;
    educationField: string;
    environmentSatisfaction: number;
    gender: string;
    hourlyRate: number;
    jobInvolvement: number;
    jobLevel: number;
    jobSatisfaction: number;
    maritalStatus: string;
    monthlyIncome: number;
    monthlyRate: number;
    numCompaniesWorked: number;
    overTime: string;
    percentSalaryHike: number;
    performanceRating: number;
    relationshipSatisfaction: number;
    stockOptionLevel: number;
    totalWorkingYears: number;
    trainingTimesLastYear: number;
    workLifeBalance: number;
    yearsAtCompany: number;
    yearsInCurrentRole: number;
    yearsSinceLastPromotion: number;
    yearsWithCurrManager: number;
    attritionRisk: number;
    sentimentScore: number;

    [key: string]: string | number | undefined;
}

type FormData = Employee;

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: FormData) => void;
    initialData: FormData;
    isEditing: boolean;
}

const FIELD_OPTIONS = {
    businessTravel: ['Rarely', 'Frequently', 'No Travel'],
    education: [1, 2, 3, 4, 5],
    educationField: ['Human Resources', 'Life Sciences', 'Marketing', 'Medical', 'Technical Degree', 'Other'],
    gender: ['Male', 'Female', 'Other'],
    maritalStatus: ['Single', 'Married', 'Divorced'],
    overTime: ['Yes', 'No'],
    departments: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
    jobRoles: ['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative', 'Manager', 'Sales Representative', 'Research Director', 'Human Resources']
} as const;

const INITIAL_FORM_DATA: FormData = {
    employeeId: 0,
    name: '',
    email: '',
    age: 0,
    department: '',
    jobRole: '',
    businessTravel: 'Rarely',
    dailyRate: 0,
    distanceFromHome: 0,
    education: 1,
    educationField: '',
    environmentSatisfaction: 1,
    gender: '',
    hourlyRate: 0,
    jobInvolvement: 1,
    jobLevel: 1,
    jobSatisfaction: 1,
    maritalStatus: 'Single',
    monthlyIncome: 0,
    monthlyRate: 0,
    numCompaniesWorked: 0,
    overTime: 'No',
    percentSalaryHike: 0,
    performanceRating: 1,
    relationshipSatisfaction: 1,
    stockOptionLevel: 0,
    totalWorkingYears: 0,
    trainingTimesLastYear: 0,
    workLifeBalance: 1,
    yearsAtCompany: 0,
    yearsInCurrentRole: 0,
    yearsSinceLastPromotion: 0,
    yearsWithCurrManager: 0,
    attritionRisk: 0,
    sentimentScore: 0
};

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
    employeeName: string;
    onConfirm: (employeeId: number) => void;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
                                                                               open,
                                                                               onOpenChange,
                                                                               employeeId,
                                                                               employeeName,
                                                                               onConfirm
                                                                           }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p>Are you sure you want to delete employee "{employeeName}" (ID: {employeeId})?</p>
                    <p className="text-gray-500 mt-2">This action cannot be undone.</p>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={() => { onConfirm(employeeId); onOpenChange(false); }}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
                                                           open,
                                                           onOpenChange,
                                                           onSubmit,
                                                           initialData,
                                                           isEditing
                                                       }) => {
    const [formData, setFormData] = useState<FormData>(initialData);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData(initialData);
        setErrors({});
    }, [initialData, open]);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors; });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        const requiredFields: (keyof FormData)[] = [
            'employeeId', 'name', 'email', 'age', 'gender', 'distanceFromHome',
            'education', 'educationField', 'numCompaniesWorked', 'maritalStatus',
            'department', 'jobRole', 'jobLevel', 'businessTravel', 'overTime',
            'jobInvolvement', 'yearsInCurrentRole', 'yearsSinceLastPromotion',
            'yearsWithCurrManager', 'monthlyIncome', 'monthlyRate', 'dailyRate',
            'hourlyRate', 'stockOptionLevel', 'percentSalaryHike', 'yearsAtCompany',
            'totalWorkingYears', 'performanceRating', 'jobSatisfaction',
            'trainingTimesLastYear', 'environmentSatisfaction', 'relationshipSatisfaction',
            'workLifeBalance'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                newErrors[field] = 'This field is required';
            }
        });

        if (isNaN(Number(formData.employeeId)) || Number(formData.employeeId) <= 0) {
            newErrors.employeeId = 'Employee ID must be a positive number';
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.age < 18 || formData.age > 100) {
            newErrors.age = 'Age must be between 18 and 100';
        }

        const ratingFields: (keyof FormData)[] = [
            'environmentSatisfaction', 'jobInvolvement', 'jobSatisfaction',
            'performanceRating', 'relationshipSatisfaction', 'workLifeBalance'
        ];
        ratingFields.forEach(field => {
            const value = formData[field];
            const numericValue = Number(value); // Convert to number
            if (value !== undefined && !isNaN(numericValue) && (numericValue < 1 || numericValue > 5)) {
                newErrors[field] = 'Rating must be between 1 and 5';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields correctly");
            return;
        }

        setLoading(true);
        try {
            // Clone formData and remove _id if it exists (from MongoDB)
            const processedData = { ...formData };
            if ('_id' in processedData) {
                delete processedData['_id'];
            }

            const numericFields: (keyof FormData)[] = [
                'employeeId', 'age', 'dailyRate', 'distanceFromHome', 'education',
                'environmentSatisfaction', 'hourlyRate', 'jobInvolvement', 'jobLevel',
                'jobSatisfaction', 'monthlyIncome', 'monthlyRate', 'numCompaniesWorked',
                'percentSalaryHike', 'performanceRating', 'relationshipSatisfaction',
                'stockOptionLevel', 'totalWorkingYears', 'trainingTimesLastYear',
                'workLifeBalance', 'yearsAtCompany', 'yearsInCurrentRole',
                'yearsSinceLastPromotion', 'yearsWithCurrManager', 'attritionRisk',
                'sentimentScore'
            ];

            numericFields.forEach(field => {
                if (typeof processedData[field] === 'string') {
                    processedData[field] = Number(processedData[field]);
                }
            });

            console.log("Sending data to predict:", processedData);

            // Step 1: Send to Flask for prediction and save
            const predictResponse = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processedData),
            });

            const predictText = await predictResponse.text();
            let predictData: Employee;
            try {
                predictData = JSON.parse(predictText) as Employee;
            } catch (e) {
                console.error('Error parsing predict response:', predictText);
                throw new Error('Invalid response from predict server');
            }

            if (!predictResponse.ok) {
                throw new Error(String(predictData.message || 'Prediction failed'));
            }

            // Since Flask already saved it, we’re done—no need for Node.js save
            onSubmit(predictData); // Pass the saved data back
            onOpenChange(false);   // Close the dialog
        } catch (error) {
            console.error(isEditing ? 'Error updating employee:' : 'Error adding employee:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderField = (field: keyof FormData, label: string, type = "text", options?: readonly string[]) => {
        const hasError = !!errors[field];
        if (options) {
            return (
                <div className="space-y-1">
                    <Label htmlFor={String(field)} className="flex">{label} <span className="text-red-500 ml-1">*</span></Label>
                    <Select value={String(formData[field])} onValueChange={(value) => handleChange(field, value)}>
                        <SelectTrigger id={String(field)} className={hasError ? "border-red-500" : ""}>
                            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {hasError && <p className="text-red-500 text-sm">{errors[field]}</p>}
                </div>
            );
        }
        return (
            <div className="space-y-1">
                <Label htmlFor={String(field)} className="flex">{label} <span className="text-red-500 ml-1">*</span></Label>
                <Input
                    id={String(field)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    type={type}
                    value={formData[field] ?? ''}
                    onChange={(e) => handleChange(field, type === "number" ? Number(e.target.value) : e.target.value)}
                    className={hasError ? "border-red-500" : ""}
                />
                {hasError && <p className="text-red-500 text-sm">{errors[field]}</p>}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Basic Information</h3><div className="grid grid-cols-2 gap-4">{renderField('employeeId', 'Employee ID', 'number')}{renderField('name', 'Full Name')}{renderField('email', 'Email Address', 'email')}{renderField('age', 'Age', 'number')}{renderField('gender', 'Gender', 'text', FIELD_OPTIONS.gender)}{renderField('distanceFromHome', 'Distance From Home(km)', 'number')}</div></div>
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Education & Background</h3><div className="grid grid-cols-2 gap-4">{renderField('education', 'Education Level', 'text', FIELD_OPTIONS.education.map(String))}{renderField('educationField', 'Field of Education', 'text', FIELD_OPTIONS.educationField)}{renderField('numCompaniesWorked', 'Previous Companies', 'number')}{renderField('maritalStatus', 'Marital Status', 'text', FIELD_OPTIONS.maritalStatus)}</div></div>
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Job Information</h3><div className="grid grid-cols-2 gap-4">{renderField('department', 'Department', 'text', FIELD_OPTIONS.departments)}{renderField('jobRole', 'Job Role', 'text', FIELD_OPTIONS.jobRoles)}{renderField('jobLevel', 'Job Level', 'number')}{renderField('businessTravel', 'Business Travel', 'text', FIELD_OPTIONS.businessTravel)}{renderField('overTime', 'Overtime', 'text', FIELD_OPTIONS.overTime)}{renderField('jobInvolvement', 'Job Involvement', 'number')}{renderField('yearsInCurrentRole', 'Years in Current Role', 'number')}{renderField('yearsSinceLastPromotion', 'Years Since Last Promotion', 'number')}{renderField('yearsWithCurrManager', 'Years with Current Manager', 'number')}</div></div>
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Compensation</h3><div className="grid grid-cols-2 gap-4">{renderField('monthlyIncome', 'Monthly Income', 'number')}{renderField('monthlyRate', 'Monthly Rate', 'number')}{renderField('dailyRate', 'Daily Rate', 'number')}{renderField('hourlyRate', 'Hourly Rate', 'number')}{renderField('stockOptionLevel', 'Stock Option Level', 'number')}{renderField('percentSalaryHike', 'Salary Hike Percentage', 'number')}</div></div>
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Experience & Performance</h3><div className="grid grid-cols-2 gap-4">{renderField('yearsAtCompany', 'Years at Company', 'number')}{renderField('totalWorkingYears', 'Total Working Years', 'number')}{renderField('performanceRating', 'Performance Rating', 'number')}{renderField('jobSatisfaction', 'Job Satisfaction', 'number')}{renderField('trainingTimesLastYear', 'Training Times Last Year', 'number')}</div></div>
                    <div className="col-span-2"><h3 className="text-lg font-semibold mb-2">Work Environment & Satisfaction</h3><div className="grid grid-cols-2 gap-4">{renderField('environmentSatisfaction', 'Environment Satisfaction', 'number')}{renderField('relationshipSatisfaction', 'Relationship Satisfaction', 'number')}{renderField('workLifeBalance', 'Work Life Balance', 'number')}</div></div>
                    <div className="col-span-2">
                        <Button onClick={handleSubmit} disabled={loading} className="w-full">
                            {loading ? (isEditing ? "Updating Employee..." : "Adding Employee...") : (isEditing ? "Update Employee" : "Add Employee")}
                        </Button>
                        {Object.keys(errors).length > 0 && <p className="text-center mt-2 text-red-600">Please fill all required fields</p>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const EmployeeManagement: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFormData, setCurrentFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
    const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);
    const [loadingPredictions, setLoadingPredictions] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
    };

    const fetchEmployees = async () => {
        try {
            setLoadingPredictions(true);
            const response = await fetch('http://localhost:5001/api/employees', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(`Error fetching employees: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched employees:', data);
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            showAlert('Error fetching employees', 'error');
        } finally {
            setLoadingPredictions(false);
        }
    };

    useEffect(() => {
        let result = employees;
        if (searchTerm) {
            result = result.filter(employee =>
                (employee.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.email?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.employeeId?.toString().toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.department?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.jobRole?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.maritalStatus?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.attritionRisk?.toString().toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (employee.sentimentScore?.toString().toLowerCase() ?? "").includes(searchTerm.toLowerCase())
            );
        }
        if (departmentFilter !== 'all') {
            result = result.filter(employee => employee.department === departmentFilter);
        }
        if (riskFilter !== 'all') {
            result = result.filter(employee => {
                if (riskFilter === 'high') return employee.attritionRisk >= 70;
                if (riskFilter === 'medium') return employee.attritionRisk >= 30 && employee.attritionRisk < 70;
                return employee.attritionRisk < 30;
            });
        }
        setFilteredEmployees(result);
    }, [searchTerm, departmentFilter, riskFilter, employees]);

    const handleEmployeeSubmit = async (data: FormData) => {
        try {
            const successMessage = isEditing
                ? `Employee ${data.name} updated successfully!`
                : `Employee ${data.name} added successfully!`;
            showAlert(successMessage, 'success');
            toast.success(successMessage);
            await fetchEmployees(); // Refresh the list
            setIsDialogOpen(false); // Already closed, but just in case
        } catch (error) {
            console.error(isEditing ? 'Error updating employee:' : 'Error adding employee:', error);
            showAlert('An error occurred', 'error');
            toast.error('An error occurred');
        }
    };

    const handleDelete = async (employeeId: number): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                showAlert('Employee deleted successfully', 'success');
                await fetchEmployees();
            } else {
                const errorData = await response.json();
                showAlert(`Error: ${errorData.message}`, 'error');
            }
        } catch (error) {
            console.error('Delete request failed:', error);
            showAlert('Error deleting employee', 'error');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const employees = results.data.map((row: any) => ({
                    employeeId: Number(row.employeeId) || 0,
                    name: row.name || "Unknown",
                    email: row.email || "",
                    age: Number(row.age) || 0,
                    department: row.department || "Not Specified",
                    jobRole: row.jobRole || "Not Specified",
                    businessTravel: row.businessTravel || "Rarely",
                    dailyRate: Number(row.dailyRate) || 0,
                    distanceFromHome: Number(row.distanceFromHome) || 0,
                    education: Number(row.education) || 1,
                    educationField: row.educationField || "Other",
                    environmentSatisfaction: Number(row.environmentSatisfaction) || 1,
                    gender: row.gender || "Other",
                    hourlyRate: Number(row.hourlyRate) || 0,
                    jobInvolvement: Number(row.jobInvolvement) || 1,
                    jobLevel: Number(row.jobLevel) || 1,
                    jobSatisfaction: Number(row.jobSatisfaction) || 1,
                    maritalStatus: row.maritalStatus || "Single",
                    monthlyIncome: Number(row.monthlyIncome) || 0,
                    monthlyRate: Number(row.monthlyRate) || 0,
                    numCompaniesWorked: Number(row.numCompaniesWorked) || 0,
                    overTime: row.overTime || "No",
                    percentSalaryHike: Number(row.percentSalaryHike) || 0,
                    performanceRating: Number(row.performanceRating) || 1,
                    relationshipSatisfaction: Number(row.relationshipSatisfaction) || 1,
                    stockOptionLevel: Number(row.stockOptionLevel) || 0,
                    totalWorkingYears: Number(row.totalWorkingYears) || 0,
                    trainingTimesLastYear: Number(row.trainingTimesLastYear) || 0,
                    workLifeBalance: Number(row.workLifeBalance) || 1,
                    yearsAtCompany: Number(row.yearsAtCompany) || 0,
                    yearsInCurrentRole: Number(row.yearsInCurrentRole) || 0,
                    yearsSinceLastPromotion: Number(row.yearsSinceLastPromotion) || 0,
                    yearsWithCurrManager: Number(row.yearsWithCurrManager) || 0,
                    attritionRisk: Number(row.attritionRisk) || 0, // Will be overwritten by Flask
                    sentimentScore: Number(row.sentimentScore) || 0, // Will be overwritten by Flask
                }));

                try {
                    const response = await fetch("http://localhost:5001/predict/bulk", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ employees }),
                    });

                    if (response.ok) {
                        showAlert("Employees imported successfully with predictions", "success");
                        event.target.value = "";
                        await fetchEmployees();
                    } else {
                        const errorData = await response.json();
                        showAlert(`Error: ${errorData.message}`, "error");
                    }
                } catch (error) {
                    console.error("Import Error:", error);
                    showAlert("Error importing employees", "error");
                }
            },
        });
    };

    const handleExport = () => {
        const csv = Papa.unparse(filteredEmployees);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employees.csv';
        a.click();
    };

    const openDeleteDialog = (employee: Employee): void => {
        setEmployeeToDelete(employee);
        setIsDeleteDialogOpen(true);
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setCurrentFormData(INITIAL_FORM_DATA);
        setIsDialogOpen(true);
    };

    const handleEdit = (employee: Employee) => {
        setIsEditing(true);
        setCurrentFormData(employee);
        setIsDialogOpen(true);
    };

    return (
        <>
            <NavigationMenu isOpen={isNavMenuOpen} setIsOpen={setIsNavMenuOpen} />
            <Header />
            <main className={`flex-1 transition-all duration-300 ease-in-out ${isNavMenuOpen ? "ml-64" : "ml-0"}`}>
                <div className="p-6 max-w-[1400px] mx-auto">
                    <EmployeeDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                        onSubmit={handleEmployeeSubmit}
                        initialData={currentFormData}
                        isEditing={isEditing}
                    />

                    {employeeToDelete && (
                        <DeleteConfirmationDialog
                            open={isDeleteDialogOpen}
                            onOpenChange={setIsDeleteDialogOpen}
                            employeeId={employeeToDelete.employeeId}
                            employeeName={employeeToDelete.name}
                            onConfirm={handleDelete}
                        />
                    )}

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Employee Management</h1>
                        <div className="flex gap-2">
                            <Button onClick={handleAddNew}><Plus className="w-4 h-4 mr-2" />Add Employee</Button>
                            <Button onClick={() => document.getElementById("csvUpload")?.click()}><Upload className="w-4 h-4 mr-2" />Import CSV</Button>
                            <input id="csvUpload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                            <Button onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 inset-y-0 my-auto" />
                            <Input placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-48"><SelectValue placeholder="Department" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {FIELD_OPTIONS.departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-48"><SelectValue placeholder="Risk Level" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Risk Levels</SelectItem>
                                <SelectItem value="high">High Risk</SelectItem>
                                <SelectItem value="medium">Medium Risk</SelectItem>
                                <SelectItem value="low">Low Risk</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {alert.show && (
                        <Alert className={`mb-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="overflow-x-auto">
                        {loadingPredictions && <div className="text-center py-4"><p className="text-gray-500">Loading attrition risk predictions...</p></div>}
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                {['Employee ID', 'Name', 'Department', 'Job Role', 'Performance', 'Job Level', 'Years at Company', 'Risk Level', 'Satisfaction', 'Actions'].map(header => (
                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => {
                                const avgSatisfaction = (employee.jobSatisfaction + employee.environmentSatisfaction + employee.workLifeBalance) / 3;
                                const riskLevel = employee.attritionRisk > 75 ? 'High' : employee.attritionRisk >= 45 ? 'Medium' : 'Low';
                                const satisfactionLevel = avgSatisfaction >= 3.5 ? 'High' : avgSatisfaction >= 2.5 ? 'Medium' : 'Low';

                                const getRiskBadgeStyle = () => "px-2 py-1 rounded-full text-center " + (riskLevel === 'High' ? 'bg-red-100 text-red-800' : riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800');
                                const getPerformanceBadgeStyle = () => "px-2 py-1 rounded-full text-center " + (employee.performanceRating >= 4 ? 'bg-green-100 text-green-800' : employee.performanceRating >= 3 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800');
                                const getSatisfactionBadgeStyle = () => "px-2 py-1 rounded-full text-center " + (satisfactionLevel === 'High' ? 'bg-green-100 text-green-800' : satisfactionLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800');

                                return (
                                    <tr key={employee.employeeId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employeeId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.jobRole}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><div className={getPerformanceBadgeStyle()}>{employee.performanceRating}/5</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Level {employee.jobLevel}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.yearsAtCompany}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className={getRiskBadgeStyle()}>
                                                {employee.attritionRisk !== undefined
                                                    ? `${employee.attritionRisk.toFixed(2)}% (${riskLevel})`
                                                    : 'Loading...'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><div className={getSatisfactionBadgeStyle()}>{satisfactionLevel}</div></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}><Pencil className="w-4 h-4" /></Button>
                                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => openDeleteDialog(employee)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default EmployeeManagement;