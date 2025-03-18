const express = require("express");
const router = express.Router();
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const Employee = require("../models/Employee");
const SentimentFeedback = require('../models/SentimentFeedback');
const authenticate = require('./authRoutes').authenticate;
const fs = require('fs'); // Added for file cleanup

// Use memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Sync sentiment scores manually
router.post('/sync-sentiment-scores', authenticate, async (req, res) => {
    try {
        const employees = await Employee.find().select('_id employeeId');
        for (const emp of employees) {
            const latestFeedback = await SentimentFeedback.findOne({ employee: emp._id })
                .sort({ date: -1 })
                .select('sentimentScore');
            const newSentimentScore = latestFeedback ? latestFeedback.sentimentScore : 0;
            await Employee.findByIdAndUpdate(emp._id, { sentimentScore: newSentimentScore });
        }
        res.json({ message: 'Sentiment scores synced successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error syncing sentiment scores', error: error.message });
    }
});

// Fetch all employees
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// Fetch sentiment data (proxy to Flask)
router.get('/sentiment', authenticate, async (req, res) => {
    console.log('HOLY SHIT WE HIT THE SENTIMENT PROXY');
    try {
        const url = `http://localhost:5001/sentiment?type=${req.query.type || 'all'}`;
        console.log(`Proxying to: ${url}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': req.headers.authorization }
        });
        console.log(`Flask response status: ${response.status}`);
        const data = await response.json();
        console.log('Proxy response:', data);
        if (!response.ok) throw new Error(data.message || 'Python API error');
        res.json(data);
    } catch (error) {
        console.error('Error proxying sentiment data:', error);
        res.status(500).json({ message: 'Error proxying sentiment data', error: error.message });
    }
});

// Fetch total employees
router.get('/total', authenticate, async (req, res) => {
    try {
        const total = await Employee.countDocuments();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: "Error fetching total employees", error: error.message });
    }
});

// Fetch high-risk employees
// Fetch all employees (not just high-risk)
router.get('/high-risk', async (req, res) => {
    try {
        const employees = await Employee.find().lean();
        const formatted = employees.map(emp => ({
            id: emp.employeeId,
            name: emp.name,
            department: emp.department,
            risk: emp.attritionRisk >= 50 ? 'High' : emp.attritionRisk >= 45 ? 'Medium' : 'Low',
            sentimentScore: emp.sentimentScore,
            attritionRisk: emp.attritionRisk
        }));
        res.json({ data: formatted });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});
// Fetch department risk distribution
router.get('/risk-distribution', authenticate, async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const distribution = await Employee.aggregate([
            {
                $group: {
                    _id: '$department',
                    lowRiskCount: { $sum: { $cond: [{ $lt: ['$attritionRisk', 45] }, 1, 0] } },
                    mediumRiskCount: { $sum: { $cond: [{ $and: [{ $gte: ['$attritionRisk', 45] }, { $lt: ['$attritionRisk', 50] }] }, 1, 0] } },
                    highRiskCount: { $sum: { $cond: [{ $gte: ['$attritionRisk', 50] }, 1, 0] } }
                }
            },
            {
                $project: {
                    department: '$_id',
                    lowRiskPercentage: { $multiply: [{ $divide: ['$lowRiskCount', totalEmployees] }, 100] },
                    mediumRiskPercentage: { $multiply: [{ $divide: ['$mediumRiskCount', totalEmployees] }, 100] },
                    highRiskPercentage: { $multiply: [{ $divide: ['$highRiskCount', totalEmployees] }, 100] },
                    _id: 0
                }
            }
        ]);
        res.json({ data: distribution });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching risk distribution', error: error.message });
    }
});

// Fetch average sentiment score and trend
router.get('/sentiment-score', async (req, res) => {
    try {
        const employees = await Employee.find({ sentimentScore: { $exists: true } });
        const avgScore = employees.reduce((sum, emp) => sum + emp.sentimentScore, 0) / employees.length || 0;
        res.json({ averageScore: avgScore, trend: 0 }); // Add trend logic if needed
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
});

// Fetch average attrition risk and trend
router.get('/attrition-risk', authenticate, async (req, res) => {
    try {
        const employees = await Employee.find().select('attritionRisk');
        const totalRisk = employees.reduce((sum, emp) => sum + (emp.attritionRisk || 0), 0);
        const count = employees.length;
        const averageRisk = count > 0 ? totalRisk / count : 0;
        const riskLevel = averageRisk >= 70 ? 'High' : averageRisk >= 40 ? 'Medium' : 'Low';
        const trend = 'No change'; // Placeholder
        res.json({ riskLevel, trend });
    } catch (error) {
        res.status(500).json({ message: "Error fetching attrition risk", error: error.message });
    }
});

// Updated /upload-feedback route
router.post('/upload-feedback', authenticate, upload.single('feedbackFile'), async (req, res) => {
    try {
        if (!req.file) {
            console.log('No file received in request');
            return res.status(400).json({ message: 'No file provided' });
        }

        console.log('File received:', req.file.originalname, req.file.size, 'bytes');

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

        // No need to sync here; Flask handles it
        if (data && Array.isArray(data.feedbacks)) {
            res.json({
                message: 'CSV uploaded and processed successfully',
                data: {
                    processedFeedbacks: data.feedbacks.length
                }
            });
        } else {
            console.warn('No feedbacks array in Flask response:', data);
            res.status(400).json({ message: 'Invalid response from Flask: No feedback data found' });
        }
    } catch (error) {
        console.error('Error proxying upload:', error);
        res.status(500).json({
            message: 'Error proxying upload',
            error: error.message,
        });
    }
});

// Fetch single employee
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOne({ employeeId: Number(req.params.id) });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Error fetching employee", error: error.message });
    }
});

// Create new employee
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

// Update employee
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

// Delete employee
router.delete("/:id", async (req, res) => {
    try {
        const employee = await Employee.findOneAndDelete({ employeeId: Number(req.params.id) });
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting employee", error: error.message });
    }
});

// Fetch feedback for an employee
router.get('/feedback/:employeeId', authenticate, async (req, res) => {
    try {
        const employeeId = Number(req.params.employeeId);
        console.log(`Fetching feedback for employeeId: ${employeeId}`);
        const response = await fetch(`http://localhost:5001/feedback/${employeeId}`, {
            method: 'GET',
            headers: { 'Authorization': req.headers.authorization }
        });
        const text = await response.text();
        console.log(`Flask response status: ${response.status}, body: ${text}`);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse Flask response as JSON:', text);
            return res.status(response.status).send(text);
        }

        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Error fetching feedback', error: error.message });
    }
});

module.exports = router;