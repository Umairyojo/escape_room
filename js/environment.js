export function createEnvironment(scene) {
    // --- Materials ---
    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    wallMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/wall.jpg", scene);

    const floorMaterial = new BABYLON.StandardMaterial("floorMat", scene);
    floorMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/floor.jpg", scene);
    floorMaterial.diffuseTexture.uScale = 8;
    floorMaterial.diffuseTexture.vScale = 8;

    const woodMaterial = new BABYLON.StandardMaterial("woodMat", scene);
    woodMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/wood.jpg", scene);
    
    const rugMaterial = new BABYLON.StandardMaterial("rugMat", scene);
    rugMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/rug.jpg", scene);

    const paintingMat = new BABYLON.StandardMaterial("paintingMat", scene);
    paintingMat.diffuseTexture = new BABYLON.Texture("assets/textures/painting.jpg", scene);
    
    const metalMaterial = new BABYLON.StandardMaterial("metalMat", scene);
    metalMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    metalMaterial.metallic = 0.8;
    metalMaterial.roughness = 0.3;

    const mirrorMaterial = new BABYLON.StandardMaterial("mirrorMat", scene);
    mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);

    const tvOffMat = new BABYLON.StandardMaterial("tvOffMat", scene);
    tvOffMat.diffuseColor = new BABYLON.Color3.Black();

    // --- Layout Dimensions ---
    const hallWidth = 14, hallDepth = 10;
    const kitchenWidth = 8, kitchenDepth = 10;
    const bed1Width = 8, bed1Depth = 8;
    const bed2Width = 8, bed2Depth = 10;
    const wallHeight = 4, wallThickness = 0.2;

    // --- Floor and Roof ---
    const totalWidth = hallWidth + kitchenWidth;
    const totalDepth = hallDepth + bed2Depth;

    const floor = BABYLON.MeshBuilder.CreateBox("floor", {width: totalWidth, height: wallThickness, depth: totalDepth}, scene);
    floor.position.y = -wallThickness / 2;
    floor.material = floorMaterial;
    floor.checkCollisions = true;

    const roof = BABYLON.MeshBuilder.CreateBox("roof", {width: totalWidth, height: wallThickness, depth: totalDepth}, scene);
    roof.position.y = wallHeight + (wallThickness / 2);
    roof.material = wallMaterial;
    roof.checkCollisions = true;

    // --- Wall Creation Helper ---
    const createWall = (name, w, h, d, x, z, rotY = 0) => {
        const wall = BABYLON.MeshBuilder.CreateBox(name, {width: w, height: h, depth: d}, scene);
        wall.position = new BABYLON.Vector3(x, h/2, z);
        wall.rotation.y = rotY;
        wall.material = wallMaterial;
        wall.checkCollisions = true;
        return wall;
    };

    // --- Outer Walls ---
    createWall("northWall", totalWidth, wallHeight, wallThickness, 0, totalDepth / 2);
    createWall("southWall", totalWidth, wallHeight, wallThickness, 0, -totalDepth / 2);
    createWall("eastWall", totalDepth, wallHeight, wallThickness, totalWidth / 2, 0, Math.PI / 2);
    createWall("westWall", totalDepth, wallHeight, wallThickness, -totalWidth / 2, 0, Math.PI / 2);

    // --- Internal Walls with Open Archways ---
    const doorwayWidth = 3;
    const hallBedDividerZ = -hallDepth / 2;
    createWall("hallBedWall1", (hallWidth/2 - doorwayWidth/2), wallHeight, wallThickness, -hallWidth/4 - doorwayWidth/4, hallBedDividerZ);
    createWall("hallBedWall2", (hallWidth/2 - doorwayWidth/2), wallHeight, wallThickness, hallWidth/4 + doorwayWidth/4, hallBedDividerZ);
    
    const hallKitchenDividerX = -hallWidth/2;
    createWall("hallKitchenWall", hallDepth, wallHeight, wallThickness, hallKitchenDividerX, 0, Math.PI / 2);
    
    const bedDividerX = -hallWidth/2 + bed1Width;
    createWall("bedDivider", bed1Depth, wallHeight, wallThickness, bedDividerX, -hallDepth/2 - bed1Depth/2, Math.PI/2);


    // --- Hall Furniture ---
    const mainExitDoor = BABYLON.MeshBuilder.CreateBox("door", {width: 1.2, height: 2.2, depth: 0.1}, scene);
    mainExitDoor.position = new BABYLON.Vector3(hallWidth/2 - 1, 1.1, (hallDepth + bed2Depth)/2 - wallThickness);
    mainExitDoor.material = woodMaterial;
    mainExitDoor.checkCollisions = true;
    mainExitDoor.isInteractable = true;

    const sofa = BABYLON.MeshBuilder.CreateBox("Sofa", {width: 4, height: 1, depth: 1.2}, scene);
    sofa.position = new BABYLON.Vector3(2, 0.5, 5);
    sofa.checkCollisions = true;
    sofa.isInteractable = true;

    const coffeeTable = BABYLON.MeshBuilder.CreateBox("Coffee Table", {width: 2, height: 0.4, depth: 1}, scene);
    coffeeTable.position = new BABYLON.Vector3(2, 0.2, 2.5);
    coffeeTable.material = woodMaterial;
    coffeeTable.checkCollisions = true;
    coffeeTable.isInteractable = true;

    const drawerTable = BABYLON.MeshBuilder.CreateBox("Drawer Table", {width: 3.5, height: 0.6, depth: 0.6}, scene);
    drawerTable.position = new BABYLON.Vector3(2, 0.3, -3);
    drawerTable.material = woodMaterial;
    drawerTable.checkCollisions = true;
    drawerTable.isInteractable = true;

    const tvScreen = BABYLON.MeshBuilder.CreateBox("TV", {width: 3, height: 1.6, depth: 0.05}, scene);
    tvScreen.position = new BABYLON.Vector3(2, 1.4, -3);
    tvScreen.material = tvOffMat;
    tvScreen.isInteractable = true;
    
    const diningTable = BABYLON.MeshBuilder.CreateBox("Dining Table", {width: 2.5, height: 1, depth: 1.2}, scene);
    diningTable.position = new BABYLON.Vector3(-4, 0.5, 3);
    diningTable.material = woodMaterial;
    diningTable.checkCollisions = true;
    diningTable.isInteractable = true;

    // --- Ceiling Fan ---
    const fanBase = BABYLON.MeshBuilder.CreateCylinder("fanBase", {height: 0.2, diameter: 0.3}, scene);
    fanBase.position = new BABYLON.Vector3(2, wallHeight - 0.2, 2.5); // Center of the hall
    
    const fanBladesNode = new BABYLON.TransformNode("fanBladesNode", scene);
    fanBladesNode.parent = fanBase;

    const numBlades = 4;
    for (let i = 0; i < numBlades; i++) {
        const blade = BABYLON.MeshBuilder.CreateBox(`blade${i}`, {width: 1.5, height: 0.05, depth: 0.3}, scene);
        blade.parent = fanBladesNode;
        blade.position.x = 0.85 * Math.cos(i * 2 * Math.PI / numBlades);
        blade.position.z = 0.85 * Math.sin(i * 2 * Math.PI / numBlades);
        blade.rotation.y = i * 2 * Math.PI / numBlades;
    }
    const fan = BABYLON.Mesh.MergeMeshes([fanBase, ...fanBladesNode.getChildMeshes()], true, true, undefined, false, true);
    fan.name = "Ceiling Fan";
    fan.isInteractable = true;

    // Add rotation animation to the blades' parent node
    const fanAnimation = new BABYLON.Animation("fanRotation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [];
    keys.push({ frame: 0, value: 0 });
    keys.push({ frame: 60, value: 2 * Math.PI });
    fanAnimation.setKeys(keys);
    fanBladesNode.animations.push(fanAnimation);
    scene.beginAnimation(fanBladesNode, 0, 60, true);

    // --- Kitchen ---
    const stove = BABYLON.MeshBuilder.CreateBox("Gas Stove", {width: 1, height: 0.2, depth: 0.8}, scene);
    stove.position = new BABYLON.Vector3(-10, 1.1, 5);
    stove.material = metalMaterial;
    stove.isInteractable = true;

    const fridge = BABYLON.MeshBuilder.CreateBox("Fridge", {width: 1, height: 2, depth: 1}, scene);
    fridge.position = new BABYLON.Vector3(-10, 1, 8);
    fridge.material = metalMaterial;
    fridge.checkCollisions = true;
    fridge.isInteractable = true;

    const kitchenShelf = BABYLON.MeshBuilder.CreateBox("Kitchen Shelf", {width: 3, height: 0.1, depth: 0.5}, scene);
    kitchenShelf.position = new BABYLON.Vector3(-10, 2, 2);
    kitchenShelf.material = woodMaterial;
    kitchenShelf.isInteractable = true;

    // --- Bedroom 1 ---
    const bed1 = BABYLON.MeshBuilder.CreateBox("Bed", {width: 2, height: 0.8, depth: 2.5}, scene);
    bed1.position = new BABYLON.Vector3(-4, 0.4, -10);
    bed1.material = woodMaterial;
    bed1.checkCollisions = true;
    bed1.isInteractable = true;

    const wardrobe1 = BABYLON.MeshBuilder.CreateBox("Wardrobe", {width: 2.5, height: 2.5, depth: 0.8}, scene);
    wardrobe1.position = new BABYLON.Vector3(0, 1.25, -12);
    wardrobe1.material = woodMaterial;
    wardrobe1.checkCollisions = true;
    wardrobe1.isInteractable = true;

    // --- Bedroom 2 (Master) ---
    const bed2 = BABYLON.MeshBuilder.CreateBox("Bed", {width: 2.5, height: 1, depth: 3}, scene);
    bed2.position = new BABYLON.Vector3(6, 0.5, -10);
    bed2.material = woodMaterial;
    bed2.checkCollisions = true;
    bed2.isInteractable = true;

    const wardrobe2 = BABYLON.MeshBuilder.CreateBox("Wardrobe", {width: 3, height: 2.5, depth: 0.8}, scene);
    wardrobe2.position = new BABYLON.Vector3(10, 1.25, -10);
    wardrobe2.material = woodMaterial;
    wardrobe2.checkCollisions = true;
    wardrobe2.isInteractable = true;

    const dressingTable = BABYLON.MeshBuilder.CreateBox("Dressing Table", {width: 2, height: 0.8, depth: 0.6}, scene);
    dressingTable.position = new BABYLON.Vector3(6, 0.4, -6);
    dressingTable.material = woodMaterial;
    dressingTable.checkCollisions = true;
    dressingTable.isInteractable = true;

    const mirror = BABYLON.MeshBuilder.CreatePlane("Mirror", {width: 1.5, height: 1.5}, scene);
    mirror.position = new BABYLON.Vector3(6, 1.5, -5.7);
    mirror.material = mirrorMaterial;

    // --- Washroom Area ---
    const washingMachine = BABYLON.MeshBuilder.CreateBox("Washing Machine", {width: 0.8, height: 1, depth: 0.8}, scene);
    washingMachine.position = new BABYLON.Vector3(-8, 0.5, 8);
    washingMachine.material = metalMaterial;
    washingMachine.checkCollisions = true;
    washingMachine.isInteractable = true;
    
    // --- Key-bearing Painting ---
    const painting = BABYLON.MeshBuilder.CreatePlane("painting", {width: 1.5, height: 1}, scene);
    painting.position = new BABYLON.Vector3(6, 2, -12.9); // In master bedroom
    painting.material = paintingMat;
    painting.isInteractable = true;

    return { floor, roof, mainExitDoor, sofa, coffeeTable, tvScreen, diningTable, bed1, wardrobe1, bed2, wardrobe2, dressingTable, stove, fridge, washingMachine, painting, fan };
}
