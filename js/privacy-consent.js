/**
 * VECT — GDPR Privacy Notice Controller
 * Extracted from index.html lines 713-730
 * Purpose: Show/hide privacy consent banner using localStorage
 */
(function () {
    var notice = document.getElementById('privacy-notice');
    var closeBtn = document.getElementById('privacy-notice-close');

    if (notice && closeBtn) {
        // Check if user already consented
        if (!localStorage.getItem('vect_privacy_ack')) {
            // Show banner with slight delay for smooth entrance
            setTimeout(function () {
                notice.style.transform = 'translateY(0)';
            }, 600);
        } else {
            // Hide permanently if already acknowledged
            notice.style.display = 'none';
        }

        // Close button handler
        closeBtn.addEventListener('click', function () {
            notice.style.transform = 'translateY(100%)';
            localStorage.setItem('vect_privacy_ack', '1');

            // Remove from DOM after transition
            setTimeout(function () {
                notice.style.display = 'none';
            }, 300);
        });
    }
})();
