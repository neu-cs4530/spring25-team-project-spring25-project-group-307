const getUpdatedRank = (score: number): string => {
  if (score >= 750) return 'Master Maverick';
  if (score >= 500) return 'Mentor Maven';
  if (score >= 300) return 'Expert Explorer';
  if (score >= 150) return 'Skilled Solver';
  if (score >= 50) return 'Common Contributor';
  return 'Newcomer Newbie';
};

export default getUpdatedRank;
