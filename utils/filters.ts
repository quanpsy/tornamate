
import { Tournament, Match, Team, User, FilterState, SportType, TournamentStatus, MatchStatus } from './types';

export const applyFilters = (
  data: {
    tournaments: Tournament[];
    matches: Match[];
    teams: Team[];
    users: User[];
  },
  filters: FilterState
) => {
  const { sports, status, location, dateRange } = filters;
  const hasSports = sports.length > 0;
  const hasStatus = status.length > 0;

  // Tournaments
  const filteredTournaments = data.tournaments.filter(t => {
    if (hasSports && !sports.includes(t.sport)) return false;
    if (hasStatus && !status.includes(t.status)) return false;
    if (location && !t.location?.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  // Matches
  const filteredMatches = data.matches.filter(m => {
    if (hasSports && !sports.includes(m.sport)) return false;
    if (hasStatus && !status.includes(m.status)) return false;
    if (location && !m.location?.toLowerCase().includes(location.toLowerCase())) return false;
    // Date Range Logic
    if (dateRange && dateRange.start && dateRange.end) {
       const mDate = new Date(m.startTime).getTime();
       const start = new Date(dateRange.start).getTime();
       const end = new Date(dateRange.end).getTime();
       if (mDate < start || mDate > end) return false;
    }
    return true;
  });

  // Teams
  const filteredTeams = data.teams.filter(t => {
     // Teams don't have sport field explicitly in the base Type but we can infer or skip
     // For mock purposes, skipping sport check for teams or checking linked tournament sports
     // Checking stats if available?
     return true; 
  });

  // Users
  const filteredUsers = data.users.filter(u => {
    if (hasSports && !u.preferredSports.some(s => sports.includes(s))) return false;
    if (location && !u.location?.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  return {
    tournaments: filteredTournaments,
    matches: filteredMatches,
    teams: filteredTeams,
    users: filteredUsers
  };
};
