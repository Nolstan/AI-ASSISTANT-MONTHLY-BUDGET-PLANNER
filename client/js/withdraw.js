document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const availableBalanceEl = document.getElementById('availableBalance');
    const withdrawForm = document.getElementById('withdrawForm');
    const withdrawBtn = document.getElementById('withdrawBtn');
    const messageEl = document.getElementById('message');

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    let currentAvailable = 0;

    // Fetch and display current balance on load
    async function loadBalance() {
        try {
            const data = await fetchAccountBalance();
            currentAvailable = data.availableMoney || 0;
            if (availableBalanceEl) {
                availableBalanceEl.textContent = formatMWK(currentAvailable);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            if (availableBalanceEl) {
                availableBalanceEl.textContent = 'Error';
                availableBalanceEl.style.color = 'var(--danger)';
            }
        }
    }

    await loadBalance();

    withdrawForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const amountInput = document.getElementById('amount').value;
        const categoryInput = document.getElementById('category').value;
        const amount = Number(amountInput);

        if (amount <= 0) {
            messageEl.style.color = 'var(--danger)';
            messageEl.textContent = 'Please enter a valid amount greater than 0.';
            return;
        }

        if (amount > currentAvailable) {
            messageEl.style.color = 'var(--danger)';
            messageEl.textContent = 'Insufficient unlocked balance for this withdrawal.';
            return;
        }

        withdrawBtn.disabled = true;
        withdrawBtn.textContent = 'Processing...';
        messageEl.style.color = 'var(--ink)';
        messageEl.textContent = 'Processing withdrawal...';

        try {
            await withdrawMoney({
                amount: amount,
                category: categoryInput
            });

            messageEl.style.color = 'var(--green)';
            messageEl.textContent = 'Withdrawal successful!';

            // Reload balance and clear form
            await loadBalance();
            withdrawForm.reset();

            // Redirect to transactions after a short delay
            setTimeout(() => {
                window.location.href = 'transaction-history.html';
            }, 1500);

        } catch (error) {
            messageEl.style.color = 'var(--danger)';
            messageEl.textContent = error.message || 'Failed to process withdrawal.';
        } finally {
            withdrawBtn.disabled = false;
            withdrawBtn.textContent = 'Submit Withdrawal';
        }
    });
});
