import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
    const { token, logout } = useAuth(); // Access token and logout function from AuthContext

    const handleLogout = () => {
        logout(); // Clear token from context
    };

    return (
        <div>
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard!</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Dashboard;
