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

    // ═══════ GLOBAL RADAR HUD LOGIC ═══════
    const radarHotspots = document.querySelectorAll('.hotspot');
    const hudRegionId = document.getElementById('hud-region-id');
    const hudDataOutput = document.getElementById('hud-data-output');

    const RADAR_DATA = {
        'NA': {
            id: 'NA-USA',
            name: { it: 'Nord America', en: 'North America' },
            standard: 'FCC Part 15 / 74',
            bands: '470-608 MHz / 653-663 MHz',
            status: { it: 'PROTETTO', en: 'SECURE' },
            regulatory: 'FCC Office of Engineering'
        },
        'EU': {
            id: 'EU-UK',
            name: { it: 'Unione Europea', en: 'European Union' },
            standard: 'ETSI EN 300 422',
            bands: '470-694 MHz / 823-832 MHz',
            status: { it: 'PROTETTO', en: 'SECURE' },
            regulatory: 'OFCOM / Agence Nationale'
        },
        'AS': {
            id: 'AS-JPN',
            name: { it: 'Asia Pacifico', en: 'Asia Pacific' },
            standard: 'MIC Ordinance 35',
            bands: '806-810 MHz / 1240 MHz',
            status: { it: 'ATTENZIONE: INTERMOD', en: 'CAUTION: INTERMOD' },
            regulatory: 'MIC Radio Bureau'
        },
        'AF': {
            id: 'AF-MDS',
            name: { it: 'Africa', en: 'Africa' },
            standard: 'ITU Region 1',
            bands: '470-790 MHz',
            status: { it: 'NOMINALE', en: 'NOMINAL' },
            regulatory: 'ATRA Regulatory'
        },
        'SA': {
            id: 'SA-BR',
            name: { it: 'Sud America', en: 'South America' },
            standard: 'ANATEL Res 680',
            bands: '470-698 MHz',
            status: { it: 'PROTETTO', en: 'SECURE' },
            regulatory: 'Anatel Compliance'
        }
    };

    let typingTimer = null;

    function typewriter(element, text) {
        let i = 0;
        element.innerHTML = '';
        if (typingTimer) clearInterval(typingTimer);
        
        // Split text into an array of chunks (either tag or character)
        const chunks = [];
        let tempI = 0;
        while (tempI < text.length) {
            if (text.charAt(tempI) === '<') {
                const tagEnd = text.indexOf('>', tempI);
                if (tagEnd !== -1) {
                    chunks.push(text.substring(tempI, tagEnd + 1));
                    tempI = tagEnd + 1;
                } else {
                    chunks.push(text.charAt(tempI));
                    tempI++;
                }
            } else {
                chunks.push(text.charAt(tempI));
                tempI++;
            }
        }

        typingTimer = setInterval(() => {
            if (i < chunks.length) {
                const chunk = chunks[i];
                const isTag = chunk.startsWith('<');
                
                element.innerHTML += chunk;
                i++;

                // Decryption effect (only for non-tag, non-space characters)
                if (!isTag && chunk !== ' ' && Math.random() > 0.8) {
                    const currentHTML = element.innerHTML;
                    element.innerHTML = currentHTML.slice(0, -1) + '_';
                    setTimeout(() => {
                        // Restore only if the last char is still '_'
                        if (element.innerHTML.endsWith('_')) {
                            element.innerHTML = element.innerHTML.slice(0, -1) + chunk;
                        } else {
                            // If more text was added, we need to find and replace the specific '_'
                            // But for simplicity in this HUD style, we'll just skip restoration if it's too late
                            // or use a more precise replacement:
                            element.innerHTML = element.innerHTML.replace(/_$/, chunk);
                        }
                    }, 40);
                }
            } else {
                clearInterval(typingTimer);
            }
        }, 15);
    }

    radarHotspots.forEach(hotspot => {
        hotspot.addEventListener('mouseenter', () => {
            const region = hotspot.getAttribute('data-region');
            const data = RADAR_DATA[region];
            const lang = document.documentElement.getAttribute('lang') || 'it';
            
            if (data) {
                hudRegionId.innerText = data.id;
                const labels = {
                    region: lang === 'it' ? 'REGIONE' : 'REGION',
                    standard: lang === 'it' ? 'NORMATIVA' : 'STANDARD',
                    bands: lang === 'it' ? 'BANDE' : 'BANDS',
                    status: lang === 'it' ? 'STATO' : 'STATUS',
                    body: lang === 'it' ? 'ENTE' : 'BODY',
                    sync: lang === 'it' ? 'SINCRONIA' : 'SYNC'
                };

                const message = `> ${labels.region}: ${data.name[lang]}\n` +
                                `> ${labels.standard}: ${data.standard}\n` +
                                `> ${labels.bands}: ${data.bands}\n` +
                                `> ${labels.status}: ${data.status[lang]}\n` +
                                `> ${labels.body}: ${data.regulatory}\n` +
                                `> ${labels.sync}: 100%`;
                
                typewriter(hudDataOutput, message.replace(/\n/g, '<br>'));
            }
        });

        hotspot.addEventListener('mouseleave', () => {
            const lang = document.documentElement.getAttribute('lang') || 'it';
            hudRegionId.innerText = 'GLBL';
            const idleMessage = lang === 'it' ? 
                '> SISTEMA IDLE<br>> IN ATTESA DI SELEZIONE SETTORE...<br>> SCANSIONE FREQUENZE...' :
                '> SYSTEM IDLE<br>> AWAITING SECTOR SELECTION...<br>> SCANNING FREQUENCIES...';
            
            if (typingTimer) {
                clearInterval(typingTimer);
                typingTimer = null;
            }
            hudDataOutput.innerHTML = idleMessage;
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
                    // Show specific error message from API if available
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
