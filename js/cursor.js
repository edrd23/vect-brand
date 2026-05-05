/**
 * VECT — Custom Cursor System
 * Premium: ring (lagged) + precision dot
 * Auto-disabled on touch devices (@media pointer:fine only)
 */

export function initCursor() {
    // Skip on touch/stylus devices — CSS @media(pointer:fine) also hides it
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(pointer: none)').matches) return;

    const ring = document.getElementById('vect-cursor');
    const dot  = document.getElementById('vect-cursor-dot');
    if (!ring || !dot) return;

    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;
    let rafId  = null;

    // Smooth ring follow with lerp (lag effect = premium feel)
    const LERP = 0.12;

    function animateRing() {
        ringX += (mouseX - ringX) * LERP;
        ringY += (mouseY - ringY) * LERP;

        ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        rafId = requestAnimationFrame(animateRing);
    }

    // Mouse move: dot is instant, ring is lerped
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }, { passive: true });

    // Hover state on interactive elements
    const interactiveSelector = 'a, button, [role="button"], .btn, .service-card, .nav-links a, label, input, textarea';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
            document.body.classList.add('cursor-hover');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
            document.body.classList.remove('cursor-hover');
        }
    }, { passive: true });

    // Click shrink effect
    document.addEventListener('mousedown', () => {
        document.body.classList.add('cursor-click');
    });
    document.addEventListener('mouseup', () => {
        document.body.classList.remove('cursor-click');
    });

    // Hide cursor when it leaves the window
    document.addEventListener('mouseleave', () => {
        ring.style.opacity = '0';
        dot.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        ring.style.opacity = '1';
        dot.style.opacity = '1';
    });

    // Start animation loop
    animateRing();
}
