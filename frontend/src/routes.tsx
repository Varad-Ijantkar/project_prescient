// src/routes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";
import EmployeeManagement from "./pages/EmployeeManagement";
import AttritionAnalysis from "./pages/AttritionAnalysis";
import SentimentAnalysis from "./pages/SentimentAnalysis";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/employees"
                element={
                    <ProtectedRoute>
                        <EmployeeManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/attrition"
                element={
                    <ProtectedRoute>
                        <AttritionAnalysis />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sentiment"
                element={
                    <ProtectedRoute>
                        <SentimentAnalysis />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRoutes;