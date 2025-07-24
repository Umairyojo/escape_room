// Escape-Game/js/interactions.js
import { addMessage, updateUI, showEndScreen, showKeywordPopup, hideKeywordPopup } from './ui.js'; 
import { getGameState, setGameState, addLogEntry } from './gameState.js'; 

let scene;
let camera;
let keyLocationMesh; 

export function initInteractions(babylonScene, playerCamera, keyMesh) { 
    scene = babylonScene;
    camera = playerCamera;
    keyLocationMesh = keyMesh; 

    // Define the checkForInteractable function locally within initInteractions
    // and assign it to an internal variable for use by the event listener.
    const internalCheckForInteractable = () => {
        const ray = new BABYLON.Ray(camera.position, camera.getForwardRay().direction, 4);
        const hit = scene.pickWithRay(ray);

        if (hit.pickedMesh && hit.pickedMesh.isInteractable) {
            // If the picked mesh is the key location and the player doesn't have the key yet
            if (hit.pickedMesh.isKeyLocation && !getGameState().hasKey) {
                return { name: `[Key Location] ${hit.pickedMesh.name}`, mesh: hit.pickedMesh };
            }
            return { name: hit.pickedMesh.name, mesh: hit.pickedMesh };
        }
        return null;
    };

    window.addEventListener("keydown", (event) => {
        if (getGameState().isPaused || getGameState().isGameOver) return;
        
        if (event.key === 'e' || event.key === 'E') {
            const interactable = internalCheckForInteractable(); // Use the internal reference
            if (interactable) {
                handleInteraction(interactable);
            }
        }
    });

    // Return the function in the object as expected by main.js
    return { 
        checkForInteractable: internalCheckForInteractable // Expose the same function publicly
    };
}

function handleInteraction(interactable) {
    const mesh = interactable.mesh; 
    const gameState = getGameState();

    // --- NEW: Key Interaction Logic ---
    if (mesh.isKeyLocation && !gameState.hasKey) {
        setGameState({ hasKey: true });
        addMessage('system', `You found a key ${mesh.keyHint}! It must be for the main door.`);
        addLogEntry('system', `Found key: ${mesh.name} (${mesh.keyHint})`); 
        updateUI();
        mesh.isInteractable = false; // Make it non-interactable after key is found
        hideKeywordPopup(); // Hide the keyword popup after interaction
        return; 
    }

    // Show object's keywords as a popup message
    if (mesh.keywords) {
        addMessage('system', `You examine the ${mesh.name}. Keywords: ${mesh.keywords.join(', ')}`);
        addLogEntry('system', `Examined ${mesh.name}. Keywords: ${mesh.keywords.join(', ')}`); 
    } else {
        addMessage('system', `You examine the ${mesh.name}.`);
        addLogEntry('system', `Examined ${mesh.name}.`); 
    }

    switch (mesh.name) {
        case "door":
            if (gameState.hasKey) {
                const newScore = gameState.score + 10; 
                setGameState({ score: newScore, escapeMethod: 'Key Found' });
                showEndScreen(true, "You slot the key into a hidden lock. The door clicks open. You escaped... but she's still in there.", newScore, gameState.escapeMethod);
                addLogEntry('system', "Escaped using the key!"); 
            } else {
                addMessage('system', "This is the main exit. It's locked. Only E.V.A. can open it, or perhaps a key...");
                addLogEntry('system', "Attempted to open locked door."); 
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
        case "Bed 1": 
        case "Bed 2": 
        case "King Bed": 
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
        case "Toilet Base":
            addMessage('system', "A standard toilet. Clean, almost too clean.");
            break;
        case "Bathroom Sink Vanity":
            addMessage('system', "A sleek bathroom sink. The faucet gleams, but no water runs.");
            break;
        case "Bean Bag":
            addMessage('system', "A large, soft bean bag chair. Surprisingly inviting given the circumstances.");
            break;
        case "Side Table":
            addMessage('system', "A small, minimalist side table. Nothing of interest on it.");
            break;
        case "Floor Lamp":
            addMessage('system', "A modern floor lamp, casting a soft, warm glow.");
            break;
        case "Bookshelf":
            addMessage('system', "A bookshelf with a few neatly organized volumes. They seem to be about philosophy and art, chosen by EVA.");
            break;
        case "Modern Lamp":
            addMessage('system', "A designer lamp providing ambient light.");
            break;
        case "Abstract Sculpture":
            addMessage('system', "A perplexing abstract sculpture. Its meaning is as elusive as EVA's true intentions.");
            break;
        case "painting":
            addMessage('system', "An abstract painting in the master bedroom. E.V.A. says it represents your 'eternal love'.");
            break;
        case "Kitchen Counter 1":
        case "Kitchen Counter 2":
            addMessage('system', "A clean, dark countertop. Everything is perfectly in place.");
            break;
        case "Upper Cabinet 1":
        case "Upper Cabinet 2":
            addMessage('system', "These cabinets are firmly shut. EVA doesn't want you rummaging around.");
            break;
        case "Shower Base":
        case "Shower Wall 1":
        case "Shower Wall 2":
            addMessage('system', "A clear glass shower enclosure. It looks unused.");
            break;
        default:
            // Generic message for any other interactable object without a specific case
            addMessage('system', `You look at the ${mesh.name}. It doesn't seem to do anything.`);
            break;
    }
}