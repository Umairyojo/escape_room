import { createScene } from './scene.js';
import { createPlayer } from './player.js';
import { createEnvironment } from './environment.js';
import { initInteractions } from './interactions.js';
import { initUI, showInteractionPrompt, hideInteractionPrompt, showKeywordPopup, hideKeywordPopup } from './ui.js'; 
import { getGameState, setGameState, resetGameState, initNewGameLog, saveGameLog } from './gameState.js'; 
import { initCelebration } from './celebration.js'; 

window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // This dictionary will hold all major components of our game
    const game = {};
    
    game.engine = engine;
    game.canvas = canvas;

    // Initialize Game State
    resetGameState();
    initNewGameLog(); // Initialize new game log

    // Create Scene
    game.scene = createScene(game);

    // Create Player
    game.player = createPlayer(game.scene);

    // Create Environment and get the key location mesh
    game.environment = createEnvironment(game.scene);
    const keyLocationMesh = game.environment.keyLocationMesh; 

    // Initialize UI and Interactions, passing the scene for UI and keyLocationMesh for interactions
    initUI(game.scene, (playerName) => { // Pass game.scene here
        initCelebration(game.scene).start(playerName);
    });
    game.interactions = initInteractions(game.scene, game.player.camera, keyLocationMesh); 

    // Add a click listener to the canvas to request pointer lock (more reliable for controls)
    canvas.addEventListener('click', () => {
        if (!getGameState().isPaused) {
            canvas.requestPointerLock();
        }
    });

    // Main game loop
    engine.runRenderLoop(() => {
        if (!getGameState().isPaused) {
            game.scene.render();
            const interactableInfo = game.interactions.checkForInteractable(); 
            if (interactableInfo) {
                // If it's the key location, display a more specific hint
                if (interactableInfo.name.startsWith('[Key Location]')) {
                    showInteractionPrompt(`[E] to search ${interactableInfo.mesh.name} ${interactableInfo.mesh.keyHint}`);
                } else {
                    showInteractionPrompt(`[E] to interact with ${interactableInfo.name}`);
                }
                // Update keyword popup when hovering over interactable
                if (interactableInfo.mesh.keywords) {
                    showKeywordPopup(interactableInfo.mesh.keywords, interactableInfo.mesh);
                } else {
                    hideKeywordPopup();
                }
            } else {
                hideInteractionPrompt();
                hideKeywordPopup(); // Hide keyword popup when not looking at object
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
    });

    // Handle game restart
    document.getElementById('restart-game-btn').addEventListener('click', () => {
        saveGameLog(); // Save current game log before reload
        window.location.reload();
    });
});