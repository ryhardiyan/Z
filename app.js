// Updated app.js

// Remove unused STATUS_API_URL variable

// Select DOM elements with null checks
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshBtn');
    if (!refreshBtn) return; // Null check for refreshBtn
    
    refreshBtn.addEventListener('click', () => {
        try {
            // Handle refresh
            console.log('Refresh button clicked');
            // Add your refresh logic here
        } catch (error) {
            console.error('Error handling refresh button:', error);
        }
    });
});

// Set locale for Jakarta timezone consistency
const options = { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
const formattedTime = new Intl.DateTimeFormat('id-ID', options).format(new Date());
console.log('Current time in Jakarta:', formattedTime);