const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
const wandElement = document.getElementById('magicWand');
const contentContainer = document.querySelector('.content-container');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initial State
contentContainer.classList.add('hidden-content');
let fireworksActive = false;

class Firework {
    constructor(startX, startY, targetX, targetY, isSpell = false) {
        this.x = startX || Math.random() * canvas.width;
        this.y = startY || canvas.height;
        this.startX = this.x;
        this.startY = this.y;
        this.targetX = targetX || this.x; // Simplified for normal fireworks
        this.targetY = targetY || canvas.height / 2; // Approximate burst height

        // Calculate velocity to reach target (simple projectile physics approximation)
        // For spell, we want it to shoot from wand to different directions
        if (isSpell) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            this.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
            this.exploded = true; // Spell bursts immediately
            this.particles = [];
            this.explode(true);
            return;
        }

        this.sx = Math.random() * 3 - 1.5;
        this.sy = Math.random() * -3 - 3;

        const colors = ['#740001', '#eeba30', '#d3a625', '#ffffff', '#9c92ac'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.velocity = { x: this.sx, y: this.sy };
        this.particles = [];
        this.exploded = false;
        this.size = 2;
    }

    update() {
        if (!this.exploded) {
            this.velocity.y += 0.05;
            this.x += this.velocity.x;
            this.y += this.velocity.y;

            if (this.velocity.y >= 0) {
                this.explode();
            }
        }

        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.alpha <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    draw() {
        if (!this.exploded) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        this.particles.forEach(particle => particle.draw());
    }

    explode(isSpell = false) {
        this.exploded = true;
        const particleCount = isSpell ? 100 : 50;
        for (let i = 0; i < particleCount; i++) {
            // Spell colors are more magical (white/gold/blue)
            const color = isSpell ?
                ['#ffffff', '#fff700', '#00f2fe'][Math.floor(Math.random() * 3)] :
                this.color;
            this.particles.push(new Particle(this.x, this.y, color, isSpell));
        }
    }
}

class Particle {
    constructor(x, y, color, isSpellSpeed) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = isSpellSpeed ? Math.random() * 5 + 2 : Math.random() * 3;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.01;
    }

    update() {
        this.velocity.y += 0.05;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

const fireworks = [];

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (fireworksActive && Math.random() < 0.04) {
        fireworks.push(new Firework());
    }

    fireworks.forEach((firework, index) => {
        firework.update();
        firework.draw();

        // Remove dead fireworks
        if (firework.exploded && firework.particles.length === 0) {
            fireworks.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

// Countdown Logic
const targetTime = new Date();
targetTime.setHours(23, 59, 58, 0);

function updateCountdown() {
    const now = new Date();
    const diff = targetTime - now;
    const countdownEl = document.getElementById('countdown');
    const wandWrapper = document.querySelector('.wand-wrapper');
    const hintEl = document.querySelector('.click-hint');

    if (diff > 0) {
        // Still waiting
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const mStr = minutes.toString().padStart(2, '0');
        const sStr = seconds.toString().padStart(2, '0');

        let timerHTML = '';
        if (minutes > 0) {
            timerHTML = `<span style="font-size: 1rem; display: block; margin-bottom: 5px;">Magic Awakening In</span><span style="font-family: monospace; font-size: 2.5rem; letter-spacing: 5px;">${mStr}:${sStr}</span>`;
        } else {
            // Less than 1 minute, show only seconds, slightly larger
            timerHTML = `<span style="font-size: 1rem; display: block; margin-bottom: 5px;">Magic Awakening In</span><span style="font-family: monospace; font-size: 3rem; letter-spacing: 5px; color: var(--accent-color);">${sStr}</span>`;
        }

        countdownEl.innerHTML = timerHTML;
        countdownEl.style.display = 'block';
        wandWrapper.classList.add('locked');
        if (hintEl) hintEl.style.opacity = '0';
    } else {
        // Time is up!
        // Use .reveal-text class which handles responsive font size
        countdownEl.innerHTML = `<span class="reveal-text reveal-text-anim">Expecto Patronum! 🦌✨</span>`;
        countdownEl.style.display = 'block';
        wandWrapper.classList.remove('locked');
        if (hintEl) hintEl.style.opacity = '1';
        clearInterval(timerInterval);
    }
}

const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown(); // Run immediately

// Interaction
wandElement.parentElement.addEventListener('click', (e) => {
    // specific check just in case
    if (document.querySelector('.wand-wrapper').classList.contains('locked')) return;

    if (contentContainer.classList.contains('reveal-magic')) return; // Already cast

    // Play Sound
    const spellSound = new Audio('expecto.mp3');
    spellSound.play().catch(e => console.log("Audio not found or blocked: ", e));

    // 0. Hide Hint immediately
    document.querySelector('.click-hint').style.opacity = '0';

    // 1. Animate Wand (Swish and Flick)
    wandElement.classList.add('cast-spell');

    // 2. Cast Effect (timed to the "flick" point of animation)
    // Animation is now 2.5s. Flick happens at 50%.
    // 50% of 2500ms = 1250ms.
    setTimeout(() => {
        const rect = wandElement.getBoundingClientRect();
        // Adjust start position to tip of wand based on rotation roughly
        const startX = rect.left + rect.width / 2 + 20;
        const startY = rect.top;

        // Burst
        const spellBurst = new Firework(0, 0, 0, 0, true);
        spellBurst.x = startX;
        spellBurst.y = startY;
        spellBurst.explode(true);
        fireworks.push(spellBurst);

        // Flash background
        const flash = document.createElement('div');
        flash.style.position = 'fixed';
        flash.style.top = 0; flash.style.left = 0;
        flash.style.width = '100vw'; flash.style.height = '100vh';
        flash.style.background = 'white';
        flash.style.opacity = '0.9';
        flash.style.pointerEvents = 'none';
        flash.style.transition = 'opacity 0.8s ease-out';
        flash.style.zIndex = '999';
        document.body.appendChild(flash);

        // Fade out flash
        requestAnimationFrame(() => {
            flash.style.opacity = '0';
        });
        setTimeout(() => flash.remove(), 1000);

        // 3. Hide Wand Wrapper
        wandElement.closest('.wand-wrapper').classList.add('wand-out');

        // 4. Reveal Content
        setTimeout(() => {
            contentContainer.classList.remove('hidden-content');
            contentContainer.classList.add('reveal-magic');
            fireworksActive = true;
        }, 300); // Reveal shortly after flash starts

    }, 1250); // 1250ms matches the 50% flick point of 2.5s animation
});

// Start loop
animate();
