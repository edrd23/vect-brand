/**
 * VECT Space Particles & RF Spectrum Analyzer Background
 * Inspired by GetLayers.ai cinematic WebGL/Shader dynamics
 * Zero dependencies, high performance 60fps canvas engine.
 */
class VectAtmosphere {
    constructor() {
        this.canvas = document.getElementById('vect-space-bg');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.isMobile = Math.min(window.innerWidth, window.innerHeight) < 768;
        this.numStars = this.isMobile ? 160 : 320;
        this.maxZ = 1000;
        this.fov = 300;
        this.baseSpeed = 0.45;
        
        // Colors
        this.starColors = [
            'rgba(255, 255, 255, {opacity})',
            'rgba(255, 255, 255, {opacity})',
            'rgba(255, 255, 255, {opacity})',
            'rgba(255, 107, 26, {opacity})'   // VECT Accent Orange
        ];

        // RF Spectrum Analyzer State
        this.rfTime = 0;
        this.mouse = {
            x: window.innerWidth * 0.5,
            y: window.innerHeight * 0.3,
            targetX: window.innerWidth * 0.5,
            targetY: window.innerHeight * 0.3
        };

        this.initStars();
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });
        
        // Mouse tracking for RF tuning effect
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
        }, { passive: true });

        // Scroll reactivity
        window.addEventListener('scroll', () => {
            this.baseSpeed = 1.8;
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.baseSpeed = 0.45;
            }, 120);
        }, { passive: true });

        this.animate();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 2200,
                y: (Math.random() - 0.5) * 2200,
                z: Math.random() * this.maxZ,
                size: Math.random() * 1.4 + 0.5,
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

    drawStars() {
        const ctx = this.ctx;
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            star.z -= this.baseSpeed;

            if (star.z <= 1) {
                star.x = (Math.random() - 0.5) * 2200;
                star.y = (Math.random() - 0.5) * 2200;
                star.z = this.maxZ;
            }

            const scale = this.fov / (this.fov + star.z);
            const x2d = star.x * scale + this.cx;
            const y2d = star.y * scale + this.cy;

            if (x2d > 0 && x2d < this.canvas.width && y2d > 0 && y2d < this.canvas.height) {
                const opacity = Math.max(0, 1 - (star.z / this.maxZ));
                const size2d = Math.max(0.2, star.size * scale * (1 / (star.z * 0.001 + 0.1)));
                ctx.fillStyle = star.colorTemplate.replace('{opacity}', opacity.toFixed(2));
                ctx.beginPath();
                ctx.arc(x2d, y2d, size2d, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawRFSpectrum() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Posizionamento dell'analizzatore RF: fascia centrale/bassa del viewport
        const baseY = h * 0.48;
        const maxAmp = this.isMobile ? 35 : 65;

        // Easing morbido del cursore per il tuning della frequenza
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;
        
        const tuneOffset = (this.mouse.x / w - 0.5) * 1.5;
        this.rfTime += 0.018;

        // 1. CARRIER PRINCIPALE WMAS (Arancione VECT con Glow)
        ctx.save();
        ctx.lineWidth = 1.8;
        ctx.shadowColor = 'rgba(255, 107, 26, 0.75)';
        ctx.shadowBlur = 14;

        // Gradiente sotto l'onda
        const grad = ctx.createLinearGradient(0, baseY - maxAmp, 0, baseY + maxAmp * 1.4);
        grad.addColorStop(0, 'rgba(255, 107, 26, 0.12)');
        grad.addColorStop(0.5, 'rgba(255, 107, 26, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        const step = this.isMobile ? 12 : 6;
        for (let x = 0; x <= w; x += step) {
            const normX = x / w;
            
            // Envelope gaussiana per concentrare le frequenze attorno al punto di sintonia
            const distFromTune = Math.abs(normX - 0.5 - (tuneOffset * 0.25));
            const envelope = Math.exp(-distFromTune * distFromTune * 8);

            // Modulazione multifrequenza (UHF carrier + WMAS broadband harmonics)
            const sin1 = Math.sin(normX * 16 + this.rfTime + tuneOffset);
            const sin2 = Math.sin(normX * 32 - this.rfTime * 1.5);
            const sin3 = Math.cos(normX * 48 + this.rfTime * 0.8) * 0.4;
            
            const y = baseY + (sin1 * 0.6 + sin2 * 0.3 + sin3) * maxAmp * (0.35 + envelope * 0.85);

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        // Bordo onda arancione
        ctx.strokeStyle = 'rgba(255, 107, 26, 0.85)';
        ctx.stroke();

        // Chiusura per riempimento sfumato
        ctx.lineTo(w, baseY + maxAmp * 1.5);
        ctx.lineTo(0, baseY + maxAmp * 1.5);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();

        // 2. ONDA SECONDARIA: ARMONICA BIANCA AD ALTA FREQUENZA
        ctx.save();
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        for (let x = 0; x <= w; x += step * 1.5) {
            const normX = x / w;
            const sinFast = Math.sin(normX * 42 + this.rfTime * 2.2 + tuneOffset);
            const cosSubtle = Math.cos(normX * 18 - this.rfTime * 0.9);
            const y = baseY + 8 + (sinFast * 0.5 + cosSubtle * 0.5) * (maxAmp * 0.45);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // 3. TELEMETRIA NODI RF: Picchi di modulazione istantanei (Punti luminosi)
        ctx.save();
        const pulseCount = this.isMobile ? 3 : 6;
        for (let p = 1; p <= pulseCount; p++) {
            const pulseNormX = (p / (pulseCount + 1) + Math.sin(this.rfTime * 0.4 + p) * 0.04);
            const px = pulseNormX * w;
            const distFromTune = Math.abs(pulseNormX - 0.5 - (tuneOffset * 0.25));
            const env = Math.exp(-distFromTune * distFromTune * 8);
            const py = baseY + Math.sin(pulseNormX * 16 + this.rfTime + tuneOffset) * maxAmp * (0.35 + env * 0.85);

            ctx.fillStyle = p % 2 === 0 ? '#FF6B1A' : '#FFFFFF';
            ctx.shadowColor = '#FF6B1A';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 2.0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Render stelle di profondità
        this.drawStars();

        // 2. Render spettro RF cinematico GetLayers
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
