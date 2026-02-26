document.addEventListener('DOMContentLoaded', () => {
    /* ═══════ INTERACTIVE BACKGROUND ═══════ */
    const updateMousePos = (e) => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateMousePos);

    /* ═══════ NAVBAR SCROLL EFFECT ═══════ */
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    /* ═══════ REVEAL ON SCROLL ═══════ */
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        reveals.forEach(el => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    /* ═══════ LANGUAGE SWITCHER ═══════ */
    const langBtns = document.querySelectorAll('.lang-btn');
    const html = document.documentElement;

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-switch');
            html.setAttribute('lang', lang);

            // Update Active Class
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Save preference
            localStorage.setItem('vect-lang', lang);

            // Re-trigger typing if needed
            startTyping();
        });
    });

    // Load saved language
    const savedLang = localStorage.getItem('vect-lang');
    if (savedLang) {
        html.setAttribute('lang', savedLang);
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-switch') === savedLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /* ═══════ TACTICAL METER ANIMATION ═══════ */
    const bars = document.querySelectorAll('.meter-bars .bar');
    const freqDisplay = document.querySelector('.meter-data .freq');

    setInterval(() => {
        bars.forEach(bar => {
            const randHeight = Math.floor(Math.random() * 80) + 20;
            bar.style.height = `${randHeight}%`;
        });

        // Simulating Frequency Shift
        const baseFreq = 512.400;
        const shift = (Math.random() * 0.05).toFixed(3);
        freqDisplay.textContent = `${(baseFreq + parseFloat(shift)).toFixed(3)} MHz`;
    }, 150);

    /* ═══════ TYPING EFFECT ═══════ */
    const typeTech = document.querySelector('.type-tech');
    let typingInterval;

    function startTyping() {
        if (!typeTech) return;
        clearInterval(typingInterval);

        const currentLang = html.getAttribute('lang') || 'it';
        const itText = "OPERAZIONI RF AVANZATE";
        const enText = "ADVANCED RF OPERATIONS";
        const targetText = currentLang === 'it' ? itText : enText;

        typeTech.textContent = "";
        let i = 0;

        typingInterval = setInterval(() => {
            if (i < targetText.length) {
                typeTech.textContent += targetText.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                typeTech.classList.add('typed');
            }
        }, 80);
    }
    startTyping();
});
