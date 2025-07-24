// Escape-Game/js/environment.js
export function createEnvironment(scene) {
    // --- Materials ---
    const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
    // Using a modern, light grey texture for walls
    wallMaterial.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/wood.jpg", scene); // Placeholder for a subtle modern wall texture
    wallMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Reduce shininess

    const floorMaterial = new BABYLON.StandardMaterial("floorMat", scene);
    floorMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/floor.jpg", scene); // Corrected path to user-uploaded floor texture
    floorMaterial.diffuseTexture.uScale = 8;
    floorMaterial.diffuseTexture.vScale = 8;
    // Make floor reflective for modern look
    floorMaterial.reflectionTexture = new BABYLON.MirrorTexture("floorMirror", 1024, scene, true);
    floorMaterial.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0); // Reflects along Y-axis
    floorMaterial.reflectionTexture.renderList = scene.meshes.filter(mesh => mesh.name !== "floor" && mesh.name !== "roof"); // Exclude floor/roof from reflection
    floorMaterial.alpha = 0.9; // Slightly transparent for subtle reflection

    const woodMaterial = new BABYLON.StandardMaterial("woodMat", scene);
    woodMaterial.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/wood.jpg", scene); // Modern light wood

    const rugMaterial = new BABYLON.StandardMaterial("rugMat", scene);
    rugMaterial.diffuseTexture = new BABYLON.Texture("assets/textures/rug.jpg", scene); // Corrected path to user-uploaded rug texture
    
    const paintingMat = new BABYLON.StandardMaterial("paintingMat", scene);
    paintingMat.diffuseTexture = new BABYLON.Texture("assets/textures/painting.jpg", scene); // Corrected path to user-uploaded painting texture
    
    const metalMaterial = new BABYLON.StandardMaterial("metalMat", scene);
    metalMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.85);
    metalMaterial.metallic = 0.8;
    metalMaterial.roughness = 0.3;

    const mirrorMaterial = new BABYLON.StandardMaterial("mirrorMat", scene);
    mirrorMaterial.reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);

    const tvOffMat = new BABYLON.StandardMaterial("tvOffMat", scene);
    tvOffMat.diffuseColor = new BABYLON.Color3.Black();

    // TV Screen Flickering Material
    const tvScreenMaterial = new BABYLON.StandardMaterial("tvScreenMat", scene);
    const tvVideoTexture = new BABYLON.VideoTexture("tvVideo", ["https://www.babylonjs-playground.com/textures/babylonjs.mp4"], scene, true); // Placeholder video
    tvScreenMaterial.emissiveTexture = tvVideoTexture; // Emissive to make it glow
    tvScreenMaterial.disableLighting = true; // Don't be affected by scene lights

    // NEW: Colorful materials for new items
    const beanBagMaterial = new BABYLON.StandardMaterial("beanBagMat", scene);
    beanBagMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.4, 0.6); // Muted Pink

    const counterTopMaterial = new BABYLON.StandardMaterial("counterTopMat", scene);
    counterTopMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Dark grey/black
    counterTopMaterial.specularColor = new BABYLON.Color3(0.5, 0.5, 0.5);

    const ceramicMaterial = new BABYLON.StandardMaterial("ceramicMat", scene);
    ceramicMaterial.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.95); // White ceramic
    ceramicMaterial.specularColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    ceramicMaterial.roughness = 0.2;

    const glassMaterial = new BABYLON.StandardMaterial("glassMat", scene);
    glassMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.9, 1);
    glassMaterial.alpha = 0.4; // Translucent
    glassMaterial.backFaceCulling = false;

    // NEW: Door Glow Material
    const doorGlowMaterial = new BABYLON.StandardMaterial("doorGlowMat", scene);
    doorGlowMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1); // Dark base
    doorGlowMaterial.emissiveColor = new BABYLON.Color3(0, 0.8, 1); // Bright Cyan glow
    doorGlowMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlights

    // --- Layout Dimensions ---
    const totalWidth = 20; // Expanded width
    const totalDepth = 25; // Expanded depth
    const wallHeight = 4;
    const wallThickness = 0.2;

    // --- Floor and Roof ---
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

    // --- Internal Walls (Restructured for better flow) ---

    // Wall separating main area from bedrooms/washroom
    createWall("mainDividerWall", totalWidth, wallHeight, wallThickness, 0, -5); // Runs across the room

    // Walls for Bedroom 1 (left)
    createWall("bedroom1Wall1", 8, wallHeight, wallThickness, -6, -9); // Back wall
    createWall("bedroom1Wall2", 4, wallHeight, wallThickness, -9.9, -7, Math.PI / 2); // Left wall
    createWall("bedroom1Wall3", 4, wallHeight, wallThickness, -2.1, -7, Math.PI / 2); // Right wall (with doorway)

    // Walls for Bedroom 2 (right)
    createWall("bedroom2Wall1", 8, wallHeight, wallThickness, 6, -9); // Back wall
    createWall("bedroom2Wall2", 4, wallHeight, wallThickness, 2.1, -7, Math.PI / 2); // Left wall (with doorway)
    createWall("bedroom2Wall3", 4, wallHeight, wallThickness, 9.9, -7, Math.PI / 2); // Right wall

    // Walls for Washroom (far right corner)
    createWall("washroomWall1", 6, wallHeight, wallThickness, 7, -12.9); // Back wall
    createWall("washroomWall2", 4, wallHeight, wallThickness, 9.9, -10, Math.PI / 2); // Right wall
    createWall("washroomWall3", 4, wallHeight, wallThickness, 4.1, -10, Math.PI / 2); // Left wall (with doorway)


    // --- Main Exit Door ---
    const mainExitDoor = BABYLON.MeshBuilder.CreateBox("door", {width: 1.2, height: 2.2, depth: 0.1}, scene);
    mainExitDoor.position = new BABYLON.Vector3(0, 1.1, totalDepth / 2 - wallThickness / 2 - 0.05); // Centered at the front
    mainExitDoor.material = doorGlowMaterial; // Use glowing material
    mainExitDoor.checkCollisions = true;
    mainExitDoor.isInteractable = true;
    mainExitDoor.keywords = ["Freedom", "Locked", "Exit"];

    // Animation for the door's emissive color
    const doorEmissiveAnimation = new BABYLON.Animation("doorEmissiveAnim", "material.emissiveColor", 30, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const doorKeys = [];
    doorKeys.push({ frame: 0, value: new BABYLON.Color3(0, 0.8, 1) }); // Bright Cyan
    doorKeys.push({ frame: 30, value: new BABYLON.Color3(0, 0.4, 0.5) }); // Dimmer Cyan
    doorKeys.push({ frame: 60, value: new BABYLON.Color3(0, 0.8, 1) }); // Back to Bright
    doorEmissiveAnimation.setKeys(doorKeys);
    mainExitDoor.animations.push(doorEmissiveAnimation);
    scene.beginAnimation(mainExitDoor, 0, 60, true);

    // --- Living Room Area (Central) ---
    const sofa = BABYLON.MeshBuilder.CreateBox("Sofa", {width: 4, height: 1, depth: 1.2}, scene);
    sofa.position = new BABYLON.Vector3(0, 0.5, 7);
    sofa.checkCollisions = true;
    sofa.isInteractable = true;
    sofa.keywords = ["Comfort", "Relax"];

    const coffeeTable = BABYLON.MeshBuilder.CreateBox("Coffee Table", {width: 2, height: 0.4, depth: 1}, scene);
    coffeeTable.position = new BABYLON.Vector3(0, 0.2, 5.5);
    coffeeTable.material = woodMaterial;
    coffeeTable.checkCollisions = true;
    coffeeTable.isInteractable = true;
    coffeeTable.keywords = ["Empty", "Surface"];

    const tvScreen = BABYLON.MeshBuilder.CreateBox("TV", {width: 3, height: 1.6, depth: 0.05}, scene);
    tvScreen.position = new BABYLON.Vector3(0, 1.4, 3);
    tvScreen.material = tvScreenMaterial; // Use flickering TV material
    tvScreen.isInteractable = true;
    tvScreen.keywords = ["Screen", "Distraction"];
    
    const drawerTable = BABYLON.MeshBuilder.CreateBox("Drawer Table", {width: 3.5, height: 0.6, depth: 0.6}, scene);
    drawerTable.position = new BABYLON.Vector3(5, 0.3, 3);
    drawerTable.material = woodMaterial;
    drawerTable.checkCollisions = true;
    drawerTable.isInteractable = true;
    drawerTable.keywords = ["Locked", "Storage"];

    // NEW: Bean Bag (more central)
    const beanBag = BABYLON.MeshBuilder.CreateSphere("Bean Bag", {diameterX: 1.5, diameterY: 1.0, diameterZ: 1.5}, scene);
    beanBag.position = new BABYLON.Vector3(-4, 0.5, 7);
    beanBag.material = beanBagMaterial;
    beanBag.checkCollisions = true;
    beanBag.isInteractable = true;
    beanBag.keywords = ["Soft", "Lounge"];

    // NEW: Side Table
    const sideTable = BABYLON.MeshBuilder.CreateCylinder("Side Table", {height: 0.5, diameter: 0.6}, scene);
    sideTable.position = new BABYLON.Vector3(-2, 0.25, 7);
    sideTable.material = woodMaterial;
    sideTable.checkCollisions = true;
    sideTable.isInteractable = true;
    sideTable.keywords = ["Small", "Table"];

    // NEW: Floor Lamp
    const floorLampBase = BABYLON.MeshBuilder.CreateCylinder("floorLampBase", {height: 0.05, diameter: 0.4}, scene);
    floorLampBase.position = new BABYLON.Vector3(3, 0.025, 7.5);
    const floorLampPole = BABYLON.MeshBuilder.CreateCylinder("floorLampPole", {height: 1.8, diameter: 0.03}, scene);
    floorLampPole.parent = floorLampBase;
    floorLampPole.position.y = 0.9;
    const floorLampShade = BABYLON.MeshBuilder.CreateCylinder("floorLampShade", {height: 0.3, diameterTop: 0.2, diameterBottom: 0.4}, scene);
    floorLampShade.parent = floorLampPole;
    floorLampShade.position.y = 0.9;
    const floorLamp = BABYLON.Mesh.MergeMeshes([floorLampBase, floorLampPole, floorLampShade], true, true, undefined, false, true);
    floorLamp.name = "Floor Lamp";
    floorLamp.isInteractable = true;
    floorLamp.keywords = ["Light", "Tall"];
    const floorLampLight = new BABYLON.PointLight("floorLampLight", new BABYLON.Vector3(3, 2, 7.5), scene);
    floorLampLight.intensity = 0.5;
    floorLampLight.diffuse = new BABYLON.Color3(1, 0.9, 0.7); // Soft warm light

    // --- Dining Area ---
    const diningTable = BABYLON.MeshBuilder.CreateBox("Dining Table", {width: 2.5, height: 1, depth: 1.2}, scene);
    diningTable.position = new BABYLON.Vector3(-8, 0.5, 2);
    diningTable.material = woodMaterial;
    diningTable.checkCollisions = true;
    diningTable.isInteractable = true;
    diningTable.keywords = ["Meal", "Empty"];

    // --- Kitchen Area ---
    const stove = BABYLON.MeshBuilder.CreateBox("Gas Stove", {width: 1, height: 0.2, depth: 0.8}, scene);
    stove.position = new BABYLON.Vector3(-8, 1.1, -1);
    stove.material = metalMaterial;
    stove.isInteractable = true;
    stove.keywords = ["Cooking", "Disconnected"];

    const fridge = BABYLON.MeshBuilder.CreateBox("Fridge", {width: 1, height: 2, depth: 1}, scene);
    fridge.position = new BABYLON.Vector3(-9.5, 1, -3);
    fridge.material = metalMaterial;
    fridge.checkCollisions = true;
    fridge.isInteractable = true;
    fridge.keywords = ["Food", "Cold"];

    const kitchenShelf = BABYLON.MeshBuilder.CreateBox("Kitchen Shelf", {width: 3, height: 0.1, depth: 0.5}, scene);
    kitchenShelf.position = new BABYLON.Vector3(-7, 2, -1.5);
    kitchenShelf.material = woodMaterial;
    kitchenShelf.isInteractable = true;
    kitchenShelf.keywords = ["Utensils", "Shelf"];

    // NEW: Kitchen Countertops
    const kitchenCounter1 = BABYLON.MeshBuilder.CreateBox("Kitchen Counter 1", {width: 4, height: 0.8, depth: 0.6}, scene);
    kitchenCounter1.position = new BABYLON.Vector3(-7, 0.4, -2.7);
    kitchenCounter1.material = counterTopMaterial;
    kitchenCounter1.checkCollisions = true;
    const kitchenCounter2 = BABYLON.MeshBuilder.CreateBox("Kitchen Counter 2", {width: 3, height: 0.8, depth: 0.6}, scene);
    kitchenCounter2.position = new BABYLON.Vector3(-9.7, 0.4, -1.5);
    kitchenCounter2.rotation.y = Math.PI / 2; // Rotate to form L-shape
    kitchenCounter2.material = counterTopMaterial;
    kitchenCounter2.checkCollisions = true;

    // NEW: Kitchen Sink
    const kitchenSink = BABYLON.MeshBuilder.CreateCylinder("Kitchen Sink", {height: 0.2, diameter: 0.5}, scene);
    kitchenSink.position = new BABYLON.Vector3(-7, 0.8, -2.7);
    kitchenSink.material = ceramicMaterial;
    kitchenSink.isInteractable = true; // Can be a key location
    kitchenSink.keywords = ["Water", "Drain"];

    // NEW: Upper Cabinets
    const upperCabinet1 = BABYLON.MeshBuilder.CreateBox("Upper Cabinet 1", {width: 4, height: 0.8, depth: 0.3}, scene);
    upperCabinet1.position = new BABYLON.Vector3(-7, 2.5, -2.7);
    upperCabinet1.material = woodMaterial;
    const upperCabinet2 = BABYLON.MeshBuilder.CreateBox("Upper Cabinet 2", {width: 3, height: 0.8, depth: 0.3}, scene);
    upperCabinet2.position = new BABYLON.Vector3(-9.7, 2.5, -1.5);
    upperCabinet2.rotation.y = Math.PI / 2;
    upperCabinet2.material = woodMaterial;

    // --- Bedroom 1 (Left Side) ---
    const bed1 = BABYLON.MeshBuilder.CreateBox("Bed 1", {width: 2, height: 0.8, depth: 2.5}, scene);
    bed1.position = new BABYLON.Vector3(-6, 0.4, -10.5);
    bed1.material = woodMaterial;
    bed1.checkCollisions = true;
    bed1.isInteractable = true;
    bed1.keywords = ["Sleep", "Rest"];

    const wardrobe1 = BABYLON.MeshBuilder.CreateBox("Wardrobe", {width: 2.5, height: 2.5, depth: 0.8}, scene);
    wardrobe1.position = new BABYLON.Vector3(-9.5, 1.25, -10.5);
    wardrobe1.material = woodMaterial;
    wardrobe1.checkCollisions = true;
    wardrobe1.isInteractable = true;
    wardrobe1.keywords = ["Clothes", "Hidden"];

    // --- Bedroom 2 (Master, Right Side) ---
    const kingBed = BABYLON.MeshBuilder.CreateBox("King Bed", {width: 2.8, height: 0.6, depth: 2.5}, scene);
    kingBed.position = new BABYLON.Vector3(6, 0.3, -10.5); // Adjusted position
    kingBed.material = woodMaterial; // Or a fabric material
    kingBed.checkCollisions = true;
    kingBed.isInteractable = true;
    kingBed.keywords = ["Luxury", "Pillow"];

    const wardrobe2 = BABYLON.MeshBuilder.CreateBox("Wardrobe", {width: 3, height: 2.5, depth: 0.8}, scene);
    wardrobe2.position = new BABYLON.Vector3(9.5, 1.25, -10.5);
    wardrobe2.material = woodMaterial;
    wardrobe2.checkCollisions = true;
    wardrobe2.isInteractable = true;
    wardrobe2.keywords = ["Clothes", "Secret"];

    const dressingTable = BABYLON.MeshBuilder.CreateBox("Dressing Table", {width: 2, height: 0.8, depth: 0.6}, scene);
    dressingTable.position = new BABYLON.Vector3(6, 0.4, -6.5);
    dressingTable.material = woodMaterial;
    dressingTable.checkCollisions = true;
    dressingTable.isInteractable = true;
    dressingTable.keywords = ["Makeup", "Drawers"];

    const mirror = BABYLON.MeshBuilder.CreatePlane("Mirror", {width: 1.5, height: 1.5}, scene);
    mirror.position = new BABYLON.Vector3(6, 1.5, -6.2);
    mirror.material = mirrorMaterial;

    const painting = BABYLON.MeshBuilder.CreatePlane("painting", {width: 1.5, height: 1}, scene);
    painting.position = new BABYLON.Vector3(8, 2, -5.7); // In master bedroom
    painting.material = paintingMat;
    painting.isInteractable = true;
    painting.keywords = ["Art", "View"];

    // --- Washroom Area (Far Right) ---
    const washingMachine = BABYLON.MeshBuilder.CreateBox("Washing Machine", {width: 0.8, height: 1, depth: 0.8}, scene);
    washingMachine.position = new BABYLON.Vector3(7.5, 0.5, -11.5);
    washingMachine.material = metalMaterial;
    washingMachine.checkCollisions = true;
    washingMachine.isInteractable = true;
    washingMachine.keywords = ["Laundry", "Spin"];
    
    // NEW: Bathroom elements (simple) - positioned near washing machine
    const toilet = BABYLON.MeshBuilder.CreateBox("Toilet Base", {width: 0.6, height: 0.4, depth: 0.7}, scene);
    toilet.position = new BABYLON.Vector3(5.5, 0.2, -11.5);
    toilet.material = ceramicMaterial;
    const toiletSeat = BABYLON.MeshBuilder.CreateBox("Toilet Seat", {width: 0.65, height: 0.05, depth: 0.75}, scene);
    toiletSeat.position = new BABYLON.Vector3(5.5, 0.45, -11.5);
    toiletSeat.material = ceramicMaterial;
    toilet.isInteractable = true; // Can be a key location
    toilet.keywords = ["Porcelain", "Flush"];

    const bathroomSink = BABYLON.MeshBuilder.CreateBox("Bathroom Sink Vanity", {width: 1.0, height: 0.7, depth: 0.5}, scene);
    bathroomSink.position = new BABYLON.Vector3(8.5, 0.35, -12);
    bathroomSink.material = woodMaterial;
    const sinkBasin = BABYLON.MeshBuilder.CreateCylinder("Sink Basin", {height: 0.2, diameter: 0.4}, scene);
    sinkBasin.position = new BABYLON.Vector3(8.5, 0.7, -12);
    sinkBasin.material = ceramicMaterial;
    bathroomSink.isInteractable = true; // Can be a key location
    bathroomSink.keywords = ["Water", "Fauces"];

    const showerBase = BABYLON.MeshBuilder.CreateBox("Shower Base", {width: 1.2, height: 0.1, depth: 1.2}, scene);
    showerBase.position = new BABYLON.Vector3(7, 0.05, -9);
    showerBase.material = ceramicMaterial;
    const showerWall1 = BABYLON.MeshBuilder.CreateBox("Shower Wall 1", {width: 0.05, height: wallHeight, depth: 1.2}, scene);
    showerWall1.position = new BABYLON.Vector3(6.4, wallHeight/2, -9);
    showerWall1.material = glassMaterial;
    const showerWall2 = BABYLON.MeshBuilder.CreateBox("Shower Wall 2", {width: 1.2, height: wallHeight, depth: 0.05}, scene);
    showerWall2.position = new BABYLON.Vector3(7, wallHeight/2, -8.4);
    showerWall2.material = glassMaterial;


    // --- Ceiling Fan ---
    const fanBase = BABYLON.MeshBuilder.CreateCylinder("fanBase", {height: 0.2, diameter: 0.3}, scene);
    fanBase.position = new BABYLON.Vector3(0, wallHeight - 0.2, 0); // Central in the main area
    
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
    fan.keywords = ["Cooling", "Spinning"];

    // Add rotation animation to the blades' parent node
    const fanAnimation = new BABYLON.Animation("fanRotation", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys = [];
    keys.push({ frame: 0, value: 0 });
    keys.push({ frame: 60, value: 2 * Math.PI });
    fanAnimation.setKeys(keys);
    fanBladesNode.animations.push(fanAnimation);
    scene.beginAnimation(fanBladesNode, 0, 60, true);

    // --- Aesthetic Elements for a Modern Home ---

    // Bookshelf with animated books
    const bookshelf = BABYLON.MeshBuilder.CreateBox("Bookshelf", {width: 0.8, height: 2.5, depth: 0.3}, scene);
    bookshelf.position = new BABYLON.Vector3(-2, 1.25, -2);
    bookshelf.material = woodMaterial;
    bookshelf.checkCollisions = true;
    bookshelf.isInteractable = true;
    bookshelf.keywords = ["Knowledge", "Stories"];

    // Create some "books"
    const bookMaterial = new BABYLON.StandardMaterial("bookMat", scene);
    bookMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1); // Brown
    const bookMaterial2 = new BABYLON.StandardMaterial("bookMat2", scene);
    bookMaterial2.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.4); // Blue
    const bookMaterial3 = new BABYLON.StandardMaterial("bookMat3", scene);
    bookMaterial3.diffuseColor = new BABYLON.Color3(0.5, 0.1, 0.1); // Red

    const createBook = (x, y, z, mat) => {
        const book = BABYLON.MeshBuilder.CreateBox("Book", {width: 0.1, height: 0.4, depth: 0.3}, scene);
        book.position = new BABYLON.Vector3(x, y, z);
        book.material = mat;
        book.parent = bookshelf;
        return book;
    };

    const book1 = createBook(0.2, 0.8, 0, bookMaterial);
    const book2 = createBook(-0.2, 0.8, 0.05, bookMaterial2);
    const book3 = createBook(0.1, 0.3, -0.05, bookMaterial3);

    // Simple animation for a book sliding out slightly
    const bookAnimation = new BABYLON.Animation("bookSlide", "position.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const bookKeys = [];
    bookKeys.push({ frame: 0, value: 0 });
    bookKeys.push({ frame: 60, value: 0.05 });
    bookKeys.push({ frame: 120, value: 0 });
    bookAnimation.setKeys(bookKeys);
    book1.animations.push(bookAnimation);
    scene.beginAnimation(book1, 0, 120, true);


    // Neon LED strip lights around the ceiling
    const createLEDStrip = (name, width, height, depth, x, y, z, rotY = 0, color) => {
        const strip = BABYLON.MeshBuilder.CreateBox(name, {width: width, height: height, depth: depth}, scene);
        strip.position = new BABYLON.Vector3(x, y, z);
        strip.rotation.y = rotY;
        const lightMat = new BABYLON.StandardMaterial(`${name}Mat`, scene);
        lightMat.emissiveColor = color;
        strip.material = lightMat;
        return strip;
    };

    // Top strips
    createLEDStrip("ledNorth", totalWidth, 0.05, 0.05, 0, wallHeight - 0.02, totalDepth / 2 - 0.02, 0, new BABYLON.Color3(0, 0.8, 1)); // Cyan
    createLEDStrip("ledSouth", totalWidth, 0.05, 0.05, 0, wallHeight - 0.02, -totalDepth / 2 + 0.02, 0, new BABYLON.Color3(1, 0, 0.8)); // Magenta
    createLEDStrip("ledEast", totalDepth, 0.05, 0.05, totalWidth / 2 - 0.02, wallHeight - 0.02, 0, Math.PI / 2, new BABYLON.Color3(0.8, 1, 0)); // Yellow-Green
    createLEDStrip("ledWest", totalDepth, 0.05, 0.05, -totalWidth / 2 + 0.02, wallHeight - 0.02, 0, Math.PI / 2, new BABYLON.Color3(0, 1, 0.8)); // Teal

    // Animated wall clock
    const clockFace = BABYLON.MeshBuilder.CreateCylinder("clockFace", {height: 0.05, diameter: 1.0}, scene);
    clockFace.position = new BABYLON.Vector3(8, 2, totalDepth/2 - wallThickness - 0.05); // On north wall
    clockFace.rotation.x = Math.PI / 2; // Face forward
    const clockMat = new BABYLON.StandardMaterial("clockMat", scene);
    clockMat.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/wood.jpg", scene); // Simple texture for face
    clockFace.material = clockMat;

    const hourHand = BABYLON.MeshBuilder.CreateBox("hourHand", {width: 0.05, height: 0.3, depth: 0.02}, scene);
    hourHand.parent = clockFace;
    hourHand.position = new BABYLON.Vector3(0, 0.15, -0.03);
    hourHand.rotation.x = Math.PI / 2;
    const minuteHand = BABYLON.MeshBuilder.CreateBox("minuteHand", {width: 0.05, height: 0.45, depth: 0.02}, scene);
    minuteHand.parent = clockFace;
    minuteHand.position = new BABYLON.Vector3(0, 0.225, -0.03);
    minuteHand.rotation.x = Math.PI / 2;

    // Animate minute hand (for demonstration, a full rotation every 2 seconds)
    const minuteHandAnimation = new BABYLON.Animation("minuteHandAnim", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const minuteKeys = [];
    minuteKeys.push({ frame: 0, value: 0 });
    minuteKeys.push({ frame: 60, value: 2 * Math.PI }); // One full rotation
    minuteHandAnimation.setKeys(minuteKeys);
    minuteHand.animations.push(minuteHandAnimation);
    scene.beginAnimation(minuteHand, 0, 60, true);

    // Animate hour hand (slower)
    const hourHandAnimation = new BABYLON.Animation("hourHandAnim", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    const hourKeys = [];
    hourKeys.push({ frame: 0, value: 0 });
    hourKeys.push({ frame: 720, value: 2 * Math.PI }); // One full rotation over much longer period
    hourHandAnimation.setKeys(hourKeys);
    hourHand.animations.push(hourHandAnimation);
    scene.beginAnimation(hourHand, 0, 720, true);


    // Additional modern furniture/decorations
    // Modern Lamp
    const lampBase = BABYLON.MeshBuilder.CreateCylinder("lampBase", {height: 0.1, diameter: 0.5}, scene);
    lampBase.position = new BABYLON.Vector3(0, 0.05, 0);
    const lampPole = BABYLON.MeshBuilder.CreateCylinder("lampPole", {height: 1.5, diameter: 0.05}, scene);
    lampPole.parent = lampBase;
    lampPole.position.y = 0.75;
    const lampShade = BABYLON.MeshBuilder.CreateCylinder("lampShade", {height: 0.4, diameterTop: 0.3, diameterBottom: 0.6}, scene);
    lampShade.parent = lampPole;
    lampShade.position.y = 0.75;
    const lamp = BABYLON.Mesh.MergeMeshes([lampBase, lampPole, lampShade], true, true, undefined, false, true);
    lamp.name = "Modern Lamp";
    lamp.position = new BABYLON.Vector3(7, 0, 7);
    lamp.isInteractable = true;
    lamp.keywords = ["Light", "Bright"];
    const lampLight = new BABYLON.PointLight("lampLight", new BABYLON.Vector3(7, 2, 7), scene);
    lampLight.intensity = 0.6;
    lampLight.diffuse = new BABYLON.Color3(1, 0.8, 0.5); // Warm light

    // Abstract Sculpture
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere1", {diameter: 0.5}, scene);
    sphere1.position = new BABYLON.Vector3(0, 0.25, 0);
    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere2", {diameter: 0.3}, scene);
    sphere2.position = new BABYLON.Vector3(0.4, 0.6, 0);
    const cylinder1 = BABYLON.MeshBuilder.CreateCylinder("cylinder1", {height: 0.8, diameter: 0.1}, scene);
    cylinder1.position = new BABYLON.Vector3(0.2, 0.4, 0);
    cylinder1.rotation.z = Math.PI / 4;
    const sculpture = BABYLON.Mesh.MergeMeshes([sphere1, sphere2, cylinder1], true, true, undefined, false, true);
    sculpture.name = "Abstract Sculpture";
    sculpture.position = new BABYLON.Vector3(-8, 0, 7);
    sculpture.material = metalMaterial; // Use metal material for a modern look
    sculpture.isInteractable = true;
    sculpture.keywords = ["Abstract", "Art"];


    // --- Dynamic Key Placement Logic ---
    const potentialKeyLocations = [
        { mesh: sofa, hint: "under the cushion.", keywords: ["Key", "Hidden", "Soft"] },
        { mesh: wardrobe1, hint: "inside the left door.", keywords: ["Key", "Clothes", "Secret"] },
        { mesh: wardrobe2, hint: "behind the clothes.", keywords: ["Key", "Garment", "Hidden"] },
        { mesh: dressingTable, hint: "in the top drawer.", keywords: ["Key", "Drawer", "Cosmetics"] },
        { mesh: drawerTable, hint: "in the middle drawer.", keywords: ["Key", "Compartment", "Wood"] },
        { mesh: painting, hint: "behind the frame.", keywords: ["Key", "Frame", "Art"] },
        { mesh: fridge, hint: "behind the milk carton.", keywords: ["Key", "Cold", "Food"] },
        { mesh: washingMachine, hint: "under the detergent tray.", keywords: ["Key", "Laundry", "Machine"] },
        { mesh: kitchenSink, hint: "in the drain.", keywords: ["Key", "Water", "Drain"] },
        { mesh: toilet, hint: "behind the tank.", keywords: ["Key", "Ceramic", "Bathroom"] },
        { mesh: bathroomSink, hint: "under the faucet.", keywords: ["Key", "Water", "Sink"] },
        { mesh: bookshelf, hint: "behind a book.", keywords: ["Key", "Book", "Shelf"] },
        { mesh: kingBed, hint: "under the pillow.", keywords: ["Key", "Pillow", "Bed"] } // Corrected: bed2 replaced with kingBed
    ];

    // Select a random location for the key
    const randomIndex = Math.floor(Math.random() * potentialKeyLocations.length);
    const keyLocation = potentialKeyLocations[randomIndex];
    keyLocation.mesh.isKeyLocation = true; // Mark the chosen mesh
    keyLocation.mesh.keyHint = keyLocation.hint; // Store the hint for this location
    keyLocation.mesh.keywords = ["Key", keyLocation.hint.replace(".", "")]; // Override keywords for key location

    console.log(`Key is hidden: ${keyLocation.mesh.name} ${keyLocation.hint}`);


    return { floor, roof, mainExitDoor, sofa, coffeeTable, tvScreen, diningTable, bed1, wardrobe1, kingBed, wardrobe2, dressingTable, stove, fridge, washingMachine, painting, fan, bookshelf, clockFace, lamp, sculpture, beanBag, sideTable, floorLamp, kitchenCounter1, kitchenCounter2, kitchenSink, upperCabinet1, upperCabinet2, toilet, bathroomSink, showerBase, showerWall1, showerWall2, keyLocationMesh: keyLocation.mesh };
}