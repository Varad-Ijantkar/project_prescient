const mongoose = require('mongoose');
const Employee = require('./Employee');

const sentimentFeedbackSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    sentimentScore: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    feedbackText: { type: String },
    satisfactionScore: { type: Number },
    additionalComments: { type: String }
});

sentimentFeedbackSchema.index({ employee: 1, date: -1 });

module.exports = mongoose.model('SentimentFeedback', sentimentFeedbackSchema);