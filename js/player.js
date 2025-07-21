export function createPlayer(scene) {
    // The player is represented by the camera.
    // Changed starting position to be in the center of the new, larger hall.
    const camera = new BABYLON.UniversalCamera("playerCamera", new BABYLON.Vector3(0, 1.7, 5), scene);

    // Attaches the camera to the canvas, allowing it to receive input.
    camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
    
    // --- Player Settings ---
    camera.speed = 0.18; // Slightly increased speed for larger area
    camera.angularSensibility = 4000; // Mouse sensitivity

    // This creates a collision box around the camera, shaped like an ellipsoid (a stretched sphere).
    // This prevents the player from walking through walls.
    camera.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5); 
    camera.checkCollisions = true;
    camera.applyGravity = true;

    // --- Keyboard Controls ---
    // By default, the Universal Camera uses W, A, S, D.
    camera.keysUp = [87];    // W
    camera.keysDown = [83];  // S
    camera.keysLeft = [65];  // A
    camera.keysRight = [68]; // D

    return {
        camera: camera
    };
}
