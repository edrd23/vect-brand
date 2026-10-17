// ═══════ TURNSTILE GLOBAL STATE & CALLBACKS ═══════
let turnstileVerified = false;
let turnstileToken = '';

function updateSubmitButtonState() {
    const submitBtn = document.getElementById('submitBtn');
    const privacyCheck = document.getElementById('privacyConsent');
    if (!submitBtn || submitBtn.classList.contains('loading')) return;

    const privacyOk = privacyCheck ? privacyCheck.checked : false;
    const turnstileOk = turnstileVerified && Boolean(turnstileToken);
    submitBtn.disabled = !(privacyOk && turnstileOk);
}

window.onTurnstileSuccess = function (token) {
    turnstileVerified = true;
    turnstileToken = token;
    const hiddenInput = document.getElementById('turnstileToken');
    if (hiddenInput) hiddenInput.value = token;
    updateSubmitButtonState();
};

window.onTurnstileExpired = function () {
    turnstileVerified = false;
    turnstileToken = '';
    const hiddenInput = document.getElementById('turnstileToken');
    if (hiddenInput) hiddenInput.value = '';
    updateSubmitButtonState();
};

window.onTurnstileError = function () {
    turnstileVerified = false;
    turnstileToken = '';
    const hiddenInput = document.getElementById('turnstileToken');
    if (hiddenInput) hiddenInput.value = '';
    console.warn('[VECT] Turnstile error — complete the verification to send');
    updateSubmitButtonState();
};

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');

    /* ═══════ HIGH-SPEED INSTANT REVEAL SYSTEM ═══════ */
    const setupReveal = () => {
        // Pre-reveal 300px BEFORE entering viewport so text is already loaded!
        const observerOptions = {
            threshold: 0.01,
            rootMargin: "300px 0px 200px 0px"
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.hasAttribute('data-reveal-group')) {
                        entry.target.querySelectorAll('.reveal-item').forEach(item => {
                            item.classList.add('active');
                        });
                    }
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const targets = document.querySelectorAll('[data-reveal], [data-reveal-group], .reveal-premium, .reveal, .reveal-item');
        targets.forEach(el => {
            // Instant reveal for anything in or near initial viewport
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight + 300) {
                el.classList.add('active');
                if (el.hasAttribute('data-reveal-group')) {
                    el.querySelectorAll('.reveal-item').forEach(item => item.classList.add('active'));
                }
            } else {
                revealObserver.observe(el);
            }
        });
    };

    /* ═══════ GETLAYERS.AI CINEMATIC SPOTLIGHT & 3D TILT ═══════ */
    const setupGetLayersAtmosphere = () => {
        // 1. Global Atmospheric Cursor Spotlight
        const spotlightEl = document.getElementById('vect-cursor-spotlight');
        if (spotlightEl) {
            window.addEventListener('mousemove', (e) => {
                if (!document.body.classList.contains('has-cursor')) {
                    document.body.classList.add('has-cursor');
                }
                spotlightEl.style.setProperty('--cursor-x', e.clientX + 'px');
                spotlightEl.style.setProperty('--cursor-y', e.clientY + 'px');
            }, { passive: true });

            window.addEventListener('mouseleave', () => {
                document.body.classList.remove('has-cursor');
            }, { passive: true });
        }

        // 2. Per-Card Border Illumination
        const interactiveCards = document.querySelectorAll(
            '.service-card, .advantage-item, .radar-card, .stat-pill, .spectera-banner, .wp-card, .wp-stat-card, .radar-info-panel, .faq-item'
        );
        interactiveCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--card-mouse-x', x + 'px');
                card.style.setProperty('--card-mouse-y', y + 'px');
            }, { passive: true });
        });

        // 3. Spotlight containers backward compatibility
        const spotlights = document.querySelectorAll('.spotlight-container');
        spotlights.forEach(container => {
            if (!container.querySelector('.spotlight-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'spotlight-overlay';
                container.appendChild(overlay);
            }
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                container.style.setProperty('--mouse-x', x + 'px');
                container.style.setProperty('--mouse-y', y + 'px');
            }, { passive: true });
        });
    };

    const setup3DTiltCards = () => {
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;

        const tiltCards = document.querySelectorAll(
            '.service-card, .advantage-item, .stat-pill, .wp-card, .wp-stat-card, .spectera-banner'
        );

        tiltCards.forEach(card => {
            card.classList.add('has-tilt');

            let glare = card.querySelector('.card-glare');
            if (!glare) {
                glare = document.createElement('div');
                glare.className = 'card-glare';
                card.appendChild(glare);
            }

            let rafId = null;
            let cardRect = null;

            // Cache bounding client rect on enter & scroll to prevent forced layout reflow
            card.addEventListener('mouseenter', () => {
                cardRect = card.getBoundingClientRect();
                card.classList.add('is-tilting');
            });

            card.addEventListener('mousemove', (e) => {
                if (!cardRect) cardRect = card.getBoundingClientRect();
                if (rafId) cancelAnimationFrame(rafId);
                
                rafId = requestAnimationFrame(() => {
                    const x = e.clientX - cardRect.left;
                    const y = e.clientY - cardRect.top;
                    const centerX = cardRect.width * 0.5;
                    const centerY = cardRect.height * 0.5;

                    const isWide = cardRect.width > 600;
                    const maxTilt = isWide ? 3.0 : 6.0;

                    const normX = (x - centerX) / centerX;
                    const normY = (y - centerY) / centerY;

                    const rotateX = normY * -maxTilt;
                    const rotateY = normX * maxTilt;

                    // Direct hardware transform without child lag
                    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
                    card.style.setProperty('--glare-x', x + 'px');
                    card.style.setProperty('--glare-y', y + 'px');
                });
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (rafId) cancelAnimationFrame(rafId);
                card.classList.remove('is-tilting');
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
                card.style.boxShadow = '';
            });
        });
    };

    setupReveal();
    setupGetLayersAtmosphere();
    setup3DTiltCards();


    // ═══════ LANGUAGE SWITCHER ═══════
    const langBtns = document.querySelectorAll('.lang-btn');
    const htmlRoot = document.documentElement;
    const nav = document.querySelector('nav');

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            htmlRoot.setAttribute('lang', lang);
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            try {
                localStorage.setItem('vect_lang', lang);
            } catch (e) {
                console.warn('LocalStorage unavailable');
            }

            // Update aria-labels for split-text elements
            document.querySelectorAll('[data-label-it]').forEach(el => {
                const newLabel = el.getAttribute(`data-label-${lang}`);
                if (newLabel) el.setAttribute('aria-label', newLabel);
            });
        });
    });

    let currentLang = 'it';
    try {
        currentLang = localStorage.getItem('vect_lang') || 'it';
    } catch (e) {
        console.warn('LocalStorage unavailable, defaulting to it');
    }
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    if (activeBtn) activeBtn.click();

    // ═══════ STICKY NAVBAR & SCROLLSPY ═══════
    const scrollTargets = document.querySelectorAll('section[id], #spectera');
    const navLinksList = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 80);

        let currentSection = '';
        scrollTargets.forEach((target) => {
            const sectionTop = target.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = target.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSection)) {
                link.classList.add('active');
            }
        });
    }, { passive: true });

    // ═══════ MOBILE HAMBURGER ═══════
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            // Prevent body scroll when menu is open
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

    // ═══════ SPECTERA GALLERY ═══════
    const specteraHero = document.getElementById('spectera-hero-img');
    const specteraThumbs = document.querySelectorAll('.spectera-thumb');
    if (specteraHero && specteraThumbs.length > 0) {
        specteraThumbs.forEach((thumb) => {
            thumb.addEventListener('click', () => {
                const src = thumb.getAttribute('data-src');
                if (!src) return;

                const lang = document.documentElement.getAttribute('lang') || 'it';
                const alt = thumb.getAttribute(lang === 'en' ? 'data-alt-en' : 'data-alt-it') || specteraHero.alt;

                specteraHero.src = src;
                specteraHero.alt = alt;

                specteraThumbs.forEach((t) => {
                    const active = t === thumb;
                    t.classList.toggle('is-active', active);
                    t.setAttribute('aria-selected', String(active));
                });
            });
        });
    }

    // ═══════ RACKMOUNT RF SPECTRUM ANALYZER (SECTION 03) ═══════
    const rackCanvas = document.getElementById('aboutRfCanvas');
    const rackFreqVal = document.getElementById('rackFreqVal');
    const rackHudCursor = document.getElementById('rackHudCursor');
    const rackHudBadge = document.getElementById('rackHudBadge');
    const rackScreenWrap = document.getElementById('rackScreenWrap');

    if (rackCanvas) {
        const ctx = rackCanvas.getContext('2d');
        let isHovering = false;
        let hoverX = 0;
        let sweepPhase = 0;
        let isVisible = false;
        let animId = null;

        const resizeRackCanvas = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = rackCanvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            rackCanvas.width = rect.width * dpr;
            rackCanvas.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resizeRackCanvas();
        window.addEventListener('resize', resizeRackCanvas);

        if (rackScreenWrap) {
            rackScreenWrap.addEventListener('mousemove', (e) => {
                isHovering = true;
                const rect = rackCanvas.getBoundingClientRect();
                hoverX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
                if (rackHudCursor) {
                    rackHudCursor.style.left = `${hoverX}px`;
                    const freqMhz = (470 + (hoverX / rect.width) * (694 - 470)).toFixed(3);
                    let pwr = -108 + Math.random() * 1.5;
                    let tag = 'NOISE FLOOR (-108 dBm)';
                    if (freqMhz >= 582 && freqMhz <= 590) {
                        pwr = -18.2 + Math.sin(freqMhz * 10) * 1.4;
                        tag = 'DAD A+B DIVERSITY LOCKED // LQM 99.8%';
                        if (rackFreqVal) rackFreqVal.textContent = freqMhz;
                    } else if (Math.abs(freqMhz - 530) < 4) {
                        pwr = -46.4 + Math.random() * 2.5;
                        tag = 'DTV CH 28 REJECTED (>60dB)';
                    } else if (Math.abs(freqMhz - 642) < 4) {
                        pwr = -51.8 + Math.random() * 2.5;
                        tag = 'DTV CH 42 REJECTED (>60dB)';
                    }
                    if (rackHudBadge) {
                        rackHudBadge.textContent = `${freqMhz} MHz | ${pwr.toFixed(1)} dBm | ${tag}`;
                    }
                }
            });
            rackScreenWrap.addEventListener('mouseleave', () => {
                isHovering = false;
            });
        }

        const SUBCARRIERS = 32;
        const subcarrierAmpsA = new Float32Array(SUBCARRIERS);
        const subcarrierAmpsB = new Float32Array(SUBCARRIERS);
        for (let i = 0; i < SUBCARRIERS; i++) {
            subcarrierAmpsA[i] = 0.82 + Math.random() * 0.16;
            subcarrierAmpsB[i] = 0.78 + Math.random() * 0.18;
        }

        const drawRackSpectrum = () => {
            if (!isVisible) return;
            const W = rackCanvas.offsetWidth;
            const H = rackCanvas.offsetHeight;
            if (!W || !H) return;

            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#040404';
            ctx.fillRect(0, 0, W, H);

            // Horizontal reference grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
            ctx.lineWidth = 1;
            [0.20, 0.45, 0.70, 0.92].forEach(ratio => {
                ctx.beginPath();
                ctx.moveTo(0, H * ratio);
                ctx.lineTo(W, H * ratio);
                ctx.stroke();
            });

            // Reticle sweep cursor
            sweepPhase = (sweepPhase + 0.005) % 1;
            const sweepX = sweepPhase * W;
            if (!isHovering && rackHudCursor) {
                rackHudCursor.style.left = `${sweepX}px`;
                const freq = (470 + sweepPhase * (694 - 470)).toFixed(3);
                let pwr = -108 + (Math.random() - 0.5) * 2;
                let tag = 'NOISE FLOOR';
                if (freq >= 582 && freq <= 590) {
                    pwr = -18.4 + (Math.random() - 0.5) * 1.2;
                    tag = 'DAD A+B LOCKED // LQM 99.8%';
                    if (rackFreqVal) rackFreqVal.textContent = freq;
                } else if (Math.abs(freq - 530) < 4) {
                    pwr = -46.2 + (Math.random() - 0.5) * 1.5;
                    tag = 'DTV CH 28 REJECTED';
                } else if (Math.abs(freq - 642) < 4) {
                    pwr = -52.1 + (Math.random() - 0.5) * 1.5;
                    tag = 'DTV CH 42 REJECTED';
                }
                if (rackHudBadge) {
                    rackHudBadge.textContent = `${freq} MHz | ${pwr.toFixed(1)} dBm | ${tag}`;
                }
            }

            // Animate 32 OFDM subcarriers with modulation jitter
            for (let i = 0; i < SUBCARRIERS; i++) {
                subcarrierAmpsA[i] += (Math.random() - 0.5) * 0.05;
                subcarrierAmpsA[i] = Math.max(0.70, Math.min(0.98, subcarrierAmpsA[i]));
                subcarrierAmpsB[i] += (Math.random() - 0.5) * 0.05;
                subcarrierAmpsB[i] = Math.max(0.65, Math.min(0.95, subcarrierAmpsB[i]));
            }

            // WMAS 8 MHz Channel block (582 to 590 MHz)
            const wmasStart = W * ((582 - 470) / (694 - 470));
            const wmasEnd = W * ((590 - 470) / (694 - 470));
            const wmasWidth = wmasEnd - wmasStart;

            ctx.fillStyle = 'rgba(255, 107, 26, 0.06)';
            ctx.fillRect(wmasStart, 6, wmasWidth, H - 16);
            ctx.strokeStyle = 'rgba(255, 107, 26, 0.28)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(wmasStart, 6, wmasWidth, H - 16);
            ctx.setLineDash([]);

            // ── TRACE 1: DAD ANT B (DIVERSITY - CYAN) ──
            ctx.beginPath();
            ctx.moveTo(0, H - 12);
            for (let x = 0; x <= W; x += 2) {
                const freq = 470 + (x / W) * (694 - 470);
                let y = H - 13 + (Math.random() - 0.5) * 2;

                if (Math.abs(freq - 530) < 4) {
                    const dist = 1 - Math.abs(freq - 530) / 4;
                    y -= dist * dist * (H * 0.38);
                } else if (Math.abs(freq - 642) < 4) {
                    const dist = 1 - Math.abs(freq - 642) / 4;
                    y -= dist * dist * (H * 0.32);
                } else if (freq >= 582 && freq <= 590) {
                    const scIndex = Math.min(SUBCARRIERS - 1, Math.floor(((freq - 582) / 8) * SUBCARRIERS));
                    const scAmp = subcarrierAmpsB[scIndex];
                    const edgeFactor = Math.sin(((freq - 582) / 8) * Math.PI);
                    const basePeak = H * 0.75;
                    const ripple = Math.sin(((freq - 582) / 8) * Math.PI * 32) * 2.2;
                    y -= (basePeak * Math.min(1, edgeFactor * 2.6) * scAmp) + ripple;
                }
                ctx.lineTo(x, Math.max(8, y));
            }
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = 1.1;
            ctx.stroke();

            // ── TRACE 2: DAD ANT A (PRIMARY - VECT ORANGE) ──
            ctx.beginPath();
            ctx.moveTo(0, H - 12);
            for (let x = 0; x <= W; x += 2) {
                const freq = 470 + (x / W) * (694 - 470);
                let y = H - 14 + (Math.random() - 0.5) * 2.5;

                if (Math.abs(freq - 530) < 4) {
                    const dist = 1 - Math.abs(freq - 530) / 4;
                    y -= dist * dist * (H * 0.42);
                } else if (Math.abs(freq - 642) < 4) {
                    const dist = 1 - Math.abs(freq - 642) / 4;
                    y -= dist * dist * (H * 0.35);
                } else if (freq >= 582 && freq <= 590) {
                    const scIndex = Math.min(SUBCARRIERS - 1, Math.floor(((freq - 582) / 8) * SUBCARRIERS));
                    const scAmp = subcarrierAmpsA[scIndex];
                    const edgeFactor = Math.sin(((freq - 582) / 8) * Math.PI);
                    const basePeak = H * 0.82;
                    const ripple = Math.sin(((freq - 582) / 8) * Math.PI * 32) * 2.8;
                    y -= (basePeak * Math.min(1, edgeFactor * 2.6) * scAmp) + ripple;
                }
                ctx.lineTo(x, Math.max(8, y));
            }
            ctx.lineTo(W, H - 12);

            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(255, 107, 26, 0.38)');
            grad.addColorStop(0.5, 'rgba(255, 107, 26, 0.12)');
            grad.addColorStop(1, 'rgba(255, 107, 26, 0.0)');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 107, 26, 0.95)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            animId = requestAnimationFrame(drawRackSpectrum);
        };

        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isVisible = entry.isIntersecting;
                    if (isVisible) {
                        resizeRackCanvas();
                        if (!animId) animId = requestAnimationFrame(drawRackSpectrum);
                    } else if (animId) {
                        cancelAnimationFrame(animId);
                        animId = null;
                    }
                });
            }, { threshold: 0.05 });
            obs.observe(rackCanvas);
        } else {
            isVisible = true;
            animId = requestAnimationFrame(drawRackSpectrum);
        }
    }

    // ═══════ RADAR — UTC LIVE CLOCK ═══════
    const radarClock = document.getElementById('radar-live-clock');
    if (radarClock) {
        const tick = () => {
            const now = new Date();
            const h = String(now.getUTCHours()).padStart(2, '0');
            const m = String(now.getUTCMinutes()).padStart(2, '0');
            const s = String(now.getUTCSeconds()).padStart(2, '0');
            radarClock.textContent = `${h}:${m}:${s}`;
        };
        tick();
        setInterval(tick, 1000);
    }

    // ═══════ RADAR — DUAL FFT & WATERFALL SCOPE ═══════
    const specCanvas = document.getElementById('spectrumCanvas');
    if (specCanvas) {
        const ctx2 = specCanvas.getContext('2d');
        const NUM_BINS = 128;
        let binsA = new Float32Array(NUM_BINS);
        let binsB = new Float32Array(NUM_BINS);
        for (let i = 0; i < NUM_BINS; i++) {
            binsA[i] = 0.08 + Math.random() * 0.04;
            binsB[i] = 0.07 + Math.random() * 0.04;
        }

        // Offline waterfall offscreen canvas
        const offCanvas = document.createElement('canvas');
        const offCtx = offCanvas.getContext('2d');

        let isSpecVisible = false;
        let specInterval = null;

        const drawSpectrum = () => {
            if (!isSpecVisible) return;
            const W = specCanvas.offsetWidth;
            const H = specCanvas.offsetHeight;
            if (!W || !H) return;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (specCanvas.width !== Math.floor(W * dpr) || specCanvas.height !== Math.floor(H * dpr)) {
                specCanvas.width = Math.floor(W * dpr);
                specCanvas.height = Math.floor(H * dpr);
                offCanvas.width = Math.floor(W * dpr);
                offCanvas.height = Math.floor(H * dpr);
                ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            const splitH = Math.floor(H * 0.52); // Top: Dual-trace FFT, Bottom: Thermal Waterfall
            const waterH = H - splitH;

            // Scroll waterfall down 1px
            if (offCanvas.width > 0 && offCanvas.height > 0) {
                offCtx.drawImage(specCanvas, 0, splitH * dpr, W * dpr, (waterH - 1) * dpr, 0, (splitH + 1) * dpr, W * dpr, (waterH - 1) * dpr);
            }

            // WMAS is between 582-590 MHz out of 470-694 MHz band
            const wmasBinStart = Math.floor(NUM_BINS * ((582 - 470) / (694 - 470)));
            const wmasBinEnd = Math.floor(NUM_BINS * ((590 - 470) / (694 - 470)));

            // Update spectrum bins for Antenna A & Antenna B (Dual Diversity)
            for (let i = 0; i < NUM_BINS; i++) {
                if (i >= wmasBinStart && i <= wmasBinEnd) {
                    // 32-carrier OFDM comb ripple inside WMAS
                    const rel = (i - wmasBinStart) / (wmasBinEnd - wmasBinStart);
                    const ripple = Math.sin(rel * Math.PI * 16) * 0.06;
                    binsA[i] = 0.76 + ripple + (Math.random() - 0.5) * 0.08;
                    binsB[i] = 0.70 - ripple * 0.8 + (Math.random() - 0.5) * 0.09;
                } else if (Math.abs(i - Math.floor(NUM_BINS * 0.28)) < 3) {
                    // DTV broadcast carrier 1 (adjacent rejection)
                    binsA[i] = 0.40 + (Math.random() - 0.5) * 0.08;
                    binsB[i] = 0.38 + (Math.random() - 0.5) * 0.08;
                } else if (Math.abs(i - Math.floor(NUM_BINS * 0.74)) < 3) {
                    // DTV broadcast carrier 2
                    binsA[i] = 0.36 + (Math.random() - 0.5) * 0.08;
                    binsB[i] = 0.35 + (Math.random() - 0.5) * 0.08;
                } else {
                    // Ambient RF noise floor (-108 dBm)
                    binsA[i] = Math.max(0.04, Math.min(0.18, binsA[i] + (Math.random() - 0.49) * 0.03));
                    binsB[i] = Math.max(0.04, Math.min(0.18, binsB[i] + (Math.random() - 0.49) * 0.03));
                }
            }

            // Clear top FFT pane
            ctx2.fillStyle = '#050505';
            ctx2.fillRect(0, 0, W, splitH);

            // Calibrated reference grid lines
            ctx2.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx2.lineWidth = 1;
            [0.25, 0.50, 0.75].forEach(r => {
                ctx2.beginPath();
                ctx2.moveTo(0, splitH * r);
                ctx2.lineTo(W, splitH * r);
                ctx2.stroke();
            });

            const binW = W / NUM_BINS;

            // Highlight WMAS 8 MHz channel
            const wmasX1 = wmasBinStart * binW;
            const wmasX2 = wmasBinEnd * binW;
            ctx2.fillStyle = 'rgba(255, 107, 26, 0.08)';
            ctx2.fillRect(wmasX1, 0, wmasX2 - wmasX1, splitH);
            ctx2.strokeStyle = 'rgba(255, 107, 26, 0.3)';
            ctx2.setLineDash([2, 2]);
            ctx2.strokeRect(wmasX1, 0, wmasX2 - wmasX1, splitH);
            ctx2.setLineDash([]);

            // ── TRACE B: DAD ANT B DIVERSITY (CYAN) ──
            ctx2.beginPath();
            ctx2.moveTo(0, splitH - 2);
            for (let i = 0; i < NUM_BINS; i++) {
                const x = i * binW;
                const barH = binsB[i] * (splitH - 4);
                ctx2.lineTo(x, splitH - barH);
            }
            ctx2.lineTo(W, splitH - 2);
            ctx2.strokeStyle = 'rgba(56, 189, 248, 0.75)';
            ctx2.lineWidth = 1;
            ctx2.stroke();

            // ── TRACE A: DAD ANT A PRIMARY (VECT ORANGE) ──
            ctx2.beginPath();
            ctx2.moveTo(0, splitH - 2);
            for (let i = 0; i < NUM_BINS; i++) {
                const x = i * binW;
                const barH = binsA[i] * (splitH - 4);
                ctx2.lineTo(x, splitH - barH);
            }
            ctx2.lineTo(W, splitH - 2);

            const grad = ctx2.createLinearGradient(0, 0, 0, splitH);
            grad.addColorStop(0, 'rgba(255, 107, 26, 0.28)');
            grad.addColorStop(0.6, 'rgba(255, 107, 26, 0.08)');
            grad.addColorStop(1, 'rgba(255, 107, 26, 0.0)');
            ctx2.fillStyle = grad;
            ctx2.fill();

            ctx2.strokeStyle = 'rgba(255, 107, 26, 0.95)';
            ctx2.lineWidth = 1.3;
            ctx2.stroke();

            // ── BOTTOM WATERFALL PANE (THERMAL SPECTRUM) ──
            for (let i = 0; i < NUM_BINS; i++) {
                const v = Math.max(binsA[i], binsB[i]);
                let r = 8, g = 10, b = 18;
                if (v > 0.65) {
                    // Hot WMAS carrier: fiery orange to white
                    r = 255;
                    g = Math.min(255, Math.floor(107 + (v - 0.65) * 450));
                    b = Math.min(255, Math.floor(26 + (v - 0.65) * 550));
                } else if (v > 0.35) {
                    // Mid power broadcast: copper / amber
                    r = Math.floor(180 + (v - 0.35) * 200);
                    g = Math.floor(80 + (v - 0.35) * 90);
                    b = 20;
                } else if (v > 0.15) {
                    // Low signals: dark cyan/teal
                    r = 10;
                    g = Math.floor(40 + v * 120);
                    b = Math.floor(70 + v * 200);
                }
                ctx2.fillStyle = `rgb(${r},${g},${b})`;
                ctx2.fillRect(i * binW, splitH, binW + 1, 1);
            }

            // Copy scrolled waterfall history
            if (offCanvas.width > 0 && offCanvas.height > 0) {
                ctx2.drawImage(offCanvas, 0, (splitH + 1) * dpr, W * dpr, (waterH - 1) * dpr, 0, splitH + 1, W, waterH - 1);
            }
        };

        if ('IntersectionObserver' in window) {
            const obs2 = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isSpecVisible = entry.isIntersecting;
                    if (isSpecVisible) {
                        if (!specInterval) specInterval = setInterval(drawSpectrum, 60);
                    } else if (specInterval) {
                        clearInterval(specInterval);
                        specInterval = null;
                    }
                });
            }, { threshold: 0.05 });
            obs2.observe(specCanvas);
        } else {
            isSpecVisible = true;
            specInterval = setInterval(drawSpectrum, 60);
        }
    }

