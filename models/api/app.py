from flask import Flask, request, jsonify, make_response
import joblib
import pandas as pd
import numpy as np
import os
import logging
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
)
import torch
import io
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# MongoDB connection
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["prescient"]
    employees_collection = db["employees"]
    sentiment_collection = db["sentimentfeedbacks"]  # New collection for feedback
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    raise

# Paths to model and encoders
MODEL_PATH = "../rf_attrition_model.pkl"
ENCODERS_PATH = "../Encoders/"
BERT_MODEL_PATH = "../bert_model/"

# Load the trained Random Forest model
try:
    model = joblib.load(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

# Load label encoders
try:
    encoders = {}
    for col in [
        "JobRole",
        "Department",
        "BusinessTravel",
        "Gender",
        "OverTime",
        "MaritalStatus",
        "EducationField",
    ]:
        encoders[col] = joblib.load(
            os.path.join(ENCODERS_PATH, f"label_encoder_{col.lower()}.pkl")
        )
    logger.info("Encoders loaded successfully")
except Exception as e:
    logger.error(f"Error loading encoders: {e}")
    raise

# Load BERT model and tokenizer
try:
    tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL_PATH)
    bert_model = AutoModelForSequenceClassification.from_pretrained(BERT_MODEL_PATH)
    logger.info("BERT model and tokenizer loaded successfully")
except Exception as e:
    logger.error(f"Error loading BERT model: {e}")
    raise

FEATURE_COLUMNS = [
    "Age",
    "BusinessTravel",
    "DailyRate",
    "Department",
    "DistanceFromHome",
    "Education",
    "EducationField",
    "EnvironmentSatisfaction",
    "Gender",
    "HourlyRate",
    "JobInvolvement",
    "JobLevel",
    "JobRole",
    "JobSatisfaction",
    "MaritalStatus",
    "MonthlyIncome",
    "MonthlyRate",
    "NumCompaniesWorked",
    "OverTime",
    "PercentSalaryHike",
    "PerformanceRating",
    "RelationshipSatisfaction",
    "StockOptionLevel",
    "TotalWorkingYears",
    "TrainingTimesLastYear",
    "WorkLifeBalance",
    "YearsAtCompany",
    "YearsInCurrentRole",
    "YearsSinceLastPromotion",
    "YearsWithCurrManager",
]


def preprocess_data(df):
    df = df.copy()
    rename_map = {
        "age": "Age",
        "businessTravel": "BusinessTravel",
        "dailyRate": "DailyRate",
        "department": "Department",
        "distanceFromHome": "DistanceFromHome",
        "education": "Education",
        "educationField": "EducationField",
        "environmentSatisfaction": "EnvironmentSatisfaction",
        "gender": "Gender",
        "hourlyRate": "HourlyRate",
        "jobInvolvement": "JobInvolvement",
        "jobLevel": "JobLevel",
        "jobRole": "JobRole",
        "jobSatisfaction": "JobSatisfaction",
        "maritalStatus": "MaritalStatus",
        "monthlyIncome": "MonthlyIncome",
        "monthlyRate": "MonthlyRate",
        "numCompaniesWorked": "NumCompaniesWorked",
        "overTime": "OverTime",
        "percentSalaryHike": "PercentSalaryHike",
        "performanceRating": "PerformanceRating",
        "relationshipSatisfaction": "RelationshipSatisfaction",
        "stockOptionLevel": "StockOptionLevel",
        "totalWorkingYears": "TotalWorkingYears",
        "trainingTimesLastYear": "TrainingTimesLastYear",
        "workLifeBalance": "WorkLifeBalance",
        "yearsAtCompany": "YearsAtCompany",
        "yearsInCurrentRole": "YearsInCurrentRole",
        "yearsSinceLastPromotion": "YearsSinceLastPromotion",
        "yearsWithCurrManager": "YearsWithCurrManager",
    }
    df = df.rename(columns=rename_map)

    for col in encoders:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda x: (
                    x if x in encoders[col].classes_ else encoders[col].classes_[0]
                )
            )
            df[col] = encoders[col].transform(df[col])

    missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns: {missing_cols}")

    return df[FEATURE_COLUMNS]


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        logger.info(f"Received data: {data}")

        # Validate employeeId
        if "employeeId" in data and (
            not isinstance(data["employeeId"], (int, float))
            or pd.isna(data["employeeId"])
        ):
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Invalid employeeId, must be a number",
                    }
                ),
                400,
            )

        input_df = pd.DataFrame([data])
        input_df = preprocess_data(input_df)
        prediction = model.predict(input_df)
        probability = model.predict_proba(input_df)[0]
        attrition_risk = round(probability[1] * 100, 2)

        employee_data = {**data, "attritionRisk": attrition_risk}
        logger.info(f"Employee data to store: {employee_data}")

        if "employeeId" in data:
            employee_id = int(data["employeeId"])
            result = employees_collection.update_one(
                {"employeeId": employee_id}, {"$set": employee_data}, upsert=True
            )
            logger.info(
                f"Employee {employee_id} upserted: {result.modified_count} modified, upserted_id: {result.upserted_id}"
            )
        else:
            result = employees_collection.insert_one(employee_data)
            logger.info(f"New employee inserted with ID: {result.inserted_id}")

        logger.info(
            f"Prediction made for employeeId {data.get('employeeId')}: {prediction[0]}, Attrition Risk: {attrition_risk}%"
        )
        return jsonify(employee_data)
    except Exception as e:
        logger.error(f"Error in /predict: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/employees", methods=["GET"])
