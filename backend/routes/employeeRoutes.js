const express = require("express");
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data'); // Ensure this is installed
const Employee = require("../models/Employee");
const SentimentFeedback = require('../models/SentimentFeedback');
const authenticate = require('./authRoutes').authenticate;

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); // Fix: Use the memory storage

// Fetch all employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

router.get('/sentiment', authenticate, async (req, res) => {
    console.log('HOLY SHIT WE HIT THE SENTIMENT PROXY');
    try {
        const url = `http://localhost:5001/sentiment?type=${req.query.type || 'all'}`;
        console.log(`Proxying to: ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': req.headers.authorization
            }
        });
        console.log(`Flask response status: ${response.status}`);
        const data = await response.json();
        console.log('Proxy response:', data);
        if (!response.ok) {
            throw new Error(data.message || 'Python API error');
        }
        res.json(data);
    } catch (error) {
        console.error('Error proxying sentiment data:', error);
        res.status(500).json({ message: 'Error proxying sentiment data', error: error.message });
    }
});

router.post('/upload-feedback', authenticate, upload.single('feedbackFile'), async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({ message: 'No file provided' });
        }

        console.log('File received:', req.file.originalname, req.file.size, 'bytes');

        // Use form-data library
        const form = new FormData();
        form.append('feedbackFile', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        console.log('Proxying to Flask at http://localhost:5001/upload-feedback');
        const response = await fetch('http://localhost:5001/upload-feedback', {
            method: 'POST',
            headers: {
                'Authorization': req.headers.authorization,
                ...form.getHeaders(),
            },
            body: form,
        });

        const data = await response.json();
        console.log('Flask response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Flask error');
        }

        res.json(data);
    } catch (error) {
        console.error('Error proxying upload:', error);
        res.status(500).json({ message: 'Error proxying upload', error: error.message });
    }
});

// Other routes (unchanged)
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: Number(req.params.id) });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee", error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { employeeId, name, email } = req.body;
        if (!employeeId || !name || !email) {
            return res.status(400).json({ message: "Employee ID, Name, and Email are required" });
        }

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

router.put("/:id", async (req, res) => {
    try {
        const { email } = req.body;
        if (email) {
            const existingEmail = await Employee.findOne({ email, employeeId: { $ne: Number(req.params.id) } });
            if (existingEmail) return res.status(400).json({ message: "Email already exists" });
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId: Number(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) return res.status(404).json({ message: "Employee not found" });
        res.json(updatedEmployee);
    } catch (error) {
        res.status(500).json({ message: "Error updating employee", error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ employeeId: Number(req.params.id) });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error: error.message });
    }
});

router.get('/feedback/:employeeId', authenticate, async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        console.log(`Fetching feedback for employeeId: ${employeeId}`);
        const response = await fetch(`http://localhost:5001/feedback/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': req.headers.authorization }
        });
        const text = await response.text(); // Get raw text first
        console.log(`Flask response status: ${response.status}, body: ${text}`);

        let data;
        try {
            data = JSON.parse(text); // Attempt to parse as JSON
        } catch (e) {
            console.error('Failed to parse Flask response as JSON:', text);
            return res.status(response.status).send(text); // Send raw response if not JSON
        }

        if (!response.ok) {
            return res.status(response.status).json(data); // Pass Flask’s error (e.g., 404)
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
});

module.exports = router;