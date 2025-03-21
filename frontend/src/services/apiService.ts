// src/services/apiService.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const fetchProtectedData = async (endpoint: string, baseUrl: string = API_BASE_URL): Promise<any> => {
    const token = localStorage.getItem("authToken");
    console.log('Fetching with token:', token);
    if (!token) throw new Error('No authentication token found');
    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (response.status === 403 && data.error === "Token has expired") {
                    throw new Error("TokenExpired");
                }
                throw new Error(data.error || `Request failed with status ${response.status}`);
            } else {
                const text = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${text}`);
            }
        }
        return response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
};

export const postProtectedData = async (url: string, data: FormData) => {
    const token = localStorage.getItem("authToken");
    console.log('Posting with token:', token);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: data,
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(errorText || 'Network response was not ok');
    }
    return response.json();
};

export const deleteProtectedData = async (endpoint: string, baseUrl: string = API_BASE_URL): Promise<any> => {
    const token = localStorage.getItem("authToken");
    console.log('Deleting with token:', token);
    if (!token) throw new Error('No authentication token found');
    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (response.status === 403 && data.error === "Token has expired") {
                    throw new Error("TokenExpired");
                }
                if (response.status === 401) {
                    throw new Error("Unauthorized");
                }
                throw new Error(data.error || `Request failed with status ${response.status}`);
            } else {
                const text = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${text}`);
            }
        }
        // DELETE requests may not return a body, so we check if there's JSON to parse
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return response.json();
        }
        return; // Return undefined if no JSON response
    } catch (error) {
        console.error("Delete Error:", error);
        throw error;
    }
};