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

  // Universal Bubble Shooter Rule: Clearing the entire board is always an automatic victory
  const isBoardCleared = !grid || grid.length === 0 || grid.every(row => !row || row.every(cell => cell === null));
  if (isBoardCleared) return true;

  switch (objective.type) {
    case 'clear_all': {
      return isBoardCleared;
    }

    case 'rescue': {
      return rescuedCount >= objective.target || isBoardCleared;
    }

    case 'score': {
      return score >= objective.target || isBoardCleared;
    }

    case 'color_hunt': {
      return colorHuntCount >= objective.target || isBoardCleared;
    }

    default:
      return isBoardCleared;
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
