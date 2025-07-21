// This file acts as the single source of truth for the game's state.
// Any module can import and modify the state using these functions.

const gameState = {
    isPaused: true,
    promptCount: 0,
    aiMood: 'calm',
    hasKey: false,
    isGameOver: false,
    paintingClickCount: 0,
    chatHistory: [],
};

export function getGameState() {
    return gameState;
}

export function setGameState(newState) {
    // Object.assign merges the new state properties into the existing state object.
    Object.assign(gameState, newState);
}

export function resetGameState() {
    // Resets the state to its initial values for a new game.
    Object.assign(gameState, {
        isPaused: true,
        promptCount: 0,
        aiMood: 'calm',
        hasKey: false,
        isGameOver: false,
        paintingClickCount: 0,
        chatHistory: [],
    });
}
