// AI Review Page Logic
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let budgetId = urlParams.get('budgetId') || localStorage.getItem('currentBudgetId');

    const summaryEl = document.getElementById('aiSummary');
    const tableBody = document.getElementById('recommendedBudgetTable');
    const improvementsList = document.getElementById('improvementsList');
    const tipsList = document.getElementById('tipsList');
    const proceedBtn = document.getElementById('proceedApprovalBtn');
    const editBtn = document.getElementById('editAllocationBtn');

    function formatMWK(amount) {
        const num = Number(amount) || 0;
        return `MWK ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
        const res = await fetchBudgets();
        const budgets = res.budgets || [];
        
        let targetBudget = null;
        if (budgetId) {
            targetBudget = budgets.find(b => b._id === budgetId);
        }
        if (!targetBudget && budgets.length > 0) {
            targetBudget = budgets[budgets.length - 1];
            budgetId = targetBudget._id;
        }

        if (!targetBudget || !targetBudget.aiPlan) {
            if (summaryEl) summaryEl.textContent = 'No AI budget review available. Please create a budget first.';
            if (tableBody) tableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 16px;">No recommendations found. <a href="create-budget.html" style="color: var(--green);">Create Budget &rarr;</a></td></tr>`;
            return;
        }

        const aiPlan = targetBudget.aiPlan;

        // Render Summary
        if (summaryEl) {
            summaryEl.textContent = aiPlan.summary || 'AI evaluation complete.';
        }

        // Update action link URLs with budget ID
        if (proceedBtn) proceedBtn.href = `approval.html?budgetId=${targetBudget._id}`;
        if (editBtn) editBtn.href = `edit-budget.html?budgetId=${targetBudget._id}`;

        // Render Recommended Budget Table
        if (tableBody && aiPlan.recommendedBudget) {
            tableBody.innerHTML = aiPlan.recommendedBudget.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td class="mono">${formatMWK(item.amount)}</td>
                    <td>${item.priority || 'Important'}</td>
                </tr>
            `).join('');
        }

        // Render Improvements List
        if (improvementsList && aiPlan.improvements) {
            improvementsList.innerHTML = aiPlan.improvements.length > 0 
                ? aiPlan.improvements.map(imp => `<li>${imp}</li>`).join('')
                : '<li>Your budget allocation looks solid!</li>';
        }

        // Render Tips List
        if (tipsList && aiPlan.tips) {
            tipsList.innerHTML = aiPlan.tips.length > 0 
                ? aiPlan.tips.map(tip => `<li>${tip}</li>`).join('')
                : '<li>Stick to your planned allocations to reach your target savings.</li>';
        }

    } catch (error) {
        console.error('Error fetching AI review:', error);
        if (summaryEl) summaryEl.textContent = 'Error loading AI evaluation. Please try again.';
    }
});
