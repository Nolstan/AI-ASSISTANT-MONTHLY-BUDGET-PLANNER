// Edit Budget Logic
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let budgetId = urlParams.get('budgetId') || localStorage.getItem('currentBudgetId');

    const form = document.getElementById('editBudgetForm');
    const tableBody = document.getElementById('budgetRows');
    const addBtn = document.getElementById('addCategoryBtn');
    const targetTotalEl = document.getElementById('targetMonthlyTotal');
    const currentTotalEl = document.getElementById('currentAllocatedTotal');
    const messageContainer = document.getElementById('formMessage');

    let monthlyAmount = 0;
    let targetBudget = null;

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function calculateCurrentTotal() {
        const amountInputs = tableBody.querySelectorAll('.row-amount');
        let sum = 0;
        amountInputs.forEach(input => {
            sum += Number(input.value) || 0;
        });

        if (currentTotalEl) {
            currentTotalEl.textContent = formatMWK(sum);
            if (sum === monthlyAmount) {
                currentTotalEl.style.color = 'var(--green)';
            } else {
                currentTotalEl.style.color = 'var(--danger)';
            }
        }
        return sum;
    }

    function addRow(name = '', amount = 0, priority = 'Important') {
        const tr = document.createElement('tr');
        tr.className = 'budget-item-row';
        tr.innerHTML = `
            <td><input type="text" class="row-name" value="${name}" placeholder="Category Name" required></td>
            <td><input type="number" class="row-amount" value="${amount}" placeholder="0.00" step="0.01" min="0" required></td>
            <td>
                <select class="row-priority">
                    <option value="Essential" ${priority === 'Essential' ? 'selected' : ''}>Essential</option>
                    <option value="Important" ${priority === 'Important' ? 'selected' : ''}>Important</option>
                    <option value="Optional" ${priority === 'Optional' ? 'selected' : ''}>Optional</option>
                </select>
            </td>
            <td><button type="button" class="btn btn-danger remove-row-btn" style="padding: 6px 12px; font-size: 0.8rem;">Remove</button></td>
        `;

        tr.querySelector('.row-amount').addEventListener('input', calculateCurrentTotal);
        tr.querySelector('.remove-row-btn').addEventListener('click', () => {
            if (tableBody.querySelectorAll('.budget-item-row').length > 1) {
                tr.remove();
                calculateCurrentTotal();
            }
        });

        tableBody.appendChild(tr);
        calculateCurrentTotal();
    }

    try {
        const res = await fetchBudgets();
        const budgets = res.budgets || [];
        
        if (budgetId) {
            targetBudget = budgets.find(b => b._id === budgetId);
        }
        if (!targetBudget && budgets.length > 0) {
            targetBudget = budgets[budgets.length - 1];
            budgetId = targetBudget._id;
        }

        if (!targetBudget) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 16px;">No budget found to edit. <a href="create-budget.html" style="color: var(--green);">Create Budget &rarr;</a></td></tr>`;
            return;
        }

        monthlyAmount = targetBudget.monthlyAmount || 0;
        if (targetTotalEl) targetTotalEl.textContent = formatMWK(monthlyAmount);

        const items = targetBudget.aiPlan?.recommendedBudget?.length 
            ? targetBudget.aiPlan.recommendedBudget 
            : (targetBudget.expenses || []);

        tableBody.innerHTML = '';
        items.forEach(item => addRow(item.name, item.amount, item.priority));

    } catch (error) {
        console.error('Error fetching budget for edit:', error);
        if (messageContainer) {
            messageContainer.style.color = 'var(--danger)';
            messageContainer.textContent = 'Error loading budget plan.';
        }
    }

    if (addBtn) {
        addBtn.addEventListener('click', () => addRow('', 0, 'Important'));
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentSum = calculateCurrentTotal();
        if (currentSum !== monthlyAmount) {
            messageContainer.style.color = 'var(--danger)';
            messageContainer.textContent = `Total allocated (MWK ${currentSum}) must equal monthly budget total (MWK ${monthlyAmount}).`;
            return;
        }

        const rows = tableBody.querySelectorAll('.budget-item-row');
        const recommendedBudget = [];

        rows.forEach(r => {
            const name = r.querySelector('.row-name').value.trim();
            const amount = Number(r.querySelector('.row-amount').value);
            const priority = r.querySelector('.row-priority').value;

            if (name && !isNaN(amount)) {
                recommendedBudget.push({ name, amount, priority });
            }
        });

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving modifications...';

        try {
            await updateBudgetPlan(budgetId, recommendedBudget);

            messageContainer.style.color = 'var(--green)';
            messageContainer.textContent = 'Budget updated successfully! Redirecting to approval...';

            setTimeout(() => {
                window.location.href = `approval.html?budgetId=${budgetId}`;
            }, 1000);

        } catch (err) {
            messageContainer.style.color = 'var(--danger)';
            messageContainer.textContent = err.message || 'Failed to update budget plan.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
});
