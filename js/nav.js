/**
 * VECT — Navigation Module
 * Responsibilities: Mobile menu, language switcher, sticky nav, scroll spy
 * (Extracted from script.js)
 */

export function initNavigation() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const htmlRoot = document.documentElement;
    const nav = document.querySelector('nav');

    // Language Switcher
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            htmlRoot.setAttribute('lang', lang);
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('vect_lang', lang);

            // Update aria-labels for split-text elements
            document.querySelectorAll('[data-label-it]').forEach(el => {
                const newLabel = el.getAttribute(`data-label-${lang}`);
                if (newLabel) el.setAttribute('aria-label', newLabel);
            });
        });
    });

    const currentLang = localStorage.getItem('vect_lang') || 'it';
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    if (activeBtn) activeBtn.click();

    // Sticky Navbar & ScrollSpy
    const sections = document.querySelectorAll('section');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);

        // ScrollSpy logic
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // Mobile Hamburger
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                menuToggle.focus();
            }
        });
    }
}
