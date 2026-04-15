document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');

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
        document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(el => revealObserver.observe(el));
    };

    setupReveal();

    // ═══════ TURNSTILE STATE ═══════
    let turnstileVerified = false;
    let turnstileToken = '';

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
            localStorage.setItem('vect_lang', lang);
        });
    });

    const currentLang = localStorage.getItem('vect_lang') || 'it';
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
    if (activeBtn) activeBtn.click();

    // ═══════ STICKY NAVBAR & SCROLLSPY ═══════
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

    // ═══════ REVEAL ANIMATIONS ═══════
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ═══════ RF SCANNER LOGIC ═══════
    const liveFreqLabel = document.getElementById('live-freq');
    const scannerLog = document.getElementById('scanner-log');

    if (liveFreqLabel && scannerLog) {
        // Generatore veloce di valori RF finti tra 470.000 e 694.000 MHz
        setInterval(() => {
            const randomFreq = (Math.random() * (694 - 470) + 470).toFixed(3);
            liveFreqLabel.innerHTML = `${randomFreq} <span class="mhz">MHz</span>`;
        }, 80);

        const logMessages = [
            "> ANALYZING SPECTRUM...",
            "> NOISE FLOOR: -98dBm",
            "> TX DETECTED",
            "> CALCULATING IMD...",
            "> INTERMOD PROFILE: PASS",
            "> LINK QUALITY: 100%",
            "> SYNCING BACKUP FREQS...",
            "> SWEEPING BAND..."
        ];

        let currentLogs = [
            "> SYSTEM OK",
            "> AWAITING TELEMETRY",
            "> SCANNING ACTIVE"
        ];

        // Ciclo log di sistema rolling lento
        setInterval(() => {
            currentLogs.shift();
            const nextLog = logMessages[Math.floor(Math.random() * logMessages.length)];
            currentLogs.push(nextLog);
            scannerLog.innerHTML = currentLogs.join("<br>");
        }, 1200);
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

    // ═══════ RADAR — SPECTRUM CANVAS ═══════
    const specCanvas = document.getElementById('spectrumCanvas');
    if (specCanvas) {
        const ctx2 = specCanvas.getContext('2d');
        let bins = [];
        const NUM_BINS = 80;
        for (let i = 0; i < NUM_BINS; i++) bins.push(Math.random() * 0.3);

        const drawSpectrum = () => {
            const W = specCanvas.offsetWidth;
            const H = specCanvas.offsetHeight;
            if (specCanvas.width !== W) specCanvas.width = W;
            if (specCanvas.height !== H) specCanvas.height = H;

            // Shift left (waterfall)
            ctx2.clearRect(0, 0, W, H);
            ctx2.fillStyle = 'rgba(8,8,8,0.9)';
            ctx2.fillRect(0, 0, W, H);

            for (let i = 0; i < NUM_BINS; i++) {
                bins[i] += (Math.random() - 0.48) * 0.15;
                bins[i] = Math.max(0.02, Math.min(1, bins[i]));
                // Occasional spikes
                if (Math.random() > 0.995) bins[i] = 0.7 + Math.random() * 0.3;
            }

            const binW = W / NUM_BINS;
            bins.forEach((v, i) => {
                const barH = v * H;
                const alpha = 0.4 + v * 0.6;
                const r = Math.floor(255 * v);
                const g = Math.floor(107 * (1 - v));
                ctx2.fillStyle = `rgba(${r},${g},26,${alpha})`;
                ctx2.fillRect(i * binW, H - barH, binW - 1, barH);
            });
        };

let specInterval = setInterval(drawSpectrum, 80);

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!specInterval) specInterval = setInterval(drawSpectrum, 80);
            } else {
                clearInterval(specInterval);
                specInterval = null;
            }
        });
    });
    observer.observe(specCanvas);
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

function showRegionData(regionKey) {
    const data = RADAR_REGIONS[regionKey];
    if (!data || !ripRegionId) return;

    const lang = document.documentElement.getAttribute('lang') || 'it';

    // Deselect all, select clicked
    radarHotspots.forEach(h => h.classList.remove('selected'));
    const btn = document.querySelector(`.radar-hotspot[data-region="${regionKey}"]`);
    if (btn) btn.classList.add('selected');

    // Update header
    ripRegionId.textContent = data.label;
    ripStatusText.textContent = data.statusText[lang];

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
        // Reset first
        barCompliance.style.width = '0%';
        barQuality.style.width = '0%';
        barCongestion.style.width = '0%';
        valCompliance.textContent = '-';
        valQuality.textContent = '-';
        valCongestion.textContent = '-';

        // Animate after paint
        requestAnimationFrame(() => {
            setTimeout(() => {
                barCompliance.style.width = data.compliance + '%';
                barQuality.style.width = data.quality + '%';
                barCongestion.style.width = data.congestion + '%';
                valCompliance.textContent = data.compliance + '%';
                valQuality.textContent = data.quality + '%';
                valCongestion.textContent = data.congestion + '%';
            }, 80);
        });
    }
}

radarHotspots.forEach(btn => {
    btn.addEventListener('click', () => {
        const region = btn.getAttribute('data-region');
        showRegionData(region);
    });
});

// ═══════ TURNSTILE STATE ═══════
turnstileVerified = false;
turnstileToken = '';

// Global callbacks for Turnstile (must be on window)
window.onTurnstileSuccess = function (token) {
    turnstileVerified = true;
    turnstileToken = token;
    const hiddenInput = document.getElementById('turnstileToken');
    if (hiddenInput) hiddenInput.value = token;
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = false;
};

window.onTurnstileExpired = function () {
    turnstileVerified = false;
    turnstileToken = '';
    const hiddenInput = document.getElementById('turnstileToken');
    if (hiddenInput) hiddenInput.value = '';
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = true;
};

window.onTurnstileError = function () {
    console.error('[VECT] Turnstile error occurred');
    const btn = document.getElementById('submitBtn');
    if (btn) btn.disabled = true;
};

// ═══════ FORM HANDLING — WEB3FORMS + TURNSTILE ═══════
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button[type="submit"]') || submitBtn;
        const lang = document.documentElement.getAttribute('lang') || 'it';
        const originalHTML = btn.innerHTML;

        // Validate Turnstile
        if (!turnstileVerified || !turnstileToken) {
            btn.innerHTML = lang === 'it' ? '⚠ Verifica umana richiesta' : '⚠ Human verification required';
            btn.style.background = 'var(--vect-warning)';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
            }, 3000);
            return;
        }

        btn.innerHTML = lang === 'it' ? '<span class="vect-spinner"></span> Invio in corso...' : '<span class="vect-spinner"></span> Sending...';
        btn.disabled = true;
        btn.classList.add('loading');

        // Robust FormData to JSON conversion
        const formData = new FormData(contactForm);
        const object = {};
        formData.forEach((value, key) => {
            if (key !== 'botcheck') object[key] = value;
        });

        // Add Turnstile token
        object['turnstile_token'] = turnstileToken;

        // Hidden submission details
        object['access_key'] = '4cc1583d-1036-49ee-ba64-38637fbb21b9';
        object['subject'] = 'Nuova richiesta da VECT [WEB]';
        object['from_name'] = 'VECT Website';

        const json = JSON.stringify(object);

        try {
            // Use Vercel serverless proxy (secure — hides API key + validates Turnstile)
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
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
                    btn.disabled = false;
                    btn.classList.remove('loading');
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
                btn.disabled = false;
                btn.classList.remove('loading');
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

});
