import { createSignal } from 'solid-js';

// Persist game state in memory so navigating away doesn't lose the game
const [pvpGameState, setPvpGameState] = createSignal(null);
const [aiGameState, setAiGameState] = createSignal(null);
const [aiSettings, setAiSettings] = createSignal({ difficulty: null, playerColor: 'w' });

export {
  pvpGameState, setPvpGameState,
  aiGameState, setAiGameState,
  aiSettings, setAiSettings
};
