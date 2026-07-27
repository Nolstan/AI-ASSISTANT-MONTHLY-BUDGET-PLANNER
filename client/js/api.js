// This file is for the api calls to the backend

// API Base Configuration
// Uses absolute localhost for isolated dev server (like Live Server running on port 5500, 127.0.0.1, etc.) 
// but falls back to relative '/api' for production deployment (e.g. Render)
const isLocalEnv = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1' ||
    window.location.protocol === 'file:'
);

const API_BASE_URL = isLocalEnv && window.location.port !== '5000' 
    ? 'http://localhost:5000/api' 
    : '/api';

/**
 * Helper function to send HTTP requests and handle response parsing safely.
 * Prevents JSON.parse SyntaxError when server returns empty responses or HTML error pages.
 */
async function request(endpoint, options = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
    } catch (err) {
        throw new Error('Unable to connect to backend server. Make sure your server is running on http://localhost:5000');
    }

    const text = await response.text();
    let data = {};

    if (text && text.trim()) {
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: `Unexpected response from server (${response.status} ${response.statusText})` };
        }
    }

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

// this will handle the registration of the user by sending the data to the backend
async function registerUser(userData) {
    return await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

// this will handle the login of the user by sending credentials to the backend
async function loginUser(credentials) {
    return await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
}

// Fetch user's budgets from backend
async function fetchBudgets() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    return await request('/budget', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Create new budget in backend
async function createBudget(budgetData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to create a budget.');
    }

    return await request('/budget', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(budgetData)
    });
}

// Generate AI plan for budget
async function generateAIPlan(budgetId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    return await request(`/ai/generate/${budgetId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Update budget plan (recommended budget edit)
async function updateBudgetPlan(budgetId, recommendedBudget) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    return await request(`/budget/${budgetId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recommendedBudget })
    });
}

// Approve budget plan
async function approveBudget(budgetId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    return await request(`/budget/${budgetId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Lock an approved budget with user-defined release schedule
async function lockBudget(budgetId, releases) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in first.');

    return await request(`/locked-budget/${budgetId}/lock`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ releases })
    });
}

// Fetch user's locked budget and release schedule
async function fetchLockedBudget() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    return await request('/locked-budget', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Fetch user's account balance summary from backend
async function fetchAccountBalance() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    return await request('/account/balance', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Fetch user's transaction history from backend
async function fetchTransactions() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    return await request('/account/transactions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

// Process a withdrawal from unlocked/available money
async function withdrawMoney(withdrawalData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    return await request('/account/withdraw', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(withdrawalData)
    });
}
