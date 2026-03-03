document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
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
    })



    // ═══════ STICKY NAVBAR & SCROLLSPY ═══════
    const nav = document.querySelector('nav');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            nav.classList.toggle('scrolled', currentScroll > 80);

            // ScrollSpy logic
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (currentScroll >= (sectionTop - 200)) { // Offset for navbar
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(currentSection)) {
                    link.classList.add('active');
                }
            });

        }, { passive: true });
    }

    // ═══════ MOBILE HAMBURGER ═══════
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileNavLinks = document.querySelector('.nav-links');

    if (menuToggle && mobileNavLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mobileNavLinks.classList.toggle('active');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNavLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNavLinks.classList.contains('active')) {
                mobileNavLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                menuToggle.focus();
            }
        });
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

    // Removed redundant mobile menu block. Already handled above.



    // ═══════ PWA SERVICE WORKER ═══════
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch((err) => {
                console.log('VECT SW registration failed:', err);
            });
        });
    }

    // FORM HANDLING - WEB3FORMS async POST
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const lang = document.documentElement.getAttribute('lang') || 'it';
            const originalHTML = btn.innerHTML;

            btn.innerHTML = lang === 'it' ? 'Invio in corso...' : 'Sending...';
            btn.disabled = true;

            // Robust FormData to JSON conversion
            const formData = new FormData(contactForm);
            const object = {};
            formData.forEach((value, key) => {
                object[key] = value;
            });
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                const result = await response.json();

                if (result.success) {
                    btn.innerHTML = lang === 'it' ? '✓ Richiesta inviata' : '✓ Request sent';
                    btn.style.background = 'var(--vect-success)';
                    contactForm.reset();
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 4000);
                } else {
                    // Show specific error message from API if available
                    btn.innerHTML = lang === 'it' ? `Errore: ${result.message || 'Server'}` : `Error: ${result.message || 'Server'}`;
                    btn.style.background = 'var(--vect-error)';
                    throw new Error(result.message || 'Server error');
                }
            } catch (err) {
                console.error('Submission error:', err);
                if (!btn.innerHTML.includes('Errore')) {
                    btn.innerHTML = lang === 'it' ? 'Errore di rete' : 'Network Error';
                    btn.style.background = 'var(--vect-error)';
                }
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 5000);
            }
        });
    }
});
