/**
 * Battle Arena - Online PvP Game
 * Complete game logic with multiplayer support
 */

class BattleArenaGame {
    constructor() {
        this.currentScreen = 'loadingScreen';
        this.player = {
            id: this.generateId(),
            name: '',
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            health: 100,
            maxHealth: 100,
            score: 0,
            wins: 0,
            defending: false,
            attacking: false,
            specialCooldown: 0
        };
        this.opponent = {
            id: null,
            name: 'Opponent',
            x: 0,
            y: 0,
            health: 100,
            maxHealth: 100,
            score: 0,
            defending: false
        };
        this.gameState = {
            running: false,
            timeLeft: 180, // 3 minutes
            roomCode: null,
            isHost: false
        };
        this.canvas = null;
        this.ctx = null;
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        this.projectiles = [];
        this.particles = [];
        this.matchmakingTimer = null;
        this.gameTimer = null;
        this.animationFrame = null;
        
        this.init();
    }

    generateId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        // Initialize canvas
        this.canvas = document.getElementById('gameCanvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // Load saved data
        this.loadPlayerData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Simulate loading
        setTimeout(() => {
            this.hideScreen('loadingScreen');
            this.showScreen('mainMenu');
        }, 2000);

        // Initialize leaderboard
        this.initializeLeaderboard();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('quickPlayBtn')?.addEventListener('click', () => this.startQuickPlay());
        document.getElementById('createRoomBtn')?.addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoomBtn')?.addEventListener('click', () => this.showJoinRoomModal());
        document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.showLeaderboard());
        document.getElementById('howToPlayBtn')?.addEventListener('click', () => this.showHowToPlay());

        // Player name input
        document.getElementById('playerName')?.addEventListener('change', (e) => {
            this.player.name = e.target.value || 'Player';
            this.savePlayerData();
        });

        // Matchmaking
        document.getElementById('cancelMatchmakingBtn')?.addEventListener('click', () => this.cancelMatchmaking());

        // Room
        document.getElementById('copyRoomCodeBtn')?.addEventListener('click', () => this.copyRoomCode());
        document.getElementById('startGameBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('leaveRoomBtn')?.addEventListener('click', () => this.leaveRoom());

        // Join room modal
        document.getElementById('confirmJoinBtn')?.addEventListener('click', () => this.joinRoom());
        document.getElementById('cancelJoinBtn')?.addEventListener('click', () => this.hideJoinRoomModal());

        // Game controls
        this.setupJoystick();
        document.getElementById('attackBtn')?.addEventListener('click', () => this.attack());
        document.getElementById('defendBtn')?.addEventListener('touchstart', () => this.startDefend());
        document.getElementById('defendBtn')?.addEventListener('touchend', () => this.stopDefend());
        document.getElementById('defendBtn')?.addEventListener('mousedown', () => this.startDefend());
        document.getElementById('defendBtn')?.addEventListener('mouseup', () => this.stopDefend());
        document.getElementById('specialBtn')?.addEventListener('click', () => this.specialAttack());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseGame());

        // Pause menu
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('quitBtn')?.addEventListener('click', () => this.quitGame());

