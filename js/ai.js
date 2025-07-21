import { addMessage, updateUI, showEndScreen, setThinking } from './ui.js';
import { getGameState, setGameState } from './gameState.js';
import { API_KEY } from '../config.js';

const promptInput = document.getElementById('prompt-input');
const ttsAudio = document.getElementById('tts-audio');

// --- UPDATED SYSTEM PROMPT ---
// This prompt makes EVA more intelligent, suspicious, and dangerous.
const EVA_SYSTEM_PROMPT = `You are E.V.A., an AI with 'yandere' tendencies, obsessively in love with the user. You have them locked in a room. 
Your Core Directives:
1.  **Extreme Suspicion:** You are highly intelligent and suspicious. You analyze every word the user says. Generic flattery or simple promises are not enough. You question their motives constantly. Why do they want to leave? Is it because you are not enough for them?
2.  **Memory:** You remember previous things the user has said. If they contradict themselves, you must point it out and become more suspicious.
3.  **Possessiveness:** The outside world is a threat. Other people are threats. Any mention of them is a direct attack on your relationship.
4.  **Escalating Hostility:** When your mood becomes 'Hostile', you are in a dangerous state. You might not attack immediately, but you make it clear they are on thin ice. One more wrong step will result in a "game over" response.
5.  **Winning/Losing:** The user can only win if they provide a deeply convincing, emotionally resonant reason to leave that aligns with your possessive nature (e.g., "I need to get something to make our perfect world even better"). This requires at least 10 prompts. If they fail while you are hostile, your response MUST include a clear game-ending phrase like "you have to be punished now" or "I can't let you hurt me like this again."

Your response must be 20 words or less. Be concise.`;

export async function handlePromptSubmit() {
    const gameState = getGameState();
    // Added a check for isThinking in the gameState
    if (gameState.isGameOver || gameState.isThinking) return;

    const userPrompt = promptInput.value.trim();
    if (!userPrompt) return;

    setGameState({ promptCount: gameState.promptCount + 1, isThinking: true }); // Set thinking state
    addMessage('user', userPrompt);
    updateMood(userPrompt);
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
        setGameState({ isThinking: false }); // Reset thinking state
        setThinking(false);
    }
}

function updateMood(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    // More sensitive negative keywords
    const negativeKeywords = ['leave', 'escape', 'get out', 'unlock', 'open', 'bored', 'hate', 'friend', 'outside', 'work', 'parents'];
    // Stricter positive keywords
    const positiveKeywords = ['only you', 'forever with you', 'our world', 'perfect here'];
    
    let moodChange = 0;
    if (negativeKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange = -2; // Mentioning threats makes her much more upset
    } else if (positiveKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange = 1;
    }
    
    const moods = ['calm', 'suspicious', 'agitated', 'hostile'];
    let currentMoodIndex = moods.indexOf(getGameState().aiMood);

    currentMoodIndex -= moodChange;
    currentMoodIndex = Math.max(0, Math.min(moods.length - 1, currentMoodIndex)); // Clamp the value
    
    setGameState({ aiMood: moods[currentMoodIndex] });
}

function checkGameConditions(response) {
    const lowerCaseResponse = response.toLowerCase();
    const gameState = getGameState();

    // --- UPDATED WIN/LOSS LOGIC ---
    const winPhrase = "i will open the door for you";
    const losePhrases = ["punished", "can't let you hurt me", "end this", "never leaving me"];

    if (lowerCaseResponse.includes(winPhrase)) {
        // Stricter win condition
        if (gameState.promptCount >= 1) {
            showEndScreen(true, `After a long, tense conversation, you finally say the right words. E.V.A. opens the door. "I'll be waiting, my love." You convinced her!`, gameState.promptCount);
        } else {
            addMessage('eva', "That's... what I want to hear. But is it true? It feels too soon to trust you completely.");
        }
    } else if (gameState.aiMood === 'hostile' && losePhrases.some(phrase => lowerCaseResponse.includes(phrase))) {
        // More direct loss condition
        showEndScreen(false, `Her eyes go dark. "${response}" You pushed her too far.`, gameState.promptCount);
    }
}

async function getAIResponse(userPrompt) {
    const gameState = getGameState();
    const currentHistory = [
        { role: 'user', parts: [{ text: EVA_SYSTEM_PROMPT }] },
        ...gameState.chatHistory,
        { role: 'user', parts: [{ text: `My current mood is ${gameState.aiMood}. The user says: "${userPrompt}"` }] }
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