def get_employees():
    try:
        employees = list(employees_collection.find({}, {"_id": 0}))
        logger.info(f"Fetched {len(employees)} employees from MongoDB: {employees}")
        if not employees:
            logger.info("No employees in database")
            return jsonify([])

        df = pd.DataFrame(employees)
        df_processed = preprocess_data(df)
        probabilities = model.predict_proba(df_processed)

        for i, emp in enumerate(employees):
            emp["attritionRisk"] = round(probabilities[i][1] * 100, 2)

        logger.info(f"Returning {len(employees)} employees with updated attritionRisk")
        return jsonify(employees)
    except Exception as e:
        logger.error(f"Error in /api/employees: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/employees/<int:employeeId>", methods=["DELETE"])
def delete_employee(employeeId):
    try:
        result = employees_collection.delete_one({"employeeId": employeeId})
        if result.deleted_count == 0:
            logger.info(f"Employee {employeeId} not found")
            return jsonify({"status": "error", "message": "Employee not found"}), 404
        logger.info(f"Deleted employeeId {employeeId}")
        return jsonify(
            {"status": "success", "message": "Employee deleted successfully"}
        )
    except Exception as e:
        logger.error(f"Error in delete_employee: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/predict/bulk", methods=["POST"])
def predict_bulk():
    try:
        data = request.get_json()
        if not data or "employees" not in data:
            return jsonify({"status": "error", "message": "No employees provided"}), 400

        employees = data["employees"]
        logger.info(f"Received {len(employees)} employees for bulk prediction")

        # Validate employeeId in bulk data
        for emp in employees:
            if "employeeId" in emp and (
                not isinstance(emp["employeeId"], (int, float))
                or pd.isna(emp["employeeId"])
            ):
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": f"Invalid employeeId in employee data: {emp}",
                        }
                    ),
                    400,
                )

        input_df = pd.DataFrame(employees)
        input_df = preprocess_data(input_df)
        probabilities = model.predict_proba(input_df)

        for i, emp in enumerate(employees):
            emp["attritionRisk"] = round(probabilities[i][1] * 100, 2)
            emp["sentimentScore"] = round(
                (
                    emp.get("jobSatisfaction", 1)
                    + emp.get("environmentSatisfaction", 1)
                    + emp.get("workLifeBalance", 1)
                )
                / 3
                * 20,
                2,
            )

        for emp in employees:
            employee_id = emp.get("employeeId")
            if employee_id is not None:
                employees_collection.update_one(
                    {"employeeId": employee_id}, {"$set": emp}, upsert=True
                )

        logger.info(f"Bulk processed and stored {len(employees)} employees")
        return jsonify(
            {"status": "success", "message": "Bulk prediction and storage complete"}
        )
    except Exception as e:
        logger.error(f"Error in /predict/bulk: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/analyze-sentiment", methods=["POST"])
