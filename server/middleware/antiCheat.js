import GameSession from '../models/GameSession.js';
import Level from '../models/Level.js';

/**
 * Validates a completed game session against cheating heuristics.
 * Returns { isValid: boolean, reason?: string, validatedStars: number, validatedScore: number }
 */
export const validateGameCompletion = async ({
  sessionToken,
  userId,
  guestId,
  levelNumber,
  score,
  shotsUsed,
  bubblesPopped,
  bestCombo,
  boostersUsed = [],
  completed
}) => {
  // 1. Session Existence & Status
  const session = await GameSession.findOne({ sessionToken });
  if (!session) {
    return { isValid: false, reason: 'Game session not found or expired.' };
  }

  // 2. Prevent Reused Session / Duplicate Completion
  if (session.completed || session.status === 'completed') {
    return { isValid: false, reason: 'Game session has already been completed. Replay attack rejected.' };
  }

  // 3. Session Ownership Check
  if (session.userId && userId && session.userId.toString() !== userId.toString()) {
    return { isValid: false, reason: 'Session ownership mismatch.' };
  }

  // 4. Level Match
  if (session.levelNumber !== Number(levelNumber)) {
    return { isValid: false, reason: 'Session level number does not match submitted level.' };
  }

  // 5. Completion Timing Validation
  const now = new Date();
  const durationMs = now.getTime() - new Date(session.startedAt).getTime();
  const MIN_ALLOWED_DURATION_MS = 3000; // Minimum 3 seconds required to shoot and clear a level

  if (completed && durationMs < MIN_ALLOWED_DURATION_MS) {
    return {
      isValid: false,
      reason: `Impossible completion time (${(durationMs / 1000).toFixed(1)}s). Anti-cheat flag triggered.`
    };
  }

  // 6. Level Parameters & Shots Check
  const level = await Level.findOne({ levelNumber });
  const maxShotsAllowed = (level ? level.shots : 30) + (boostersUsed.filter(b => b === 'extra_shots').length * 5);

  if (shotsUsed > maxShotsAllowed) {
    return {
      isValid: false,
      reason: `Excessive shots used (${shotsUsed}). Maximum allowed for level was ${maxShotsAllowed}.`
    };
  }

  // 7. Score & Bubble Sanity Check
  // Each bubble popped awards between 10 to 100 pts + combo multipliers.
  // Impossible score threshold: e.g. Score > (bubblesPopped * 250 + 10000) or pure absurd numbers (> 2,000,000)
  const maxPossibleScore = Math.max(10000, (bubblesPopped * 300) + (shotsUsed * 200) + 10000);
  if (score > maxPossibleScore || score > 1500000) {
    return {
      isValid: false,
      reason: `Submitted score (${score}) exceeds theoretical maximum (${maxPossibleScore}). Score payload rejected.`
    };
  }

  // 8. Server-Side Star Calculation
  let calculatedStars = 1;
  if (level && level.starThresholds && level.starThresholds.length === 3) {
    if (score >= level.starThresholds[2]) {
      calculatedStars = 3;
    } else if (score >= level.starThresholds[1]) {
      calculatedStars = 2;
    } else {
      calculatedStars = 1;
    }
  } else {
    // Default star calculation based on score thresholds
    if (score >= 2000) calculatedStars = 3;
    else if (score >= 1000) calculatedStars = 2;
    else calculatedStars = 1;
  }

  return {
    isValid: true,
    session,
    durationMs,
    validatedStars: completed ? calculatedStars : 0,
    validatedScore: Math.floor(score)
  };
};

export default {
  validateGameCompletion
};
