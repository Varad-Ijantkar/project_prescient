export const loginUser = async (email: string, password: string) => {
    try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login failed");

        // Store token in localStorage
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};