// ═══════ RADAR — REGION DATA (WMAS / SPECTERA FOCUS) ═══════
const RADAR_REGIONS = {
    'NA': {
        label: 'NA-FCC',
        name: { it: 'Nord America (USA & Canada)', en: 'North America (USA & Canada)' },
        standard: 'FCC Part 74H / WMAS Order 24-17',
        bands: '470–608 MHz TV · 653–663 MHz WMAS\nCanale 6/8 MHz // 32 TX + 32 RX BiDi',
        body: 'FCC · ISED · Sennheiser Certified',
        intermod: { it: '0.00% IMD — SeDAC 24-bit/96kHz 0.7ms', en: '0.00% IMD — SeDAC 24-bit/96kHz 0.7ms' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA OPERATIONAL' },
        compliance: 99, quality: 98, congestion: 32
    },
    'EU': {
        label: 'EU-ETSI',
        name: { it: 'Unione Europea & UK', en: 'European Union & UK' },
        standard: 'ETSI EN 303 978 — WMAS Standard',
        bands: '470–694 MHz (UHF WMAS Nativo)\nCH 35: 582.000–590.000 MHz (8 MHz BW)',
        body: 'ETSI · CE Mark · AGCOM-IT · OFCOM-UK',
        intermod: { it: '0.00% IMD — Zero intermodulazione (OFDM)', en: '0.00% IMD — Zero intermodulation (OFDM)' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA NATIVO', en: 'SPECTERA NATIVE' },
        compliance: 100, quality: 99, congestion: 38
    },
    'AS': {
        label: 'AS-MIC',
        name: { it: 'Asia Pacifico (JP / KR / SG)', en: 'Asia Pacific (JP / KR / SG)' },
        standard: 'MIC Ordinance 35 / KCC WMAS Trial',
        bands: '470–710 MHz & 806–810 MHz (WMAS Trial)\nPTP IEEE 1588 Sync Lock',
        body: 'MIC Japan · KCC Korea · IMDA Singapore',
        intermod: { it: '0.00% IMD — Licenza coordinata VECT', en: '0.00% IMD — VECT coordinated license' },
        statusClass: 'warn',
        statusText: { it: 'LICENZA RICHIESTA', en: 'LICENSE REQUIRED' },
        compliance: 84, quality: 88, congestion: 62
    },
    'ME': {
        label: 'ME-TDRA',
        name: { it: 'Medio Oriente (UAE / SA / QA)', en: 'Middle East (UAE / SA / QA)' },
        standard: 'TDRA Class Licence / CST Regulation',
        bands: '470–694 MHz (8 MHz WMAS Carrier)\nDAD Dual Active Diversity su fibra/Cat6',
        body: 'TDRA UAE · CST Saudi Arabia · CRA Qatar',
        intermod: { it: '0.00% IMD — RF Shielding Mission-Critical', en: '0.00% IMD — Mission-Critical RF Shielding' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA OPERATIONAL' },
        compliance: 95, quality: 96, congestion: 42
    },
    'SA': {
        label: 'SA-ANATEL',
        name: { it: 'Sud America (BR / AR / CL)', en: 'South America (BR / AR / CL)' },
        standard: 'ANATEL Res. 680 / ENACOM WMAS',
        bands: '470–698 MHz (WMAS BiDi Link)\nRidondanza Dante 1Gbps + AES-256',
        body: 'Anatel Brazil · ENACOM · Subtel Chile',
        intermod: { it: '0.00% IMD — Carrier unico ad alta densità', en: '0.00% IMD — High-density single carrier' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA CONFORME', en: 'SPECTERA COMPLIANT' },
        compliance: 93, quality: 94, congestion: 36
    },
    'AU': {
        label: 'AU-ACMA',
        name: { it: 'Australia & Nuova Zelanda', en: 'Australia & New Zealand' },
        standard: 'ACMA LIPD Class Licence — WMAS Class',
        bands: '520–694 MHz (8 MHz Ch 28–48)\nFull Duplex IEM + Mic su DAD',
        body: 'ACMA Australia · RSM New Zealand',
        intermod: { it: '0.00% IMD — Zero intermodulazione tra canali', en: '0.00% IMD — Zero intermodulation' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA OPERATIONAL' },
        compliance: 98, quality: 97, congestion: 26
    }
};

const ripRegionId = document.getElementById('rip-region-id');
const ripStatusText = document.getElementById('rip-status-text');
const ripBody = document.getElementById('rip-body');
const ripBars = document.getElementById('rip-bars');
const barCompliance = document.getElementById('bar-compliance');
const barQuality = document.getElementById('bar-quality');
const barCongestion = document.getElementById('bar-congestion');
const valCompliance = document.getElementById('val-compliance');
const valQuality = document.getElementById('val-quality');
const valCongestion = document.getElementById('val-congestion');

const radarHotspots = document.querySelectorAll('.radar-hotspot');
const radarRibbonBtns = document.querySelectorAll('.rrb-btn');

function showRegionData(regionKey) {
    const data = RADAR_REGIONS[regionKey];
    if (!data || !ripRegionId) return;

    const lang = document.documentElement.getAttribute('lang') || 'it';

    // Deselect all reticles, select matched
    radarHotspots.forEach(h => {
        const isMatch = h.getAttribute('data-region') === regionKey;
        h.classList.toggle('selected', isMatch);
        const dot = h.querySelector('.rh-dot');
        const lbl = h.querySelector('.rh-lbl');
        if (dot) dot.classList.toggle('rh-dot-active', isMatch);
        if (lbl) lbl.classList.toggle('rh-lbl-active', isMatch);
    });

    // Synchronize quick region selector ribbon buttons
    radarRibbonBtns.forEach(btn => {
        const isMatch = btn.getAttribute('data-region') === regionKey;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', String(isMatch));
    });

    // Update header
    ripRegionId.textContent = data.label;
    if (ripStatusText) {
        ripStatusText.textContent = data.statusText[lang];
        const statusChip = ripStatusText.closest('.rip-status-chip');
        if (statusChip) {
            statusChip.classList.toggle('warn', data.statusClass === 'warn');
        }
    }

    // Build data rows
    const bandLabel = lang === 'it' ? 'BANDE WMAS' : 'WMAS BANDS';
    const stdLabel = lang === 'it' ? 'NORMATIVA WMAS' : 'WMAS STANDARD';
    const bodyLabel = lang === 'it' ? 'ENTE CERTIFICANTE' : 'CERTIFYING BODY';
    const intermodLabel = lang === 'it' ? 'RISCHIO INTERMOD WMAS' : 'WMAS INTERMOD RISK';
    const regionLabel = lang === 'it' ? 'REGIONE' : 'REGION';

    const statusClass = data.statusClass === 'ok' ? 'ok' : 'warn';

    ripBody.innerHTML = `
            <div class="rip-data">
                <div class="rip-data-row">
                    <span class="rip-data-label">${regionLabel}</span>
                    <span class="rip-data-value">${data.name[lang]}</span>
                </div>
                <div class="rip-data-row">
                    <span class="rip-data-label">${stdLabel}</span>
                    <span class="rip-data-value accent">${data.standard}</span>
                </div>
                <div class="rip-data-row">
                    <span class="rip-data-label">${bandLabel}</span>
                    <span class="rip-data-value" style="white-space:pre-line">${data.bands}</span>
                </div>
                <div class="rip-data-row">
                    <span class="rip-data-label">${bodyLabel}</span>
                    <span class="rip-data-value" style="font-size:10px">${data.body}</span>
                </div>
                <div class="rip-data-row">
                    <span class="rip-data-label">${intermodLabel}</span>
                    <span class="rip-data-value ${statusClass}">${data.intermod[lang]}</span>
                </div>
            </div>`;

    // Show and animate bars
    if (ripBars) {
        ripBars.style.display = 'flex';
        barCompliance.style.width = '0%';
        barQuality.style.width = '0%';
        barCongestion.style.width = '0%';
        valCompliance.textContent = '-';
        valQuality.textContent = '-';
        valCongestion.textContent = '-';

        requestAnimationFrame(() => {
            setTimeout(() => {
                barCompliance.style.width = data.compliance + '%';
                barQuality.style.width = data.quality + '%';
                barCongestion.style.width = data.congestion + '%';
                valCompliance.textContent = data.compliance + '%';
                valQuality.textContent = data.quality + '%';
                valCongestion.textContent = data.congestion + '%';
            }, 60);
        });
    }
}

radarHotspots.forEach(btn => {
    btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-region');
        showRegionData(region);
    });
});

radarRibbonBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-region');
        showRegionData(region);
    });
});

