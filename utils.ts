
import { Match, SportType, CricketDetails, FootballDetails, SetBasedDetails, KabaddiDetails } from './types';

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

export const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

// --- Sport Specific Helpers ---

export const getInitialMatchDetails = (sport: SportType, teamAId: string): any => {
  switch (sport) {
    case SportType.CRICKET:
      return {
        currentInning: 1,
        battingTeamId: teamAId,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        recentBalls: []
      } as CricketDetails;
    case SportType.FOOTBALL:
      return {
        period: '1H',
        timeElapsed: 0,
        homeGoals: 0,
        awayGoals: 0,
        homeCards: { yellow: 0, red: 0 },
        awayCards: { yellow: 0, red: 0 }
      } as FootballDetails;
    case SportType.BADMINTON:
    case SportType.TENNIS:
      return {
        currentSet: 1,
        homeSetsWon: 0,
        awaySetsWon: 0,
        currentSetScore: { home: 0, away: 0 },
        setScores: []
      } as SetBasedDetails;
    case SportType.KABADDI:
      return {
        period: '1H',
        homePoints: 0,
        awayPoints: 0,
        raidPoints: { home: 0, away: 0 },
        tacklePoints: { home: 0, away: 0 }
      } as KabaddiDetails;
    default:
      return {};
  }
};

export const formatScore = (match: Match): { a: string, b: string } => {
  if (!match.details || Object.keys(match.details).length === 0) {
    return { a: match.scoreA.toString(), b: match.scoreB.toString() };
  }

  const s = match.sport;
  const d = match.details;

  if (s === SportType.CRICKET) {
    const cd = d as CricketDetails;
    // Simple mock logic: Assuming Team A bats first for simplicity in this demo
    // In a real app, you'd store innings data separately
    const scoreStr = `${cd.runs}/${cd.wickets} (${cd.overs}.${cd.balls})`;
    if (cd.battingTeamId === match.teamAId) {
      return { a: scoreStr, b: 'Yet to bat' };
    } else {
      // If 2nd inning, we'd need stored 1st inning score. 
      // For Phase 3 mock, let's just return simple strings or the stored display string
      return { a: match.scoreA.toString(), b: match.scoreB.toString() }; 
    }
  }

  if (s === SportType.FOOTBALL) {
    const fd = d as FootballDetails;
    return { a: fd.homeGoals.toString(), b: fd.awayGoals.toString() };
  }
  
  if (s === SportType.BADMINTON || s === SportType.TENNIS) {
    const bd = d as SetBasedDetails;
    // Show sets won (Main score) and current points (Sub score)
    return { 
      a: `${bd.homeSetsWon} (${bd.currentSetScore.home})`, 
      b: `${bd.awaySetsWon} (${bd.currentSetScore.away})` 
    };
  }

  if (s === SportType.KABADDI) {
    const kd = d as KabaddiDetails;
    return { a: kd.homePoints.toString(), b: kd.awayPoints.toString() };
  }

  return { a: match.scoreA.toString(), b: match.scoreB.toString() };
};

export const getSportIcon = (sport: SportType): string => {
  switch (sport) {
    case SportType.CRICKET: return '🏏';
    case SportType.FOOTBALL: return '⚽';
    case SportType.BADMINTON: return '🏸';
    case SportType.TENNIS: return '🎾';
    case SportType.KABADDI: return '🤼';
    default: return '🏆';
  }
};