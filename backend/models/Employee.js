const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    employeeId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Added email field
    age: { type: Number, required: true },
    department: { type: String, required: true },
    jobRole: { type: String, required: true },
    businessTravel: { type: String, required: true },
    dailyRate: { type: Number, required: true },
    distanceFromHome: { type: Number, required: true },
    education: { type: Number, required: true },
    educationField: { type: String, required: true },
    environmentSatisfaction: { type: Number, required: true },
    gender: { type: String, required: true },
    hourlyRate: { type: Number, required: true },
    jobInvolvement: { type: Number, required: true },
    jobLevel: { type: Number, required: true },
    jobSatisfaction: { type: Number, required: true },
    maritalStatus: { type: String, required: true },
    monthlyIncome: { type: Number, required: true },
    monthlyRate: { type: Number, required: true },
    numCompaniesWorked: { type: Number, required: true },
    overTime: { type: String, required: true },
    percentSalaryHike: { type: Number, required: true },
    performanceRating: { type: Number, required: true },
    relationshipSatisfaction: { type: Number, required: true },
    stockOptionLevel: { type: Number, required: true },
    totalWorkingYears: { type: Number, required: true },
    trainingTimesLastYear: { type: Number, required: true },
    workLifeBalance: { type: Number, required: true },
    yearsAtCompany: { type: Number, required: true },
    yearsInCurrentRole: { type: Number, required: true },
    yearsSinceLastPromotion: { type: Number, required: true },
    yearsWithCurrManager: { type: Number, required: true },
    // Model Predictions
    attritionRisk: { type: Number }, // Predicted Attrition Probability (0-100%)
    sentimentScore: { type: Number } // Sentiment Analysis Score (0-100%)
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;