// Auto-initialize with EU-ETSI on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => showRegionData('EU'));
} else {
    showRegionData('EU');
}


// ═══════ FORM HANDLING — WEB3FORMS + TURNSTILE ═══════
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    const privacyCheck = document.getElementById('privacyConsent');
    if (privacyCheck) {
        privacyCheck.addEventListener('change', updateSubmitButtonState);
    }
    updateSubmitButtonState();
}

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button[type="submit"]') || submitBtn;
        const lang = document.documentElement.getAttribute('lang') || 'it';
        const originalHTML = btn.innerHTML;

        // Verifica privacy (doppia sicurezza)
        const privacyCheck = document.getElementById('privacyConsent');
        if (privacyCheck && !privacyCheck.checked) {
            btn.innerHTML = lang === 'it' ? '⚠ Accetta la Privacy Policy' : '⚠ Accept Privacy Policy';
            btn.style.background = 'var(--vect-warning)';
            setTimeout(() => { btn.innerHTML = originalHTML; btn.style.background = ''; updateSubmitButtonState(); }, 3000);
            return;
        }

        if (!turnstileVerified || !turnstileToken) {
            showToast(
                lang === 'it' ? 'Completa la verifica anti-spam (Turnstile).' : 'Complete the anti-spam check (Turnstile).',
                'error'
            );
            updateSubmitButtonState();
            return;
        }

        btn.innerHTML = lang === 'it' ? '<span class="vect-spinner"></span> Invio in corso...' : '<span class="vect-spinner"></span> Sending...';
        btn.disabled = true;
        btn.classList.add('loading');

        // Costruzione payload per il backend proxy Vercel
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());
        
        if (turnstileToken) {
            payload.turnstile_token = turnstileToken;
        }

        // Aggiunta campi opzionali gestiti dal backend
        payload.subject = 'Nuova richiesta dal sito VECT';
        payload.from_name = 'VECT Website';
        // Conversione booleana privacy
        payload.privacyConsent = !!payload.privacyConsent;

        try {
            // Invio sicuro tramite Serverless Function
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                showToast(lang === 'it' ? '✓ Richiesta completata' : '✓ Request completed', 'success');
                btn.innerHTML = lang === 'it' ? '✓ Richiesta inviata' : '✓ Request sent';
                btn.style.background = 'var(--vect-success)';
                contactForm.reset();

                // Reset Turnstile
                turnstileVerified = false;
                turnstileToken = '';
                const hiddenInput = document.getElementById('turnstileToken');
                if (hiddenInput) hiddenInput.value = '';
                if (window.turnstile) window.turnstile.reset();

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    btn.classList.remove('loading');
                    updateSubmitButtonState();
                }, 4000);
            } else {
                showToast(lang === 'it' ? `Errore server: ${result.message}` : `Server Error: ${result.message}`, 'error');
                btn.innerHTML = lang === 'it' ? `Errore: ${result.message || 'Server'}` : `Error: ${result.message || 'Server'}`;
                btn.style.background = 'var(--vect-error)';
                throw new Error(result.message || 'Server error');
            }
        } catch (err) {
            console.error('Submission error:', err);
            showToast(lang === 'it' ? 'Si è verificato un errore di rete.' : 'A network error occurred.', 'error');
            if (!btn.innerHTML.includes('Errore') && !btn.innerHTML.includes('Error')) {
                btn.innerHTML = lang === 'it' ? 'Errore di rete' : 'Network Error';
                btn.style.background = 'var(--vect-error)';
            }
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.classList.remove('loading');
                updateSubmitButtonState();
            }, 5000);
        }
    });
}

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

