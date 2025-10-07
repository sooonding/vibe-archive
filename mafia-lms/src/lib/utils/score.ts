interface WeightedScore {
  score: number;
  weight: number;
}

export const calculateTotalScore = (scores: WeightedScore[]): number => {
  if (scores.length === 0) return 0;

  const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = scores.reduce(
    (sum, item) => sum + item.score * item.weight,
    0,
  );

  return weightedSum / totalWeight;
};

export const formatScore = (score: number): string => {
  return score.toFixed(1);
};
