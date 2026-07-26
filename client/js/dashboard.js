// Dashboard Logic - Connects to backend API
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const totalIncomeEl = document.getElementById('totalMonthlyIncome');
    const allocatedBudgetEl = document.getElementById('allocatedBudget');
    const lockedMoneyEl = document.getElementById('lockedMoney');
    const availableBalanceEl = document.getElementById('availableBalance');
    const allocationsTableBody = document.getElementById('allocationsTableBody');
    const dashboardSubEl = document.getElementById('dashboardOverviewSub');

    // Utility: Format currency in MWK
    function formatMWK(amount) {
        const num = Number(amount) || 0;
        return `MWK ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
        // Fetch budget data and account balance concurrently
        const [budgetRes, balanceRes] = await Promise.allSettled([
            fetchBudgets(),
            fetchAccountBalance()
        ]);

        let budgets = [];
        if (budgetRes.status === 'fulfilled' && budgetRes.value.budgets) {
            budgets = budgetRes.value.budgets;
        }

        let balanceData = { lockedMoney: 0, availableMoney: 0 };
        if (balanceRes.status === 'fulfilled') {
            balanceData = balanceRes.value;
        }

        // Display locked money and available balance from balance API if available
        if (lockedMoneyEl) lockedMoneyEl.textContent = formatMWK(balanceData.lockedMoney || 0);
        if (availableBalanceEl) availableBalanceEl.textContent = formatMWK(balanceData.availableMoney || 0);

        if (budgets.length === 0) {
            if (dashboardSubEl) dashboardSubEl.textContent = 'No budget created yet for this period.';
            if (totalIncomeEl) totalIncomeEl.textContent = formatMWK(0);
            if (allocatedBudgetEl) allocatedBudgetEl.textContent = formatMWK(0);
            if (allocationsTableBody) {
                allocationsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--ink-soft); padding: 24px;">
                            No active budget found. <a href="create-budget.html" style="color: var(--green); font-weight: 500;">Create your first budget &rarr;</a>
                        </td>
                    </tr>
                `;
            }
            return;
        }

        // Use the latest user budget
        const currentBudget = budgets[budgets.length - 1];
        
        // Month sub-heading
        const budgetDate = currentBudget.createdAt ? new Date(currentBudget.createdAt) : new Date();
        const monthYear = budgetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (dashboardSubEl) dashboardSubEl.textContent = `Overview for ${monthYear}`;

        // Monthly Income
        const totalIncome = currentBudget.monthlyAmount || 0;
        if (totalIncomeEl) totalIncomeEl.textContent = formatMWK(totalIncome);

        // Allocations array (prefer finalPlan, fallback to aiPlan recommendedBudget, fallback to original expenses)
        const items = currentBudget.finalPlan?.length 
            ? currentBudget.finalPlan 
            : (currentBudget.aiPlan?.recommendedBudget?.length ? currentBudget.aiPlan.recommendedBudget : (currentBudget.expenses || []));

        // Calculate Total Allocated Budget
        const totalAllocated = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        if (allocatedBudgetEl) allocatedBudgetEl.textContent = formatMWK(totalAllocated);

        // Render Allocations Table Body
        if (allocationsTableBody) {
            if (items.length === 0) {
                allocationsTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--ink-soft); padding: 24px;">No allocation categories found.</td>
                    </tr>
                `;
            } else {
                allocationsTableBody.innerHTML = items.map(item => {
                    const allocated = Number(item.amount) || 0;
                    const spent = 0; // Initial spent
                    const remaining = allocated - spent;
                    const statusText = currentBudget.status === 'approved' ? 'Approved' : 'Draft';
                    const badgeClass = currentBudget.status === 'approved' ? 'badge-active' : 'badge-locked';

                    return `
                        <tr>
                            <td><strong>${item.name || 'Category'}</strong></td>
                            <td class="mono">${formatMWK(allocated)}</td>
                            <td class="mono">${formatMWK(spent)}</td>
                            <td class="mono">${formatMWK(remaining)}</td>
                            <td><span class="badge ${badgeClass}">${statusText}</span></td>
                        </tr>
                    `;
                }).join('');
            }
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (dashboardSubEl) dashboardSubEl.textContent = 'Error loading backend data.';
        if (allocationsTableBody) {
            allocationsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--danger); padding: 24px;">
                        Unable to connect to server backend. Please ensure the server is running.
                    </td>
                </tr>
            `;
        }
    }
});