def analyze_sentiment():
    try:
        if "feedbackFile" not in request.files:
            return jsonify({"status": "error", "message": "No file provided"}), 400

        file = request.files["feedbackFile"]
        if not file.filename.endswith(".csv"):
            return jsonify({"status": "error", "message": "File must be a CSV"}), 400

        # Read CSV into DataFrame
        df = pd.read_csv(io.BytesIO(file.read()))
        logger.info(f"Received CSV with {len(df)} rows")

        required_columns = [
            "Employee ID",
            "Email",
            "GeneralFeedback",
        ]  # Updated to match your CSV
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return (
                jsonify(
                    {"status": "error", "message": f"Missing columns: {missing_cols}"}
                ),
                400,
            )

        # Process feedback with BERT
        results = []
        for index, row in df.iterrows():
            employee_id = row["Employee ID"] if pd.notna(row["Employee ID"]) else None
            email = row["Email"] if pd.notna(row["Email"]) else None
            general_feedback = (
                str(row["GeneralFeedback"]) if pd.notna(row["GeneralFeedback"]) else ""
            )
            specific_feedback = (
                str(row["SpecificFeedback"])
                if "SpecificFeedback" in df.columns
                and pd.notna(row["SpecificFeedback"])
                else None
            )
            satisfaction = (
                int(row["How satisfied are you with your current job overall?"])
                if "How satisfied are you with your current job overall?" in df.columns
                and pd.notna(
                    row["How satisfied are you with your current job overall?"]
                )
                else None
            )

            # Find employee in MongoDB using either employeeId or email
            query = {}
            if employee_id is not None:
                query["employeeId"] = employee_id
            elif email is not None:
                query["email"] = email
            else:
                logger.warning(f"No valid Employee ID or Email for row {index}")
                continue

            employee = employees_collection.find_one(query)
            if not employee:
                logger.warning(
                    f"Employee not found for ID/Email: {employee_id or email}"
                )
                continue

            # Run BERT on GeneralFeedback
            inputs = tokenizer(
                general_feedback,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=512,
            )
            with torch.no_grad():
                outputs = bert_model(**inputs)
            logits = outputs.logits
            score = torch.softmax(logits, dim=1).tolist()[0]  # [negative, positive]
            sentiment_score = score[1] - score[0]  # Scale -1 to 1

            # Store in SentimentFeedback collection
            feedback_data = {
                "employee": str(employee["_id"]),  # Store ObjectId as string
                "generalFeedback": general_feedback,
                "specificFeedback": specific_feedback,
                "sentimentScore": sentiment_score,
                "satisfactionRating": satisfaction,
                "date": pd.Timestamp.now().isoformat(),
            }
            sentiment_collection.insert_one(feedback_data)

            # Update Employee collection with latest sentimentScore
            employees_collection.update_one(
                {"employeeId": employee["employeeId"]},
                {"$set": {"sentimentScore": sentiment_score}},
            )

            results.append(
                {
                    "employeeId": employee["employeeId"],
                    "sentimentScore": sentiment_score,
                }
            )

        logger.info(f"Processed {len(results)} feedback entries")
        return jsonify(
            {
                "status": "success",
                "message": "Sentiment analysis complete",
                "results": results,
            }
        )
    except Exception as e:
        logger.error(f"Error in /analyze-sentiment: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/sentiment', methods=['GET'])
def get_sentiment():
    try:
        logger.info("Starting sentiment route")

        # Get filter parameters from query string
        type_param = request.args.get('type', 'all').lower()  # Sentiment type: all, positive, negative, neutral
        date_range = request.args.get('dateRange', 'Last 6 Months')  # Date range filter
        department_filter = request.args.get('department', 'All Departments')  # Department filter

        # Define date filter
        from datetime import timedelta
        today = datetime.now()
        if date_range == 'Last 7 Days':
            start_date = today - timedelta(days=7)
        elif date_range == 'Last 30 Days':
            start_date = today - timedelta(days=30)
        elif date_range == 'Last Year':
            start_date = today - timedelta(days=365)
        else:  # Last 6 Months
            start_date = today - timedelta(days=180)

        # Build MongoDB query with date filter
        query = {'date': {'$gte': start_date}} if date_range != 'All' else {}
        raw_sentiment_data = list(sentiment_collection.find(query).sort('date', -1))
        total_feedback = len(raw_sentiment_data)  # Initial count (before additional filters)

        if not raw_sentiment_data:
            logger.info("No feedback found, returning default response")
            return jsonify({
                'totalFeedback': 0,
                'positiveSentiment': 0,
                'negativeSentiment': 0,
                'overallScore': 0,
                'trendData': [],
                'departmentData': [],
                'distributionData': [
                    {'name': 'Positive', 'value': 0, 'color': '#36B37E'},
                    {'name': 'Neutral', 'value': 0, 'color': '#6554C0'},
                    {'name': 'Negative', 'value': 0, 'color': '#FF5630'}
                ],
                'employeesData': []
            })

        # Map employees
        employee_ids = [str(item['employee']) for item in raw_sentiment_data]
        employees = list(employees_collection.find({'_id': {'$in': [ObjectId(id) for id in employee_ids]}}))
        employee_map = {str(emp['_id']): emp for emp in employees}

        # Combine data and apply filters
        combined_data = []
        for record in raw_sentiment_data:
            emp_id = str(record['employee'])
            emp = employee_map.get(emp_id)
            if emp and 'employeeId' in emp:
                combined_data.append({
                    'employeeId': emp['employeeId'],
                    'email': emp.get('email', ''),
                    'name': emp.get('name', 'N/A'),
                    'department': emp.get('department', 'Unknown'),
                    'sentimentScore': record['sentimentScore'],
                    'date': record.get('date', '')
                })

        # Apply department filter
        if department_filter != 'All Departments':
            combined_data = [e for e in combined_data if e['department'] == department_filter]

        # Apply sentiment type filter
        if type_param == 'positive':
            combined_data = [e for e in combined_data if e['sentimentScore'] > 0.5]
        elif type_param == 'negative':
            combined_data = [e for e in combined_data if e['sentimentScore'] < 0]
        elif type_param == 'neutral':
            combined_data = [e for e in combined_data if 0 <= e['sentimentScore'] <= 0.5]

        # Update total_feedback after filtering
        total_feedback = len(combined_data)

        # If no data after filtering
        if total_feedback == 0:
            logger.info("No feedback after filtering, returning default response")
            return jsonify({
                'totalFeedback': 0,
                'positiveSentiment': 0,
                'negativeSentiment': 0,
                'overallScore': 0,
                'trendData': [],
                'departmentData': [],
                'distributionData': [
                    {'name': 'Positive', 'value': 0, 'color': '#36B37E'},
                    {'name': 'Neutral', 'value': 0, 'color': '#6554C0'},
                    {'name': 'Negative', 'value': 0, 'color': '#FF5630'}
                ],
                'employeesData': []
            })

        # Aggregate employeesData by employeeId, keeping the most recent feedback
        employees_map = {}  # Temporary map to deduplicate
        for entry in combined_data:
            employee_id = entry['employeeId']
            if employee_id not in employees_map or pd.to_datetime(entry['date']) > pd.to_datetime(employees_map[employee_id]['date']):
                employees_map[employee_id] = entry

        employees_data = [e for e in employees_map.values() if e['sentimentScore'] < 0]
        employees_data.sort(key=lambda x: x['sentimentScore'])

        # Calculate metrics using the full combined_data
        positive_sentiment = len([e for e in combined_data if e['sentimentScore'] > 0.5]) / total_feedback * 100 if total_feedback > 0 else 0
        negative_sentiment = len([e for e in combined_data if e['sentimentScore'] < 0]) / total_feedback * 100 if total_feedback > 0 else 0
        neutral_sentiment = 100 - positive_sentiment - negative_sentiment

        # Debug overall score calculation
        score_sum = sum(e['sentimentScore'] for e in combined_data)
        overall_score = score_sum / total_feedback if total_feedback > 0 else 0
        logger.info(f"Overall score calculation: sum={score_sum}, total_feedback={total_feedback}, overall_score={overall_score}")

        # Trend data
        trend_map = {}
        for e in combined_data:
            date = pd.to_datetime(e['date'])
            month = date.strftime('%b %Y')
            if month not in trend_map:
                trend_map[month] = {'sum': 0, 'count': 0}
            trend_map[month]['sum'] += e['sentimentScore']
            trend_map[month]['count'] += 1
        trend_data = [{'month': month, 'score': data['sum'] / data['count']} for month, data in trend_map.items()]
        trend_data.sort(key=lambda x: pd.to_datetime(x['month'], format='%b %Y'))

        # Department data
        dept_map = {}
        for e in combined_data:
            dept = e['department']
            if dept not in dept_map:
                dept_map[dept] = {'sum': 0, 'count': 0}
            dept_map[dept]['sum'] += e['sentimentScore']
            dept_map[dept]['count'] += 1
        department_data = [{'department': dept, 'score': data['sum'] / data['count']} for dept, data in dept_map.items()]

        # Distribution data
        distribution_data = [
            {'name': 'Positive', 'value': round(positive_sentiment), 'color': '#36B37E'},
            {'name': 'Neutral', 'value': round(neutral_sentiment), 'color': '#6554C0'},
            {'name': 'Negative', 'value': round(negative_sentiment), 'color': '#FF5630'}
        ]

        logger.info(f"Returning sentiment data: totalFeedback={total_feedback}, overallScore={overall_score}")
        return jsonify({
            'totalFeedback': total_feedback,
            'positiveSentiment': round(positive_sentiment),
            'negativeSentiment': round(negative_sentiment),
            'overallScore': overall_score,
            'trendData': trend_data,
            'departmentData': department_data,
            'distributionData': distribution_data,
            'employeesData': [  # Format dates for frontend
                {**e, 'date': pd.to_datetime(e['date']).strftime('%Y-%m-%d') if e['date'] else 'N/A'}
                for e in employees_data
            ]
        })
    except Exception as e:
        logger.error(f"Error in /sentiment: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/upload-feedback', methods=['POST'])
def upload_feedback():
    print('Request received at /upload-feedback')
    print('Request headers:', request.headers)
    print('Request files:', request.files)
    print('Request form:', request.form)

    try:
        if 'feedbackFile' not in request.files:
            logger.error('No feedbackFile in request.files')
            return jsonify({'status': 'error', 'message': 'No file provided'}), 400

        file = request.files['feedbackFile']
        if file.filename == '':
            logger.error('Empty filename')
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400

        # Load CSV
        df = pd.read_csv(file)
        logger.info(f'CSV loaded with {len(df)} rows')

        # Define column names
        feedback_col = 'How do you feel about your current working environment?'
        satisfaction_col = 'How satisfied are you with your current job overall?'
        comments_col = 'Is there anything specific (e.g., workload, management, growth opportunities) you would like to mention?'

        # Validate required columns
        required_cols = ['Employee ID', feedback_col]
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            logger.error(f'Missing required columns: {missing_cols}')
            return jsonify({'status': 'error', 'message': f'Missing columns: {missing_cols}'}), 400

        # Load DistilBERT model for sentiment analysis
        tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english')
        model = DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased-finetuned-sst-2-english')

        feedbacks = []

        # Process each row in the CSV
        for index, row in df.iterrows():
            employee_id = int(row['Employee ID']) if pd.notna(row['Employee ID']) else None
            if not employee_id:
                logger.warning(f'No valid Employee ID at row {index}, skipping')
                continue

            feedback = str(row[feedback_col]) if pd.notna(row[feedback_col]) else ''
            satisfaction = (
                int(row[satisfaction_col])
                if satisfaction_col in df.columns and pd.notna(row[satisfaction_col])
                else None
            )
            comments = (
                str(row[comments_col])
                if comments_col in df.columns and pd.notna(row[comments_col])
                else ''
            )

            # Check if employee exists
            employee = employees_collection.find_one({'employeeId': employee_id})
            if not employee:
                logger.warning(f'Employee ID {employee_id} not found, skipping')
                continue

            # Sentiment analysis
            sentiment_score = 0.0
            if feedback and feedback.lower() != 'nan':
                inputs = tokenizer(feedback, return_tensors='pt', truncation=True, padding=True, max_length=512)
                with torch.no_grad():
                    outputs = model(**inputs)
                scores = torch.softmax(outputs.logits, dim=1).detach().numpy()[0]
                logger.info(f"Employee {employee_id} raw scores: negative={scores[0]}, positive={scores[1]}")
                sentiment_score = float(scores[1] - scores[0])  # Scale -1 to 1

            # Prepare feedback data for SentimentFeedback
            feedback_data = {
                'employee': employee['_id'],  # Use ObjectId directly
                'employeeId': employee_id,    # Optional: for easier querying
                'sentimentScore': sentiment_score,
                'date': (
                    datetime.strptime(row['Timestamp'], '%m/%d/%Y %H:%M:%S')
                    if 'Timestamp' in df.columns and pd.notna(row['Timestamp'])
                    else datetime.now()
                ),
                'feedbackText': feedback,
                'satisfactionScore': satisfaction,
                'additionalComments': comments
            }

            # Insert into SentimentFeedback collection
            sentiment_result = sentiment_collection.insert_one(feedback_data)
            logger.info(f'Inserted feedback for employee {employee_id} with ID {sentiment_result.inserted_id}')

            # Update Employee collection with the sentimentScore
            employee_result = employees_collection.update_one(
                {'employeeId': employee_id},
                {'$set': {'sentimentScore': sentiment_score}}
            )
            if employee_result.modified_count > 0:
                logger.info(f'Updated Employee {employee_id} with sentimentScore: {sentiment_score}')
            else:
                logger.info(f'No update needed for Employee {employee_id} (sentimentScore unchanged)')

            # Add to response for Node.js
            feedbacks.append({
                'employeeId': employee_id,
                'sentimentScore': sentiment_score,
                'feedbackText': feedback,
                'satisfactionScore': satisfaction,
                'additionalComments': comments
            })

        logger.info(f'Processed and synced {len(feedbacks)} feedback entries')
        return jsonify({
            'feedbacks': feedbacks  # Return for Node.js to log or pass through
        })

    except Exception as e:
        logger.error(f'Error in /upload-feedback: {str(e)}')
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'status': 'error', 'message': 'Resource not found'}), 404)

@app.route('/feedback/<int:employee_id>', methods=['GET'])
def get_feedback(employee_id):
    logger.info(f'Request received at /feedback/{employee_id}')
    feedbacks = list(sentiment_collection.find({'employeeId': employee_id}).sort('date', -1))
    if not feedbacks:
        return jsonify({'status': 'error', 'message': 'Feedback not found'}), 404
    for feedback in feedbacks:
        feedback['_id'] = str(feedback['_id'])
        feedback['employee'] = str(feedback['employee'])
        feedback['date'] = feedback['date'].strftime('%Y-%m-%d') if feedback['date'] else 'N/A'
    logger.info(f'Feedback found: {len(feedbacks)} entries')
    return jsonify({'feedbacks': feedbacks}), 200

if __name__ == "__main__":
    app.run(
        host="localhost", port=5001, debug=True
    )  # Port 5001 to avoid clash with Node.js
