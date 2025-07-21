import { addMessage, updateUI, showEndScreen } from './ui.js';
import { getGameState, setGameState } from './gameState.js';

let scene;
let camera;
let keyLocationMesh; // NEW: To store the mesh where the key is located

export function initInteractions(babylonScene, playerCamera, keyMesh) { // NEW: Accepts keyMesh
    scene = babylonScene;
    camera = playerCamera;
    keyLocationMesh = keyMesh; // Store the key mesh

    window.addEventListener("keydown", (event) => {
        if (getGameState().isPaused || getGameState().isGameOver) return;
        
        if (event.key === 'e' || event.key === 'E') {
            const interactable = checkForInteractable();
            if (interactable) {
                handleInteraction(interactable);
            }
        }
    });

    // Modified to return the key location mesh's name if it's the key location
    return { 
        checkForInteractable: () => {
            const ray = new BABYLON.Ray(camera.position, camera.getForwardRay().direction, 4);
            const hit = scene.pickWithRay(ray);

            if (hit.pickedMesh && hit.pickedMesh.isInteractable) {
                // If the picked mesh is the key location and the player doesn't have the key yet
                if (hit.pickedMesh.isKeyLocation && !getGameState().hasKey) {
                    // Return the mesh with a special name to indicate it's the key location
                    // This allows ui.js to display a more specific hint
                    return { name: `[Key Location] ${hit.pickedMesh.name}`, mesh: hit.pickedMesh };
                }
                return { name: hit.pickedMesh.name, mesh: hit.pickedMesh };
            }
            return null;
        }
    };
}

function handleInteraction(interactable) {
    const mesh = interactable.mesh; // Access the actual mesh
    const gameState = getGameState();

    // --- NEW: Key Interaction Logic ---
    if (mesh.isKeyLocation && !gameState.hasKey) {
        setGameState({ hasKey: true });
        addMessage('system', `You found a key ${mesh.keyHint}! It must be for the main door.`);
        updateUI();
        mesh.isInteractable = false; // Make it non-interactable after key is found
        // Optional: Change material or make key disappear visually
        // mesh.dispose(); // If you want the mesh to disappear entirely
        return; // Key found, no other interaction needed for this mesh
    }

    switch (mesh.name) {
        case "door":
            if (gameState.hasKey) {
                const newScore = gameState.promptCount + 10;
                showEndScreen(true, "You slot the key into a hidden lock. The door clicks open. You escaped... but she's still in there.", newScore);
            } else {
                addMessage('system', "This is the main exit. It's locked. Only E.V.A. can open it, or perhaps a key...");
            }
            break;
        case "TV":
            addMessage('system', "A large, dark screen. It's not plugged in. E.V.A. says you don't need distractions from her.");
            break;
        case "Drawer Table":
            addMessage('system', "A long table with several drawers. You try them, but they're all locked.");
            break;
        case "Sofa":
            addMessage('system', "A surprisingly comfortable sofa. You've spent a lot of time here... talking to her.");
            break;
        case "Coffee Table":
            addMessage('system', "A simple wooden coffee table. Clean, not a single thing on it.");
            break;
        case "Dining Table":
            addMessage('system', "A dining table set for two. It seems she's always expecting you to have a meal with her.");
            break;
        case "Gas Stove":
            addMessage('system', "A modern gas stove. It's disconnected from the gas line. She doesn't want any 'accidents'.");
            break;
        case "Fridge":
            addMessage('system', "The fridge is stocked with your favorite drinks and snacks. She's very attentive.");
            break;
        case "Kitchen Shelf":
            addMessage('system', "Shelves stocked with ingredients. It seems she's ready to cook anything you desire.");
            break;
        case "Bed":
            addMessage('system', "A neatly made bed. It looks comfortable, but you're too anxious to sleep.");
            break;
        case "Wardrobe":
            addMessage('system', "A wardrobe filled with clothes she picked out for you. Your old clothes are gone.");
            break;
        case "Dressing Table":
            addMessage('system', "A dressing table with expensive-looking cosmetics. She says you should always look your best, for her.");
            break;
        case "Washing Machine":
            addMessage('system', "A new washing machine. She likes to keep everything clean and perfect.");
            break;
        // Removed the specific painting interaction for the key, as it's now dynamic
        case "painting":
            addMessage('system', "An abstract painting in the master bedroom. E.V.A. says it represents your 'eternal love'.");
            break;
        default:
            addMessage('system', `You look at the ${mesh.name}.`);
            break;
    }
}
