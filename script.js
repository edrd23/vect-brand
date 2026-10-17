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
                    if (freqMhz >= 582 && freqMhz <= 590) {
                        pwr = -18.2 + Math.sin(freqMhz * 10) * 1.5;
                    } else if (Math.abs(freqMhz - 530) < 4 || Math.abs(freqMhz - 642) < 4) {
                        pwr = -46 + Math.random() * 3;
                    }
                    if (rackHudBadge) {
                        rackHudBadge.textContent = `${freqMhz} MHz | ${pwr.toFixed(1)} dBm`;
                    }
                }
            });
            rackScreenWrap.addEventListener('mouseleave', () => {
                isHovering = false;
            });
        }

        const SUBCARRIERS = 32;
        const subcarrierAmps = new Float32Array(SUBCARRIERS);
        for (let i = 0; i < SUBCARRIERS; i++) subcarrierAmps[i] = 0.8 + Math.random() * 0.2;

        const drawRackSpectrum = () => {
            if (!isVisible) return;
            const W = rackCanvas.offsetWidth;
            const H = rackCanvas.offsetHeight;
            if (!W || !H) return;

            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#040404';
            ctx.fillRect(0, 0, W, H);

            sweepPhase = (sweepPhase + 0.006) % 1;
            const sweepX = sweepPhase * W;
            if (!isHovering && rackHudCursor) {
                rackHudCursor.style.left = `${sweepX}px`;
                const freq = (470 + sweepPhase * (694 - 470)).toFixed(3);
                let pwr = -108 + (Math.random() - 0.5) * 2;
                if (freq >= 582 && freq <= 590) {
                    pwr = -18.4 + (Math.random() - 0.5) * 1.2;
                    if (rackFreqVal) rackFreqVal.textContent = freq;
                } else if (Math.abs(freq - 530) < 4) {
                    pwr = -46.2;
                } else if (Math.abs(freq - 642) < 4) {
                    pwr = -52.1;
                }
                if (rackHudBadge) {
                    rackHudBadge.textContent = `${freq} MHz | ${pwr.toFixed(1)} dBm`;
                }
            }

            for (let i = 0; i < SUBCARRIERS; i++) {
                subcarrierAmps[i] += (Math.random() - 0.5) * 0.08;
                subcarrierAmps[i] = Math.max(0.65, Math.min(0.98, subcarrierAmps[i]));
            }

            const wmasStart = W * ((582 - 470) / (694 - 470));
            const wmasEnd = W * ((590 - 470) / (694 - 470));
            const wmasWidth = wmasEnd - wmasStart;

            ctx.fillStyle = 'rgba(255, 107, 26, 0.06)';
            ctx.fillRect(wmasStart, 6, wmasWidth, H - 16);
            ctx.strokeStyle = 'rgba(255, 107, 26, 0.25)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(wmasStart, 6, wmasWidth, H - 16);
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(0, H - 12);

            for (let x = 0; x <= W; x += 2) {
                const freq = 470 + (x / W) * (694 - 470);
                let y = H - 14 + (Math.random() - 0.5) * 3;

                if (Math.abs(freq - 530) < 4) {
                    const dist = 1 - Math.abs(freq - 530) / 4;
                    y -= dist * dist * (H * 0.42);
                } else if (Math.abs(freq - 642) < 4) {
                    const dist = 1 - Math.abs(freq - 642) / 4;
                    y -= dist * dist * (H * 0.35);
                } else if (freq >= 582 && freq <= 590) {
                    const scIndex = Math.min(SUBCARRIERS - 1, Math.floor(((freq - 582) / 8) * SUBCARRIERS));
                    const scAmp = subcarrierAmps[scIndex];
                    const edgeFactor = Math.sin(((freq - 582) / 8) * Math.PI);
                    const basePeak = H * 0.82;
                    y -= basePeak * Math.min(1, edgeFactor * 2.5) * scAmp;
                }

                ctx.lineTo(x, Math.max(8, y));
            }

            ctx.lineTo(W, H - 12);

            const grad = ctx.createLinearGradient(0, 0, 0, H);
            grad.addColorStop(0, 'rgba(255, 107, 26, 0.4)');
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
        const NUM_BINS = 96;
        let bins = new Float32Array(NUM_BINS);
        for (let i = 0; i < NUM_BINS; i++) bins[i] = 0.08 + Math.random() * 0.05;

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

            if (specCanvas.width !== W || specCanvas.height !== H) {
                specCanvas.width = W;
                specCanvas.height = H;
                offCanvas.width = W;
                offCanvas.height = H;
            }

            const splitH = Math.floor(H * 0.48); // Top: FFT line, Bottom: Waterfall
            const waterH = H - splitH;

            // Scroll waterfall down 1px
            if (offCanvas.width > 0 && offCanvas.height > 0) {
                offCtx.drawImage(specCanvas, 0, splitH, W, waterH - 1, 0, splitH + 1, W, waterH - 1);
            }

            // Update spectrum bins
            // WMAS is between bins 46 and 54 (corresponding to 582-590 MHz out of 470-694 MHz)
            const wmasBinStart = Math.floor(NUM_BINS * ((582 - 470) / (694 - 470)));
            const wmasBinEnd = Math.floor(NUM_BINS * ((590 - 470) / (694 - 470)));

            for (let i = 0; i < NUM_BINS; i++) {
                if (i >= wmasBinStart && i <= wmasBinEnd) {
                    bins[i] = 0.72 + (Math.random() - 0.5) * 0.16; // WMAS high energy
                } else if (Math.abs(i - Math.floor(NUM_BINS * 0.28)) < 2) {
                    bins[i] = 0.42 + (Math.random() - 0.5) * 0.1; // DTV 1
                } else if (Math.abs(i - Math.floor(NUM_BINS * 0.74)) < 2) {
                    bins[i] = 0.38 + (Math.random() - 0.5) * 0.1; // DTV 2
                } else {
                    bins[i] = Math.max(0.04, Math.min(0.2, bins[i] + (Math.random() - 0.49) * 0.04));
                }
            }

            // Render top FFT pane
            ctx2.fillStyle = '#060606';
            ctx2.fillRect(0, 0, W, splitH);

            const binW = W / NUM_BINS;
            ctx2.beginPath();
            ctx2.moveTo(0, splitH - 2);

            for (let i = 0; i < NUM_BINS; i++) {
                const x = i * binW;
                const barH = bins[i] * (splitH - 4);
                ctx2.lineTo(x, splitH - barH);
            }
            ctx2.lineTo(W, splitH - 2);

            ctx2.fillStyle = 'rgba(255, 107, 26, 0.15)';
            ctx2.fill();
            ctx2.strokeStyle = 'rgba(255, 107, 26, 0.85)';
            ctx2.lineWidth = 1;
            ctx2.stroke();

            // Highlight WMAS boundary in FFT pane
            const wmasX1 = wmasBinStart * binW;
            const wmasX2 = wmasBinEnd * binW;
            ctx2.fillStyle = 'rgba(255, 107, 26, 0.08)';
            ctx2.fillRect(wmasX1, 0, wmasX2 - wmasX1, splitH);

            // Render bottom Waterfall row
            for (let i = 0; i < NUM_BINS; i++) {
                const v = bins[i];
                let r = 10, g = 10, b = 15;
                if (v > 0.6) {
                    r = 255; g = Math.floor(107 + (v - 0.6) * 300); b = 30;
                } else if (v > 0.25) {
                    r = Math.floor(v * 280); g = Math.floor(v * 90); b = 20;
                } else {
                    r = Math.floor(v * 70); g = Math.floor(v * 40); b = 40;
                }
                ctx2.fillStyle = `rgb(${r},${g},${b})`;
                ctx2.fillRect(i * binW, splitH, binW + 1, 1);
            }

            // Copy scrolled waterfall history
            if (offCanvas.width > 0 && offCanvas.height > 0) {
                ctx2.drawImage(offCanvas, 0, splitH + 1, W, waterH - 1, 0, splitH + 1, W, waterH - 1);
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
        label: 'NA-USA',
        name: { it: 'Nord America', en: 'North America' },
        standard: 'FCC Part 74H — WMAS Licensed',
        bands: '470–608 MHz\n653–663 MHz (WMAS authorized)',
        body: 'FCC · Sennheiser Spectera Certified',
        intermod: { it: 'BASSO — WMAS attivo', en: 'LOW — WMAS active' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA ACTIVE' },
        compliance: 98, quality: 96, congestion: 34
    },
    'EU': {
        label: 'EU-ETSI',
        name: { it: 'Unione Europea', en: 'European Union' },
        standard: 'ETSI EN 303 978 — WMAS Standard',
        bands: '470–694 MHz (WMAS native)\n8 MHz TV channel carrier',
        body: 'ETSI · CE Mark · AGCom-IT · OFCOM',
        intermod: { it: 'BASSO — WMAS elimina intermod', en: 'LOW — WMAS eliminates intermod' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA NATIVO', en: 'SPECTERA NATIVE' },
        compliance: 100, quality: 98, congestion: 40
    },
    'AS': {
        label: 'AS-JPKR',
        name: { it: 'Asia Pacifico', en: 'Asia Pacific' },
        standard: 'MIC Ordinance 35 — WMAS Parziale',
        bands: '806–810 MHz (limitato)\nLicenza WMAS locale richiesta',
        body: 'MIC Japan · KCC Korea · IMDA Singapore',
        intermod: { it: 'MEDIO — coordinamento richiesto', en: 'MEDIUM — coordination required' },
        statusClass: 'warn',
        statusText: { it: 'LICENZA RICHIESTA', en: 'LICENSE REQUIRED' },
        compliance: 72, quality: 80, congestion: 68
    },
    'ME': {
        label: 'ME-UAE',
        name: { it: 'Medio Oriente', en: 'Middle East' },
        standard: 'TRA UAE / CITC — WMAS Approvato',
        bands: '470–790 MHz\nAutorizzazione WMAS per evento',
        body: 'TRA UAE · CITC Saudi · VECT Consulting',
        intermod: { it: 'BASSO con WMAS', en: 'LOW with WMAS' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA ACTIVE' },
        compliance: 86, quality: 88, congestion: 48
    },
    'SA': {
        label: 'SA-BRA',
        name: { it: 'Sud America', en: 'South America' },
        standard: 'ANATEL Res. 680 — WMAS Approvato',
        bands: '470–698 MHz (WMAS operativo)\nDante 1Gbps ridondante',
        body: 'Anatel Brazil · Subtel Chile · ARCOTEL',
        intermod: { it: 'BASSO — WMAS carrier unico', en: 'LOW — single WMAS carrier' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA CONFORME', en: 'SPECTERA COMPLIANT' },
        compliance: 91, quality: 90, congestion: 38
    },
    'AU': {
        label: 'AU-ACMA',
        name: { it: 'Australia / Oceania', en: 'Australia / Oceania' },
        standard: 'ACMA LIPD Class — WMAS Registrato',
        bands: '520–694 MHz (WMAS band)\nCanale da 8 MHz autorizzato',
        body: 'ACMA · Sennheiser AU Partner Certified',
        intermod: { it: 'BASSO — spettro libero', en: 'LOW — clear spectrum' },
        statusClass: 'ok',
        statusText: { it: 'SPECTERA OPERATIVO', en: 'SPECTERA ACTIVE' },
        compliance: 95, quality: 93, congestion: 28
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

