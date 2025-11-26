
import { User, Tournament, Team, Match, SportType } from './types';

// Simple weighted scoring system
export const calculateRelevance = (text: string, query: string, weight: number): number => {
  if (!text || !query) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 100 * weight; // Exact match
  if (t.startsWith(q)) return 80 * weight; // Starts with
  if (t.includes(q)) return 60 * weight; // Contains
  
  // Split query matching (e.g. "cricket blr" matches "Gully Cricket Bangalore")
  const queryParts = q.split(' ');
  let matches = 0;
  queryParts.forEach(part => {
    if (t.includes(part)) matches++;
  });
  
  if (matches > 0) return (40 * matches / queryParts.length) * weight;

  return 0;
};

export interface SearchResults {
  tournaments: Tournament[];
  teams: Team[];
  users: User[];
  matches: Match[];
}

export const performGlobalSearch = (
  query: string,
  data: {
    tournaments: Tournament[];
    teams: Team[];
    users: User[];
    matches: Match[];
  }
): SearchResults => {
  const q = query.trim();
  if (!q) return { tournaments: [], teams: [], users: [], matches: [] };

  // Helper to sort by score
  const sortByScore = (items: any[]) => items.sort((a, b) => b._score - a._score);

  // 1. Tournaments
  const tournaments = data.tournaments.map(t => {
    let score = 0;
    score += calculateRelevance(t.name, q, 2); // Name is most important
    score += calculateRelevance(t.sport, q, 1.5);
    score += calculateRelevance(t.location || '', q, 1.2);
    score += calculateRelevance(t.description || '', q, 0.5);
    return { ...t, _score: score };
  }).filter(t => t._score > 0);

  // 2. Teams
  const teams = data.teams.map(t => {
    let score = 0;
    score += calculateRelevance(t.name, q, 2);
    return { ...t, _score: score };
  }).filter(t => t._score > 0);

  // 3. Users
  const users = data.users.map(u => {
    let score = 0;
    score += calculateRelevance(u.name, q, 2);
    score += calculateRelevance(u.id, q, 1.5); // Handle match
    score += calculateRelevance(u.location || '', q, 1);
    return { ...u, _score: score };
  }).filter(u => u._score > 0);

  // 4. Matches
  const matches = data.matches.map(m => {
    let score = 0;
    // Match search is tricky, usually searching by team names or tournament
    const tA = data.teams.find(t => t.id === m.teamAId)?.name || '';
    const tB = data.teams.find(t => t.id === m.teamBId)?.name || '';
    const tour = data.tournaments.find(t => t.id === m.tournamentId)?.name || '';
    
    score += calculateRelevance(tA, q, 1.5);
    score += calculateRelevance(tB, q, 1.5);
    score += calculateRelevance(tour, q, 1);
    score += calculateRelevance(m.location, q, 1);
    score += calculateRelevance(m.sport, q, 1);
    
    return { ...m, _score: score };
  }).filter(m => m._score > 0);

  return {
    tournaments: sortByScore(tournaments),
    teams: sortByScore(teams),
    users: sortByScore(users),
    matches: sortByScore(matches)
  };
};
