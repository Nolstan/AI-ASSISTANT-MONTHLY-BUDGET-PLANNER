// Login Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Create container for feedback messages if not present
    let messageContainer = document.getElementById('formMessage');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'formMessage';
        messageContainer.style.marginTop = '14px';
        messageContainer.style.fontSize = '0.9rem';
        messageContainer.style.textAlign = 'center';
        loginForm.appendChild(messageContainer);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Reset message state
        messageContainer.textContent = '';
        messageContainer.style.color = '';

        // Disable button & show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const result = await loginUser({ email, password });
            
            // Store token in localStorage
            if (result.token) {
                localStorage.setItem('token', result.token);
            }

            messageContainer.style.color = '#2F6F4E';
            messageContainer.textContent = result.message || 'Login successful! Redirecting...';

            loginForm.reset();

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);

        } catch (error) {
            messageContainer.style.color = '#A33B2D';
            messageContainer.textContent = error.message || 'Invalid email or password.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});
