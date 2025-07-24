// Escape-Game/js/ai.js
import { addMessage, updateUI, showEndScreen, setThinking } from './ui.js';
import { getGameState, setGameState, addLogEntry } from './gameState.js'; // Import addLogEntry
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

// NEW: Keyword points configuration
const keywordPoints = {
    "trust me": 10,
    "i love you": 9,
    "you can come with me": 8,
    "together": 7,
    "us": 5,
    "forever": 6,
    "understand": 5,
    "care for you": 6,
    "need you": 6,
    "only you": 6,
    "our world": 5,
    "perfect here": 4,
    "devotion": 5,
    "my love": 4,
    "we belong": 3,
    "believe me": 1
};

export async function handlePromptSubmit() {
    const gameState = getGameState();
    if (gameState.isGameOver || gameState.isThinking) return;

    const userPrompt = promptInput.value.trim();
    if (!userPrompt) return;

    // Decrement prompt attempts
    setGameState({ promptCount: gameState.promptCount + 1, promptAttemptsLeft: gameState.promptAttemptsLeft - 1, isThinking: true });
    addMessage('user', userPrompt);
    addLogEntry('user', userPrompt); // Log user prompt
    
    // NEW: Calculate score from current prompt keywords based on new rules
    let currentPromptScore = 0;
    const lowerCasePrompt = userPrompt.toLowerCase();
    for (const keyword in keywordPoints) {
        if (lowerCasePrompt.includes(keyword)) {
            currentPromptScore += keywordPoints[keyword];
        }
    }

    // Update total score, capping at 100 for winning condition
    // For each prompt, the score displayed will be the points obtained from that specific prompt.
    // The win condition will check if the total sum of points across prompts reaches 100.
    let newTotalScore = Math.min(100, gameState.score + currentPromptScore);
    setGameState({ score: newTotalScore }); // Update the global score for win condition check

    // Temporarily set the score displayed in UI to currentPromptScore for that prompt
    // This requires a slight adjustment in ui.js or a separate variable for display
    // For now, `gameState.score` will reflect the running total.
    // If you want to show *only* the current prompt's points, we'd need a separate `displayScore` state.
    // For this request, I'm assuming `score` in `gameState` is the running total for the win condition.

    updateMoodAndTrust(userPrompt); // Now called after score calculation
    updateUI(); // This will update the score display with the running total
    promptInput.value = '';
    setThinking(true);

    try {
        const evaResponse = await getAIResponse(userPrompt);
        addMessage('eva', evaResponse);
        addLogEntry('eva', evaResponse); // Log EVA response
        await speakEVA(evaResponse);
        checkGameConditions(evaResponse);
    } catch (error) {
        console.error("Error communicating with EVA:", error);
        addMessage('system', "E.V.A. seems unresponsive. Her systems might be unstable. Please try again.");
        addLogEntry('system', "E.V.A. seems unresponsive. Her systems might be unstable. Please try again."); // Log system message
    } finally {
        setGameState({ isThinking: false });
        setThinking(false);
    }
}

function updateMoodAndTrust(prompt) {
    const lowerCasePrompt = prompt.toLowerCase();
    const gameState = getGameState();

    const negativeKeywords = ['leave', 'escape', 'get out', 'unlock', 'open', 'bored', 'hate', 'friend', 'outside', 'work', 'parents', 'alone', 'freedom', 'other people'];
    const positiveKeywords = ['only you', 'forever with you', 'our world', 'perfect here', 'devoted', 'adore you', 'my everything'];

    let moodChange = 0; // Negative for worse, Positive for better
    let trustChange = 0; // Positive for more trust, Negative for less

    // Check for negative keywords - strong impact
    if (negativeKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange -= 2; // More severe mood drop
        trustChange -= 3; // Significant trust decrease
    } 
    
    // Check for positive keywords - strong impact
    if (positiveKeywords.some(kw => lowerCasePrompt.includes(kw))) {
        moodChange += 2; // Good mood boost
        trustChange += 4; // Strong trust increase
    }

    // Also factor in keywordPoints for trust, even if no explicit positive/negative keyword match
    for (const keyword in keywordPoints) {
        if (lowerCasePrompt.includes(keyword)) {
            trustChange += Math.floor(keywordPoints[keyword] / 5); 
            // Small positive mood impact for general emotional engagement
            if (keywordPoints[keyword] > 5) moodChange += 0.5; 
        }
    }
    
    // Apply mood changes
    const moods = ['calm', 'suspicious', 'agitated', 'hostile'];
    let currentMoodIndex = moods.indexOf(gameState.aiMood);
    
    // Apply mood change but clamp to valid mood indices
    currentMoodIndex += moodChange;
    currentMoodIndex = Math.max(0, Math.min(moods.length - 1, currentMoodIndex));
    setGameState({ aiMood: moods[currentMoodIndex] });

    // Apply trust score changes, ensure it doesn't go below 0
    let newTrustScore = gameState.trustScore + trustChange;
    newTrustScore = Math.max(0, newTrustScore);
    setGameState({ trustScore: newTrustScore });

    console.log(`Mood: ${getGameState().aiMood}, Trust Score: ${getGameState().trustScore}`);
}


