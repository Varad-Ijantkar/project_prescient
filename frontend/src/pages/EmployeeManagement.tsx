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
import {Label} from "../components/ui/label";
import Papa from 'papaparse';
import { toast } from "react-hot-toast";
import NavigationMenu from "../components/layouts/nav_menu";
import Footer from "../components/layouts/footer";
import Header from "../components/layouts/header";

// Define a single interface for employee data
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

// Use the Employee interface for form data too
type FormData = Employee;

interface EmployeeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: FormData) => void;
    initialData: FormData;
    isEditing: boolean;
}

// Add these constants for select field options
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

// DeleteConfirmationDialog component with TypeScript
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
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm(employeeId);
                            onOpenChange(false);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Renamed from AddEmployeeDialog to EmployeeDialog to reflect dual purpose
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({
            show: true,
            message: message,
            type: type
        });

        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
            setAlert({ show: false, message: '', type: 'success' });
        }, 5000);
    };

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        setFormData(initialData);
        setErrors({});
    }, [initialData, open]);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when field is edited
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

// Enhanced validation function
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
            if (formData[field] === undefined || formData[field] === null || formData[field] === '') {
                newErrors[field] = 'This field is required';
            }
        });

        // Ensure employeeId is a valid number
        if (isNaN(Number(formData.employeeId)) || Number(formData.employeeId) <= 0) {
            newErrors.employeeId = 'Employee ID must be a positive number';
        }

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Ensure age is within reasonable bounds
        if (formData.age < 18 || formData.age > 100) {
            newErrors.age = 'Age must be between 18 and 100';
        }

        // Validate ratings are between 1-5
        const ratingFields = ['environmentSatisfaction', 'jobInvolvement', 'jobSatisfaction',
            'performanceRating', 'relationshipSatisfaction', 'workLifeBalance'];

        ratingFields.forEach(field => {
            const value = formData[field];
            if (value !== undefined && (value < 1 || value > 5)) {
                newErrors[field] = 'Rating must be between 1 and 5';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

// For the handleEmployeeSubmit function
    const handleEmployeeSubmit = async (data: FormData) => {
        try {
            // Make sure all numeric fields are properly processed
            const processedData = { ...data };

            // Use the explicitly typed fields for type safety
            const stringFields: (keyof Employee)[] = [
                'name', 'email', 'department', 'jobRole', 'gender',
                'maritalStatus', 'educationField', 'businessTravel', 'overTime'
            ];

            Object.keys(processedData).forEach(key => {
                // Check if this key is not in our string fields list
                if (!stringFields.includes(key as keyof Employee) &&
                    typeof processedData[key] === 'string' &&
                    !isNaN(Number(processedData[key]))) {
                    processedData[key] = Number(processedData[key]);
                }
            });

        } catch (error) {
            console.error(isEditing ? "Error updating employee:" : "Error adding employee:", error);
            showAlert("An error occurred", "error");
        } finally {
            setIsDialogOpen(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fill all required fields correctly");
            return;
        }

        setLoading(true);
        try {
            let url = "http://localhost:5000/api/employees";
            let method = "POST";

            // If editing, use PUT method and include employee ID in URL
            if (isEditing) {
                url = `http://localhost:5000/api/employees/${formData.employeeId}`;
                method = "PUT";
            }

            // Ensure all numeric fields are actually numbers, not strings
            const processedData = { ...formData };
            const numericFields = [
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

            // Log data being sent for debugging
            console.log("Sending data:", processedData);

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(processedData),
            });

            // Always parse the response, regardless of status code
            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error("Error parsing response:", responseText);
                responseData = { message: "Invalid response from server" };
            }

            if (response.ok) {
                toast.success(isEditing ? "Employee updated successfully!" : "Employee added successfully!");
                onSubmit(processedData); // Callback function
                onOpenChange(false); // Close dialog
            } else {
                // Show the error returned from the server
                console.error("API Error:", responseData);
                toast.error(responseData.message || (isEditing ? "Failed to update employee." : "Failed to add employee."));
            }
        } catch (error) {
            console.error(isEditing ? "Error updating employee:" : "Error adding employee:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render input field with error handling
    const renderField = (field: keyof FormData, label: string, type = "text", options?: string[]) => {
        const hasError = !!errors[field];

        // For select inputs
        if (options) {
            return (
                <div className="space-y-1">
                    <Label htmlFor={String(field)}
                           className="flex">
                        {label} <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                        value={String(formData[field])}
                        onValueChange={(value) => handleChange(field, value)}
                    >
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

        // For regular inputs
        return (
            <div className="space-y-1">
                <Label htmlFor={String(field)}
                       className="flex">
                    {label} <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                    id={String(field)}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    type={type}
                    value={formData[field]}
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
                    {/* Basic Information */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('employeeId', 'Employee ID', 'number')}
                            {renderField('name', 'Full Name')}
                            {renderField('email', 'Email Address', 'email')}
                            {renderField('age', 'Age', 'number')}
                            {renderField('gender', 'Gender', 'text', ['Male', 'Female', 'Other'])}
                            {renderField('distanceFromHome', 'Distance From Home(km)', 'number')}
                        </div>
                    </div>

                    {/* Education & Background */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Education & Background</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('education', 'Education Level', 'text', ['1', '2', '3', '4', '5'])}
                            {renderField('educationField', 'Field of Education', 'text', ['Human Resources', 'Life Sciences', 'Marketing', 'Medical', 'Technical Degree', 'Other'])}
                            {renderField('numCompaniesWorked', 'Previous Companies', 'number')}
                            {renderField('maritalStatus', 'Marital Status', 'text', ['Single', 'Married', 'Divorced'])}
                        </div>
                    </div>

                    {/* Job Information */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Job Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('department', 'Department', 'text', ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'])}
                            {renderField('jobRole', 'Job Role', 'text', ['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative', 'Manager', 'Sales Representative', 'Research Director', 'Human Resources'])}
                            {renderField('jobLevel', 'Job Level', 'number')}
                            {renderField('businessTravel', 'Business Travel', 'text', ['Rarely', 'Frequently', 'No Travel'])}
                            {renderField('overTime', 'Overtime', 'text', ['Yes', 'No'])}
                            {renderField('jobInvolvement', 'Job Involvement', 'number')}
                            {renderField('yearsInCurrentRole', 'Years in Current Role', 'number')}
                            {renderField('yearsSinceLastPromotion', 'Years Since Last Promotion', 'number')}
                            {renderField('yearsWithCurrManager', 'Years with Current Manager', 'number')}
                        </div>
                    </div>

                    {/* Compensation */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Compensation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('monthlyIncome', 'Monthly Income', 'number')}
                            {renderField('monthlyRate', 'Monthly Rate', 'number')}
                            {renderField('dailyRate', 'Daily Rate', 'number')}
                            {renderField('hourlyRate', 'Hourly Rate', 'number')}
                            {renderField('stockOptionLevel', 'Stock Option Level', 'number')}
                            {renderField('percentSalaryHike', 'Salary Hike Percentage', 'number')}
                        </div>
                    </div>

                    {/* Experience & Performance */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Experience & Performance</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('yearsAtCompany', 'Years at Company', 'number')}
                            {renderField('totalWorkingYears', 'Total Working Years', 'number')}
                            {renderField('performanceRating', 'Performance Rating', 'number')}
                            {renderField('jobSatisfaction', 'Job Satisfaction', 'number')}
                            {renderField('trainingTimesLastYear', 'Training Times Last Year', 'number')}
                        </div>
                    </div>

                    {/* Work Environment & Satisfaction */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold mb-2">Work Environment & Satisfaction</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {renderField('environmentSatisfaction', 'Environment Satisfaction', 'number')}
                            {renderField('relationshipSatisfaction', 'Relationship Satisfaction', 'number')}
                            {renderField('workLifeBalance', 'Work Life Balance', 'number')}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (isEditing ? "Updating Employee..." : "Adding Employee...") : (isEditing ? "Update Employee" : "Add Employee")}
                        </Button>
                        {Object.keys(errors).length > 0 && (
                            <p className="text-center mt-2 text-red-600">Please fill all required fields</p>
                        )}
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
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [currentFormData, setCurrentFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [alert, setAlert] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const [isNavMenuOpen, setIsNavMenuOpen] = useState<boolean>(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/employees');

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            showAlert('Error fetching employees', 'error');
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
            result = result.filter(employee =>
                employee.department === departmentFilter
            );
        }

        if (riskFilter !== 'all') {
            result = result.filter(employee => {
                if (riskFilter === 'high') return employee.attritionRisk >= 0.7;
                if (riskFilter === 'medium') return employee.attritionRisk >= 0.3 && employee.attritionRisk < 0.7;
                return employee.attritionRisk < 0.3;
            });
        }

        setFilteredEmployees(result);
    }, [searchTerm, departmentFilter, riskFilter, employees]);


    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log("File Selected:", file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                console.log("Parsed CSV Data:", results.data);

                if (!Array.isArray(results.data) || results.data.length === 0) {
                    showAlert("Invalid CSV file or empty data", "error");
                    return;
                }

                const employees = results.data.map((row: any) => ({
                    employeeId: row.employeeId?.toString() ?? "",
                    name: row.name ?? "Unknown",
                    email: row.email ?? "",
                    department: row.department ?? "Not Specified",
                    jobRole: row.jobRole ?? "Not Specified",
                    maritalStatus: row.maritalStatus ?? "Unknown",
                    attritionRisk: parseFloat(row.attritionRisk) || 0,
                    sentimentScore: parseFloat(row.sentimentScore) || 0,
                }));

                console.log("Final Employee Data to Send:", employees);

                try {
                    const response = await fetch("http://localhost:5000/api/employees/bulk", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ employees }),
                    });

                    if (response.ok) {
                        showAlert("Employees imported successfully", "success");
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

// Update the handleEmployeeSubmit function to use the correct API endpoint
    const handleEmployeeSubmit = async (data: FormData) => {
        try {
            // Make sure all numeric fields are properly processed
            const processedData = { ...data };
            Object.keys(processedData).forEach(key => {
                const field = key as keyof FormData;
                if (typeof processedData[field] === 'string' && !isNaN(Number(processedData[field])) &&
                    field !== 'name' && field !== 'email' && field !== 'department' &&
                    field !== 'jobRole' && field !== 'gender' && field !== 'maritalStatus' &&
                    field !== 'educationField' && field !== 'businessTravel' && field !== 'overTime') {
                    processedData[field] = Number(processedData[field]);
                }
            });

            const url = isEditing
                ? `http://localhost:5000/api/employees/${processedData.employeeId}`
                : "http://localhost:5000/api/employees";

            const method = isEditing ? "PUT" : "POST";

            console.log("Submitting data:", processedData);

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(processedData),
            });

            const responseText = await response.text();
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                console.error("Error parsing response:", responseText);
                responseData = { message: "Invalid response from server" };
            }

            if (response.ok) {
                // Show success message with employee name
                const successMessage = isEditing
                    ? `Employee ${processedData.name} updated successfully!`
                    : `Employee ${processedData.name} added successfully!`;

                showAlert(successMessage, "success");
                fetchEmployees(); // Refresh the list

                // Use your toast library properly - match its API
                toast.success(successMessage);
            } else {
                console.error("API Error:", responseData);
                const errorMessage = responseData.message ||
                    (isEditing ? "Failed to update employee" : "Failed to add employee");

                showAlert(errorMessage, "error");
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error(isEditing ? "Error updating employee:" : "Error adding employee:", error);
            showAlert("An error occurred", "error");
            toast.error("An error occurred");
        } finally {
            setIsDialogOpen(false);
        }
    };
// Make sure you have this showAlert function defined in your component:
    const showAlert = (message: string, type: 'success' | 'error') => {
        setAlert({
            show: true,
            message: message,
            type: type
        });
        // Auto-hide the alert after 5 seconds
        setTimeout(() => {
            setAlert({ show: false, message: '', type: 'success' });
        }, 5000);
    };

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    const handleDelete = async (employeeId: number): Promise<void> => {
        try {
            const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showAlert("Employee deleted successfully", "success");
                fetchEmployees();
            } else {
                const errorData = await response.json();
                showAlert(`Error: ${errorData.message}`, "error");
            }
        } catch (error) {
            console.error("Delete request failed:", error);
            showAlert("Error deleting employee", "error");
        }
    };

    const openDeleteDialog = (employee: Employee): void => {
        setEmployeeToDelete(employee);
        setIsDeleteDialogOpen(true);
    };

    // Open add employee dialog
    const handleAddNew = () => {
        setIsEditing(false);
        setCurrentFormData(INITIAL_FORM_DATA);
        setIsDialogOpen(true);
    };

    // Open edit employee dialog
    const handleEdit = (employee: Employee) => {
        setIsEditing(true);
        setSelectedEmployee(employee);
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

            {/* Header with actions */}
            <div className="flex justify-between items-center mb-6 ">
                <h1 className="text-2xl font-bold">Employee Management</h1>
                <div className="flex gap-2">
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />Add Employee
                    </Button>

                    <Button onClick={() => document.getElementById("csvUpload")?.click()}>
                        <Upload className="w-4 h-4 mr-2" />Import CSV
                    </Button>
                    <input
                        id="csvUpload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                    />

                    <Button onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 inset-y-0 my-auto" />
                    <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Department filter */}
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Risk filter */}
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Alert message */}
            {alert.show && (
                <Alert className={`mb-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
            )}

            {/* Employee Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {['Employee ID', 'Name', 'Department', 'Job Role', 'Performance',
                            'Job Level', 'Years at Company', 'Risk Level', 'Satisfaction', 'Actions'].map(header => (
                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee) => {
                        // Calculate derived values once
                        const avgSatisfaction = (employee.jobSatisfaction + employee.environmentSatisfaction + employee.workLifeBalance) / 3;
                        const riskLevel = employee.attritionRisk >= 0.7 ? 'High' :
                            employee.attritionRisk >= 0.3 ? 'Medium' : 'Low';
                        const satisfactionLevel = avgSatisfaction >= 3.5 ? 'High' :
                            avgSatisfaction >= 2.5 ? 'Medium' : 'Low';

                        // Status badge styles
                        const getRiskBadgeStyle = () => {
                            const baseStyle = "px-2 py-1 rounded-full text-center ";
                            return baseStyle + (riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                                riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800');
                        };

                        const getPerformanceBadgeStyle = () => {
                            const baseStyle = "px-2 py-1 rounded-full text-center ";
                            return baseStyle + (employee.performanceRating >= 4 ? 'bg-green-100 text-green-800' :
                                employee.performanceRating >= 3 ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800');
                        };

                        const getSatisfactionBadgeStyle = () => {
                            const baseStyle = "px-2 py-1 rounded-full text-center ";
                            return baseStyle + (satisfactionLevel === 'High' ? 'bg-green-100 text-green-800' :
                                satisfactionLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800');
                        };

                        return (
                            <tr key={employee.employeeId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.employeeId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.jobRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className={getPerformanceBadgeStyle()}>{employee.performanceRating}/5</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Level {employee.jobLevel}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.yearsAtCompany}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className={getRiskBadgeStyle()}>{riskLevel}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className={getSatisfactionBadgeStyle()}>{satisfactionLevel}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedEmployee(employee);
                                                setCurrentFormData(employee);
                                                setIsDialogOpen(true);
                                                setIsEditing(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => openDeleteDialog(employee)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
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