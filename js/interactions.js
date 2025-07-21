import { addMessage, updateUI, showEndScreen } from './ui.js';
import { getGameState, setGameState } from './gameState.js';

let scene;
let camera;

export function initInteractions(babylonScene, playerCamera) {
    scene = babylonScene;
    camera = playerCamera;

    window.addEventListener("keydown", (event) => {
        if (getGameState().isPaused || getGameState().isGameOver) return;
        
        if (event.key === 'e' || event.key === 'E') {
            const interactable = checkForInteractable();
            if (interactable) {
                handleInteraction(interactable);
            }
        }
    });

    return { checkForInteractable };
}

function checkForInteractable() {
    const ray = new BABYLON.Ray(camera.position, camera.getForwardRay().direction, 4); // Increased ray length for larger rooms
    const hit = scene.pickWithRay(ray);

    if (hit.pickedMesh && hit.pickedMesh.isInteractable) {
        return hit.pickedMesh;
    }
    return null;
}

function handleInteraction(mesh) {
    const gameState = getGameState();

    switch (mesh.name) {
        case "door":
            if (gameState.hasKey) {
                const newScore = gameState.promptCount + 10;
                showEndScreen(true, "You slot the key into a hidden lock. The door clicks open. You escaped... but she's still in there.", newScore);
            } else {
                addMessage('system', "This is the main exit. It's locked. Only E.V.A. can open it.");
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
        case "painting":
            let count = gameState.paintingClickCount + 1;
            setGameState({ paintingClickCount: count });
            if (count >= 5 && !gameState.hasKey) {
                setGameState({ hasKey: true });
                addMessage('system', "You press a corner of the painting for the fifth time. A hidden panel pops open, revealing a key!");
                updateUI();
            } else {
                addMessage('system', "An abstract painting in the master bedroom. E.V.A. says it represents your 'eternal love'.");
            }
            break;
        default:
            addMessage('system', `You look at the ${mesh.name}.`);
            break;
    }
}
