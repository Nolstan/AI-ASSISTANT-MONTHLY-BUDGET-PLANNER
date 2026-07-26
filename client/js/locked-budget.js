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
            totalLockedAmountEl.textContent = formatMWK(data.lockedAmount);
        }

        if (!data.releases || data.releases.length === 0) {
            if (lockRulesCountEl) {
                lockRulesCountEl.textContent = 'Protected across 0 active lock rules';
            }
            if (lockedRulesBodyEl) {
                lockedRulesBodyEl.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--ink-soft); padding: 24px;">No locked funds found.</td></tr>`;
            }
            return;
        }

        // Count pending (locked) releases vs total releases, or just show total releases count
        if (lockRulesCountEl) {
            lockRulesCountEl.textContent = `Protected across ${data.releases.length} active lock rules`;
        }

        // Render locked rules table
        if (lockedRulesBodyEl) {
            lockedRulesBodyEl.innerHTML = data.releases.map(release => {
                const date = release.releaseDate ? new Date(release.releaseDate).toLocaleDateString('en-GB') : 'Indefinite';
                let statusText = 'Time Locked';
                let statusColor = 'var(--ink-soft)';
                
                if (release.released) {
                    statusText = 'Released';
                    statusColor = 'var(--green)';
                }

                return `
                    <tr>
                        <td><strong>${release.category}</strong></td>
                        <td class="mono">${formatMWK(release.amount)}</td>
                        <td>${date}</td>
                        <td><span style="color: ${statusColor}; font-size: 0.85rem;">${statusText}</span></td>
                    </tr>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Error fetching locked budget:', err);
        if (lockRulesCountEl) {
            lockRulesCountEl.textContent = 'Failed to load data';
        }
        if (lockedRulesBodyEl) {
            lockedRulesBodyEl.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load locked funds. Ensure you have an active locked budget.</td></tr>`;
        }
    }
});
