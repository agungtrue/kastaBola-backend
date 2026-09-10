/**
 * Kalkulasi Perubahan Rating Elo untuk Pertandingan Mini Soccer (K-Factor = 32)
 */
export function calculateEloUpdate(
  homeElo: number,
  awayElo: number,
  homeScore: number,
  awayScore: number,
): { newHomeElo: number; newAwayElo: number } {
  const K = 32;

  // Expected outcome
  const expectedHome = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
  const expectedAway = 1 / (1 + Math.pow(10, (homeElo - awayElo) / 400));

  // Actual outcome
  let actualHome = 0.5;
  let actualAway = 0.5;

  if (homeScore > awayScore) {
    actualHome = 1;
    actualAway = 0;
  } else if (awayScore > homeScore) {
    actualHome = 0;
    actualAway = 1;
  }

  const newHomeElo = Math.round(homeElo + K * (actualHome - expectedHome));
  const newAwayElo = Math.round(awayElo + K * (actualAway - expectedAway));

  return { newHomeElo, newAwayElo };
}