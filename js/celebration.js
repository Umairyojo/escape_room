// js/celebration.js
import { getGameState } from './gameState.js';

let scene;
let confettiSystem;
let popperSystem;
let flyerSystem;
let victorySound;
let advancedTexture;
let victoryText;

export function initCelebration(babylonScene) {
    scene = babylonScene;

    // --- Sound ---
    // Using a placeholder URL. In a real project, you'd host your own audio file.
    // Make sure to replace this with an actual sound file URL.
    victorySound = new BABYLON.Sound("VictorySound", "https://www.babylonjs-playground.com/sounds/cheer.wav", scene, null, { loop: false, autoplay: false });

    // --- Particle System for Confetti ---
    confettiSystem = new BABYLON.ParticleSystem("confetti", 2000, scene);
    confettiSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene); // Simple square texture
    confettiSystem.emitter = new BABYLON.Vector3(0, 5, 0); // Emit from above
    confettiSystem.minEmitBox = new BABYLON.Vector3(-5, 0, -5); // Start box
    confettiSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 5); // End box
    confettiSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0); // Red
    confettiSystem.color2 = new BABYLON.Color4(0, 1, 0, 1.0); // Green
    confettiSystem.colorDead = new BABYLON.Color4(0, 0, 1, 0.0); // Blue, fades out
    confettiSystem.minSize = 0.1;
    confettiSystem.maxSize = 0.3;
    confettiSystem.minLifeTime = 0.5;
    confettiSystem.maxLifeTime = 2.0;
    confettiSystem.emitRate = 500;
    confettiSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);
    confettiSystem.direction1 = new BABYLON.Vector3(-1, 8, -1);
    confettiSystem.direction2 = new BABYLON.Vector3(1, 8, 1);
    confettiSystem.minAngularSpeed = 0;
    confettiSystem.maxAngularSpeed = Math.PI;
    confettiSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    confettiSystem.disposeOnStop = true; // Clean up after stopping

    // --- Particle System for Poppers (similar to confetti but faster, more explosive) ---
    popperSystem = new BABYLON.ParticleSystem("poppers", 1000, scene);
    popperSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    popperSystem.emitter = new BABYLON.Vector3(0, 1.7, 0); // From player height
    popperSystem.minEmitBox = new BABYLON.Vector3(-0.5, 0, -0.5);
    popperSystem.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0.5);
    popperSystem.color1 = new BABYLON.Color4(1, 1, 0, 1.0); // Yellow
    popperSystem.color2 = new BABYLON.Color4(1, 0.5, 0, 1.0); // Orange
    popperSystem.colorDead = new BABYLON.Color4(0.5, 0, 0.5, 0.0); // Purple, fades out
    popperSystem.minSize = 0.05;
    popperSystem.maxSize = 0.15;
    popperSystem.minLifeTime = 0.2;
    popperSystem.maxLifeTime = 0.8;
    popperSystem.emitRate = 200;
    popperSystem.gravity = new BABYLON.Vector3(0, -5, 0); // Less gravity for explosive feel
    popperSystem.direction1 = new BABYLON.Vector3(-5, 10, -5);
    popperSystem.direction2 = new BABYLON.Vector3(5, 10, 5);
    popperSystem.minAngularSpeed = 0;
    popperSystem.maxAngularSpeed = Math.PI * 2;
    popperSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    popperSystem.disposeOnStop = true;

    // --- Particle System for Floating Flyers (larger, slower, more buoyant) ---
    flyerSystem = new BABYLON.ParticleSystem("flyers", 500, scene);
    flyerSystem.particleTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/flare.png", scene);
    flyerSystem.emitter = new BABYLON.Vector3(0, 0, 0); // Emit from center
    flyerSystem.minEmitBox = new BABYLON.Vector3(-10, 0, -10);
    flyerSystem.maxEmitBox = new BABYLON.Vector3(10, 0, 10);
    flyerSystem.color1 = new BABYLON.Color4(0.5, 0.5, 1, 1.0); // Light Blue
    flyerSystem.color2 = new BABYLON.Color4(0.8, 0.8, 1, 1.0); // Lighter Blue
    flyerSystem.colorDead = new BABYLON.Color4(0.2, 0.2, 0.2, 0.0);
    flyerSystem.minSize = 0.5;
    flyerSystem.maxSize = 1.0;
    flyerSystem.minLifeTime = 3.0;
    flyerSystem.maxLifeTime = 8.0;
    flyerSystem.emitRate = 20;
    flyerSystem.gravity = new BABYLON.Vector3(0, -1, 0); // Slow fall
    flyerSystem.direction1 = new BABYLON.Vector3(-0.5, 0.5, -0.5); // Gentle float
    flyerSystem.direction2 = new BABYLON.Vector3(0.5, 1.5, 0.5);
    flyerSystem.minAngularSpeed = 0;
    flyerSystem.maxAngularSpeed = Math.PI / 4;
    flyerSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    flyerSystem.disposeOnStop = true;

    // --- Animated Text ---
    advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    victoryText = new BABYLON.GUI.TextBlock();
    victoryText.fontFamily = "Arial";
    victoryText.fontSize = "100px";
    victoryText.color = "gold";
    victoryText.text = ""; // Will be set dynamically
    victoryText.alpha = 0; // Start invisible
    advancedTexture.addControl(victoryText);

    return {
        start: (playerName) => startCelebration(playerName),
        stop: () => stopCelebration()
    };
}

function startCelebration(playerName) {
    // Play sound
    victorySound.play();

    // Start particle systems
    confettiSystem.start();
    popperSystem.start();
    flyerSystem.start();

    // Set and animate text
    victoryText.text = `Congratulations, ${playerName}!`;
    victoryText.alpha = 0;
    victoryText.scaleX = 0.5;
    victoryText.scaleY = 0.5;

    // Create text animation
    const textAppear = new BABYLON.Animation("textAppear", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const textScale = new BABYLON.Animation("textScale", "scaleX", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    const textScaleY = new BABYLON.Animation("textScaleY", "scaleY", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keysAppear = [{ frame: 0, value: 0 }, { frame: 60, value: 1 }];
    const keysScale = [{ frame: 0, value: 0.5 }, { frame: 60, value: 1.2 }, { frame: 90, value: 1 }];
    
    textAppear.setKeys(keysAppear);
    textScale.setKeys(keysScale);
    textScaleY.setKeys(keysScale); // Use same keys for Y scale

    victoryText.animations = [];
    victoryText.animations.push(textAppear, textScale, textScaleY);
    scene.beginAnimation(victoryText, 0, 90, false);

    // Fade out text after some time
    setTimeout(() => {
        const textFade = new BABYLON.Animation("textFade", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keysFade = [{ frame: 0, value: 1 }, { frame: 60, value: 0 }];
        textFade.setKeys(keysFade);
        victoryText.animations = []; // Clear previous animations
        victoryText.animations.push(textFade);
        scene.beginAnimation(victoryText, 0, 60, false, 1.0, () => {
            victoryText.text = ""; // Clear text completely
        });
    }, 4000); // Text visible for 4 seconds
}

function stopCelebration() {
    confettiSystem.stop();
    popperSystem.stop();
    flyerSystem.stop();
    victorySound.stop();
    victoryText.text = ""; // Clear text
    victoryText.alpha = 0; // Hide text
}
