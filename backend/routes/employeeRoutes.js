const express = require("express");
const Employee = require("../models/Employee"); // Import Employee model
const router = express.Router();

// Fetch all employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Fetch a single employee by Employee ID (not ObjectId)
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.params.id }); // Search by employeeId
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee", error: error.message });
    }
});

// Add a new employee
router.post("/", async (req, res) => {
    try {
        const { employeeId, name } = req.body;

        // 🔴 Validate required fields before inserting
        if (!employeeId || !name) {
            return res.status(400).json({ message: "Employee ID and Name are required" });
        }

        // Check if Employee ID already exists
        const existingEmployee = await Employee.findOne({ employeeId });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee ID already exists" });
        }

        // ✅ Save new employee
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ message: "Error adding employee", error: error.message });
    }
});

// Update an employee by Employee ID
router.put("/:id", async (req, res) => {
    try {
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId: req.params.id }, // Search by employeeId
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: "Error updating employee", error: error.message });
    }
});

// Delete an employee by Employee ID
router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ employeeId: req.params.id });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error: error.message });
    }
});

router.post("/bulk", async (req, res) => {
    try {
        const employees = req.body.employees;
        if (!employees || employees.length === 0) {
            return res.status(400).json({ message: "No employees provided" });
        }

        // ✅ Save all employees in one operation
        await Employee.insertMany(employees);
        res.status(201).json({ message: "Employees imported successfully" });
    } catch (error) {
        console.error("❌ Error importing employees:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
