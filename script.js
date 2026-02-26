document.addEventListener('DOMContentLoaded', () => {
    // ═══════ LANGUAGE SWITCHER ═══════
    const langBtns = document.querySelectorAll('.lang-btn');
    const htmlRoot = document.documentElement;

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            htmlRoot.setAttribute('lang', lang);

            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Store preference
            localStorage.setItem('vect_lang', lang);
        });
    });

    // Check for stored language
    const currentLang = localStorage.getItem('vect_lang') || 'it';
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    if (activeBtn) activeBtn.click();

    // ═══════ STICKY NAVBAR ═══════
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ═══════ CURSOR GLOW ═══════
    const root = document.documentElement;
    window.addEventListener('mousemove', (e) => {
        root.style.setProperty('--mouse-x', e.clientX + 'px');
        root.style.setProperty('--mouse-y', e.clientY + 'px');
    });

    // ═══════ REVEAL ANIMATIONS ═══════
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                target.classList.add('active');
                revealObserver.unobserve(target); // Force unobserve for performance
            }
        });
    }, {
        threshold: 0.1, // Trigger earlier
        rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ═══════ TYPEWRITER EFFECT ═══════
    const typeElements = document.querySelectorAll('.type-tech');

    function typeContent(target, text, speed) {
        let i = 0;
        target.textContent = '';
        function iterate() {
            if (i < text.length) {
                target.textContent += text.charAt(i);
                i++;
                setTimeout(iterate, speed);
            }
        }
        iterate();
    }

    function startTyping(el) {
        if (el.classList.contains('typed')) return;
        el.classList.add('typed');

        // Only type the CURRENTLY VISIBLE language to save performance
        const currentLang = document.documentElement.getAttribute('lang') || 'it';
        const itSpan = el.querySelector('.it-text');
        const enSpan = el.querySelector('.en-text');

        if (itSpan && enSpan) {
            const targetSpan = currentLang === 'it' ? itSpan : enSpan;
            const otherSpan = currentLang === 'it' ? enSpan : itSpan;

            const content = targetSpan.textContent;
            targetSpan.textContent = '';

            // Just clear the other one so it doesn't "ghost" during typing
            otherSpan.textContent = otherSpan.textContent; // Keep structure

            // Wait until the section's opacity/transform transition is well underway
            setTimeout(() => typeContent(targetSpan, content, 20), 600);
        } else if (!el.querySelector('.it-text')) {
            // Simple technical text with no spans
            const text = el.textContent;
            el.textContent = '';
            setTimeout(() => typeContent(el, text, 20), 600);
        }
    }

    const typeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startTyping(entry.target);
                typeObserver.unobserve(entry.target); // Force unobserve for performance
            }
        });
    }, { threshold: 0.1 });

    typeElements.forEach(el => typeObserver.observe(el));

    // ═══════ MOBILE MENU ═══════
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ═══════ TACTICAL METER ANIMATION & GEO ═══════
    const meterBars = document.querySelectorAll('.meter-bars .bar');
    const locId = document.querySelector('.loc-id');
    const statusLabel = document.querySelector('.status');

    if (meterBars.length > 0) {
        // Initial random motion
        let meterInterval = setInterval(() => {
            meterBars.forEach(bar => {
                const height = Math.floor(Math.random() * 80);
                bar.style.height = `${Math.max(20, height)}%`;
            });
        }, 300);

        // Fetch Location based on IP
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data.city) {
                    const locationStr = `${data.city.toUpperCase()}, ${data.country_code}`;
                    
                    // Update all dynamic location placeholders
                    const dynamicLabels = document.querySelectorAll('[data-dynamic-location]');
                    dynamicLabels.forEach(el => {
                        el.textContent = locationStr;
                        el.style.color = 'var(--vect-accent)';
                    });

                    if (locId) locId.textContent = locationStr;
                    if (statusLabel) statusLabel.textContent = 'LOCAL NODE ACTIVE';

                    // Boost bars to show "Active Link"
                    clearInterval(meterInterval);
                    setInterval(() => {
                        meterBars.forEach(bar => {
                            const height = 60 + Math.floor(Math.random() * 40);
                            bar.style.height = `${height}%`;
                            bar.style.background = 'var(--vect-accent)';
                        });
                    }, 200);
                }
            })
            .catch(() => {
                const dynamicLabels = document.querySelectorAll('[data-dynamic-location]');
                dynamicLabels.forEach(el => el.textContent = 'MILAN, IT');
                if (locId) locId.textContent = 'GLOBAL NODE';
                if (statusLabel) statusLabel.textContent = 'REMOTE LINK';
            });
    }

    // ═══════ PWA SERVICE WORKER ═══════
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(registration => {
                console.log('VECT SW registered');
            }).catch(err => {
                console.log('VECT SW registration failed: ', err);
            });
        });
    }

    // ═══════ FORM HANDLING (DEBUG) ═══════
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;

            btn.innerHTML = '...';
            btn.disabled = true;

            setTimeout(() => {
                alert('Success / Successo - (Front-end Demo)');
                btn.innerHTML = originalText;
                btn.disabled = false;
                contactForm.reset();
            }, 1000);
        });
    }
});
