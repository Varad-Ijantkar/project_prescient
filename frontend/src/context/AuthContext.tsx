// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import { fetchProtectedData } from "../services/apiService";

interface User {
    full_name: string;
    email: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation to get the current route

    const fetchUserData = async () => {
        if (token) {
            try {
                const userData = await fetchProtectedData('/api/user');
                setUser(userData);
            } catch (error: any) {
                console.error("Failed to fetch user data:", error);
                if (error.message === "TokenExpired") {
                    logout();
                } else {
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            setUser(null);
            setIsLoading(false);
            // Define public routes that don't require a redirect to /login
            const publicRoutes = ['/', '/login', '/signup', '/solutions', '/contact'];
            if (!publicRoutes.includes(location.pathname)) {
                navigate('/login', { replace: true });
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [token, location.pathname]); // Add location.pathname to re-run when the route changes

    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);

    const login = (token: string) => {
        setToken(token);
        navigate('/dashboard');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;