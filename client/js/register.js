// Register Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Create container for feedback messages if not present
    let messageContainer = document.getElementById('formMessage');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'formMessage';
        messageContainer.style.marginTop = '14px';
        messageContainer.style.fontSize = '0.9rem';
        messageContainer.style.textAlign = 'center';
        registerForm.appendChild(messageContainer);
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset message
        messageContainer.textContent = '';
        messageContainer.style.color = '';

        // Validation
        if (password !== confirmPassword) {
            messageContainer.textContent = 'Passwords do not match.';
            messageContainer.style.color = '#A33B2D';
            return;
        }

        if (password.length < 8) {
            messageContainer.textContent = 'Password must be at least 8 characters long.';
            messageContainer.style.color = '#A33B2D';
            return;
        }

        // Disable button & show loading state
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            const result = await registerUser({ name, email, password });
            
            messageContainer.style.color = '#2F6F4E';
            messageContainer.textContent = result.message || 'Account created successfully! Redirecting to login...';

            registerForm.reset();

            // Redirect to login page after 1.5s
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            messageContainer.style.color = '#A33B2D';
            messageContainer.textContent = error.message || 'Registration failed. Please try again.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});