// ═══════ TOAST NOTIFICATIONS ═══════
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

    // ═══════ MOBILE DETECTION ═══════
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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
            
            side.innerHTML = text.split('').map((char, i) => {
                if (char === '\n') return '<br>';
                return `<span class="char-wrap"><span class="char" style="transition-delay: 0s">${char === ' ' ? '&nbsp;' : char}</span></span>`;
            }).join('');
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
            if (isTouchDevice) return; // Skip on mobile
            if (scramblerIt) scramblerIt.setText(originalTextIt);
            if (scramblerEn) scramblerEn.setText(originalTextEn);
        });

        if (el.classList.contains('btn') && !isTouchDevice) {
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
    if (!isTouchDevice) {
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

    // ═══════ SECTION GLOW ═══════
    const titles = document.querySelectorAll('.section-title');
    titles.forEach(title => {
        title.addEventListener('mouseenter', () => {
            if (isTouchDevice) return;
            title.style.textShadow = '0 0 15px rgba(255, 107, 26, 0.3)';
        });
        title.addEventListener('mouseleave', () => {
            title.style.textShadow = 'none';
        });
    });
});




// Lead Gen Form Handler
window.handleLeadGen = async function(e) {
    e.preventDefault();
    const form = document.getElementById('leadGenForm');
    const emailInput = document.getElementById('leadEmail');
    const successMsg = document.getElementById('leadGenSuccess');
    const btn = form.querySelector('button');
    
    if (!emailInput.value) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '...';
    btn.disabled = true;
    
    try {
        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailInput.value })
        });
        
        // Even if it fails, we show success to not disrupt the UX,
        // but normally we would handle errors.
        form.style.display = 'none';
        successMsg.style.display = 'block';
    } catch (err) {
        console.error(err);
        btn.innerHTML = originalText;
        btn.disabled = false;
        alert("Si è verificato un errore. Riprova.");
    }
};

// Download Standalone White Paper HTML
window.downloadWhitePaperHtml = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
        const res = await fetch('VECT_WhitePaper.html');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'VECT_WhitePaper.html';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    } catch (err) {
        window.location.href = 'VECT_WhitePaper.html';
    }
};

