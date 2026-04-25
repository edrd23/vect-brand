/**
 * VECT — Animations & Interactions Module
 * Responsibilities: Reveal on scroll, spotlight effect, text scramble, magnetic buttons, counters
 * (Extracted from script.js)
 */

export function initAnimations() {
    /* ═══════ SNAPPY REVEAL SYSTEM ═══════ */
    const setupReveal = () => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Snappy sequence for children if needed
                    if (entry.target.hasAttribute('data-reveal-group')) {
                        entry.target.querySelectorAll('.reveal-item').forEach((item, index) => {
                            setTimeout(() => item.classList.add('active'), index * 60);
                        });
                    }
                }
            });
        }, observerOptions);
        // Include ALL reveal types
        document.querySelectorAll('[data-reveal], [data-reveal-group], .reveal, .reveal-premium').forEach(el => revealObserver.observe(el));
    };

    const setupSpotlight = () => {
        const spotlights = document.querySelectorAll('.spotlight-container');
        spotlights.forEach(container => {
            const overlay = document.createElement('div');
            overlay.className = 'spotlight-overlay';
            container.appendChild(overlay);

            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                container.style.setProperty('--mouse-x', `${x}px`);
                container.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    };

    setupReveal();
    setupSpotlight();

    // ═══════ ANIMATED COUNTERS (SPECTERA) ═══════
    const statValues = document.querySelectorAll('.spectera-stats .stat-value');
    if (statValues.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('counted')) return;
                    entry.target.classList.add('counted');

                    const originalHTML = entry.target.innerHTML;
                    const smallTagStart = originalHTML.indexOf('<small>');
                    let numStr = originalHTML;
                    let smallStr = '';
                    if (smallTagStart !== -1) {
                        numStr = originalHTML.substring(0, Math.max(0, smallTagStart));
                        smallStr = originalHTML.substring(smallTagStart);
                    }

                    const targetValue = parseFloat(numStr);
                    if (isNaN(targetValue)) return; // Failsafe

                    const hasDecimals = numStr.includes('.');
                    const duration = 1500;
                    const start = performance.now();

                    const animate = (time) => {
                        const elapsed = time - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOut = 1 - Math.pow(1 - progress, 4); // easeOutQuart

                        let current = targetValue * easeOut;
                        if (!hasDecimals) current = Math.floor(current);
                        else current = current.toFixed(1);

                        entry.target.innerHTML = current + smallStr;

                        if (progress < 1) requestAnimationFrame(animate);
                        else entry.target.innerHTML = targetValue + smallStr;
                    };
                    requestAnimationFrame(animate);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(val => observer.observe(val));
    }

    // ═══════ MAGNETIC BUTTONS ═══════
    const magneticBtns = document.querySelectorAll('.btn-primary');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });

    // ═══════ SECTION GLOW ═══════
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        title.addEventListener('mouseenter', () => {
            if (isTouchDevice()) return;
            title.style.textShadow = '0 0 15px rgba(255, 107, 26, 0.3)';
        });
        title.addEventListener('mouseleave', () => {
            title.style.textShadow = 'none';
        });
    });

    // ═══════ TEXT SCRAMBLE CLASS ═══════
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span class="mono" style="opacity:0.3">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }

    // ═══════ SPLIT TEXT UTILITY ═══════
    const splitText = (el) => {
        const it = el.querySelector('.it-text');
        const en = el.querySelector('.en-text');

        if (it && en) {
            el.setAttribute('data-label-it', it.innerText);
            el.setAttribute('data-label-en', en.innerText);

            // Initial accessibility label based on current html lang
            const currentLang = document.documentElement.getAttribute('lang') || 'it';
            el.setAttribute('aria-label', currentLang === 'en' ? en.innerText : it.innerText);
        }

        [it, en].forEach(side => {
            if (!side) return;
            const text = side.innerText;
            side.setAttribute('aria-hidden', 'true');

            side.innerHTML = text.split('').map((char, i) =>
                `<span class="char-wrap"><span class="char" style="transition-delay: ${i * 0.025}s">${char === ' ' ? '&nbsp;' : char}</span></span>`
            ).join('');
        });
    };

    document.querySelectorAll('.section-title, .section-label').forEach(splitText);

    // ═══════ BUTTON & NAV INTERACTORS ═══════
    const interactables = document.querySelectorAll('.btn, .nav-links a');
    interactables.forEach(el => {
        if (el.classList.contains('btn')) el.classList.add('btn-spotlight');

        const originalTextIt = el.querySelector('.it-text')?.innerText || '';
        const originalTextEn = el.querySelector('.en-text')?.innerText || '';

        const scramblerIt = el.querySelector('.it-text') ? new TextScramble(el.querySelector('.it-text')) : null;
        const scramblerEn = el.querySelector('.en-text') ? new TextScramble(el.querySelector('.en-text')) : null;

        el.addEventListener('mouseenter', () => {
            if (isTouchDevice()) return; // Skip on mobile
            if (scramblerIt) scramblerIt.setText(originalTextIt);
            if (scramblerEn) scramblerEn.setText(originalTextEn);
        });

        if (el.classList.contains('btn') && !isTouchDevice()) {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                el.style.setProperty('--m-x', `${x}px`);
                el.style.setProperty('--m-y', `${y}px`);
            });
        }
    });

    // ═══════ MAGNETIC ENHANCEMENT (Desktop Only) ═══════
    if (!isTouchDevice()) {
        const magneticBtns = document.querySelectorAll('.btn');
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
                btn.style.transform = `translate(${x}px, ${y}px)`;
                const spans = btn.querySelectorAll('span');
                spans.forEach(span => {
                    if (!span.classList.contains('it-text') && !span.classList.contains('en-text') && !span.classList.contains('char')) {
                        span.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
                    }
                });
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }
}

// Helper: Touch device detection
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
