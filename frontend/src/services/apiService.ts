export const fetchProtectedData = async () => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch data");

        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
};
