document.addEventListener('DOMContentLoaded', () => {
    const letters = document.querySelectorAll('.letter');
    const vPath = document.getElementById('v-path');
    const status = document.querySelector('.value');

    // Simple entry animation
    setTimeout(() => {
        vPath.style.opacity = '1';
        letters.forEach((l, i) => {
            setTimeout(() => l.style.opacity = '1', (i + 1) * 200);
        });
        
        setTimeout(() => {
            status.textContent = "SIGNAL ESTABLISHED // READY";
            status.style.color = "#FF6B1A";
        }, 1200);
    }, 500);
});
