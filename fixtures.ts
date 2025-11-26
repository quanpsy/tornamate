
import { Match, Team, Tournament, TournamentFormat, SportType, MatchStatus, StandingsRow, CricketDetails, FootballDetails } from './types';
import { generateMatchId } from './utils';

export const generateFixtures = (tournament: Tournament): Match[] => {
  const teams = tournament.teams;
  if (teams.length < 2) return [];

  switch (tournament.format) {
    case TournamentFormat.LEAGUE:
      return generateLeagueFixtures(teams, tournament);
    case TournamentFormat.KNOCKOUT:
      return generateKnockoutFixtures(teams, tournament);
    default:
      return []; // Group stage not implemented for Phase 4 demo
  }
};

const generateLeagueFixtures = (teams: Team[], tournament: Tournament): Match[] => {
  const matches: Match[] = [];
  // Round Robin Algorithm
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: generateMatchId(),
        tournamentId: tournament.id,
        teamAId: teams[i].id,
        teamBId: teams[j].id,
        scoreA: '-',
        scoreB: '-',
        status: MatchStatus.SCHEDULED,
        startTime: new Date(new Date(tournament.startDate).getTime() + (matches.length * 86400000)).toISOString(), // 1 match per day mock
        location: tournament.location || 'TBD',
        sport: tournament.sport,
        commentary: [],
        round: 1,
        details: {}
      });
    }
  }
  return matches;
};

const generateKnockoutFixtures = (teams: Team[], tournament: Tournament): Match[] => {
  const matches: Match[] = [];
  const numTeams = teams.length;
  
  // Power of 2 check (simplified, assuming host manages byes or full teams for demo)
  // Calculate depth
  let rounds = Math.ceil(Math.log2(numTeams));
  const totalMatches = Math.pow(2, rounds) - 1;
  
  // Need to structure fixtures such that Match 1 & 2 -> Match 5, etc.
  // We will create the bracket from Finals backwards or Round 1 forwards?
  // Round 1 forwards is easier to assign teams.
  
  const matchesPerRound: Match[][] = [];
  
  let currentRoundMatchCount = Math.pow(2, rounds - 1);
  let roundIndex = 1;
  let matchCounter = 0;

  // Generate blank bracket structure
  while (currentRoundMatchCount >= 1) {
    const roundMatches: Match[] = [];
    for (let i = 0; i < currentRoundMatchCount; i++) {
      roundMatches.push({
        id: generateMatchId() + `_R${roundIndex}_${i}`,
        tournamentId: tournament.id,
        teamAId: null, // Placeholder
        teamBId: null, // Placeholder
        scoreA: '-',
        scoreB: '-',
        status: MatchStatus.SCHEDULED,
        startTime: new Date(new Date(tournament.startDate).getTime() + (roundIndex * 86400000)).toISOString(),
        location: tournament.location || 'TBD',
        sport: tournament.sport,
        commentary: [],
        round: roundIndex,
        details: {},
        bracketIndex: i
      });
    }
    matchesPerRound.push(roundMatches);
    currentRoundMatchCount /= 2;
    roundIndex++;
  }

  // Link matches (NextMatchId)
  // Loop through rounds except the last (Final)
  for (let r = 0; r < matchesPerRound.length - 1; r++) {
    const currentRound = matchesPerRound[r];
    const nextRound = matchesPerRound[r + 1];
    
    for (let i = 0; i < currentRound.length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      currentRound[i].nextMatchId = nextRound[nextMatchIndex].id;
    }
  }

  // Assign Teams to Round 1
  // Simple seeding: 1 vs 2, 3 vs 4... (Random shuffle in real app)
  const round1 = matchesPerRound[0];
  for (let i = 0; i < round1.length; i++) {
    if (i * 2 < teams.length) round1[i].teamAId = teams[i * 2].id;
    if (i * 2 + 1 < teams.length) round1[i].teamBId = teams[i * 2 + 1].id;
    
    // Auto-win/bye handling if team is missing would go here
    // For now, assume TBD if odd number
  }

  return matchesPerRound.flat();
};

export const calculateStandings = (matches: Match[], teams: Team[], sport: SportType): StandingsRow[] => {
  const standings: Record<string, StandingsRow> = {};

  // Initialize
  teams.forEach(t => {
    standings[t.id] = {
      teamId: t.id,
      teamName: t.name,
      played: 0,
      won: 0,
      lost: 0,
      draw: 0,
      points: 0,
      nrr: 0,
      gd: 0
    };
  });

  matches.forEach(m => {
    if (m.status === MatchStatus.COMPLETED && m.teamAId && m.teamBId) {
      const sA = standings[m.teamAId];
      const sB = standings[m.teamBId];
      if (!sA || !sB) return;

      sA.played++;
      sB.played++;

      // Determine Result
      // Simplified scoring parsing
      let valA = 0, valB = 0;
      
      // Attempt to parse simple scores or use Details
      if (m.sport === SportType.FOOTBALL && m.details) {
         valA = (m.details as FootballDetails).homeGoals;
         valB = (m.details as FootballDetails).awayGoals;
         sA.gd! += (valA - valB);
         sB.gd! += (valB - valA);
      } else {
         // Fallback for simple numeric strings
         valA = parseInt(m.scoreA.toString()) || 0;
         valB = parseInt(m.scoreB.toString()) || 0;
      }

      if (valA > valB) {
        sA.won++; sA.points += 2; // 2 points for win
        sB.lost++;
      } else if (valB > valA) {
        sB.won++; sB.points += 2;
        sA.lost++;
      } else {
        sA.draw++; sA.points += 1;
        sB.draw++; sB.points += 1;
      }
    }
  });

  return Object.values(standings).sort((a, b) => b.points - a.points || b.gd! - a.gd!);
};

// Helper to determine where a winner goes
export const advanceBracket = (match: Match, winnerId: string, allMatches: Match[]): Match[] => {
  if (!match.nextMatchId) return allMatches;

  return allMatches.map(m => {
    if (m.id === match.nextMatchId) {
      // Determine if winner goes to A or B slot
      // Logic: If previous match index was even (0, 2), go to A. If odd (1, 3), go to B.
      const isTeamA = match.bracketIndex! % 2 === 0;
      
      return {
        ...m,
        teamAId: isTeamA ? winnerId : m.teamAId,
        teamBId: !isTeamA ? winnerId : m.teamBId
      };
    }
    return m;
  });
};
