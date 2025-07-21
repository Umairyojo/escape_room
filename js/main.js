import { createScene } from './scene.js';
import { createPlayer } from './player.js';
import { createEnvironment } from './environment.js';
import { initInteractions } from './interactions.js';
import { initUI, showInteractionPrompt, hideInteractionPrompt, showEndScreen } from './ui.js';
import { getGameState, setGameState, resetGameState } from './gameState.js';

window.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // This dictionary will hold all major components of our game
    const game = {};
    
    game.engine = engine;
    game.canvas = canvas;

    // Initialize Game State
    resetGameState();

    // Create Scene
    game.scene = createScene(game);

    // Create Player
    game.player = createPlayer(game.scene);

    // Create Environment and get the key location mesh
    game.environment = createEnvironment(game.scene);
    const keyLocationMesh = game.environment.keyLocationMesh; // NEW: Get the key location mesh

    // Initialize UI and Interactions, passing the key location mesh
    initUI();
    game.interactions = initInteractions(game.scene, game.player.camera, keyLocationMesh); // NEW: Pass keyLocationMesh

    // Main game loop
    engine.runRenderLoop(() => {
        if (!getGameState().isPaused) {
            game.scene.render();
            const interactableInfo = game.interactions.checkForInteractable(); // NEW: Get interactable info
            if (interactableInfo) {
                // If it's the key location, display a more specific hint
                if (interactableInfo.name.startsWith('[Key Location]')) {
                    showInteractionPrompt(`[E] to search ${interactableInfo.mesh.name} ${interactableInfo.mesh.keyHint}`);
                } else {
                    showInteractionPrompt(`[E] to interact with ${interactableInfo.name}`);
                }
            } else {
                hideInteractionPrompt();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize();
    });

    // Handle game restart
    document.getElementById('restart-game-btn').addEventListener('click', () => {
        // This is a simple way to restart; a more complex game might need to dispose and recreate resources.
        window.location.reload();
    });
});