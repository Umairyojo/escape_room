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

    // Create Environment
    game.environment = createEnvironment(game.scene);

    // Initialize UI and Interactions
    initUI();
    game.interactions = initInteractions(game.scene, game.player.camera);

    // Main game loop
    engine.runRenderLoop(() => {
        if (!getGameState().isPaused) {
            game.scene.render();
            const interactable = game.interactions.checkForInteractable();
            if (interactable) {
                showInteractionPrompt(interactable.name);
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