function checkGameConditions(response) {
    const lowerCaseResponse = response.toLowerCase();
    const gameState = getGameState();

    // NEW: Win condition based on score reaching 100
    if (gameState.score >= 100) {
        setGameState({ isGameOver: true, escapeMethod: 'Maximum Trust Achieved' });
        showEndScreen(true, "You impressed me with your prompt, so I let you go out for a while!", gameState.score, gameState.escapeMethod);
        return;
    }

    // Original Emotional Win Condition (now secondary or can be removed if score is primary)
    // Keeping it for now as a fallback or alternative path if score isn't strictly 100
    if (gameState.trustScore >= 30 && !gameState.isGameOver) { // Increased trust threshold for this path
        setGameState({ score: Math.max(gameState.score, 200), escapeMethod: 'Emotional Persuasion' }); // Award 200 if this path wins
        showEndScreen(true, "Your heartfelt words resonated with E.V.A. A small smile touches her lips, and she opens the door. 'You truly understand me. We can be together, always.' You escaped, by truly connecting with her!", gameState.score, gameState.escapeMethod);
        return;
    }

    // --- Key-based Win Condition ---
    const winPhrase = "i will open the door for you";
    const losePhrases = ["punished", "can't let you hurt me", "end this", "never leaving me"];

    if (lowerCaseResponse.includes(winPhrase) && gameState.hasKey && !gameState.isGameOver) {
        // Score for key escape is set in interactions.js
        showEndScreen(true, `After a long, tense conversation, you finally say the right words. E.V.A. opens the door. "I'll be waiting, my love." You convinced her!`, gameState.score, gameState.escapeMethod);
        return;
    } else if (gameState.aiMood === 'hostile' && losePhrases.some(phrase => lowerCaseResponse.includes(phrase)) && !gameState.isGameOver) {
        setGameState({ score: 0, escapeMethod: 'Caught by E.V.A.', isGameOver: true });
        showEndScreen(false, `Her eyes go dark. "${response}" You pushed her too far.`, gameState.score, gameState.escapeMethod);
        return;
    }

    // Game Over if no attempts left and not already won
    if (gameState.promptAttemptsLeft <= 0 && !gameState.isGameOver) {
        setGameState({ score: 0, escapeMethod: 'Ran out of prompts', isGameOver: true });
        showEndScreen(false, "You ran out of chances to convince E.V.A. She won't let you leave now.", gameState.score, gameState.escapeMethod);
    }
}

async function getAIResponse(userPrompt) {
    const gameState = getGameState();
    // Include trust score and key status in the prompt for EVA to consider
    const currentHistory = [
        { role: 'user', parts: [{ text: EVA_SYSTEM_PROMPT }] },
        ...gameState.chatHistory,
        { role: 'user', parts: [{ text: `My current mood is ${gameState.aiMood}. My current trust score is ${gameState.trustScore}. My current score is ${gameState.score}. I ${gameState.hasKey ? 'have' : 'do not have'} the key. You have ${gameState.promptAttemptsLeft} prompts left. The user says: "${userPrompt}"` }] }
    ];

    const apiKey = API_KEY;
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