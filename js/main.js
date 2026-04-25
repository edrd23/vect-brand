/**
 * VECT — Main Bootstrap Module
 * This is the sole entry point for all JavaScript functionality.
 * Uses ES modules for code splitting and lazy loading.
 */

// ═══════ CORE: PARTICLES (immediate) ═══════
import { StarField } from './particles.js';
new StarField();

// ═══════ DOCUMENT READY ═══════
document.addEventListener('DOMContentLoaded', async () => {
    // Always load: Navigation + Animations
    await Promise.all([
        import('./nav.js'),
        import('./animations.js')
    ]);

    // Conditionally load heavy modules only if needed on page
    if (document.querySelector('.radar-scanner-wrap')) {
        await import('./radar.js');
    }

    if (document.querySelector('#contactForm')) {
        await import('./form.js');
    }

    console.log('[VECT] All modules loaded');
});
