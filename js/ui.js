import { handlePromptSubmit } from './ai.js';
import { getGameState, setGameState } from './gameState.js';

// Get all UI elements once at the start
const interactionPrompt = document.getElementById('interaction-prompt');
const modalContainer = document.getElementById('modal-container');
const welcomeModal = document.getElementById('welcome-modal');
const endModal = document.getElementById('end-modal');
const startGameBtn = document.getElementById('start-game-btn');
const promptForm = document.getElementById('prompt-form');
const dialogueContent = document.getElementById('dialogue-content');
const promptCountEl = document.getElementById('prompt-count');
const moodStatusEl = document.getElementById('mood-status');
const evaPortrait = document.getElementById('eva-portrait');
const keyIcon = document.getElementById('key-icon');
const loadingIndicator = document.getElementById('loading-indicator');
const submitButton = document.querySelector('#prompt-form button');
const promptInput = document.getElementById('prompt-input');


export function initUI() {
    startGameBtn.addEventListener('click', () => {
        modalContainer.classList.add('hidden');
        setGameState({ isPaused: false });
        document.getElementById('renderCanvas').requestPointerLock();
    });

    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePromptSubmit();
    });
}

// Centralized function to manage the "thinking" state of the UI
export function setThinking(isThinking) {
    if (isThinking) {
        loadingIndicator.classList.remove('hidden');
        submitButton.disabled = true;
        promptInput.disabled = true;
    } else {
        loadingIndicator.classList.add('hidden');
        submitButton.disabled = false;
        promptInput.disabled = false;
        promptInput.focus(); // Set focus back to the input for the next message
    }
}

export function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    dialogueContent.prepend(messageDiv);
}

export function updateUI() {
    const gameState = getGameState();
    promptCountEl.textContent = gameState.promptCount;
    
    // --- UPDATED MOOD CONFIG ---
    // Added a 'danger' property for visual feedback
    const moodConfig = {
        calm: { text: 'Calm', portraitClass: 'mood-calm', emoji: ':)', danger: false },
        suspicious: { text: 'Suspicious', portraitClass: 'mood-suspicious', emoji: ':/', danger: false },
        agitated: { text: 'Agitated', portraitClass: 'mood-agitated', emoji: ':(', danger: false },
        hostile: { text: 'Hostile', portraitClass: 'mood-hostile', emoji: '>:(' , danger: true },
    };
    
    const config = moodConfig[gameState.aiMood];
    moodStatusEl.textContent = config.text;
    evaPortrait.className = 'eva-portrait ' + config.portraitClass;
    evaPortrait.querySelector('span').textContent = config.emoji;
    
    // Add or remove a 'danger' class to the whole UI panel for a visual warning
    const uiPanel = document.getElementById('ui-panel');
    if (config.danger) {
        uiPanel.classList.add('danger-state');
    } else {
        uiPanel.classList.remove('danger-state');
    }
    
    keyIcon.classList.toggle('hidden', !gameState.hasKey);
}

export function showInteractionPrompt(objectName) {
    interactionPrompt.querySelector('p').textContent = `Press [E] to interact with ${objectName}`;
    interactionPrompt.classList.remove('hidden');
}

export function hideInteractionPrompt() {
    interactionPrompt.classList.add('hidden');
}

export function showEndScreen(isWin, message, finalScore) {
    setGameState({ isPaused: true, isGameOver: true });
    document.exitPointerLock();

    document.getElementById('end-title').textContent = isWin ? "You Escaped!" : "Game Over";
    document.getElementById('end-message').textContent = message;
    document.getElementById('final-score').textContent = finalScore;
    
    modalContainer.classList.remove('hidden');
    endModal.classList.remove('hidden');
    welcomeModal.classList.add('hidden');
}
