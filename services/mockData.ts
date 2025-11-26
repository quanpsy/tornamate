
import { User, Tournament, Match, Team, SportType, TournamentStatus, MatchStatus } from '../types';

// --- Users (10) ---
export const MOCK_USERS: User[] = [
  { id: '@arjun_1001', name: 'Arjun Sharma', email: 'arjun@example.com', avatar: 'https://i.pravatar.cc/150?u=arjun', bio: 'Cricket all-rounder', location: 'Bangalore', preferredSports: [SportType.CRICKET], tournamentsCreated: ['#TOUR_10001'], tournamentsJoined: ['#TOUR_10001'], tournamentsFollowed: ['#TOUR_10001', '#TOUR_10002'] },
  { id: '@rohan_1002', name: 'Rohan Das', email: 'rohan@example.com', avatar: 'https://i.pravatar.cc/150?u=rohan', bio: 'Football striker', location: 'Mumbai', preferredSports: [SportType.FOOTBALL], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10002'] },
  { id: '@vikram_1003', name: 'Vikram Singh', email: 'vikram@example.com', avatar: 'https://i.pravatar.cc/150?u=vikram', bio: 'Kabaddi Raider', location: 'Pune', preferredSports: [SportType.KABADDI], tournamentsCreated: ['#TOUR_10003'], tournamentsJoined: [], tournamentsFollowed: [] },
  { id: '@aditi_1004', name: 'Aditi Rao', email: 'aditi@example.com', avatar: 'https://i.pravatar.cc/150?u=aditi', bio: 'Badminton pro', location: 'Hyderabad', preferredSports: [SportType.BADMINTON], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10004'] },
  { id: '@suresh_1005', name: 'Suresh Raina', email: 'suresh@example.com', avatar: 'https://i.pravatar.cc/150?u=suresh', bio: 'Left-handed bat', location: 'Chennai', preferredSports: [SportType.CRICKET], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [] },
  { id: '@manoj_1006', name: 'Manoj Tiwary', email: 'manoj@example.com', avatar: 'https://i.pravatar.cc/150?u=manoj', bio: 'Sports enthusiast', location: 'Kolkata', preferredSports: [SportType.CRICKET, SportType.FOOTBALL], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [] },
  { id: '@rahul_1007', name: 'Rahul Dravid', email: 'rahul@example.com', avatar: 'https://i.pravatar.cc/150?u=rahul', bio: 'The Wall', location: 'Bangalore', preferredSports: [SportType.CRICKET], tournamentsCreated: ['#TOUR_10005'], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10001'] },
  { id: '@priya_1008', name: 'Priya Malik', email: 'priya@example.com', avatar: 'https://i.pravatar.cc/150?u=priya', bio: 'Tennis ace', location: 'Delhi', preferredSports: [SportType.TENNIS], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [] },
  { id: '@ankit_1009', name: 'Ankit Kumar', email: 'ankit@example.com', avatar: 'https://i.pravatar.cc/150?u=ankit', bio: 'Gully cricket legend', location: 'Mumbai', preferredSports: [SportType.CRICKET], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [] },
  { id: '@deepa_1010', name: 'Deepa Mehta', email: 'deepa@example.com', avatar: 'https://i.pravatar.cc/150?u=deepa', bio: 'Fitness coach', location: 'Pune', preferredSports: [SportType.OTHER], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [] },
];

// --- Teams (20) ---
export const MOCK_TEAMS: Team[] = Array.from({ length: 20 }, (_, i) => ({
  id: `TEAM_${i + 1}`,
  name: `Team ${['Thunder', 'Warriors', 'Kings', 'Royals', 'Strikers', 'United', 'City', 'Bulls', 'Eagles', 'Titans'][i % 10]} ${Math.floor(i / 10) + 1}`,
  captainId: MOCK_USERS[i % 10].id,
  playerIds: [MOCK_USERS[i % 10].id],
  logo: `https://picsum.photos/100/100?random=${i + 100}`,
  stats: { played: Math.floor(Math.random() * 10), won: Math.floor(Math.random() * 5), lost: Math.floor(Math.random() * 5), draw: 0 }
}));

// --- Matches (15) ---
const createMatch = (id: string, tId: string, tA: string, tB: string, status: MatchStatus, sport: SportType): Match => ({
  id,
  tournamentId: tId,
  teamAId: tA,
  teamBId: tB,
  scoreA: status === MatchStatus.SCHEDULED ? '-' : Math.floor(Math.random() * 5).toString(),
  scoreB: status === MatchStatus.SCHEDULED ? '-' : Math.floor(Math.random() * 5).toString(),
  status,
  startTime: status === MatchStatus.LIVE ? new Date().toISOString() : new Date(Date.now() + 86400000).toISOString(),
  location: 'City Sports Complex',
  sport,
  commentary: status === MatchStatus.LIVE ? [{ id: 'c1', timestamp: Date.now(), text: 'Match started!', type: 'INFO' }] : []
});

export const MOCK_MATCHES: Match[] = [
  // Live Matches
  {...createMatch('#MATCH_101', '#TOUR_10001', 'TEAM_1', 'TEAM_2', MatchStatus.LIVE, SportType.CRICKET), scoreA: '142/3 (18.2)', scoreB: '140/8 (20)', commentary: [{id: 'c1', timestamp: Date.now(), text: 'What a finish!', type: 'INFO'}]},
  {...createMatch('#MATCH_102', '#TOUR_10001', 'TEAM_3', 'TEAM_4', MatchStatus.LIVE, SportType.CRICKET), scoreA: '56/1 (6.0)', scoreB: 'Yet to bat', commentary: []},
  
  // Completed Matches
  createMatch('#MATCH_103', '#TOUR_10002', 'TEAM_5', 'TEAM_6', MatchStatus.COMPLETED, SportType.FOOTBALL),
  createMatch('#MATCH_104', '#TOUR_10002', 'TEAM_7', 'TEAM_8', MatchStatus.COMPLETED, SportType.FOOTBALL),
  createMatch('#MATCH_105', '#TOUR_10003', 'TEAM_9', 'TEAM_10', MatchStatus.COMPLETED, SportType.KABADDI),
  
  // Upcoming Matches
  createMatch('#MATCH_106', '#TOUR_10001', 'TEAM_1', 'TEAM_3', MatchStatus.SCHEDULED, SportType.CRICKET),
  createMatch('#MATCH_107', '#TOUR_10001', 'TEAM_2', 'TEAM_4', MatchStatus.SCHEDULED, SportType.CRICKET),
  createMatch('#MATCH_108', '#TOUR_10002', 'TEAM_5', 'TEAM_7', MatchStatus.SCHEDULED, SportType.FOOTBALL),
  createMatch('#MATCH_109', '#TOUR_10002', 'TEAM_6', 'TEAM_8', MatchStatus.SCHEDULED, SportType.FOOTBALL),
  createMatch('#MATCH_110', '#TOUR_10004', 'TEAM_11', 'TEAM_12', MatchStatus.SCHEDULED, SportType.BADMINTON),
  createMatch('#MATCH_111', '#TOUR_10004', 'TEAM_13', 'TEAM_14', MatchStatus.SCHEDULED, SportType.BADMINTON),
  createMatch('#MATCH_112', '#TOUR_10005', 'TEAM_15', 'TEAM_16', MatchStatus.SCHEDULED, SportType.CRICKET),
  createMatch('#MATCH_113', '#TOUR_10005', 'TEAM_17', 'TEAM_18', MatchStatus.SCHEDULED, SportType.CRICKET),
  createMatch('#MATCH_114', '#TOUR_10005', 'TEAM_19', 'TEAM_20', MatchStatus.SCHEDULED, SportType.CRICKET),
  createMatch('#MATCH_115', '#TOUR_10005', 'TEAM_1', 'TEAM_5', MatchStatus.SCHEDULED, SportType.CRICKET),
];

// --- Tournaments (5) ---
export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: '#TOUR_10001',
    name: 'Gully Cricket Championship',
    organizerId: '@arjun_1001',
    sport: SportType.CRICKET,
    teams: MOCK_TEAMS.slice(0, 4),
    matches: MOCK_MATCHES.filter(m => m.tournamentId === '#TOUR_10001'),
    status: TournamentStatus.ONGOING,
    startDate: new Date().toISOString(),
    location: 'Bangalore',
    description: 'High intensity tennis ball cricket tournament in the heart of Bangalore.'
  },
  {
    id: '#TOUR_10002',
    name: 'Monsoon Football Cup',
    organizerId: '@rohan_1002',
    sport: SportType.FOOTBALL,
    teams: MOCK_TEAMS.slice(4, 8),
    matches: MOCK_MATCHES.filter(m => m.tournamentId === '#TOUR_10002'),
    status: TournamentStatus.ONGOING,
    startDate: new Date().toISOString(),
    location: 'Mumbai',
    description: '5-a-side football on turf. Rain or shine, the game goes on.'
  },
  {
    id: '#TOUR_10003',
    name: 'Pro Kabaddi Local',
    organizerId: '@vikram_1003',
    sport: SportType.KABADDI,
    teams: MOCK_TEAMS.slice(8, 10),
    matches: MOCK_MATCHES.filter(m => m.tournamentId === '#TOUR_10003'),
    status: TournamentStatus.COMPLETED,
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    location: 'Pune',
    description: 'Community Kabaddi league for under-19 players.'
  },
  {
    id: '#TOUR_10004',
    name: 'Shuttle Smash 2024',
    organizerId: '@aditi_1004',
    sport: SportType.BADMINTON,
    teams: MOCK_TEAMS.slice(10, 14),
    matches: MOCK_MATCHES.filter(m => m.tournamentId === '#TOUR_10004'),
    status: TournamentStatus.UPCOMING,
    startDate: new Date(Date.now() + 86400000).toISOString(),
    location: 'Hyderabad',
    description: 'Doubles badminton tournament. Open for all ages.'
  },
  {
    id: '#TOUR_10005',
    name: 'Corporate Cricket League',
    organizerId: '@rahul_1007',
    sport: SportType.CRICKET,
    teams: MOCK_TEAMS.slice(14, 20),
    matches: MOCK_MATCHES.filter(m => m.tournamentId === '#TOUR_10005'),
    status: TournamentStatus.UPCOMING,
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    location: 'Delhi',
    description: 'Inter-corporate cricket tournament. Weekend matches only.'
  }
];
