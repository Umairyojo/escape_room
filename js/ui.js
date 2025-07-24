// Escape-Game/js/ui.js
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
const playerNameInput = document.getElementById('player-name-input'); // NEW: Player name input
const scoreEl = document.getElementById('score'); // NEW: Score element
const attemptsLeftEl = document.getElementById('attempts-left'); // NEW: Attempts Left element
const objectKeywordPopup = document.getElementById('object-keyword-popup'); // NEW: Keyword popup

let winCallback = null; 
let _scene; // Declare a variable to hold the scene object

export function initUI(babylonScene, onWinGameCallback) { 
    _scene = babylonScene; // Store the scene object
    winCallback = onWinGameCallback; 

    startGameBtn.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        setGameState({ isPaused: false, playerName: playerName || 'Player' }); // Set player name
        modalContainer.classList.add('hidden');
        // This requestPointerLock is from the initial button click, a more robust one is in main.js
        document.getElementById('renderCanvas').requestPointerLock();
    });

    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlePromptSubmit();
    });

    updateUI(); // Initial UI update
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
    scoreEl.textContent = gameState.score; // Update score display
    attemptsLeftEl.textContent = gameState.promptAttemptsLeft; // Update attempts left display
    
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

export function showInteractionPrompt(message) {
    interactionPrompt.querySelector('p').textContent = message;
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
    document.getElementById('end-player-name').textContent = `Player: ${getGameState().playerName}`; // Display player name 
    document.getElementById('escape-method-summary').textContent = getGameState().escapeMethod; // Display escape method 
    
    modalContainer.classList.remove('hidden');
    endModal.classList.remove('hidden');
    welcomeModal.classList.add('hidden');

    if (isWin && winCallback) { // Trigger win callback
        winCallback(getGameState().playerName);
    }
}

// --- NEW: Keyword Popup Functions ---
export function showKeywordPopup(keywords, mesh) {
    // Corrected: Use camera's view and projection matrices for the transform
    // The 'transform' parameter of BABYLON.Vector3.Project should be the view-projection matrix
    if (!mesh || !keywords || keywords.length === 0 || !_scene || !_scene.activeCamera || !_scene.activeCamera.viewport) {
        hideKeywordPopup();
        return;
    }

    const camera = _scene.activeCamera;
    const viewProjectionMatrix = camera.getViewMatrix().multiply(camera.getProjectionMatrix());

    const screenPosition = BABYLON.Vector3.Project(
        mesh.absolutePosition,
        BABYLON.Matrix.Identity(), // World matrix of the mesh (assuming identity if not parented)
        viewProjectionMatrix,      // Combined view and projection matrix
        camera.viewport            // The camera's viewport object
    );
    
    objectKeywordPopup.style.left = `${screenPosition.x / window.devicePixelRatio}px`;
    objectKeywordPopup.style.top = `${screenPosition.y / window.devicePixelRatio - 50}px`; // Adjust offset
    objectKeywordPopup.textContent = keywords.join(', ');
    objectKeywordPopup.classList.remove('hidden');
}

export function hideKeywordPopup() {
    objectKeywordPopup.classList.add('hidden'); 
}