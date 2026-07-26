// Release Schedule Logic
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const setupMode = urlParams.get('setup') === 'true';
    let budgetId = urlParams.get('budgetId') || localStorage.getItem('currentBudgetId');

    const setupSection = document.getElementById('setupSection');
    const viewSection = document.getElementById('viewSection');
    const loadingSection = document.getElementById('loadingSection');
    const loadingMessage = document.getElementById('loadingMessage');

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function showOnly(section) {
        setupSection.style.display = 'none';
        viewSection.style.display = 'none';
        loadingSection.style.display = 'none';
        section.style.display = 'block';
    }

    // VIEW MODE: show existing locked budget schedule 
    async function showViewMode() {
        try {
            const data = await fetchLockedBudget();
            showOnly(viewSection);

            const totalEl = document.getElementById('viewTotalLocked');
            const tbody = document.getElementById('scheduleViewBody');

            if (totalEl) totalEl.textContent = formatMWK(data.lockedAmount);

            if (!data.releases || data.releases.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--ink-soft);">No scheduled releases found.</td></tr>`;
                return;
            }

            tbody.innerHTML = data.releases.map(release => {
                const date = release.releaseDate ? new Date(release.releaseDate).toLocaleDateString('en-GB') : '—';
                const statusClass = release.released ? 'badge-released' : 'badge-pending';
                const statusText = release.released ? 'Released' : 'Scheduled';

                return `
                    <tr>
                        <td><strong>${release.category}</strong></td>
                        <td class="mono">${formatMWK(release.amount)}</td>
                        <td class="mono">${date}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    </tr>
                `;
            }).join('');

        } catch (err) {
            // No locked budget yet - check if we should offer setup
            if (setupMode) {
                await showSetupMode();
            } else {
                showOnly(loadingSection);
                loadingMessage.innerHTML = `
                    No active lock schedule found. 
                    ${budgetId ? `<a href="release-schedule.html?setup=true&budgetId=${budgetId}" style="color:var(--green);">Set up release dates &rarr;</a>` : ''}
                `;
            }
        }
    }

    // user sets withdrawal dates before locking 
    async function showSetupMode() {
        try {
            const res = await fetchBudgets();
            const budgets = res.budgets || [];

            let targetBudget = null;
            if (budgetId) {
                targetBudget = budgets.find(b => b._id === budgetId);
            }
            if (!targetBudget) {
                targetBudget = budgets.find(b => b.status === 'approved');
            }
            if (!targetBudget) {
                showOnly(loadingSection);
                loadingMessage.innerHTML = `No approved budget found. <a href="approval.html" style="color:var(--green);">Go to Approval &rarr;</a>`;
                return;
            }

            budgetId = targetBudget._id;
            const monthlyAmount = targetBudget.monthlyAmount || 0;

            // Use finalPlan, then aiPlan.recommendedBudget, then expenses
            const items = targetBudget.finalPlan?.length
                ? targetBudget.finalPlan
                : (targetBudget.aiPlan?.recommendedBudget?.length
                    ? targetBudget.aiPlan.recommendedBudget
                    : (targetBudget.expenses || []));

            if (items.length === 0) {
                showOnly(loadingSection);
                loadingMessage.textContent = 'No budget items found. Please complete the budget creation process first.';
                return;
            }

            showOnly(setupSection);

            const totalRequiredEl = document.getElementById('setupTotalRequired');
            const totalEnteredEl = document.getElementById('setupTotalEntered');
            const tbody = document.getElementById('scheduleSetupBody');
            const messageEl = document.getElementById('scheduleFormMessage');

            if (totalRequiredEl) totalRequiredEl.textContent = formatMWK(monthlyAmount);

            // Recalculate running total on input
            function updateTotal() {
                const amountInputs = tbody.querySelectorAll('.schedule-amount');
                let sum = 0;
                amountInputs.forEach(inp => sum += Number(inp.value) || 0);
                if (totalEnteredEl) {
                    totalEnteredEl.textContent = formatMWK(sum);
                    totalEnteredEl.style.color = sum === monthlyAmount ? 'var(--green)' : 'var(--danger)';
                }
                return sum;
            }

            // Render rows - one per budget item
            tbody.innerHTML = items.map((item, idx) => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>
                        <input
                            type="number"
                            class="schedule-amount"
                            data-idx="${idx}"
                            value="${item.amount}"
                            min="0"
                            step="0.01"
                            required
                        >
                    </td>
                    <td>
                        <input
                            type="date"
                            class="schedule-date"
                            data-idx="${idx}"
                            required
                        >
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.schedule-amount').forEach(inp => {
                inp.addEventListener('input', updateTotal);
            });

            updateTotal();

            // Form submit - build releases array and POST to backend
            const form = document.getElementById('scheduleForm');
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const currentSum = updateTotal();
                if (currentSum !== monthlyAmount) {
                    messageEl.style.color = 'var(--danger)';
                    messageEl.textContent = `Total scheduled (${formatMWK(currentSum)}) must equal budget total (${formatMWK(monthlyAmount)}).`;
                    return;
                }

                const rows = tbody.querySelectorAll('tr');
                const releases = [];
                let valid = true;

                rows.forEach((row, idx) => {
                    const amountInput = row.querySelector('.schedule-amount');
                    const dateInput = row.querySelector('.schedule-date');
                    const categoryName = items[idx]?.name || `Item ${idx + 1}`;

                    if (!dateInput.value) {
                        valid = false;
                        dateInput.style.borderColor = 'var(--danger)';
                        return;
                    }

                    releases.push({
                        category: categoryName,
                        amount: Number(amountInput.value),
                        releaseDate: dateInput.value
                    });
                });

                if (!valid) {
                    messageEl.style.color = 'var(--danger)';
                    messageEl.textContent = 'Please set a withdrawal date for every category.';
                    return;
                }

                const submitBtn = form.querySelector('button[type="submit"]');
                const origText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Locking budget...';
                messageEl.style.color = 'var(--ink)';
                messageEl.textContent = 'Saving schedule and locking budget...';

                try {
                    await lockBudget(budgetId, releases);

                    messageEl.style.color = 'var(--green)';
                    messageEl.textContent = 'Budget locked successfully! Redirecting...';

                    localStorage.removeItem('currentBudgetId');

                    setTimeout(() => {
                        window.location.href = 'release-schedule.html';
                    }, 1200);

                } catch (err) {
                    messageEl.style.color = 'var(--danger)';
                    messageEl.textContent = err.message || 'Failed to lock budget.';
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = origText;
                }
            });

        } catch (err) {
            console.error('Setup mode error:', err);
            showOnly(loadingSection);
            loadingMessage.style.color = 'var(--danger)';
            loadingMessage.textContent = 'Error loading budget. Please try again.';
        }
    }

    // ENTRY POINT 
    if (setupMode) {
        await showSetupMode();
    } else {
        await showViewMode();
    }
});
