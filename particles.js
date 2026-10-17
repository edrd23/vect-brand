/**
 * VECT Space Atmosphere & Interactive WMAS Spectrum Analyzer Background
 * Inspired by GetLayers.ai cinematic WebGL/Shader dynamics & High-End RF Telemetry
 * Zero dependencies, optimized 60fps canvas engine with mouse tuning & pulse shockwaves.
 */
class VectAtmosphere {
    constructor() {
        this.canvas = document.getElementById('vect-space-bg');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.stars = [];
        this.isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
        this.numStars = this.isMobile ? 180 : 360;
        this.maxZ = 1000;
        this.fov = 320;
        this.baseSpeed = 0.45;
        
        // Colors
        this.starColors = [
            'rgba(255, 255, 255, {opacity})',
            'rgba(255, 255, 255, {opacity})',
            'rgba(240, 245, 255, {opacity})',
            'rgba(255, 107, 26, {opacity})'   // VECT Signature Orange
        ];

        // RF Spectrum Analyzer State
        this.rfTime = 0;
        this.mouse = {
            x: window.innerWidth * 0.5,
            y: window.innerHeight * 0.4,
            targetX: window.innerWidth * 0.5,
            targetY: window.innerHeight * 0.4,
            isHovering: false,
            speed: 0
        };
        this.prevMouseX = this.mouse.x;

        // Shockwaves on click
        this.shockwaves = [];

        // Waterfall FFT historic bins
        this.fftColumns = this.isMobile ? 32 : 64;
        this.fftHistory = [];
        this.maxHistory = 18;

        this.initStars();
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });
        
        // Mouse tracking for RF tuning reticle
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
            this.mouse.isHovering = true;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            this.mouse.isHovering = false;
        });

        // Click to spawn electromagnetic RF shockwave
        window.addEventListener('pointerdown', (e) => {
            // Don't trigger if clicking buttons or links
            if (e.target.closest('a, button, input, textarea, select')) return;
            this.triggerShockwave(e.clientX, e.clientY);
        });

        // Scroll reactivity (warp speed)
        window.addEventListener('scroll', () => {
            this.baseSpeed = 1.9;
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.baseSpeed = 0.45;
            }, 100);
        }, { passive: true });

        this.animate();
    }

    triggerShockwave(x, y) {
        if (this.shockwaves.length > 4) this.shockwaves.shift();
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 10,
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.55,
            strength: 1.0,
            speed: this.isMobile ? 14 : 22
        });
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 2400,
                y: (Math.random() - 0.5) * 2400,
                z: Math.random() * this.maxZ,
                size: Math.random() * 1.5 + 0.4,
                colorTemplate: this.starColors[Math.floor(Math.random() * this.starColors.length)]
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }

    drawBackground() {
        const ctx = this.ctx;
        // Deep pure space black
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStars() {
        const ctx = this.ctx;
        const speed = this.baseSpeed;
        const w = this.canvas.width;
        const h = this.canvas.height;

        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            star.z -= speed;

            if (star.z <= 1) {
                star.x = (Math.random() - 0.5) * 2400;
                star.y = (Math.random() - 0.5) * 2400;
                star.z = this.maxZ;
            }

            const scale = this.fov / (this.fov + star.z);
            let x2d = star.x * scale + this.cx;
            let y2d = star.y * scale + this.cy;

            // Shockwave perturbation on stars
            for (let s = 0; s < this.shockwaves.length; s++) {
                const sw = this.shockwaves[s];
                const dx = x2d - sw.x;
                const dy = y2d - sw.y;
                const dist = Math.hypot(dx, dy);
                if (Math.abs(dist - sw.radius) < 60) {
                    const waveFactor = Math.sin((dist - sw.radius) * 0.1) * sw.strength * 8;
                    x2d += (dx / (dist || 1)) * waveFactor;
                    y2d += (dy / (dist || 1)) * waveFactor;
                }
            }

            if (x2d > 0 && x2d < w && y2d > 0 && y2d < h) {
                const opacity = Math.max(0, 1 - (star.z / this.maxZ));
                const size2d = Math.max(0.25, star.size * scale * (1 / (star.z * 0.001 + 0.09)));
                ctx.fillStyle = star.colorTemplate.replace('{opacity}', opacity.toFixed(2));
                ctx.beginPath();
                ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawShockwaves() {
        const ctx = this.ctx;
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.strength *= 0.96;

            if (sw.radius > sw.maxRadius || sw.strength < 0.01) {
                this.shockwaves.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 107, 26, ${(sw.strength * 0.45).toFixed(3)})`;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#FF6B1A';
            ctx.shadowBlur = 12;
            ctx.stroke();

            // Inner subtle ring
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 20), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(sw.strength * 0.25).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawRFSpectrum() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Easing mouse for RF frequency dial tuning
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Base altitude of the spectrum wave
        const baseY = h * 0.50;
        const maxAmp = this.isMobile ? 38 : 72;
        const tuneNorm = this.mouse.x / w;
        const tuneFreq = (470 + tuneNorm * (694 - 470)).toFixed(3);
        const tuneOffset = (tuneNorm - 0.5) * 2.2;
        this.rfTime += 0.022;

        // ═══════ 1. BACKGROUND RF WATERFALL MATRIX ═══════
        ctx.save();
        const colW = w / this.fftColumns;
        for (let c = 0; c < this.fftColumns; c++) {
            const normX = c / this.fftColumns;
            const distFromTune = Math.abs(normX - tuneNorm);
            const peak = Math.exp(-distFromTune * distFromTune * 40);
            
            // Generate synthetic RF power per bin
            const noise = Math.sin(normX * 24 + this.rfTime * 2) * 0.25 + 0.35;
            const binPower = Math.min(1.0, noise + peak * 0.65);
            
            const barH = binPower * (maxAmp * 0.85);
            const barY = baseY + maxAmp * 0.6;
            
            // Faint matrix column
            if (binPower > 0.4) {
                const alpha = (binPower * 0.08).toFixed(3);
                ctx.fillStyle = distFromTune < 0.06 ? `rgba(255, 107, 26, 0.22)` : `rgba(255, 255, 255, ${alpha})`;
                ctx.fillRect(c * colW + 1, barY, colW - 2, barH);
            }
        }
        ctx.restore();

        // ═══════ 2. FREQUENCY TICK GRID & LABELS ═══════
        ctx.save();
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        const gridFrequencies = [
            { f: '470.0 MHz', norm: 0.06 },
            { f: '518.0 MHz', norm: 0.22 },
            { f: '566.0 MHz', norm: 0.43 },
            { f: '614.0 MHz (WMAS 8MHz)', norm: 0.64, accent: true },
            { f: '662.0 MHz', norm: 0.82 },
            { f: '694.0 MHz', norm: 0.94 }
        ];

        for (let i = 0; i < gridFrequencies.length; i++) {
            const item = gridFrequencies[i];
            const gx = item.norm * w;
            
            // Vertical dotted line
            ctx.setLineDash([2, 6]);
            ctx.beginPath();
            ctx.moveTo(gx, baseY - maxAmp * 1.5);
            ctx.lineTo(gx, baseY + maxAmp * 1.8);
            ctx.stroke();

            // Label
            ctx.setLineDash([]);
            ctx.fillStyle = item.accent ? 'rgba(255, 107, 26, 0.65)' : 'rgba(255, 255, 255, 0.25)';
            if (!this.isMobile || item.accent) {
                ctx.fillText(item.f, gx - 20, baseY + maxAmp * 1.9);
            }
        }
        ctx.restore();

        // ═══════ 3. DUAL-HARMONIC WMAS CARRIER (ORANGE + GLOW) ═══════
        ctx.save();
        ctx.lineWidth = 2.2;
        ctx.shadowColor = 'rgba(255, 107, 26, 0.85)';
        ctx.shadowBlur = 18;

        // Gradient under the wave
        const grad = ctx.createLinearGradient(0, baseY - maxAmp * 1.3, 0, baseY + maxAmp * 1.8);
        grad.addColorStop(0, 'rgba(255, 107, 26, 0.20)');
        grad.addColorStop(0.5, 'rgba(255, 107, 26, 0.04)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        const step = this.isMobile ? 10 : 5;
        let points = [];

        for (let x = 0; x <= w; x += step) {
            const normX = x / w;
            const distFromTune = Math.abs(normX - tuneNorm);
            const envelope = Math.exp(-distFromTune * distFromTune * 16);

            // Multicarrier WMAS OFDM synthesis
            const sin1 = Math.sin(normX * 18 + this.rfTime + tuneOffset);
            const sin2 = Math.sin(normX * 36 - this.rfTime * 1.4);
            const sin3 = Math.cos(normX * 54 + this.rfTime * 0.9) * 0.35;
            const sin4 = Math.sin(normX * 90 + this.rfTime * 2.8) * 0.15; // Fast micro-ripple
            
            // Shockwave perturbation on wave height
            let swDisplacement = 0;
            for (let s = 0; s < this.shockwaves.length; s++) {
                const sw = this.shockwaves[s];
                const dx = x - sw.x;
                const dy = baseY - sw.y;
                const dist = Math.hypot(dx, dy);
                if (Math.abs(dist - sw.radius) < 80) {
                    swDisplacement += Math.sin((dist - sw.radius) * 0.08) * sw.strength * 30;
                }
            }

            const y = baseY + (sin1 * 0.6 + sin2 * 0.28 + sin3 + sin4) * maxAmp * (0.32 + envelope * 0.95) + swDisplacement;
            points.push({ x, y });

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        // Stroke primary carrier
        ctx.strokeStyle = '#FF6B1A';
        ctx.stroke();

        // Fill under wave
        ctx.lineTo(w, baseY + maxAmp * 2.0);
        ctx.lineTo(0, baseY + maxAmp * 2.0);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // ═══════ 4. SECONDARY HARMONIC: ELECTRIC WHITE / CYAN CARRIER ═══════
        ctx.save();
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.shadowColor = 'rgba(0, 229, 255, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        for (let i = 0; i < points.length; i += 2) {
            const pt = points[i];
            const normX = pt.x / w;
            const fineSin = Math.sin(normX * 48 + this.rfTime * 2.1) * (maxAmp * 0.25);
            const y = pt.y - 6 + fineSin;
            if (i === 0) ctx.moveTo(pt.x, y);
            else ctx.lineTo(pt.x, y);
        }
        ctx.stroke();
        ctx.restore();

        // ═══════ 5. ACTIVE TUNING RETICLE & TELEMETRY HUD ═══════
        const reticleX = this.mouse.x;
        const activeDistFromTune = Math.abs(reticleX / w - tuneNorm);
        const activeEnv = Math.exp(-activeDistFromTune * activeDistFromTune * 16);
        const reticleY = baseY + Math.sin((reticleX / w) * 18 + this.rfTime + tuneOffset) * maxAmp * (0.32 + activeEnv * 0.95);

        ctx.save();
        // Vertical tuning laser
        ctx.strokeStyle = 'rgba(255, 107, 26, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.moveTo(reticleX, baseY - maxAmp * 1.6);
        ctx.lineTo(reticleX, baseY + maxAmp * 1.6);
        ctx.stroke();
        ctx.setLineDash([]);

        // Reticle Center Ring
        ctx.shadowColor = '#FF6B1A';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(reticleX, reticleY, 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(reticleX, reticleY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF6B1A';
        ctx.fill();

        // Live Reticle Telemetry Tag
        if (!this.isMobile && reticleX > 140 && reticleX < w - 180) {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
            ctx.strokeStyle = 'rgba(255, 107, 26, 0.5)';
            ctx.lineWidth = 1;
            const tagW = 160;
            const tagH = 34;
            const tagX = reticleX + 14;
            const tagY = reticleY - 42;
            ctx.beginPath();
            ctx.roundRect(tagX, tagY, tagW, tagH, 6);
            ctx.fill();
            ctx.stroke();

            ctx.font = 'bold 9px "JetBrains Mono", monospace';
            ctx.fillStyle = '#FF6B1A';
            ctx.fillText(`TUNER // ${tuneFreq} MHz`, tagX + 10, tagY + 14);
            
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`WMAS LINK: SYNC 32ch // +38dB`, tagX + 10, tagY + 26);
        }
        ctx.restore();

        // ═══════ 6. TRAILING RF PHOTON NODES ALONG WAVE ═══════
        ctx.save();
        const photonCount = this.isMobile ? 4 : 8;
        for (let p = 0; p < photonCount; p++) {
            const phase = (this.rfTime * 0.12 + p / photonCount) % 1.0;
            const px = phase * w;
            const normX = px / w;
            const distFromTune = Math.abs(normX - tuneNorm);
            const env = Math.exp(-distFromTune * distFromTune * 16);
            const py = baseY + Math.sin(normX * 18 + this.rfTime + tuneOffset) * maxAmp * (0.32 + env * 0.95);

            ctx.fillStyle = p % 2 === 0 ? '#FFFFFF' : '#FF6B1A';
            ctx.shadowColor = '#FF6B1A';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    animate() {
        // 1. Pulisce e disegna sfondo profondo
        this.drawBackground();

        // 2. Render stelle di profondità (con shockwaves)
        this.drawStars();

        // 3. Render onde d'urto RF
        this.drawShockwaves();

        // 4. Render spettro RF cinematico con sintonia mouse
        this.drawRFSpectrum();

        requestAnimationFrame(() => this.animate());
    }
}

// Inizializza quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VectAtmosphere());
} else {
    new VectAtmosphere();
}
