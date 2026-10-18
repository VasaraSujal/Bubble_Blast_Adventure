/**
 * Data-Driven Level Registry (Sections 26, 28, 29, 30, 31)
 *
 * Defines 40 playable levels with varied difficulty, objectives,
 * bubble configurations, and star thresholds, plus procedural generation for 41+.
 */

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

// Helper to generate curated level definitions
export const getLevelDefinition = (levelNumber) => {
  if (levelNumber < 1) levelNumber = 1;

  let difficulty = 'easy';
  let colorsCount = 3;
  let rows = 4;
  let shots = 25;
  let objective = {
    type: 'clear_all',
    target: 0,
    description: 'Clear all bubbles on the board!'
  };

  // 1. Difficulty & Progression scaling (Section 13)
  if (levelNumber === 1) {
    difficulty = 'tutorial';
    colorsCount = 2; // red & blue only for effortless tutorial learning
    rows = 3;
    shots = 30; // generous shots
    objective = {
      type: 'clear_all',
      target: 0,
      description: 'Tutorial: Match 3 or more bubbles to clear the grid!'
    };
  } else if (levelNumber <= 5) {
    difficulty = 'tutorial';
    colorsCount = 3;
    rows = 4;
    shots = 26 - levelNumber;
    objective = {
      type: 'clear_all',
      target: 0,
      description: 'Tutorial: Match 3 or more bubbles to clear the grid!'
    };
  } else if (levelNumber <= 10) {
    difficulty = 'beginner';
    colorsCount = 4;
    rows = 5;
    shots = 22;
    if (levelNumber % 2 === 0) {
      objective = {
        type: 'rescue',
        target: 2,
        description: 'Rescue 2 baby companions trapped behind bubbles!'
      };
    } else {
      objective = {
        type: 'clear_all',
        target: 0,
        description: 'Clear all bubbles before shots run out!'
      };
    }
  } else if (levelNumber <= 20) {
    difficulty = 'easy';
    colorsCount = 4;
    rows = 6;
    shots = 20;
    if (levelNumber % 3 === 0) {
      objective = {
        type: 'rescue',
        target: 3,
        description: 'Rescue 3 baby dragons!'
      };
    } else if (levelNumber % 3 === 1) {
      objective = {
        type: 'color_hunt',
        targetColor: COLORS[levelNumber % 4],
        target: 12,
        description: `Color Hunt: Pop 12 ${COLORS[levelNumber % 4].toUpperCase()} bubbles!`
      };
    } else {
      objective = {
        type: 'clear_all',
        target: 0,
        description: 'Clear all bubbles to advance!'
      };
    }
  } else if (levelNumber <= 30) {
    difficulty = 'medium';
    colorsCount = 5;
    rows = 7;
    shots = 18;
    if (levelNumber % 2 === 0) {
      objective = {
        type: 'rescue',
        target: 4,
        description: 'Rescue 4 baby dragons!'
      };
    } else {
      objective = {
        type: 'score',
        target: 3500,
        description: 'Score Challenge: Reach at least 3,500 points!'
      };
    }
  } else if (levelNumber <= 35) {
    difficulty = 'hard';
    colorsCount = 5;
    rows = 8;
    shots = 16;
    objective = {
      type: 'rescue',
      target: 5,
      description: 'Hard Level: Rescue 5 trapped baby dragons!'
    };
  } else if (levelNumber <= 40) {
    difficulty = 'expert';
    colorsCount = 6;
    rows = 9;
    shots = 15;
    objective = {
      type: 'clear_all',
      target: 0,
      description: 'Expert Challenge: Clear all bubbles with tight shots!'
    };
  } else {
    // 41+ Procedural Endless Generator
    difficulty = 'expert';
    colorsCount = 6;
    rows = Math.min(10, 5 + (levelNumber % 6));
    shots = Math.max(14, 24 - Math.floor(levelNumber / 10));
    objective = {
      type: levelNumber % 2 === 0 ? 'rescue' : 'clear_all',
      target: levelNumber % 2 === 0 ? 4 : 0,
      description: `Endless Stage ${levelNumber}: Clear objective!`
    };
  }

  // Level 1: Curated, instant-fun tutorial with obvious paired clusters
  if (levelNumber === 1) {
    const curatedL1 = [
      ['red', 'red', 'blue', 'blue', 'red', 'red', 'blue', 'blue'],
      ['red', 'red', 'blue', 'blue', 'blue', 'red', 'red'],
      ['red', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'blue']
    ];
    return {
      levelNumber: 1,
      difficulty: 'tutorial',
      objective,
      shots: 30,
      colors: ['red', 'blue'],
      boardLayout: curatedL1,
      bubbleQueue: ['red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue', 'red', 'blue'],
      targetScore: 1200,
      starThresholds: [400, 800, 1200],
      availableBoosters: ['extra_shots', 'aim_guide', 'bomb', 'rainbow', 'shuffle']
    };
  }

  const activeColors = COLORS.slice(0, colorsCount);

  // Deterministic clustered layout generator based on levelNumber seed
  const boardLayout = [];
  const COLS_EVEN = 8;
  const COLS_ODD = 7;
  let rescuePlaced = 0;

  for (let r = 0; r < rows; r++) {
    const colCount = (r % 2 === 0) ? COLS_EVEN : COLS_ODD;
    const row = [];

    for (let c = 0; c < colCount; c++) {
      // Natural arcade clustering: cluster size of 2-3 bubbles per group
      const clusterCol = Math.floor(c / 2);
      const clusterRow = Math.floor(r / 2);
      const seedVal = (levelNumber * 23 + clusterRow * 17 + clusterCol * 7) % activeColors.length;
      const color = activeColors[seedVal];

      // Rescue target placement
      if (objective.type === 'rescue' && rescuePlaced < objective.target && r >= 2 && (r + c) % 3 === 0) {
        row.push({
          color,
          hasRescueTarget: true,
          rescueType: 'baby_dragon'
        });
        rescuePlaced++;
      } else {
        row.push(color);
      }
    }
    boardLayout.push(row);
  }

  // Pre-generated bubble queue (Section 25) with high matching probability
  const bubbleQueue = [];
  for (let i = 0; i < 45; i++) {
    const qSeed = (levelNumber * 19 + Math.floor(i / 2) * 11) % activeColors.length;
    bubbleQueue.push(activeColors[qSeed]);
  }

  const baseScore = rows * 400 + 400;
  const starThresholds = [
    Math.floor(baseScore * 0.5),
    Math.floor(baseScore * 0.8),
    Math.floor(baseScore * 1.25)
  ];

  return {
    levelNumber,
    difficulty,
    objective,
    shots,
    colors: activeColors,
    boardLayout,
    bubbleQueue,
    targetScore: baseScore,
    starThresholds,
    availableBoosters: ['extra_shots', 'aim_guide', 'bomb', 'rainbow', 'shuffle']
  };
};

export const TOTAL_PRIMARY_LEVELS = 40;

export default {
  getLevelDefinition,
  TOTAL_PRIMARY_LEVELS
};
