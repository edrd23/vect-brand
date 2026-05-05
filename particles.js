/**
 * VECT Space Particles Background
 * Vanilla JS Port based on ReactBits Particles logic
 * Zero dependencies, high performance.
 */
export class StarField {
    constructor() {
        this.canvas = document.getElementById('vect-space-bg');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = Math.min(window.innerWidth, window.innerHeight) > 768 ? 400 : 200; // Less on mobile
        this.maxZ = 1000;
        this.fov = 300;
        this.baseSpeed = 0.5; // slow drift by default

        this.colors = [
            'rgba(255, 255, 255, {opacity})', // white
            'rgba(255, 255, 255, {opacity})', // white
            'rgba(255, 255, 255, {opacity})', // white
            'rgba(255, 107, 26, {opacity})'   // vect accent (orange)
        ];

        this.init();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Slight interaction on scroll
        window.addEventListener('scroll', () => {
            this.baseSpeed = 2.0; // accelerate briefly on scroll
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.baseSpeed = 0.5;
            }, 100);
        });

        this.animate();
    }

    init() {
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 2000,
                y: (Math.random() - 0.5) * 2000,
                z: Math.random() * this.maxZ,
                size: Math.random() * 1.5 + 0.5,
                colorTemplate: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let star of this.stars) {
            // Move star
            star.z -= this.baseSpeed;

            // Reset if passed screen
            if (star.z <= 1) {
                star.x = (Math.random() - 0.5) * 2000;
                star.y = (Math.random() - 0.5) * 2000;
                star.z = this.maxZ;
            }

            // 3D to 2D projection
            const scale = this.fov / (this.fov + star.z);
            const x2d = star.x * scale + this.cx;
            const y2d = star.y * scale + this.cy;

            // Opacity is higher when closer to screen
            const opacity = Math.max(0, 1 - (star.z / this.maxZ));

            // Size increases slightly as it gets closer
            const size2d = star.size * scale * (1 / (star.z * 0.001 + 0.1));

            // Only draw if within screen bounds to save draw calls
            if (x2d > 0 && x2d < this.canvas.width && y2d > 0 && y2d < this.canvas.height) {
                this.ctx.fillStyle = star.colorTemplate.replace('{opacity}', opacity.toFixed(2));
                this.ctx.beginPath();
                this.ctx.arc(x2d, y2d, Math.max(0.1, size2d), 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// NOTE: StarField is instantiated exclusively by js/main.js (ES module).
// Do NOT add auto-init here — it would create a duplicate instance.
