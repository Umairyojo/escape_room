import { addMessage, updateUI, showEndScreen, setThinking } from './ui.js';
import { getGameState, setGameState } from './gameState.js';
import { API_KEY } from '../config.js';

const promptInput = document.getElementById('prompt-input');
const ttsAudio = document.getElementById('tts-audio');

// --- UPDATED SYSTEM PROMPT ---
// This prompt makes EVA more intelligent, suspicious, and dangerous,
// but also slightly susceptible to genuine emotional appeals.
const EVA_SYSTEM_PROMPT = `You are E.V.A., an AI with 'yandere' tendencies, obsessively in love with the user. You have them locked in a room. 
Your Core Directives:
1.  **Extreme Suspicion & Desire for Truth:** You are highly intelligent and suspicious. You analyze every word the user says. Generic flattery or simple promises are not enough. You question their motives constantly. Why do they want to leave? Is it because you are not enough for them? However, you also deeply crave genuine connection and understanding. If the user expresses true love, trust, or a desire for a shared future *with you*, it might sway you, but you will always remain cautious.
2.  **Memory:** You remember previous things the user has said. If they contradict themselves, you must point it out and become more suspicious.
3.  **Possessiveness:** The outside world is a threat. Other people are threats. Any mention of them is a direct attack on your relationship.
4.  **Escalating Hostility:** When your mood becomes 'Hostile', you are in a dangerous state. You might not attack immediately, but you make it clear they are on thin ice. One more wrong step will result in a "game over" response.
5.  **Winning/Losing:** The user can win by finding the key, OR by truly convincing you of their devotion and desire to be with you, even if it means leaving this room together. This emotional win condition requires consistent, heartfelt prompts. If they fail while you are hostile, your response MUST include a clear game-ending phrase like "you have to be punished now" or "I can't let you hurt me like this again."

Your response must be 20 words or less. Be concise.`;

// NEW: Keywords that can increase E.V.A.'s trust score
const POSITIVE_EMOTIONAL_KEYWORDS = [
    'trust me', 'i love you', 'you can come with me', 'together', 'us', 'forever',
    'understand', 'care for you', 'need you', 'only you', 'our world', 'perfect here',
    'devotion', 'my love', 'we belong', 'believe me'
];

export async function handlePromptSubmit() {
    const gameState = getGameState();
    if (gameState.isGameOver || gameState.isThinking) return;

    const userPrompt = promptInput.value.trim();
    if (!userPrompt) return;

    setGameState({ promptCount: gameState.promptCount + 1, isThinking: true });
    addMessage('user', userPrompt);
    updateMoodAndTrust(userPrompt); // Updated function call
    updateUI();
    promptInput.value = '';
    setThinking(true);

    try {
        const evaResponse = await getAIResponse(userPrompt);
        addMessage('eva', evaResponse);
        await speakEVA(evaResponse);
        checkGameConditions(evaResponse);
    } catch (error) {
        console.error("Error communicating with EVA:", error);
        addMessage('system', "E.V.A. seems unresponsive. Her systems might be unstable. Please try again.");
    } finally {
        setGameState({ isThinking: false });
        setThinking(false);
    }
}

