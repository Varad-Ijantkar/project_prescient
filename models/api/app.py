from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
import logging
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# MongoDB connection
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['prescient']
    employees_collection = db['employees']
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    raise

# Paths to model and encoders
MODEL_PATH = "../rf_attrition_model.pkl"
ENCODERS_PATH = "../Encoders/"

# Load the trained model
try:
    model = joblib.load(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

# Load label encoders
try:
    encoders = {}
    for col in ['JobRole', 'Department', 'BusinessTravel', 'Gender', 'OverTime',
                'MaritalStatus', 'EducationField']:
        encoders[col] = joblib.load(os.path.join(ENCODERS_PATH, f"label_encoder_{col.lower()}.pkl"))
    logger.info("Encoders loaded successfully")
except Exception as e:
    logger.error(f"Error loading encoders: {e}")
    raise

FEATURE_COLUMNS = [
    'Age', 'BusinessTravel', 'DailyRate', 'Department', 'DistanceFromHome',
    'Education', 'EducationField', 'EnvironmentSatisfaction', 'Gender', 'HourlyRate',
    'JobInvolvement', 'JobLevel', 'JobRole', 'JobSatisfaction', 'MaritalStatus',
    'MonthlyIncome', 'MonthlyRate', 'NumCompaniesWorked', 'OverTime', 'PercentSalaryHike',
    'PerformanceRating', 'RelationshipSatisfaction', 'StockOptionLevel',
    'TotalWorkingYears', 'TrainingTimesLastYear', 'WorkLifeBalance', 'YearsAtCompany',
    'YearsInCurrentRole', 'YearsSinceLastPromotion', 'YearsWithCurrManager'
]

def preprocess_data(df):
    df = df.copy()
    rename_map = {
        'age': 'Age', 'businessTravel': 'BusinessTravel', 'dailyRate': 'DailyRate',
        'department': 'Department', 'distanceFromHome': 'DistanceFromHome',
        'education': 'Education', 'educationField': 'EducationField',
        'environmentSatisfaction': 'EnvironmentSatisfaction', 'gender': 'Gender',
        'hourlyRate': 'HourlyRate', 'jobInvolvement': 'JobInvolvement',
        'jobLevel': 'JobLevel', 'jobRole': 'JobRole', 'jobSatisfaction': 'JobSatisfaction',
        'maritalStatus': 'MaritalStatus', 'monthlyIncome': 'MonthlyIncome',
        'monthlyRate': 'MonthlyRate', 'numCompaniesWorked': 'NumCompaniesWorked',
        'overTime': 'OverTime', 'percentSalaryHike': 'PercentSalaryHike',
        'performanceRating': 'PerformanceRating', 'relationshipSatisfaction': 'RelationshipSatisfaction',
        'stockOptionLevel': 'StockOptionLevel', 'totalWorkingYears': 'TotalWorkingYears',
        'trainingTimesLastYear': 'TrainingTimesLastYear', 'workLifeBalance': 'WorkLifeBalance',
        'yearsAtCompany': 'YearsAtCompany', 'yearsInCurrentRole': 'YearsInCurrentRole',
        'yearsSinceLastPromotion': 'YearsSinceLastPromotion', 'yearsWithCurrManager': 'YearsWithCurrManager'
    }
    df = df.rename(columns=rename_map)

    for col in encoders:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: x if x in encoders[col].classes_ else encoders[col].classes_[0])
            df[col] = encoders[col].transform(df[col])

    missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing columns: {missing_cols}")

    return df[FEATURE_COLUMNS]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400

        logger.info(f"Received data: {data}")

        input_df = pd.DataFrame([data])
        input_df = preprocess_data(input_df)
        prediction = model.predict(input_df)
        probability = model.predict_proba(input_df)[0]
        attrition_risk = round(probability[1] * 100, 2)  # Round to 2 decimals

        employee_data = {**data, 'attritionRisk': attrition_risk}
        logger.info(f"Employee data to store: {employee_data}")

        if 'employeeId' in data:
            employee_id = int(data['employeeId'])
            result = employees_collection.update_one(
                {'employeeId': employee_id},
                {'$set': employee_data},
                upsert=True
            )
            logger.info(f"Employee {employee_id} upserted: {result.modified_count} modified, upserted_id: {result.upserted_id}")
        else:
            result = employees_collection.insert_one(employee_data)
            logger.info(f"New employee inserted with ID: {result.inserted_id}")

        logger.info(f"Prediction made for employeeId {data.get('employeeId')}: {prediction[0]}, Attrition Risk: {attrition_risk}%")
        return jsonify(employee_data)
    except Exception as e:
        logger.error(f"Error in /predict: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/employees', methods=['GET'])
def get_employees():
    try:
        employees = list(employees_collection.find({}, {'_id': 0}))
        logger.info(f"Fetched {len(employees)} employees from MongoDB: {employees}")
        if not employees:
            logger.info("No employees in database")
            return jsonify([])

        df = pd.DataFrame(employees)
        df_processed = preprocess_data(df)
        probabilities = model.predict_proba(df_processed)

        for i, emp in enumerate(employees):
            emp['attritionRisk'] = round(probabilities[i][1] * 100, 2)

        logger.info(f"Returning {len(employees)} employees with updated attritionRisk")
        return jsonify(employees)
    except Exception as e:
        logger.error(f"Error in /api/employees: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/employees/<int:employeeId>', methods=['DELETE'])
def delete_employee(employeeId):
    try:
        result = employees_collection.delete_one({'employeeId': employeeId})
        if result.deleted_count == 0:
            logger.info(f"Employee {employeeId} not found")
            return jsonify({'status': 'error', 'message': 'Employee not found'}), 404
        logger.info(f"Deleted employeeId {employeeId}")
        return jsonify({'status': 'success', 'message': 'Employee deleted successfully'})
    except Exception as e:
        logger.error(f"Error in delete_employee: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/predict/bulk', methods=['POST'])
def predict_bulk():
    try:
        data = request.get_json()
        if not data or 'employees' not in data:
            return jsonify({'status': 'error', 'message': 'No employees provided'}), 400

        employees = data['employees']
        logger.info(f"Received {len(employees)} employees for bulk prediction")

        # Preprocess all employees at once
        input_df = pd.DataFrame(employees)
        input_df = preprocess_data(input_df)
        probabilities = model.predict_proba(input_df)

        # Update each employee with predictions
        for i, emp in enumerate(employees):
            emp['attritionRisk'] = round(probabilities[i][1] * 100, 2)
            emp['sentimentScore'] = round(
                (emp.get('jobSatisfaction', 1) +
                 emp.get('environmentSatisfaction', 1) +
                 emp.get('workLifeBalance', 1)) / 3 * 20, 2
            )  # Simple avg, scaled to 0-100

        # Bulk upsert into MongoDB
        for emp in employees:
            employee_id = emp.get('employeeId')
            if employee_id is not None:
                employees_collection.update_one(
                    {'employeeId': employee_id},
                    {'$set': emp},
                    upsert=True
                )

        logger.info(f"Bulk processed and stored {len(employees)} employees")
        return jsonify({'status': 'success', 'message': 'Bulk prediction and storage complete'})
    except Exception as e:
        logger.error(f"Error in /predict/bulk: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(host='localhost', port=5001, debug=True)  # Changed to port 5001