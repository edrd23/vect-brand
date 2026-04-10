document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-ready');
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
            const h = String(now.getUTCHours()).padStart(2,'0');
            const m = String(now.getUTCMinutes()).padStart(2,'0');
            const s = String(now.getUTCSeconds()).padStart(2,'0');
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
        setInterval(drawSpectrum, 80);
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

    // ═══════ FORM HANDLING — WEB3FORMS ═══════
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
