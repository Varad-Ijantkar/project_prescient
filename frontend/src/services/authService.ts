const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login failed");
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};
