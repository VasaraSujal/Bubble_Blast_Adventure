/**
 * Objective Management & Victory/Failure Evaluator (Sections 26, 28, 34)
 */

export const checkObjectiveCompletion = ({
  objective,
  grid,
  score = 0,
  rescuedCount = 0,
  colorHuntCount = 0
}) => {
  if (!objective) return false;

  switch (objective.type) {
    case 'clear_all': {
      // Complete when all bubbles on the board are cleared
      return !grid || grid.every(row => !row || row.every(cell => cell === null));
    }

    case 'rescue': {
      // Complete when required count of trapped baby dragons are freed OR when board is completely cleared
      const isBoardCleared = !grid || grid.length === 0 || grid.every(row => !row || row.every(cell => cell === null));
      return rescuedCount >= objective.target || isBoardCleared;
    }

    case 'score': {
      // Complete when player exceeds target score
      return score >= objective.target;
    }

    case 'color_hunt': {
      // Complete when required count of specified color are popped
      return colorHuntCount >= objective.target;
    }

    default:
      return false;
  }
};

export const checkLevelFailure = ({
  shotsRemaining,
  isComplete,
  isProjectileInFlight = false
}) => {
  if (isComplete) return false;
  return shotsRemaining <= 0 && !isProjectileInFlight;
};

export const calculateStars = (score, starThresholds = [500, 1000, 1500]) => {
  if (score >= starThresholds[2]) return 3;
  if (score >= starThresholds[1]) return 2;
  if (score >= starThresholds[0]) return 1;
  return 1; // Minimum 1 star upon completing level
};

export default {
  checkObjectiveCompletion,
  checkLevelFailure,
  calculateStars
};
