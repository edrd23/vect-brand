/**
 * VECT — Contact Form Handler
 * Responsibilities: Turnstile validation, form submission via API, error handling
 * (Extracted from script.js)
 */

export function initContactForm() {
    // ═══════ TURNSTILE STATE ═══════
    let turnstileVerified = false;
    let turnstileToken = '';

    // Global callbacks for Turnstile (must be on window)
    window.onTurnstileSuccess = function (token) {
        turnstileVerified = true;
        turnstileToken = token;
        const hiddenInput = document.getElementById('turnstileToken');
        if (hiddenInput) hiddenInput.value = token;
        const btn = document.getElementById('submitBtn');
        if (btn) btn.disabled = false;
    };

    window.onTurnstileExpired = function () {
        turnstileVerified = false;
        turnstileToken = '';
        const hiddenInput = document.getElementById('turnstileToken');
        if (hiddenInput) hiddenInput.value = '';
        const btn = document.getElementById('submitBtn');
        if (btn) btn.disabled = true;
    };

    window.onTurnstileError = function () {
        console.error('[VECT] Turnstile error occurred');
        const btn = document.getElementById('submitBtn');
        if (btn) btn.disabled = true;
    };

    // ═══════ FORM HANDLING — WEB3FORMS + TURNSTILE ═══════
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]') || submitBtn;
            const lang = document.documentElement.getAttribute('lang') || 'it';
            const originalHTML = btn.innerHTML;
            const formStatus = document.getElementById('form-status');

            // Validate Turnstile
            if (!turnstileVerified || !turnstileToken) {
                const errorMsg = lang === 'it' ? '⚠ Verifica umana richiesta' : '⚠ Human verification required';
                btn.innerHTML = errorMsg;
                btn.style.background = 'var(--vect-warning)';
                if (formStatus) formStatus.textContent = errorMsg;
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    if (formStatus) formStatus.textContent = '';
                }, 3000);
                return;
            }

            btn.innerHTML = lang === 'it' ? '<span class="vect-spinner"></span> Invio in corso...' : '<span class="vect-spinner"></span> Sending...';
            btn.disabled = true;
            btn.classList.add('loading');

            // Robust FormData to JSON conversion
            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => {
                if (key !== 'botcheck') object[key] = value;
            });

            // Add Turnstile token
            object['turnstile_token'] = turnstileToken;

            const json = JSON.stringify(object);

            try {
                // Use Vercel serverless proxy
                const response = await fetch('/api/submit-form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    const successMsg = lang === 'it' ? '✓ Richiesta completata' : '✓ Request completed';
                    showToast(successMsg, 'success');
                    btn.innerHTML = lang === 'it' ? '✓ Richiesta inviata' : '✓ Request sent';
                    btn.style.background = 'var(--vect-success)';
                    contactForm.reset();
                    if (formStatus) formStatus.textContent = successMsg;

                    // Reset Turnstile
                    turnstileVerified = false;
                    turnstileToken = '';
                    const hiddenInput = document.getElementById('turnstileToken');
                    if (hiddenInput) hiddenInput.value = '';
                    if (window.turnstile) window.turnstile.reset();

                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                        btn.disabled = false;
                        btn.classList.remove('loading');
                        if (formStatus) formStatus.textContent = '';
                    }, 4000);
                } else {
                    const errorMsg = lang === 'it' ? `Errore server: ${result.message}` : `Server Error: ${result.message}`;
                    showToast(errorMsg, 'error');
                    btn.innerHTML = errorMsg;
                    btn.style.background = 'var(--vect-error)';
                    if (formStatus) formStatus.textContent = errorMsg;
                    throw new Error(result.message || 'Server error');
                }
            } catch (err) {
                console.error('Submission error:', err);
                const errorMsg = lang === 'it' ? 'Si è verificato un errore di rete.' : 'A network error occurred.';
                showToast(errorMsg, 'error');
                if (!btn.innerHTML.includes('Errore') && !btn.innerHTML.includes('Error')) {
                    btn.innerHTML = lang === 'it' ? 'Errore di rete' : 'Network Error';
                    btn.style.background = 'var(--vect-error)';
                }
                if (formStatus) formStatus.textContent = errorMsg;
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.disabled = false;
                    btn.classList.remove('loading');
                    if (formStatus) formStatus.textContent = '';
                }, 5000);
            }
        });
    }
}

/**
 * Toast Notifications (kept here as it's form-related)
 */
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        });
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    Object.assign(toast.style, {
        background: type === 'success' ? '#0f1f12' : '#2a0a0a',
        border: `1px solid ${type === 'success' ? 'var(--vect-success, #28a745)' : 'var(--vect-error, #dc3545)'}`,
        borderLeft: `4px solid ${type === 'success' ? 'var(--vect-success, #28a745)' : 'var(--vect-error, #dc3545)'}`,
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        fontFamily: 'var(--vect-mono, monospace)',
        fontSize: '13px',
        lineHeight: '1.4',
        opacity: '0',
        transform: 'translateX(50px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    toast.innerHTML = message;

    container.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
