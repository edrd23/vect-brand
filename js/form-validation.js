/**
 * VECT — Inline Form Validation
 * Real-time field validation with visual feedback.
 * Adds .field-valid / .field-invalid classes and error messages.
 */

const RULES = {
    name: {
        minLength: 2,
        maxLength: 100,
        pattern: null,
        messages: {
            it: { required: 'Nome richiesto.', minLength: 'Minimo 2 caratteri.' },
            en: { required: 'Name required.', minLength: 'Minimum 2 characters.' }
        }
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        messages: {
            it: { required: 'Email richiesta.', pattern: 'Formato email non valido.' },
            en: { required: 'Email required.', pattern: 'Invalid email format.' }
        }
    },
    phone: {
        pattern: /^[\d\s\+\-\(\)]{6,20}$/,
        required: false,
        messages: {
            it: { pattern: 'Numero non valido.' },
            en: { pattern: 'Invalid phone number.' }
        }
    },
    message: {
        minLength: 10,
        maxLength: 2000,
        messages: {
            it: { required: 'Messaggio richiesto.', minLength: 'Minimo 10 caratteri.', maxLength: 'Massimo 2000 caratteri.' },
            en: { required: 'Message required.', minLength: 'Minimum 10 characters.', maxLength: 'Maximum 2000 characters.' }
        }
    }
};

function getLang() {
    return document.documentElement.getAttribute('lang') || 'it';
}

function getErrorEl(input) {
    let err = input.parentElement.querySelector('.field-error-msg');
    if (!err) {
        err = document.createElement('span');
        err.className = 'field-error-msg';
        err.setAttribute('role', 'alert');
        err.setAttribute('aria-live', 'polite');
        input.parentElement.appendChild(err);
    }
    return err;
}

function setError(input, msg) {
    const err = getErrorEl(input);
    input.classList.remove('field-valid');
    input.classList.add('field-invalid');
    input.setAttribute('aria-invalid', 'true');
    err.textContent = msg;
    err.classList.add('visible');
}

function setValid(input) {
    const err = getErrorEl(input);
    input.classList.remove('field-invalid');
    input.classList.add('field-valid');
    input.setAttribute('aria-invalid', 'false');
    err.textContent = '';
    err.classList.remove('visible');
}

function clearState(input) {
    const err = getErrorEl(input);
    input.classList.remove('field-valid', 'field-invalid');
    input.removeAttribute('aria-invalid');
    err.textContent = '';
    err.classList.remove('visible');
}

function validateField(input) {
    const name = input.name;
    const value = input.value.trim();
    const lang = getLang();
    const rule = RULES[name];

    if (!rule) return true; // No rule = skip

    // Required check
    if (value === '') {
        if (rule.required === false) {
            clearState(input); // Optional field, cleared = OK
            return true;
        }
        const msg = rule.messages[lang]?.required || 'Campo obbligatorio.';
        setError(input, msg);
        return false;
    }

    // Pattern check
    if (rule.pattern && !rule.pattern.test(value)) {
        const msg = rule.messages[lang]?.pattern || 'Formato non valido.';
        setError(input, msg);
        return false;
    }

    // Min length check
    if (rule.minLength && value.length < rule.minLength) {
        const msg = rule.messages[lang]?.minLength || `Minimo ${rule.minLength} caratteri.`;
        setError(input, msg);
        return false;
    }

    // Max length check
    if (rule.maxLength && value.length > rule.maxLength) {
        const msg = rule.messages[lang]?.maxLength || `Massimo ${rule.maxLength} caratteri.`;
        setError(input, msg);
        return false;
    }

    setValid(input);
    return true;
}

function addCharCounter(textarea, maxLength) {
    if (!maxLength) return;
    let counter = textarea.parentElement.querySelector('.field-counter');
    if (!counter) {
        counter = document.createElement('span');
        counter.className = 'field-counter';
        counter.setAttribute('aria-live', 'off');
        textarea.parentElement.appendChild(counter);
    }
    const update = () => {
        const remaining = maxLength - textarea.value.length;
        counter.textContent = `${textarea.value.length}/${maxLength}`;
        counter.style.color = remaining < 50 ? 'var(--vect-warning)' : 'var(--vect-ash)';
    };
    textarea.addEventListener('input', update, { passive: true });
    update();
}

export function initFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Add .form-field wrapper class to field containers if not present
    ['name', 'email', 'phone', 'message'].forEach(fieldName => {
        const input = form.elements[fieldName];
        if (!input) return;

        // Add wrapper class for CSS targeting
        const parent = input.parentElement;
        if (!parent.classList.contains('form-field')) {
            parent.classList.add('form-field');
        }

        // Character counter for textarea
        if (input.tagName === 'TEXTAREA' && RULES[fieldName]?.maxLength) {
            addCharCounter(input, RULES[fieldName].maxLength);
        }

        // Validate on blur (not on every keystroke — less aggressive UX)
        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                validateField(input);
            }
        });

        // Validate on input (only after field was already touched/invalid)
        input.addEventListener('input', () => {
            if (input.classList.contains('field-invalid')) {
                validateField(input);
            }
        }, { passive: true });
    });

    // Full validation on submit attempt
    form.addEventListener('submit', (e) => {
        // Run validation on all fields before letting form.js handle submission
        const fields = ['name', 'email', 'phone', 'message'];
        let allValid = true;
        fields.forEach(name => {
            const input = form.elements[name];
            if (input && !validateField(input)) {
                allValid = false;
            }
        });
        // If invalid, stop propagation (form.js submit will be blocked by its own check anyway)
        if (!allValid) {
            e.stopImmediatePropagation();
        }
    }, true); // Capture phase: runs BEFORE form.js submit handler
}
