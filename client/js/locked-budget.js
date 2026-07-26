document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const lockRulesCountEl = document.getElementById('lockRulesCount');
    const totalLockedAmountEl = document.getElementById('totalLockedAmount');
    const lockedRulesBodyEl = document.getElementById('lockedRulesBody');

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
        const data = await fetchLockedBudget();

        // Update total locked amount
        if (totalLockedAmountEl) {
            totalLockedAmountEl.textContent = formatMWK(data.totalLockedAmount);
        }

        const container = document.getElementById('lockedBudgetsContainer');
        if (!container) return;

        if (!data.lockedBudgets || data.lockedBudgets.length === 0) {
            if (lockRulesCountEl) {
                lockRulesCountEl.textContent = 'Protected across 0 active lock rules';
            }
            container.innerHTML = `<div style="text-align: center; color: var(--ink-soft); padding: 24px;">No locked funds found.</div>`;
            return;
        }

        let totalRules = 0;
        let html = '';

        data.lockedBudgets.forEach(lb => {
            if (lb.releases) {
                totalRules += lb.releases.length;
            }

            const budgetTitle = lb.budget?.monthlyAmount 
                ? `Budget (${formatMWK(lb.budget.monthlyAmount)})` 
                : `Budget Plan`;
            const dateStr = lb.createdAt ? new Date(lb.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

            html += `
                <div class="budget-block" style="background: var(--paper); border: 1px solid var(--rule); border-radius: var(--radius); margin-bottom: 24px; overflow: hidden;">
                    <div style="background: var(--paper-raised); padding: 16px; border-bottom: 1px solid var(--rule); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="font-size: 1.1rem; margin: 0;">${budgetTitle}</h3>
                            <div style="font-size: 0.85rem; color: var(--ink-soft); margin-top: 4px;">Created: ${dateStr}</div>
                        </div>
                        <div class="mono" style="color: var(--gold); font-weight: 600;">Total Locked: ${formatMWK(lb.lockedAmount)}</div>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--rule); font-size: 0.85rem; color: var(--ink-soft);">Lock Vault / Target</th>
                                <th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--rule); font-size: 0.85rem; color: var(--ink-soft);">Locked Amount</th>
                                <th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--rule); font-size: 0.85rem; color: var(--ink-soft);">Withdrawal Date</th>
                                <th style="text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--rule); font-size: 0.85rem; color: var(--ink-soft);">Status</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (lb.releases && lb.releases.length > 0) {
                html += lb.releases.map(release => {
                    const rDate = release.releaseDate ? new Date(release.releaseDate).toLocaleDateString('en-GB') : 'Indefinite';
                    let statusText = 'Time Locked';
                    let statusColor = 'var(--ink-soft)';
                    
                    if (release.released) {
                        statusText = 'Released';
                        statusColor = 'var(--green)';
                    }
                    
                    const available = release.amount - (release.withdrawnAmount || 0);
                    if (release.released && available <= 0) {
                        statusText = 'Withdrawn';
                        statusColor = 'var(--ink-soft)';
                    }

                    return `
                        <tr>
                            <td style="padding: 12px 16px; border-bottom: 1px solid var(--rule);"><strong>${release.category}</strong></td>
                            <td class="mono" style="padding: 12px 16px; border-bottom: 1px solid var(--rule);">${formatMWK(release.amount)}</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid var(--rule);">${rDate}</td>
                            <td style="padding: 12px 16px; border-bottom: 1px solid var(--rule);"><span style="color: ${statusColor}; font-size: 0.85rem;">${statusText}</span></td>
                        </tr>
                    `;
                }).join('');
            } else {
                html += `<tr><td colspan="4" style="text-align: center; padding: 16px; color: var(--ink-soft);">No rules for this budget</td></tr>`;
            }

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });

        if (lockRulesCountEl) {
            lockRulesCountEl.textContent = `Protected across ${totalRules} active lock rules`;
        }

        container.innerHTML = html;

    } catch (err) {
        console.error('Error fetching locked budget:', err);
        if (lockRulesCountEl) {
            lockRulesCountEl.textContent = 'Failed to load data';
        }
        const container = document.getElementById('lockedBudgetsContainer');
        if (container) {
            container.innerHTML = `<div style="text-align: center; color: var(--danger); padding: 24px;">Failed to load locked funds. Ensure you have an active locked budget.</div>`;
        }
    }
});
