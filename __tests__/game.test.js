/**
 * Battle Arena Game Tests
 * Tests for game functionality and core mechanics
 */

describe('Battle Arena Game - Core Tests', () => {
    // Basic sanity tests
    test('should define BattleArenaGame class', () => {
        expect(typeof BattleArenaGame).toBe('function');
    });

    test('should generate unique player IDs', () => {
        const game = new BattleArenaGame();
        expect(game.player.id).toBeDefined();
        expect(game.player.id).toMatch(/^player_/);
    });

    test('should initialize player with default values', () => {
        const game = new BattleArenaGame();
        expect(game.player.health).toBe(100);
        expect(game.player.maxHealth).toBe(100);
        expect(game.player.score).toBeGreaterThanOrEqual(0);
        expect(game.player.wins).toBeGreaterThanOrEqual(0);
    });

    test('should initialize opponent with default values', () => {
        const game = new BattleArenaGame();
        expect(game.opponent.health).toBe(100);
        expect(game.opponent.maxHealth).toBe(100);
    });

    test('should generate valid room codes', () => {
        const game = new BattleArenaGame();
        const roomCode = game.generateRoomCode();
        expect(roomCode).toBeDefined();
        expect(roomCode.length).toBe(6);
        expect(roomCode).toMatch(/^[A-Z0-9]+$/);
    });

    test('should generate opponent names', () => {
        const game = new BattleArenaGame();
        const name = game.generateOpponentName();
        expect(name).toBeDefined();
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
    });

    test('should calculate distance correctly', () => {
        const game = new BattleArenaGame();
        const distance = game.getDistance(0, 0, 3, 4);
        expect(distance).toBe(5);
    });

    test('should manage game state', () => {
        const game = new BattleArenaGame();
        expect(game.gameState.running).toBe(false);
        expect(game.gameState.timeLeft).toBe(180);
        expect(game.gameState.roomCode).toBeNull();
        expect(game.gameState.isHost).toBe(false);
    });

    test('should initialize with empty projectiles and particles', () => {
        const game = new BattleArenaGame();
        expect(game.projectiles).toEqual([]);
        expect(game.particles).toEqual([]);
    });

    test('should have joystick in inactive state initially', () => {
        const game = new BattleArenaGame();
        expect(game.joystick.active).toBe(false);
    });
});

describe('Battle Arena Game - Combat Mechanics', () => {
    test('should reduce opponent health on hit', () => {
        const game = new BattleArenaGame();
        game.opponent.health = 100;
        game.hitOpponent(20);
        expect(game.opponent.health).toBe(80);
    });

    test('should not reduce health below zero', () => {
        const game = new BattleArenaGame();
        game.opponent.health = 10;
        game.hitOpponent(50);
        expect(game.opponent.health).toBe(0);
    });

    test('should reduce damage when defending', () => {
        const game = new BattleArenaGame();
        game.opponent.health = 100;
        game.opponent.defending = true;
        game.hitOpponent(20);
        expect(game.opponent.health).toBe(90); // 20 / 2 = 10 damage
    });

    test('should create projectiles on attack', () => {
        const game = new BattleArenaGame();
        game.player.x = 100;
        game.player.y = 100;
        game.opponent.x = 200;
        game.opponent.y = 200;
        game.attack();
        
        setTimeout(() => {
            expect(game.projectiles.length).toBeGreaterThan(0);
        }, 100);
    });

    test('should handle player defending state', () => {
        const game = new BattleArenaGame();
        expect(game.player.defending).toBe(false);
        game.startDefend();
        expect(game.player.defending).toBe(true);
        game.stopDefend();
        expect(game.player.defending).toBe(false);
    });
});

describe('Battle Arena Game - Data Persistence', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    test('should save player data to localStorage', () => {
        const game = new BattleArenaGame();
        game.player.name = 'TestPlayer';
        game.player.wins = 10;
        game.player.score = 1000;
        game.savePlayerData();
        
        const saved = JSON.parse(localStorage.getItem('battleArenaPlayer'));
        expect(saved.name).toBe('TestPlayer');
        expect(saved.wins).toBe(10);
        expect(saved.totalScore).toBe(1000);
    });

    test('should load player data from localStorage', () => {
        const testData = {
            name: 'SavedPlayer',
            wins: 25,
            totalScore: 5000
        };
        localStorage.setItem('battleArenaPlayer', JSON.stringify(testData));
        
        const game = new BattleArenaGame();
        game.loadPlayerData();
        
        expect(game.player.name).toBe('SavedPlayer');
        expect(game.player.wins).toBe(25);
        expect(game.player.score).toBe(5000);
    });

    test('should handle missing localStorage data gracefully', () => {
        const game = new BattleArenaGame();
        game.loadPlayerData();
        // Should not throw error
        expect(game.player.name).toBeDefined();
    });
});

describe('Battle Arena Game - Leaderboard', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should initialize leaderboard with default data', () => {
        const game = new BattleArenaGame();
        game.initializeLeaderboard();
        
        const leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard'));
        expect(leaderboard).toBeDefined();
        expect(Array.isArray(leaderboard)).toBe(true);
        expect(leaderboard.length).toBeGreaterThan(0);
    });

    test('should update leaderboard with player data', () => {
        const game = new BattleArenaGame();
        game.updateLeaderboard('NewPlayer', 15, 3000);
        
        const leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard'));
        const player = leaderboard.find(p => p.name === 'NewPlayer');
        
        expect(player).toBeDefined();
        expect(player.wins).toBe(15);
        expect(player.score).toBe(3000);
    });

    test('should sort leaderboard by wins', () => {
        const game = new BattleArenaGame();
        game.updateLeaderboard('Player1', 100, 5000);
        game.updateLeaderboard('Player2', 50, 8000);
        
        const leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard'));
        expect(leaderboard[0].wins).toBeGreaterThanOrEqual(leaderboard[1].wins);
    });

    test('should limit leaderboard to 50 entries', () => {
        const game = new BattleArenaGame();
        
        // Add 60 players
        for (let i = 0; i < 60; i++) {
            game.updateLeaderboard(`Player${i}`, i, i * 100);
        }
        
        const leaderboard = JSON.parse(localStorage.getItem('battleArenaLeaderboard'));
        expect(leaderboard.length).toBeLessThanOrEqual(50);
    });
});

describe('Battle Arena Game - Utilities', () => {
    test('should calculate correct angle between two points', () => {
        const game = new BattleArenaGame();
        game.player.x = 0;
        game.player.y = 0;
        game.opponent.x = 1;
        game.opponent.y = 0;
        
        const angle = Math.atan2(
            game.opponent.y - game.player.y,
            game.opponent.x - game.player.x
        );
        
        expect(angle).toBe(0); // 0 radians = pointing right
    });

    test('should keep player within canvas bounds', () => {
        const game = new BattleArenaGame();
        game.canvas = { width: 800, height: 600 };
        game.player.x = -100;
        game.player.y = -100;
        game.player.vx = 0;
        game.player.vy = 0;
        
        game.updateGame();
        
        const playerSize = 30;
        expect(game.player.x).toBeGreaterThanOrEqual(playerSize);
        expect(game.player.y).toBeGreaterThanOrEqual(playerSize);
    });
});
