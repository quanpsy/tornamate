
export const generateUserId = (name: string): string => {
  const sanitized = name.toLowerCase().replace(/\s+/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `@${sanitized}_${random}`;
};

export const generateTournamentId = (): string => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#TOUR_${random}`;
};

export const generateMatchId = (): string => {
  const random = Math.floor(100 + Math.random() * 900);
  return `#MATCH_${random}`;
};

export const generateTeamId = (name: string): string => {
  const sanitized = name.substring(0, 3).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900);
  return `TEAM_${sanitized}${random}`;
};
