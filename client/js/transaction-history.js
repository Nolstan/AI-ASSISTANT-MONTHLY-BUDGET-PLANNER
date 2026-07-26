document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const tbody = document.getElementById('transactionsBody');

    function formatMWK(num) {
        return `MWK ${(Number(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    try {
        const data = await fetchTransactions();
        
        if (!data.transactions || data.transactions.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--ink-soft); padding: 24px;">No transactions found.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.transactions.map(txn => {
            const dateObj = new Date(txn.createdAt || txn.date);
            const dateStr = dateObj.toLocaleDateString('en-GB') || '—';
            
            // Format amounts and badges based on transaction type
            const isDeposit = txn.type === 'DEPOSIT' || txn.type === 'INCOME';
            
            let amountStr = '';
            let amountStyle = '';
            let badgeHtml = '';

            if (isDeposit) {
                amountStr = `+${formatMWK(txn.amount)}`;
                amountStyle = 'color: var(--green);';
                badgeHtml = `<span class="badge" style="border-color: var(--green); color: var(--green);">Deposit</span>`;
            } else {
                // E.g. WITHDRAWAL or EXPENSE
                amountStr = `-${formatMWK(txn.amount)}`;
                amountStyle = 'color: var(--danger);';
                badgeHtml = `<span class="badge">Expense</span>`;
            }

            return `
                <tr>
                    <td>${dateStr}</td>
                    <td>${txn.description || '—'}</td>
                    <td>${txn.category || '—'}</td>
                    <td>${badgeHtml}</td>
                    <td class="mono" style="${amountStyle}">${amountStr}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error fetching transactions:', error);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger); padding: 24px;">Failed to load transactions.</td></tr>`;
    }
});
