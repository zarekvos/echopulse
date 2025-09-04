// Echo Pulse Game - Enhanced Game Engine
class EchoPulseGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, paused, gameOver, levelComplete
        
        // Game entities
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.powerups = [];
        
        // Input handling
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.mousePressed = false;
        
        // Game settings
        this.currentWeapon = 'pulse';
        this.difficulty = 1;
        this.gameSettings = {
            soundEnabled: true,
            particlesEnabled: true,
            screenShake: true,
            autoSave: true
        };
        
        // Performance tracking
        this.fps = 0;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Game stats
        this.gameStats = {
            level: 1,
            score: 0,
            health: 100,
            energy: 100,
            enemiesKilled: 0,
            shotsFired: 0,
            accuracy: 0,
            timePlayed: 0,
            bestStreak: 0,
            currentStreak: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initializePlayer();
        this.startGameLoop();
    }
    
    setupCanvas() {
        // Set canvas size based on container
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = Math.min(800, rect.width - 40);
        this.canvas.height = Math.min(600, rect.height - 40);
        
        // Set up high DPI support
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        this.canvas.width = displayWidth * dpr;
        this.canvas.height = displayHeight * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Window events
        window.addEventListener('resize', () => this.setupCanvas());
        window.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    }
    
    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        // Prevent default for game keys
        if (['w', 'a', 's', 'd', ' ', '1', '2', '3'].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
        
        // Handle special keys
        switch(e.key.toLowerCase()) {
            case ' ':
                if (this.gameState === 'playing') {
                    this.player.sendEcho();
                }
                break;
            case '1':
                this.currentWeapon = 'pulse';
                this.updateWeaponUI();
                break;
            case '2':
                this.currentWeapon = 'rapid';
                this.updateWeaponUI();
                break;
            case '3':
                this.currentWeapon = 'heavy';
                this.updateWeaponUI();
                break;
            case 'escape':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
    }
    
    handleMouseDown(e) {
        this.mousePressed = true;
        if (this.gameState === 'playing' && e.button === 0) {
            this.player.shoot();
            this.gameStats.shotsFired++;
        }
    }
    
    handleMouseUp(e) {
        this.mousePressed = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        this.handleMouseDown({ button: 0 });
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.handleMouseUp({ button: 0 });
    }
    
    handleVisibilityChange() {
        if (document.hidden && this.gameState === 'playing') {
            this.pauseGame();
        }
    }
    
    initializePlayer() {
        this.player = new EnhancedPlayer(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this
        );
    }
    
    spawnEnemies() {
        this.enemies = [];
        const baseCount = 3;
        const levelBonus = Math.floor(this.gameStats.level / 3);
        const totalEnemies = Math.min(baseCount + levelBonus, 15);
        
        for (let i = 0; i < totalEnemies; i++) {
            let x, y;
            let attempts = 0;
            
            // Find valid spawn position
            do {
                x = Math.random() * (this.canvas.width - 100) + 50;
                y = Math.random() * (this.canvas.height - 100) + 50;
                attempts++;
            } while (
                this.getDistance(x, y, this.player.x, this.player.y) < 150 &&
                attempts < 50
            );
            
            const enemy = new EnhancedEnemy(x, y, this);
            enemy.level = Math.min(1 + Math.floor(this.gameStats.level / 5), 10);
            enemy.health = enemy.level * 2;
            enemy.maxHealth = enemy.health;
            this.enemies.push(enemy);
        }
    }
    
    spawnPowerup(x, y) {
        const powerupTypes = ['health', 'energy', 'weapon', 'shield', 'score'];
        const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        this.powerups.push(new Powerup(x, y, type, this));
    }
    
    createParticleEffect(x, y, type, count = 5) {
        if (!this.gameSettings.particlesEnabled) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push(new EnhancedParticle(x, y, type, this));
        }
    }
    
    createScreenShake(intensity = 5, duration = 300) {
        if (!this.gameSettings.screenShake) return;
        
        const startTime = Date.now();
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const progress = 1 - (elapsed / duration);
                const shakeX = (Math.random() - 0.5) * intensity * progress;
                const shakeY = (Math.random() - 0.5) * intensity * progress;
                
                this.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
                requestAnimationFrame(shake);
            } else {
                this.canvas.style.transform = 'translate(0, 0)';
            }
        };
        shake();
    }
    
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    checkCollision(obj1, obj2) {
        return this.getDistance(obj1.x, obj1.y, obj2.x, obj2.y) < 
               (obj1.radius || obj1.width/2) + (obj2.radius || obj2.width/2);
    }
    
    updateWeaponUI() {
        // Update weapon selector UI
        document.querySelectorAll('.weapon-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.weapon === this.currentWeapon);
        });
    }
    
    updateGameUI() {
        // Update UI elements
        this.updateElement('currentLevel', this.gameStats.level);
        this.updateElement('currentScore', this.gameStats.score.toLocaleString());
        this.updateElement('enemiesCount', this.enemies.length);
        
        // Update progress bars
        this.updateProgressBar('healthBar', this.gameStats.health);
        this.updateProgressBar('energyBar', this.gameStats.energy);
        
        // Update timer
        const minutes = Math.floor(this.gameStats.timePlayed / 60);
        const seconds = Math.floor(this.gameStats.timePlayed % 60);
        this.updateElement('gameTimer', 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        
        // Update accuracy
        this.gameStats.accuracy = this.gameStats.shotsFired > 0 ? 
            Math.round((this.gameStats.enemiesKilled / this.gameStats.shotsFired) * 100) : 0;
    }
    
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }
    
    updateProgressBar(id, percentage) {
        const element = document.getElementById(id);
        if (element) element.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.gameStats = {
            level: 1,
            score: 0,
            health: 100,
            energy: 100,
            enemiesKilled: 0,
            shotsFired: 0,
            accuracy: 0,
            timePlayed: 0,
            bestStreak: 0,
            currentStreak: 0
        };
        
        this.initializePlayer();
        this.spawnEnemies();
        this.bullets = [];
        this.particles = [];
        this.powerups = [];
        
        // Hide start screen
        const startScreen = document.getElementById('startScreen');
        if (startScreen) startScreen.style.display = 'none';
    }
    
    pauseGame() {
        this.gameState = 'paused';
        // Show pause menu
    }
    
    resumeGame() {
        this.gameState = 'playing';
        // Hide pause menu
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pauseGame();
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        this.gameStats.level++;
        this.gameStats.score += 500 + (this.gameStats.level * 100);
        
        // Bonus for accuracy
        if (this.gameStats.accuracy > 80) {
            this.gameStats.score += 1000;
        }
        
        // Show level complete UI
        setTimeout(() => {
            this.nextLevel();
        }, 2000);
    }
    
    nextLevel() {
        this.gameState = 'playing';
        this.player.health = Math.min(100, this.player.health + 25);
        this.player.energy = 100;
        this.spawnEnemies();
        this.createParticleEffect(this.player.x, this.player.y, 'levelup', 15);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.createParticleEffect(this.player.x, this.player.y, 'explosion', 20);
        this.createScreenShake(10, 500);
        
        // Save high score
        this.saveHighScore();
        
        // Show game over screen
        setTimeout(() => {
            this.showGameOverScreen();
        }, 1000);
    }
    
    saveHighScore() {
        const savedScore = localStorage.getItem('echoPulseHighScore') || 0;
        if (this.gameStats.score > savedScore) {
            localStorage.setItem('echoPulseHighScore', this.gameStats.score);
            localStorage.setItem('echoPulseGameStats', JSON.stringify(this.gameStats));
        }
    }
    
    showGameOverScreen() {
        // Implementation for game over screen
        console.log('Game Over - Score:', this.gameStats.score);
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update game timer
        this.gameStats.timePlayed += deltaTime / 1000;
        
        // Update entities
        if (this.player) {
            this.player.update(deltaTime);
            this.gameStats.health = this.player.health;
            this.gameStats.energy = this.player.energy;
        }
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.update(deltaTime);
            return bullet.life > 0;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update(deltaTime);
            return particle.life > 0;
        });
        
        // Update powerups
        this.powerups = this.powerups.filter(powerup => {
            powerup.update(deltaTime);
            return !powerup.collected && powerup.life > 0;
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Update UI
        this.updateGameUI();
        
        // Check win/lose conditions
        if (this.enemies.length === 0) {
            this.levelComplete();
        } else if (this.player && this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        // Bullet vs Enemy collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    // Damage enemy
                    enemy.takeDamage(bullet.damage);
                    this.createParticleEffect(enemy.x, enemy.y, 'hit', 3);
                    
                    // Remove bullet
                    this.bullets.splice(i, 1);
                    
                    // Check if enemy is dead
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.gameStats.enemiesKilled++;
                        this.gameStats.currentStreak++;
                        this.gameStats.bestStreak = Math.max(this.gameStats.bestStreak, this.gameStats.currentStreak);
                        this.gameStats.score += 100 * enemy.level;
                        
                        // Chance to spawn powerup
                        if (Math.random() < 0.3) {
                            this.spawnPowerup(enemy.x, enemy.y);
                        }
                        
                        this.createParticleEffect(enemy.x, enemy.y, 'explosion', 8);
                    }
                    break;
                }
            }
        }
        
        // Player vs Enemy collisions
        if (this.player) {
            this.enemies.forEach(enemy => {
                if (this.checkCollision(this.player, enemy)) {
                    const damage = enemy.getDamage();
                    this.player.takeDamage(damage);
                    this.gameStats.currentStreak = 0;
                    this.createParticleEffect(this.player.x, this.player.y, 'damage', 5);
                    this.createScreenShake(8, 200);
                }
            });
        }
        
        // Player vs Powerup collisions
        if (this.player) {
            this.powerups.forEach(powerup => {
                if (this.checkCollision(this.player, powerup)) {
                    powerup.apply(this.player);
                    powerup.collected = true;
                    this.createParticleEffect(powerup.x, powerup.y, 'pickup', 6);
                }
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw space background
        this.drawSpaceBackground();
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            // Draw entities
            if (this.player) this.player.draw(this.ctx);
            
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
            this.bullets.forEach(bullet => bullet.draw(this.ctx));
            this.powerups.forEach(powerup => powerup.draw(this.ctx));
            this.particles.forEach(particle => particle.draw(this.ctx));
            
            // Draw echo visualization
            this.drawEchoVisualization();
            
            // Draw pause overlay
            if (this.gameState === 'paused') {
                this.drawPauseOverlay();
            }
        }
        
        // Draw debug info if enabled
        if (this.debugMode) {
            this.drawDebugInfo();
        }
    }
    
    drawSpaceBackground() {
        const time = Date.now() * 0.0005;
        
        for (let i = 0; i < 100; i++) {
            const x = (Math.sin(i * 0.1 + time) * 0.5 + 0.5) * this.canvas.width;
            const y = (Math.cos(i * 0.13 + time * 0.7) * 0.5 + 0.5) * this.canvas.height;
            const alpha = Math.sin(i * 0.2 + time * 2) * 0.5 + 0.5;
            const size = Math.sin(i * 0.3 + time) * 0.5 + 1;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha * 0.6;
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawEchoVisualization() {
        if (!this.player) return;
        
        const now = Date.now();
        const timeSinceEcho = now - this.player.lastEchoTime;
        
        if (timeSinceEcho < 2000) {
            const progress = timeSinceEcho / 2000;
            const radius = progress * 300;
            const alpha = (1 - progress) * 0.3;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.strokeStyle = '#06b6d4';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Inner ring
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
    
    drawPauseOverlay() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = 'bold 48px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Inter';
        this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.restore();
    }
    
    drawDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 200, 120);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${this.fps}`, 20, 30);
        this.ctx.fillText(`Entities: ${this.enemies.length + this.bullets.length + this.particles.length}`, 20, 50);
        this.ctx.fillText(`Mouse: ${Math.round(this.mousePos.x)}, ${Math.round(this.mousePos.y)}`, 20, 70);
        this.ctx.fillText(`Player: ${Math.round(this.player?.x || 0)}, ${Math.round(this.player?.y || 0)}`, 20, 90);
        this.ctx.fillText(`State: ${this.gameState}`, 20, 110);
        this.ctx.restore();
    }
    
    calculateFPS(currentTime) {
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / deltaTime);
        }
    }
    
    startGameLoop() {
        const gameLoop = (currentTime) => {
            this.calculateFPS(currentTime);
            
            const deltaTime = currentTime - this.lastFrameTime;
            this.update(deltaTime);
            this.render();
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.echoPulseGame = new EchoPulseGame('gameCanvas');
});
