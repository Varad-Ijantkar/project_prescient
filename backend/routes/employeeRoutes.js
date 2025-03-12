const express = require("express");
const Employee = require("../models/Employee");
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

// Fetch a single employee by Employee ID
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: req.params.id });
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
        const { employeeId, name, email } = req.body;

        // Validate required fields
        if (!employeeId || !name || !email) {
            return res.status(400).json({ message: "Employee ID, Name, and Email are required" });
        }

        // Check if Employee ID or Email already exists
        const existingEmployee = await Employee.findOne({ $or: [{ employeeId }, { email }] });
        if (existingEmployee) {
            return res.status(400).json({
                message: existingEmployee.employeeId === employeeId ? "Employee ID already exists" : "Email already exists"
            });
        }

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
        const { email } = req.body;
        if (email) {
            const existingEmail = await Employee.findOne({ email, employeeId: { $ne: req.params.id } });
            if (existingEmail) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId: req.params.id },
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

module.exports = router;