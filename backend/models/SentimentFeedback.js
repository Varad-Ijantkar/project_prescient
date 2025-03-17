// backend/models/SentimentFeedback.js
const mongoose = require('mongoose');

const sentimentFeedbackSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    sentimentScore: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    feedbackText: { type: String }, // New
    satisfactionScore: { type: Number }, // New
    additionalComments: { type: String } // New
});

sentimentFeedbackSchema.index({ employee: 1, date: -1 });

module.exports = mongoose.model('SentimentFeedback', sentimentFeedbackSchema);