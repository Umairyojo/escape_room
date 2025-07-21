export function createScene(game) {
    const scene = new BABYLON.Scene(game.engine);
    scene.collisionsEnabled = true;
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    // --- Lighting ---
    // Ambient light to give a general illumination
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Point light to create shadows and depth
    const pointLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 2.5, 0), scene);
    pointLight.intensity = 0.8;

    // --- Fog ---
    // Adds to the claustrophobic atmosphere
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = 0.03;
    scene.fogColor = new BABYLON.Color3(0.1, 0.1, 0.15);

    return scene;
}
