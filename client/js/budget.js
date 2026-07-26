// Budget Creation Logic
document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('createBudgetForm');
    const expensesContainer = document.getElementById('expensesContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const messageContainer = document.getElementById('formMessage');

    if (!form || !expensesContainer) return;

    // Helper: update remove button visibilities
    function updateRemoveButtons() {
        const rows = expensesContainer.querySelectorAll('.expense-row');
        rows.forEach(row => {
            const removeBtn = row.querySelector('.remove-row-btn');
            if (removeBtn) {
                removeBtn.style.visibility = rows.length > 1 ? 'visible' : 'hidden';
            }
        });
    }

    // Add row function
    function createExpenseRow(name = '', amount = '', priority = 'Important') {
        const row = document.createElement('div');
        row.className = 'form-row expense-row';
        row.innerHTML = `
            <div class="form-group" style="margin-bottom: 0;">
                <label>Item Name / Purchase</label>
                <input type="text" class="expense-name" placeholder="e.g. Food & Groceries" value="${name}" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Planned Amount (MWK)</label>
                <input type="number" class="expense-amount" placeholder="600000" value="${amount}" required min="0" step="0.01">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Priority</label>
                <select class="expense-priority">
                    <option value="Essential" ${priority === 'Essential' ? 'selected' : ''}>Essential</option>
                    <option value="Important" ${priority === 'Important' ? 'selected' : ''}>Important</option>
                    <option value="Optional" ${priority === 'Optional' ? 'selected' : ''}>Optional</option>
                </select>
            </div>
            <div>
                <button type="button" class="btn-remove remove-row-btn">&times;</button>
            </div>
        `;

        row.querySelector('.remove-row-btn').addEventListener('click', () => {
            row.remove();
            updateRemoveButtons();
        });

        expensesContainer.appendChild(row);
        updateRemoveButtons();
    }

    // Add initial row click listener
    if (addItemBtn) {
        addItemBtn.addEventListener('click', () => createExpenseRow());
    }

    // Delegate remove event for initial static row
    expensesContainer.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('remove-row-btn')) {
            const row = e.target.closest('.expense-row');
            if (row && expensesContainer.querySelectorAll('.expense-row').length > 1) {
                row.remove();
                updateRemoveButtons();
            }
        }
    });

    updateRemoveButtons();

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const monthlyAmountInput = document.getElementById('monthlyAmount');
        const submitBtn = form.querySelector('button[type="submit"]');

        const monthlyAmount = Number(monthlyAmountInput.value);
        if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
            messageContainer.style.color = '#A33B2D';
            messageContainer.textContent = 'Please enter a valid monthly budget amount.';
            return;
        }

        // Collect expenses
        const expenseRows = expensesContainer.querySelectorAll('.expense-row');
        const expenses = [];

        expenseRows.forEach(row => {
            const name = row.querySelector('.expense-name').value.trim();
            const amount = Number(row.querySelector('.expense-amount').value);
            const priority = row.querySelector('.expense-priority').value;

            if (name && !isNaN(amount) && amount >= 0) {
                expenses.push({ name, amount, priority });
            }
        });

        if (expenses.length === 0) {
            messageContainer.style.color = '#A33B2D';
            messageContainer.textContent = 'Please add at least one planned expense item.';
            return;
        }

        // Disable submit button & state message
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving budget...';
        messageContainer.style.color = 'var(--ink)';
        messageContainer.textContent = 'Creating budget in backend...';

        try {
            // 1. Create budget
            const newBudgetRes = await createBudget({ monthlyAmount, expenses });
            const budgetId = newBudgetRes.budget._id;

            // 2. Generate AI plan
            submitBtn.textContent = 'Generating AI Recommendations...';
            messageContainer.textContent = 'AI is analyzing your planned expenses and generating recommendations...';

            await generateAIPlan(budgetId);

            // Store current active budget ID
            localStorage.setItem('currentBudgetId', budgetId);

            messageContainer.style.color = '#2F6F4E';
            messageContainer.textContent = 'AI plan generated! Redirecting to AI Review...';

            setTimeout(() => {
                window.location.href = `ai-review.html?budgetId=${budgetId}`;
            }, 1000);

        } catch (error) {
            console.error('Error creating budget:', error);
            messageContainer.style.color = '#A33B2D';
            messageContainer.textContent = error.message || 'An error occurred while creating budget and generating AI plan.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
});
