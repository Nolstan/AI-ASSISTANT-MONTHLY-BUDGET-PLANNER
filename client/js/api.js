// THis file is for the api calls to the backend


// API Base Configuration
// Uses absolute localhost for isolated dev server (like Live Server) 
// but falls back to relative '/api' for production deployment (e.g. Render)
const API_BASE_URL = window.location.hostname === 'localhost' && window.location.port !== '5000' 
    ? 'http://localhost:5000/api' 
    : '/api';

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

// Fetch user's budgets from backend
async function fetchBudgets() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/budget`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch budgets');
    }

    return data;
}

// Create new budget in backend
async function createBudget(budgetData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to create a budget.');
    }

    const response = await fetch(`${API_BASE_URL}/budget`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(budgetData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to create budget');
    }

    return data;
}

// Generate AI plan for budget
async function generateAIPlan(budgetId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    const response = await fetch(`${API_BASE_URL}/ai/generate/${budgetId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'AI plan generation failed');
    }

    return data;
}

// Update budget plan (recommended budget edit)
async function updateBudgetPlan(budgetId, recommendedBudget) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    const response = await fetch(`${API_BASE_URL}/budget/${budgetId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recommendedBudget })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to update budget plan');
    }

    return data;
}

// Approve budget plan
async function approveBudget(budgetId) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    const response = await fetch(`${API_BASE_URL}/budget/${budgetId}/approve`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to approve budget');
    }

    return data;
}

// Lock an approved budget with user-defined release schedule
async function lockBudget(budgetId, releases) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in first.');

    const response = await fetch(`${API_BASE_URL}/locked-budget/${budgetId}/lock`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ releases })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to lock budget');
    return data;
}

// Fetch user's locked budget and release schedule
async function fetchLockedBudget() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_BASE_URL}/locked-budget`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch locked budget');
    return data;
}

// Fetch user's account balance summary from backend
async function fetchAccountBalance() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/account/balance`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch account balance');
    }

    return data;
}

// Fetch user's transaction history from backend
async function fetchTransactions() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/account/transactions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch transactions');
    }

    return data;
}

// Process a withdrawal from unlocked/available money
async function withdrawMoney(withdrawalData) {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in first.');
    }

    const response = await fetch(`${API_BASE_URL}/account/withdraw`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(withdrawalData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Withdrawal failed');
    }

    return data;
}
