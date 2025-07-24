// Escape-Game/js/gameState.js
// This file acts as the single source of truth for the game's state.
// Any module can import and modify the state using these functions.

const GAME_LOGS_KEY = 'escapeGameLogs'; // Key for localStorage

const gameState = {
    isPaused: true,
    promptCount: 0,
    aiMood: 'calm',
    hasKey: false,
    isGameOver: false,
    paintingClickCount: 0,
    chatHistory: [],
    trustScore: 0,
    isThinking: false,
    playerName: 'Player',
    score: 0, 
    escapeMethod: '', 
    // New logging state
    gameLogs: JSON.parse(localStorage.getItem(GAME_LOGS_KEY)) || [], // Load existing logs
    currentLog: null, // Log for the current game session
};

export function getGameState() {
    return gameState;
}

export function setGameState(newState) {
    Object.assign(gameState, newState);
}

export function resetGameState() {
    // Save current game log before resetting
    if (gameState.currentLog) {
        saveGameLog();
    }

    Object.assign(gameState, {
        isPaused: true,
        promptCount: 0,
        aiMood: 'calm',
        hasKey: false,
        isGameOver: false,
        paintingClickCount: 0,
        chatHistory: [],
        trustScore: 0,
        isThinking: false,
        playerName: 'Player',
        score: 0, 
        escapeMethod: '', 
        currentLog: null, // Reset current log for new game
    });
}

// --- New Logging Functions ---
export function initNewGameLog() {
    const now = new Date();
    gameState.currentLog = {
        sessionId: Date.now(),
        timestamp: now.toLocaleString(),
        playerName: gameState.playerName,
        log: []
    };
    // Update player name in currentLog if it was set after init
    Object.defineProperty(gameState.currentLog, 'playerName', {
        get: () => gameState.playerName,
        enumerable: true,
        configurable: true
    });
}

export function addLogEntry(type, content) {
    if (gameState.currentLog) {
        gameState.currentLog.log.push({ type, content, timestamp: new Date().toLocaleTimeString() });
    }
}

export function saveGameLog() {
    if (gameState.currentLog && gameState.currentLog.log.length > 0) {
        // Remove old entry if restarting game and session ID is the same (e.g., via reload)
        gameState.gameLogs = gameState.gameLogs.filter(log => log.sessionId !== gameState.currentLog.sessionId);
        gameState.gameLogs.push(gameState.currentLog);
        localStorage.setItem(GAME_LOGS_KEY, JSON.stringify(gameState.gameLogs));
        console.log("Game log saved to localStorage:", gameState.currentLog);
    }
}

// Optional: Function to clear all stored logs (for development/testing)
export function clearAllGameLogs() {
    localStorage.removeItem(GAME_LOGS_KEY);
    gameState.gameLogs = [];
    console.log("All game logs cleared from localStorage.");
}

// Ensure logs are saved on page unload
window.addEventListener('beforeunload', saveGameLog);