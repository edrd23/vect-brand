document.addEventListener('DOMContentLoaded', () => {
    const htmlRoot = document.documentElement;
    const langBtns = document.querySelectorAll('.lang-btn');
    const initialLang = localStorage.getItem('vect_lang');
    const lang = initialLang === 'en' ? 'en' : 'it';

    const labels = {
        sending: {
            it: 'Invio in corso...',
            en: 'Sending...'
        },
        success: {
            it: 'Richiesta inviata con successo. Ti risponderemo entro 24 ore.',
            en: 'Request sent successfully. We will reply within 24 hours.'
        },
        error: {
            it: 'Invio non riuscito. Puoi usare il link email qui sotto.',
            en: 'Submission failed. You can use the email link below.'
        },
        fallback: {
            it: 'Apri email',
            en: 'Open email'
        }
    };

    function currentLang() {
        return htmlRoot.getAttribute('lang') === 'en' ? 'en' : 'it';
    }

    function setLang(nextLang) {
        htmlRoot.setAttribute('lang', nextLang);
        langBtns.forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-lang') === nextLang);
        });
        localStorage.setItem('vect_lang', nextLang);
    }

    setLang(lang);

    langBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const nextLang = btn.getAttribute('data-lang');
            setLang(nextLang === 'en' ? 'en' : 'it');
        });
    });

    // ═══════ STICKY NAVBAR ═══════
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 80);
        }, { passive: true });
    }

    // ═══════ CURSOR GLOW ═══════
    window.addEventListener('mousemove', (e) => {
        htmlRoot.style.setProperty('--mouse-x', `${e.clientX}px`);
        htmlRoot.style.setProperty('--mouse-y', `${e.clientY}px`);
    }, { passive: true });

    // ═══════ REVEAL ANIMATIONS ═══════
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -20px 0px'
        });

        revealElements.forEach((el) => revealObserver.observe(el));
    } else {
        revealElements.forEach((el) => el.classList.add('active'));
    }

    // ═══════ TYPEWRITER EFFECT ═══════
    const typeElements = document.querySelectorAll('.type-tech');

    function typeContent(target, text, speed) {
        let i = 0;
        target.textContent = '';
        function iterate() {
            if (i >= text.length) {
                return;
            }
            target.textContent += text.charAt(i);
            i += 1;
            setTimeout(iterate, speed);
        }
        iterate();
    }

    function startTyping(el) {
        if (el.classList.contains('typed')) {
            return;
        }
        el.classList.add('typed');

        const activeLang = currentLang();
        const itSpan = el.querySelector('.it-text');
        const enSpan = el.querySelector('.en-text');

        if (itSpan && enSpan) {
            const targetSpan = activeLang === 'it' ? itSpan : enSpan;
            const content = targetSpan.textContent;
            targetSpan.textContent = '';
            setTimeout(() => typeContent(targetSpan, content, 20), 600);
            return;
        }

        if (!itSpan) {
            const content = el.textContent;
            el.textContent = '';
            setTimeout(() => typeContent(el, content, 20), 600);
        }
    }

    if ('IntersectionObserver' in window) {
        const typeObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                startTyping(entry.target);
                typeObserver.unobserve(entry.target);
            });
        }, { threshold: 0.1 });

        typeElements.forEach((el) => typeObserver.observe(el));
    } else {
        typeElements.forEach(startTyping);
    }

    // ═══════ MOBILE MENU ═══════
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navItems.forEach((item) => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ═══════ TACTICAL METER ANIMATION (STATIC LOCATION) ═══════
    const meterBars = document.querySelectorAll('.meter-bars .bar');
    const locId = document.querySelector('.loc-id');
    const statusLabel = document.querySelector('.status');
    const dynamicLabels = document.querySelectorAll('[data-dynamic-location]');

    if (dynamicLabels.length > 0) {
        dynamicLabels.forEach((el) => {
            el.textContent = 'MILAN, IT';
            el.style.color = 'var(--vect-accent)';
        });
    }
    if (locId) {
        locId.textContent = 'MILAN, IT';
    }
    if (statusLabel) {
        statusLabel.textContent = 'LOCAL NODE ACTIVE';
    }

    let meterIntervalId = null;
    if (meterBars.length > 0) {
        meterIntervalId = window.setInterval(() => {
            meterBars.forEach((bar) => {
                const height = 60 + Math.floor(Math.random() * 40);
                bar.style.height = `${height}%`;
                bar.style.background = 'var(--vect-accent)';
            });
        }, 200);
    }

    // ═══════ MISSION UPTIME ═══════
    const uptimeEl = document.querySelector('.uptime');
    if (uptimeEl) {
        const startedAt = Date.now();
        window.setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAt) / 1000);
            const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const ss = String(elapsed % 60).padStart(2, '0');
            uptimeEl.textContent = `${hh}:${mm}:${ss}`;
        }, 1000);
    }

    window.addEventListener('beforeunload', () => {
        if (meterIntervalId !== null) {
            window.clearInterval(meterIntervalId);
        }
    });

    // ═══════ PWA SERVICE WORKER ═══════
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch((err) => {
                console.log('VECT SW registration failed:', err);
            });
        });
    }

    // ═══════ FORM HANDLING (PRODUCTION) ═══════
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('form-status');
    const formBtn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
    const endpoint = 'https://formsubmit.co/ajax/info@vect-rf.com';

    function text(key) {
        return labels[key][currentLang()];
    }

    function setFormStatus(type, message) {
        if (!formStatus) {
            return;
        }
        formStatus.className = `form-status ${type}`;
        formStatus.textContent = message;
    }

    function mailtoFallback(formData) {
        const subject = encodeURIComponent(`VECT RF Request - ${formData.name}`);
        const body = encodeURIComponent(
            `Name/Company: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        return `mailto:info@vect-rf.com?subject=${subject}&body=${body}`;
    }

    if (contactForm && formBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            const trap = contactForm.querySelector('input[name="_honey"]');
            if (trap && trap.value.trim() !== '') {
                return;
            }

            const formData = {
                name: String(contactForm.querySelector('#name')?.value || '').trim(),
                email: String(contactForm.querySelector('#email')?.value || '').trim(),
                message: String(contactForm.querySelector('#message')?.value || '').trim(),
                _subject: 'Nuova richiesta dal sito VECT',
                _captcha: 'false'
            };

            const originalBtnLabel = formBtn.innerHTML;
            formBtn.disabled = true;
            formBtn.textContent = text('sending');
            setFormStatus('pending', text('sending'));

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json().catch(() => ({}));
                if (result.success === false || result.success === 'false') {
                    throw new Error('Provider rejected request');
                }

                contactForm.reset();
                setFormStatus('success', text('success'));
            } catch (error) {
                setFormStatus('error', text('error'));
                if (formStatus) {
                    const fallbackLink = document.createElement('a');
                    fallbackLink.href = mailtoFallback(formData);
                    fallbackLink.className = 'form-fallback-link';
                    fallbackLink.textContent = text('fallback');
                    formStatus.appendChild(document.createTextNode(' '));
                    formStatus.appendChild(fallbackLink);
                }
            } finally {
                formBtn.disabled = false;
                formBtn.innerHTML = originalBtnLabel;
            }
        });
    }
});
