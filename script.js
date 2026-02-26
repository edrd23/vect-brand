/* ═══════════════════════════════════════════
   VECT — INTERACTIVE ENGINE
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════ CURSOR GRADIENT TRACKING ═══════
    document.addEventListener('mousemove', e => {
        const x = e.clientX + 'px';
        const y = e.clientY + 'px';
        document.documentElement.style.setProperty('--mouse-x', x);
        document.documentElement.style.setProperty('--mouse-y', y);
    });

    // ═══════ DYNAMIC LOCATION SCANNER ═══════
    const locElement = document.querySelector('[data-dynamic-location]');
    const locIdElement = document.querySelector('.loc-id');

    async function updateLocation() {
        try {
            // Priority 1: High Fidelity IP Geolocation
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data.city && data.country_code) {
                const locString = `${data.city}, ${data.country_code}`;
                locElement.textContent = locString;
                locIdElement.textContent = data.city.toUpperCase();
            }
        } catch (err) {
            // Failover: Default HQ
            locElement.textContent = 'Milan, IT';
            locIdElement.textContent = 'MILAN HQ';
        }
    }
    updateLocation();

    // ═══════ SCROLL REVEAL ENGINE ═══════
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ═══════ NAV SCROLL EFFECT ═══════
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // ═══════ TACTICAL METER ANIMATION ═══════
    const bars = document.querySelectorAll('.meter-bars .bar');
    const uptimeElement = document.querySelector('.uptime');
    let startTime = Date.now();

    function updateMeter() {
        bars.forEach(bar => {
            const h = Math.floor(Math.random() * 10) + 2;
            bar.style.height = `${h}px`;
            // Color shift based on signal strength
            if (h < 4) bar.style.background = 'var(--vect-error)';
            else if (h < 7) bar.style.background = 'var(--vect-warning)';
            else bar.style.background = 'var(--vect-success)';
        });

        // Update Uptime
        const diff = Date.now() - startTime;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        uptimeElement.textContent = `${h}:${m}:${s}`;

        requestAnimationFrame(updateMeter);
    }
    updateMeter();

    // ═══════ LANGUAGE SWITCHER ═══════
    const langBtns = document.querySelectorAll('.lang-btn');
    const body = document.body;

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            
            // UI Toggle
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Logic Toggle
            body.setAttribute('lang', lang);
            
            // Persist (Optional)
            localStorage.setItem('vect_lang', lang);
        });
    });

    // Load saved language
    const savedLang = localStorage.getItem('vect_lang');
    if (savedLang) {
        body.setAttribute('lang', savedLang);
        langBtns.forEach(b => {
            if (b.dataset.lang === savedLang) b.classList.add('active');
            else b.classList.remove('active');
        });
    } else {
        body.setAttribute('lang', 'it'); // Default
    }

    // ═══════ MOBILE MENU TOGGLE ═══════
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                body.style.overflow = 'auto';
            });
        });
    }

    // ═══════ FORM HANDLING ═══════
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = body.getAttribute('lang') === 'it' ? 'INVIO IN CORSO...' : 'SENDING...';

            // Simulate send
            setTimeout(() => {
                btn.innerHTML = body.getAttribute('lang') === 'it' ? 'RICHIESTA INVIATA ✓' : 'REQUEST SENT ✓';
                btn.style.background = 'var(--vect-success)';
                contactForm.reset();
            }, 1500);
        });
    }
});
