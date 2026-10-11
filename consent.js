/**
 * VECT — Cookie consent & conditional Vercel Web Analytics
 * Storage key: vect_consent_analytics = "granted" | "denied"
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'vect_consent_analytics';
    var GRANTED = 'granted';
    var DENIED = 'denied';

    function getConsent() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function setConsent(value) {
        try {
            localStorage.setItem(STORAGE_KEY, value);
        } catch (e) {
            console.warn('[VECT] localStorage unavailable');
        }
    }

    function loadVercelAnalytics() {
        if (getConsent() !== GRANTED) return;
        if (document.querySelector('script[data-vect-analytics]')) return;

        window.va = window.va || function () {
            (window.vaq = window.vaq || []).push(arguments);
        };

        var script = document.createElement('script');
        script.defer = true;
        script.src = '/_vercel/insights/script.js';
        script.setAttribute('data-vect-analytics', '1');
        document.head.appendChild(script);
    }

    function hideBanner() {
        var banner = document.getElementById('vect-consent-banner');
        if (!banner) return;
        banner.classList.remove('vect-consent-visible');
        banner.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
            banner.style.display = 'none';
        }, 400);
    }

    function showBanner() {
        var banner = document.getElementById('vect-consent-banner');
        if (!banner) return;
        banner.style.display = 'flex';
        banner.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () {
            banner.classList.add('vect-consent-visible');
        });
    }

    function acceptAnalytics() {
        setConsent(GRANTED);
        loadVercelAnalytics();
        hideBanner();
    }

    function rejectAnalytics() {
        setConsent(DENIED);
        hideBanner();
    }

    function buildBanner() {
        if (document.getElementById('vect-consent-banner')) return;

        var banner = document.createElement('div');
        banner.id = 'vect-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'false');
        banner.setAttribute('aria-labelledby', 'vect-consent-title');
        banner.setAttribute('aria-hidden', 'true');
        banner.style.display = 'none';

        banner.innerHTML =
            '<div class="vect-consent-inner">' +
            '<div class="vect-consent-copy">' +
            '<p id="vect-consent-title" class="vect-consent-title">' +
            '<span class="it-text">Preferenze privacy e cookie</span>' +
            '<span class="en-text">Privacy &amp; cookie preferences</span>' +
            '</p>' +
            '<p class="vect-consent-desc">' +
            '<span class="it-text">Usiamo storage tecnico sul tuo dispositivo per lingua e questa scelta. ' +
            'Le statistiche di navigazione (Vercel Web Analytics, dati aggregati e anonimi) sono ' +
            '<strong>facoltative</strong> e si attivano solo con il tuo consenso. ' +
            '<a href="privacy.html">Privacy Policy</a>.</span>' +
            '<span class="en-text">We use technical storage on your device for language and this choice. ' +
            'Browsing statistics (Vercel Web Analytics, aggregated anonymous data) are ' +
            '<strong>optional</strong> and load only with your consent. ' +
            '<a href="privacy.html">Privacy Policy</a>.</span>' +
            '</p>' +
            '</div>' +
            '<div class="vect-consent-actions">' +
            '<button type="button" class="vect-consent-btn vect-consent-btn-secondary" data-vect-consent="deny">' +
            '<span class="it-text">Solo necessari</span><span class="en-text">Essential only</span>' +
            '</button>' +
            '<button type="button" class="vect-consent-btn vect-consent-btn-primary" data-vect-consent="accept">' +
            '<span class="it-text">Accetta statistiche</span><span class="en-text">Accept analytics</span>' +
            '</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(banner);

        banner.querySelector('[data-vect-consent="accept"]').addEventListener('click', acceptAnalytics);
        banner.querySelector('[data-vect-consent="deny"]').addEventListener('click', rejectAnalytics);
    }

    function initBanner() {
        buildBanner();
        var consent = getConsent();
        if (consent === GRANTED || consent === DENIED) {
            hideBanner();
            return;
        }
        setTimeout(showBanner, 600);
    }

    function openPreferences() {
        buildBanner();
        showBanner();
    }

    if (getConsent() === GRANTED) {
        loadVercelAnalytics();
    }

    window.VECTConsent = {
        getConsent: getConsent,
        acceptAnalytics: acceptAnalytics,
        rejectAnalytics: rejectAnalytics,
        openPreferences: openPreferences,
        loadVercelAnalytics: loadVercelAnalytics
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
})();
