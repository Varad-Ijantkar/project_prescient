const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Back to 5000

export const fetchProtectedData = async (endpoint: string): Promise<any> => {
    const token = localStorage.getItem("token");
    console.log('Fetching with token:', token); // Debug token
    if (!token) throw new Error('No authentication token found');
    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        if (!response.ok) {
            console.log('Response status:', response.status, 'Response data:', data); // Debug response
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
};

// apiService.ts
export const postProtectedData = async (url: string, data: FormData) => {
    console.log('Fetching with token:', localStorage.getItem('token'));
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // Do NOT set 'Content-Type'—let fetch handle it for FormData
        },
        body: data,
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText); // Debug
        throw new Error(errorText || 'Network response was not ok');
    }
    return response.json();
};