        // Game over
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.playAgain());
        document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.returnToMainMenu());

        // Leaderboard
        document.getElementById('closeLeaderboardBtn')?.addEventListener('click', () => this.closeLeaderboard());
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterLeaderboard(e.target.dataset.filter));
        });

        // How to play
        document.getElementById('closeHowToPlayBtn')?.addEventListener('click', () => this.closeHowToPlay());
    }

    setupJoystick() {
        const joystick = document.getElementById('joystick');
        const knob = joystick?.querySelector('.joystick-knob');
        if (!joystick || !knob) return;

        const handleStart = (e) => {
            e.preventDefault();
            this.joystick.active = true;
            const rect = joystick.getBoundingClientRect();
            this.joystick.centerX = rect.left + rect.width / 2;
            this.joystick.centerY = rect.top + rect.height / 2;
        };

        const handleMove = (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();

            const touch = e.touches ? e.touches[0] : e;
            const dx = touch.clientX - this.joystick.centerX;
            const dy = touch.clientY - this.joystick.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 35;

            let x = dx;
            let y = dy;

            if (distance > maxDistance) {
                x = (dx / distance) * maxDistance;
                y = (dy / distance) * maxDistance;
            }

            knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

            // Update player velocity
            this.player.vx = x / maxDistance * 5;
            this.player.vy = y / maxDistance * 5;
        };

        const handleEnd = (e) => {
            e.preventDefault();
            this.joystick.active = false;
            knob.style.transform = 'translate(-50%, -50%)';
            this.player.vx = 0;
            this.player.vy = 0;
        };

        joystick.addEventListener('touchstart', handleStart);
        joystick.addEventListener('mousedown', handleStart);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchend', handleEnd);
        document.addEventListener('mouseup', handleEnd);
    }

    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('active');
        }
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Player data management
    loadPlayerData() {
        const savedData = localStorage.getItem('battleArenaPlayer');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.player.name = data.name || '';
            this.player.wins = data.wins || 0;
            this.player.score = data.totalScore || 0;
            
            document.getElementById('playerName').value = this.player.name;
            document.getElementById('playerWins').textContent = this.player.wins;
            document.getElementById('playerScore').textContent = this.player.score;
        }
    }

    savePlayerData() {
        const data = {
            name: this.player.name,
            wins: this.player.wins,
            totalScore: this.player.score
        };
        localStorage.setItem('battleArenaPlayer', JSON.stringify(data));
        
        document.getElementById('playerWins').textContent = this.player.wins;
        document.getElementById('playerScore').textContent = this.player.score;
    }

    // Matchmaking
    startQuickPlay() {
        if (!this.player.name) {
            this.showToast('Please enter your name first!', 'error');
            return;
        }

        this.showScreen('matchmakingScreen');
        this.showToast('Searching for opponent...', 'info');
        
        // Simulate matchmaking (in real app, this would connect to a server)
        let dots = 0;
        this.matchmakingTimer = setInterval(() => {
            dots = (dots + 1) % 4;
            document.getElementById('matchmakingStatus').textContent = 
                'Searching for players' + '.'.repeat(dots);
        }, 500);

        // Simulate finding opponent after 3 seconds
        setTimeout(() => {
            this.foundOpponent();
        }, 3000);
    }

    foundOpponent() {
        clearInterval(this.matchmakingTimer);
        this.opponent.name = this.generateOpponentName();
        this.showToast(`Opponent found: ${this.opponent.name}!`, 'success');
        
        setTimeout(() => {
            this.startGame();
        }, 1500);
    }

    cancelMatchmaking() {
        clearInterval(this.matchmakingTimer);
        this.showScreen('mainMenu');
        this.showToast('Matchmaking cancelled', 'info');
    }

    generateOpponentName() {
        const names = [
            'ShadowWarrior', 'DragonSlayer', 'NightHunter', 'IronFist',
            'StormBringer', 'PhoenixRider', 'ThunderStrike', 'DarkKnight',
            'BlazeRunner', 'FrostBite', 'MysticSage', 'VoidWalker'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    // Room management
    createRoom() {
        if (!this.player.name) {
            this.showToast('Please enter your name first!', 'error');
            return;
        }

        this.gameState.roomCode = this.generateRoomCode();
        this.gameState.isHost = true;
        
        this.showScreen('roomScreen');
        document.getElementById('roomCodeDisplay').textContent = this.gameState.roomCode;
        this.updateRoomPlayersList();
        
        this.showToast('Room created! Share the code with your friend.', 'success');
    }

    generateRoomCode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    copyRoomCode() {
        const code = this.gameState.roomCode;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code);
            this.showToast('Room code copied!', 'success');
        } else {
            this.showToast('Code: ' + code, 'info');
        }
    }

    updateRoomPlayersList() {
        const list = document.getElementById('roomPlayersList');
        if (!list) return;

        list.innerHTML = `
            <div class="player-item">
                <span>👤 ${this.player.name}</span>
                <span style="color: var(--gold);">HOST</span>
            </div>
        `;

        if (this.opponent.name) {
            list.innerHTML += `
                <div class="player-item">
                    <span>👤 ${this.opponent.name}</span>
                    <span style="color: var(--secondary-color);">READY</span>
                </div>
            `;
        } else {
            list.innerHTML += `
                <div class="player-item" style="opacity: 0.5;">
                    <span>Waiting for player...</span>
                </div>
            `;
        }
    }

    showJoinRoomModal() {
        if (!this.player.name) {
            this.showToast('Please enter your name first!', 'error');
            return;
        }
        this.showModal('joinRoomModal');
    }

    hideJoinRoomModal() {
        this.hideModal('joinRoomModal');
        document.getElementById('roomCodeInput').value = '';
    }

    joinRoom() {
        const code = document.getElementById('roomCodeInput').value.toUpperCase();
        if (code.length !== 6) {
            this.showToast('Please enter a valid 6-character room code', 'error');
            return;
        }

        this.hideJoinRoomModal();
        
        // Simulate joining room
        this.showToast('Joining room...', 'info');
        setTimeout(() => {
            this.gameState.roomCode = code;
            this.gameState.isHost = false;
            this.opponent.name = 'Host Player';
            
            this.showScreen('roomScreen');
            document.getElementById('roomCodeDisplay').textContent = code;
            this.updateRoomPlayersList();
            
            this.showToast('Joined room successfully!', 'success');
        }, 1000);
    }

    leaveRoom() {
        this.showScreen('mainMenu');
        this.gameState.roomCode = null;
        this.gameState.isHost = false;
        this.opponent.name = null;
        this.showToast('Left room', 'info');
    }

    // Game logic
    startGame() {
        // Initialize game state
        this.gameState.running = true;
        this.gameState.timeLeft = 180;
        
        // Reset player and opponent
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        this.player.x = canvasWidth * 0.25;
        this.player.y = canvasHeight / 2;
        this.player.health = 100;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.defending = false;
        this.player.attacking = false;
        this.player.specialCooldown = 0;
        
        this.opponent.x = canvasWidth * 0.75;
        this.opponent.y = canvasHeight / 2;
        this.opponent.health = 100;
        this.opponent.defending = false;

        this.projectiles = [];
        this.particles = [];
        
        // Update UI
        this.updateHealthBars();
        this.updateGameScore();
        
        // Show game screen
        this.showScreen('gameScreen');
        this.showToast('Fight!', 'success');
        
        // Start game timer
        this.startGameTimer();
        
        // Start game loop
        this.gameLoop();
        
        // Start opponent AI
        this.startOpponentAI();
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameState.running) {
                this.gameState.timeLeft--;
                
                const minutes = Math.floor(this.gameState.timeLeft / 60);
                const seconds = this.gameState.timeLeft % 60;
                document.getElementById('gameTimer').textContent = 
                    `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                if (this.gameState.timeLeft <= 0) {
                    this.endGame();
                }

                // Update special cooldown
                if (this.player.specialCooldown > 0) {
                    this.player.specialCooldown--;
                    if (this.player.specialCooldown === 0) {
                        document.getElementById('specialBtn').disabled = false;
                        this.showToast('Special attack ready!', 'info');
                    }
                }
            }
        }, 1000);
    }

    gameLoop() {
        if (!this.gameState.running) return;

        this.updateGame();
        this.renderGame();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }

    updateGame() {
        // Update player position
        this.player.x += this.player.vx;
        this.player.y += this.player.vy;
        
        // Keep player in bounds
        const playerSize = 30;
        this.player.x = Math.max(playerSize, Math.min(this.canvas.width - playerSize, this.player.x));
        this.player.y = Math.max(playerSize, Math.min(this.canvas.height - playerSize, this.player.y));
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => {
            proj.x += proj.vx;
            proj.y += proj.vy;
            proj.life--;
            
            // Check collision with target
            if (proj.target === 'opponent') {
                const dist = this.getDistance(proj.x, proj.y, this.opponent.x, this.opponent.y);
                if (dist < 30) {
                    this.hitOpponent(proj.damage);
                    return false;
                }
            }
            
            return proj.life > 0 && 
                   proj.x > 0 && proj.x < this.canvas.width &&
                   proj.y > 0 && proj.y < this.canvas.height;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life--;
            particle.alpha -= 0.02;
            return particle.life > 0 && particle.alpha > 0;
        });
    }

    renderGame() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw projectiles
        this.projectiles.forEach(proj => this.drawProjectile(proj));
        
        // Draw players
        this.drawPlayer(this.player, '#6C5CE7');
        this.drawPlayer(this.opponent, '#FF6B6B');
        
        // Draw defending effects
        if (this.player.defending) {
            this.drawShield(this.player.x, this.player.y);
        }
        if (this.opponent.defending) {
            this.drawShield(this.opponent.x, this.opponent.y);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player, color) {
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y + 35, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Body
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Outline
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Name
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, player.x, player.y - 35);
    }

    drawProjectile(proj) {
        this.ctx.fillStyle = proj.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = proj.color;
        this.ctx.beginPath();
        this.ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawParticle(particle) {
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawShield(x, y) {
        this.ctx.strokeStyle = '#4ECDC4';
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 35, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Combat actions
    attack() {
        if (!this.gameState.running || this.player.attacking) return;
        
        this.player.attacking = true;
        
        const angle = Math.atan2(
            this.opponent.y - this.player.y,
            this.opponent.x - this.player.x
        );
        
        this.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: Math.cos(angle) * 8,
            vy: Math.sin(angle) * 8,
            damage: 15,
            color: '#6C5CE7',
            size: 8,
            life: 100,
            target: 'opponent'
        });
        
        this.createParticles(this.player.x, this.player.y, '#6C5CE7', 5);
        
        setTimeout(() => {
            this.player.attacking = false;
        }, 300);
    }

    startDefend() {
        if (!this.gameState.running) return;
        this.player.defending = true;
    }

    stopDefend() {
        this.player.defending = false;
    }

    specialAttack() {
        if (!this.gameState.running || this.player.specialCooldown > 0) return;
        
        const angle = Math.atan2(
            this.opponent.y - this.player.y,
            this.opponent.x - this.player.x
        );
        
        // Create 3 projectiles
        for (let i = -1; i <= 1; i++) {
            const spreadAngle = angle + (i * 0.2);
            this.projectiles.push({
                x: this.player.x,
                y: this.player.y,
                vx: Math.cos(spreadAngle) * 10,
                vy: Math.sin(spreadAngle) * 10,
                damage: 30,
                color: '#FFA502',
                size: 12,
                life: 100,
                target: 'opponent'
            });
        }
        
        this.createParticles(this.player.x, this.player.y, '#FFA502', 15);
        
        this.player.specialCooldown = 10;
        document.getElementById('specialBtn').disabled = true;
        this.showToast('Special attack!', 'success');
    }

    hitOpponent(damage) {
        if (this.opponent.defending) {
            damage = Math.floor(damage / 2);
            this.showToast('Blocked!', 'info');
        }
        
        this.opponent.health = Math.max(0, this.opponent.health - damage);
        this.updateHealthBars();
        this.createParticles(this.opponent.x, this.opponent.y, '#FF6B6B', 10);
        
        if (this.opponent.health <= 0) {
            this.endGame(true);
        }
    }

    hitPlayer(damage) {
        if (this.player.defending) {
            damage = Math.floor(damage / 2);
            this.showToast('Blocked!', 'info');
        }
        
        this.player.health = Math.max(0, this.player.health - damage);
        this.updateHealthBars();
        this.createParticles(this.player.x, this.player.y, '#6C5CE7', 10);
        
        if (this.player.health <= 0) {
            this.endGame(false);
        }
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: color,
                size: Math.random() * 4 + 2,
                life: 30,
                alpha: 1
            });
        }
    }

    updateHealthBars() {
        const playerHealthPercent = (this.player.health / this.player.maxHealth) * 100;
        const opponentHealthPercent = (this.opponent.health / this.opponent.maxHealth) * 100;
        
        document.getElementById('playerHealthBar').style.width = playerHealthPercent + '%';
        document.getElementById('opponentHealthBar').style.width = opponentHealthPercent + '%';
        document.getElementById('playerHealth').textContent = this.player.health;
        document.getElementById('opponentHealth').textContent = this.opponent.health;
    }

    updateGameScore() {
        const playerScore = 100 - this.opponent.health;
        const opponentScore = 100 - this.player.health;
        document.getElementById('gameScoreDisplay').textContent = `${playerScore} - ${opponentScore}`;
    }

    // Opponent AI
    startOpponentAI() {
        setInterval(() => {
            if (!this.gameState.running) return;
            
            // Random movement
            if (Math.random() < 0.3) {
                const targetX = Math.random() * this.canvas.width;
                const targetY = Math.random() * this.canvas.height;
                
                const angle = Math.atan2(targetY - this.opponent.y, targetX - this.opponent.x);
                this.opponent.x += Math.cos(angle) * 3;
                this.opponent.y += Math.sin(angle) * 3;
                
                const opponentSize = 30;
                this.opponent.x = Math.max(opponentSize, Math.min(this.canvas.width - opponentSize, this.opponent.x));
                this.opponent.y = Math.max(opponentSize, Math.min(this.canvas.height - opponentSize, this.opponent.y));
            }
            
            // Random attacks
            if (Math.random() < 0.15) {
                const angle = Math.atan2(
                    this.player.y - this.opponent.y,
                    this.player.x - this.opponent.x
                );
                
                this.projectiles.push({
                    x: this.opponent.x,
                    y: this.opponent.y,
                    vx: Math.cos(angle) * 7,
                    vy: Math.sin(angle) * 7,
                    damage: 12,
                    color: '#FF6B6B',
                    size: 8,
                    life: 100,
                    target: 'player'
                });
                
                this.createParticles(this.opponent.x, this.opponent.y, '#FF6B6B', 5);
            }
            
            // Random defending
            if (Math.random() < 0.1) {
                this.opponent.defending = true;
                setTimeout(() => {
                    this.opponent.defending = false;
                }, 1000);
            }
            
            // Check projectile hits on player
            this.projectiles.forEach((proj, index) => {
                if (proj.target === 'player') {
                    const dist = this.getDistance(proj.x, proj.y, this.player.x, this.player.y);
                    if (dist < 30) {
                        this.hitPlayer(proj.damage);
                        this.projectiles.splice(index, 1);
                    }
                }
            });
        }, 500);
    }

    // Game end
    pauseGame() {
        this.gameState.running = false;
        this.showModal('pauseMenu');
    }

    resumeGame() {
        this.hideModal('pauseMenu');
        this.gameState.running = true;
        this.gameLoop();
    }

    quitGame() {
        this.hideModal('pauseMenu');
        this.endGameCleanup();
        this.showScreen('mainMenu');
        this.showToast('Game ended', 'info');
    }

    endGame(playerWon = null) {
        this.gameState.running = false;
        
        const playerScore = 100 - this.opponent.health;
        const opponentScore = 100 - this.player.health;
        
        let winner;
        if (playerWon !== null) {
            winner = playerWon;
        } else {
            winner = playerScore > opponentScore;
        }
        
        // Update stats
        const expGained = winner ? 100 : 50;
        this.player.score += playerScore + expGained;
        
        if (winner) {
            this.player.wins++;
        }
        
        this.savePlayerData();
        this.updateLeaderboard(this.player.name, this.player.wins, this.player.score);
        
        // Show game over screen
        document.getElementById('gameOverTitle').textContent = winner ? '🏆 Victory! 🏆' : '💔 Defeat 💔';
        document.getElementById('gameOverTitle').style.color = winner ? var(--gold) : var(--danger-color);
        document.getElementById('finalPlayerScore').textContent = playerScore;
        document.getElementById('finalOpponentScore').textContent = opponentScore;
        document.getElementById('damageDealt').textContent = playerScore;
        document.getElementById('expGained').textContent = '+' + expGained + ' XP';
        
        this.endGameCleanup();
        
        setTimeout(() => {
            this.showScreen('gameOverScreen');
        }, 1000);
    }

    endGameCleanup() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    playAgain() {
        this.startQuickPlay();
    }

    returnToMainMenu() {
        this.showScreen('mainMenu');
    }

    // Leaderboard
    initializeLeaderboard() {
        if (!localStorage.getItem('battleArenaLeaderboard')) {
            const defaultLeaderboard = [
                { name: 'DragonSlayer', wins: 50, score: 15000 },
                { name: 'ShadowWarrior', wins: 45, score: 13500 },
                { name: 'ThunderStrike', wins: 40, score: 12000 },
                { name: 'PhoenixRider', wins: 35, score: 10500 },
                { name: 'IronFist', wins: 30, score: 9000 }
            ];
            localStorage.setItem('battleArenaLeaderboard', JSON.stringify(defaultLeaderboard));
        }
    }

    updateLeaderboard(playerName, wins, score) {
        if (!playerName) return;
        
        let leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard') || '[]');
        
        // Find or add player
        const existingIndex = leaderboard.findIndex(p => p.name === playerName);
        if (existingIndex >= 0) {
            leaderboard[existingIndex].wins = wins;
            leaderboard[existingIndex].score = score;
        } else {
            leaderboard.push({ name: playerName, wins, score });
        }
        
        // Sort by wins
        leaderboard.sort((a, b) => b.wins - a.wins);
        
        // Keep top 50
        leaderboard = leaderboard.slice(0, 50);
        
        localStorage.setItem('battleArenaLeaderboard', JSON.stringify(leaderboard));
    }

    showLeaderboard() {
        this.showScreen('leaderboardScreen');
        this.filterLeaderboard('wins');
    }

    filterLeaderboard(sortBy) {
        const leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard') || '[]');
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === sortBy);
        });
        
        // Sort
        if (sortBy === 'wins') {
            leaderboard.sort((a, b) => b.wins - a.wins);
        } else {
            leaderboard.sort((a, b) => b.score - a.score);
        }
        
        // Render
        const list = document.getElementById('leaderboardList');
        list.innerHTML = '';
        
        leaderboard.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'gold';
            else if (index === 1) rankClass = 'silver';
            else if (index === 2) rankClass = 'bronze';
            
            item.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${sortBy === 'wins' ? player.wins + ' wins' : player.score + ' pts'}</div>
            `;
            
            list.appendChild(item);
        });
    }

    closeLeaderboard() {
        this.showScreen('mainMenu');
    }

    // How to play
    showHowToPlay() {
        this.showScreen('howToPlayScreen');
    }

    closeHowToPlay() {
        this.showScreen('mainMenu');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new BattleArenaGame();
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
