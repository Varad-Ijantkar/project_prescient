// src/App.tsx
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <AppRoutes />??
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
};

export default App;