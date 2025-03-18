import { createContext, useContext, useState, useEffect } from "react";
import { fetchProtectedData } from "../services/apiService"; // Adjust the import path as needed

interface User {
    full_name: string;
    email: string;
    // Add other user fields as needed
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

// Create context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
    const [user, setUser] = useState<User | null>(null);

    // Fetch user data when token changes
    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                try {
                    const userData = await fetchProtectedData('/api/user'); // Fetch user data from API
                    setUser(userData); // Assuming the API returns { full_name, email, ... }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    setUser(null); // Reset user if fetch fails
                }
            } else {
                setUser(null); // Clear user if no token
            }
        };

        fetchUserData();
    }, [token]);

    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);

    const login = (token: string) => setToken(token);
    const logout = () => setToken(null);

    return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;