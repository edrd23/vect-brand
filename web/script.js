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

    // ═══════ REVEAL ANIMATIONS ═══════
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

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
