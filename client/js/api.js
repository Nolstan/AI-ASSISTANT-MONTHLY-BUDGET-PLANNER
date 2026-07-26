// THis file is for the api calls to the backend


// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// this will handle the registration of the user by sending the data to the backend
async function registerUser(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }

    return data;
}

// this will handle the login of the user by sending credentials to the backend
async function loginUser(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
}
