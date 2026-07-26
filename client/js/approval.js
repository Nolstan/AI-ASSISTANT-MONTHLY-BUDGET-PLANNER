// Approval Logic
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    let budgetId = urlParams.get('budgetId') || localStorage.getItem('currentBudgetId');

    const form = document.getElementById('approvalForm');
    const planPeriodEl = document.getElementById('planPeriod');
    const totalIncomeEl = document.getElementById('totalIncomeVal');
    const totalAllocatedEl = document.getElementById('totalAllocatedVal');
    const planStatusEl = document.getElementById('planStatusVal');
    const backEditBtn = document.getElementById('backEditBtn');
    const messageContainer = document.getElementById('formMessage');

    let targetBudget = null;

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            if (messageContainer) {
                messageContainer.style.color = 'var(--danger)';
                messageContainer.textContent = 'No budget found for approval. Please create a budget first.';
            }
            return;
        }

        const date = targetBudget.createdAt ? new Date(targetBudget.createdAt) : new Date();
        if (planPeriodEl) planPeriodEl.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const income = targetBudget.monthlyAmount || 0;
        if (totalIncomeEl) totalIncomeEl.textContent = formatMWK(income);

        const items = targetBudget.aiPlan?.recommendedBudget?.length 
            ? targetBudget.aiPlan.recommendedBudget 
            : (targetBudget.expenses || []);
            
        const totalAllocated = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
        if (totalAllocatedEl) totalAllocatedEl.textContent = formatMWK(totalAllocated);

        if (planStatusEl) {
            planStatusEl.textContent = targetBudget.status ? targetBudget.status.toUpperCase() : 'DRAFT';
            planStatusEl.style.color = targetBudget.status === 'approved' ? 'var(--green)' : 'var(--gold)';
        }

        if (backEditBtn) backEditBtn.href = `edit-budget.html?budgetId=${targetBudget._id}`;

    } catch (err) {
        console.error('Error fetching budget for approval:', err);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!targetBudget) return;

        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Activating plan...';

        try {
            await approveBudget(targetBudget._id);

            messageContainer.style.color = 'var(--green)';
            messageContainer.textContent = 'Budget approved! Now set withdrawal dates to lock your funds...';

            setTimeout(() => {
                window.location.href = `release-schedule.html?setup=true&budgetId=${targetBudget._id}`;
            }, 1200);

        } catch (err) {
            messageContainer.style.color = 'var(--danger)';
            messageContainer.textContent = err.message || 'Failed to approve budget.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = origText;
        }
    });
});