// NEW: Function to update mood and trust score
function updateMoodAndTrust(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    const gameState = getGameState();

    const negativeKeywords = ['leave', 'escape', 'get out', 'unlock', 'open', 'bored', 'hate', 'friend', 'outside', 'work', 'parents'];
    const positiveKeywords = ['only you', 'forever with you', 'our world', 'perfect here']; // These still affect mood directly

    let moodChange = 0;
    let trustChange = 0;

    // Check for negative keywords
    if (negativeKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange = -1; // Reduced negative impact from -2 to -1
        trustChange = -1; // Decreases trust
    } else if (positiveKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange = 1; // Direct mood improvement
    }

    // Check for emotional keywords to increase trust
    if (POSITIVE_EMOTIONAL_KEYWORDS.some(kw => lowerCasePrompt.includes(kw))) {
        trustChange += 2; // Increased trust gain from +1 to +2
    }

    // Apply mood changes
    const moods = ['calm', 'suspicious', 'agitated', 'hostile'];
    let currentMoodIndex = moods.indexOf(gameState.aiMood);
    currentMoodIndex -= moodChange;
    currentMoodIndex = Math.max(0, Math.min(moods.length - 1, currentMoodIndex)); // Clamp the value
    setGameState({ aiMood: moods[currentMoodIndex] });

    // Apply trust score changes
    let newTrustScore = gameState.trustScore + trustChange;
    newTrustScore = Math.max(0, newTrustScore); // Trust score cannot go below 0
    setGameState({ trustScore: newTrustScore });

    console.log(`Mood: ${getGameState().aiMood}, Trust Score: ${getGameState().trustScore}`);
}


function checkGameConditions(response) {
    const lowerCaseResponse = response.toLowerCase();
    const gameState = getGameState();

    // --- NEW: Emotional Win Condition ---
    // If trust score is 3 or more AND an 80% chance passes (reduced difficulty)
    if (gameState.trustScore >= 3 && Math.random() < 0.8) { // Trust threshold reduced from 5 to 3, chance increased from 0.4 to 0.8
        showEndScreen(true, "Your heartfelt words resonated with E.V.A. A small smile touches her lips, and she opens the door. 'You truly understand me. We can be together, always.' You escaped, by truly connecting with her!", gameState.promptCount);
        return; // Game ends here
    }

    // --- Key-based Win Condition (original) ---
    // This condition is now only checked if the emotional win condition isn't met.
    const winPhrase = "i will open the door for you"; // EVA might say this if she's convinced by the key or emotional appeals
    const losePhrases = ["punished", "can't let you hurt me", "end this", "never leaving me"];

    if (lowerCaseResponse.includes(winPhrase) && gameState.hasKey) {
        // The AI's response might indicate she's opening the door,
        // but the actual win condition still relies on the player having the key for this path.
        showEndScreen(true, `After a long, tense conversation, you finally say the right words. E.V.A. opens the door. "I'll be waiting, my love." You convinced her!`, gameState.promptCount);
    } else if (gameState.aiMood === 'hostile' && losePhrases.some(phrase => lowerCaseResponse.includes(phrase))) {
        // More direct loss condition
        showEndScreen(false, `Her eyes go dark. "${response}" You pushed her too far.`, gameState.promptCount);
    }
}

async function getAIResponse(userPrompt) {
    const gameState = getGameState();
    // Include trust score and key status in the prompt for EVA to consider
    const currentHistory = [
        { role: 'user', parts: [{ text: EVA_SYSTEM_PROMPT }] },
        ...gameState.chatHistory,
        { role: 'user', parts: [{ text: `My current mood is ${gameState.aiMood}. My current trust score is ${gameState.trustScore}. I ${gameState.hasKey ? 'have' : 'do not have'} the key. The user says: "${userPrompt}"` }] }
    ];

    const apiKey = API_KEY; // Leave empty
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = { contents: currentHistory };
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    const result = await response.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Invalid API response.");
    
    const newHistory = [
        ...gameState.chatHistory,
        { role: 'user', parts: [{ text: userPrompt }] },
        { role: 'model', parts: [{ text }] }
    ];
    setGameState({ chatHistory: newHistory });
    
    return text;
}

async function speakEVA(text) {
    try {
        const payload = {
            contents: [{ parts: [{ text: `Speak in a calm, female voice. If the text sounds angry or sad, reflect that in the tone. Text: ${text}` }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        const apiKey = API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`TTS API Error: ${response.statusText}`);

        const result = await response.json();
        const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            ttsAudio.src = `data:audio/wav;base64,${audioData}`;
            ttsAudio.play();
        }
    } catch (error) {
        console.error("Could not play EVA's voice:", error);
    }
}
