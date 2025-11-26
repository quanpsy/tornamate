
import { User, Tournament, Match, Team, SportType, TournamentStatus, MatchStatus, UserRole, TournamentFormat, AppNotification, NotificationType, ActivityFeedItem, AppView, Post, PostType, ChatRoom } from '../types';

// --- Users (10) ---
export const MOCK_USERS: User[] = [
  { 
    id: '@arjun_1001', name: 'Arjun Sharma', email: 'arjun@example.com', avatar: 'https://i.pravatar.cc/150?u=arjun', 
    bio: 'Cricket all-rounder | Data Enthusiast | Bangalore', 
    location: 'Bangalore', preferredSports: [SportType.CRICKET], roles: [UserRole.HOST, UserRole.PLAYER], 
    xp: 1250, reputationScore: 92,
    coverPhoto: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    achievements: [
      { id: 'first_tournament', name: 'Rookie Host', description: 'Hosted first tournament', icon: 'Flag', tier: 'BRONZE', unlockedAt: '2023-01-01' },
      { id: 'organizer_pro', name: 'Organizer Pro', description: 'Hosted 5+ tournaments', icon: 'Crown', tier: 'GOLD', unlockedAt: '2023-06-15' }
    ],
    stats: [
      { 
        sport: SportType.CRICKET, matchesPlayed: 45, tournamentsWon: 2, wins: 28, mvpAwards: 3,
        cricket: { runs: 1240, wickets: 32, matches: 45, highestScore: 88, bestBowling: '4/12', fifties: 8, centuries: 0, catches: 15 }
      }
    ],
    socialLinks: [{ platform: 'twitter', url: '@arjun_cricket' }],
    tournamentsCreated: ['#TOUR_10001'], tournamentsJoined: ['#TOUR_10001'], tournamentsFollowed: ['#TOUR_10001', '#TOUR_10002'], teamsCreated: ['TEAM_1'], teamsJoined: ['TEAM_1'],
    followers: ['@rohan_1002', '@vikram_1003'], following: ['@rahul_1007'], postsCount: 12
  },
  { 
    id: '@rohan_1002', name: 'Rohan Das', email: 'rohan@example.com', avatar: 'https://i.pravatar.cc/150?u=rohan', 
    bio: 'Football striker aiming for the stars.', 
    location: 'Mumbai', preferredSports: [SportType.FOOTBALL], roles: [UserRole.HOST], 
    xp: 450, reputationScore: 85,
    achievements: [],
    stats: [
       { sport: SportType.FOOTBALL, matchesPlayed: 20, tournamentsWon: 1, wins: 12, mvpAwards: 5, football: { matches: 20, goals: 18, assists: 7, cleanSheets: 0, yellowCards: 2, redCards: 0 } }
    ],
    tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10002'], teamsCreated: [], teamsJoined: [],
    followers: [], following: ['@arjun_1001'], postsCount: 3
  },
  { 
    id: '@vikram_1003', name: 'Vikram Singh', email: 'vikram@example.com', avatar: 'https://i.pravatar.cc/150?u=vikram', 
    bio: 'Kabaddi Raider', location: 'Pune', preferredSports: [SportType.KABADDI], roles: [UserRole.HOST], 
    xp: 2100, reputationScore: 98,
    achievements: [{ id: 'mvp_star', name: 'MVP', description: 'Won Player of the Match', icon: 'Star', tier: 'SILVER', unlockedAt: '2023-08-20' }],
    stats: [],
    tournamentsCreated: ['#TOUR_10003'], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: ['TEAM_9'], teamsJoined: ['TEAM_9'],
    followers: [], following: [], postsCount: 1
  },
  { id: '@aditi_1004', name: 'Aditi Rao', email: 'aditi@example.com', avatar: 'https://i.pravatar.cc/150?u=aditi', bio: 'Badminton pro', location: 'Hyderabad', preferredSports: [SportType.BADMINTON], roles: [UserRole.HOST], xp: 300, reputationScore: 80, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10004'], teamsCreated: ['TEAM_11'], teamsJoined: ['TEAM_11'], followers: [], following: [], postsCount: 0 },
  { id: '@suresh_1005', name: 'Suresh Raina', email: 'suresh@example.com', avatar: 'https://i.pravatar.cc/150?u=suresh', bio: 'Left-handed bat', location: 'Chennai', preferredSports: [SportType.CRICKET], roles: [UserRole.PLAYER], xp: 800, reputationScore: 88, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: [], teamsJoined: [], followers: [], following: [], postsCount: 0 },
  { id: '@manoj_1006', name: 'Manoj Tiwary', email: 'manoj@example.com', avatar: 'https://i.pravatar.cc/150?u=manoj', bio: 'Sports enthusiast', location: 'Kolkata', preferredSports: [SportType.CRICKET, SportType.FOOTBALL], roles: [UserRole.SPECTATOR], xp: 100, reputationScore: 50, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: [], teamsJoined: [], followers: [], following: [], postsCount: 0 },
  { id: '@rahul_1007', name: 'Rahul Dravid', email: 'rahul@example.com', avatar: 'https://i.pravatar.cc/150?u=rahul', bio: 'The Wall', location: 'Bangalore', preferredSports: [SportType.CRICKET], roles: [UserRole.HOST, UserRole.SPECTATOR], xp: 5000, reputationScore: 100, achievements: [], stats: [], tournamentsCreated: ['#TOUR_10005'], tournamentsJoined: [], tournamentsFollowed: ['#TOUR_10001'], teamsCreated: ['TEAM_15'], teamsJoined: ['TEAM_15'], followers: [], following: [], postsCount: 0 },
  { id: '@priya_1008', name: 'Priya Malik', email: 'priya@example.com', avatar: 'https://i.pravatar.cc/150?u=priya', bio: 'Tennis ace', location: 'Delhi', preferredSports: [SportType.TENNIS], roles: [UserRole.PLAYER], xp: 600, reputationScore: 75, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: [], teamsJoined: [], followers: [], following: [], postsCount: 0 },
  { id: '@ankit_1009', name: 'Ankit Kumar', email: 'ankit@example.com', avatar: 'https://i.pravatar.cc/150?u=ankit', bio: 'Gully cricket legend', location: 'Mumbai', preferredSports: [SportType.CRICKET], roles: [UserRole.PLAYER], xp: 150, reputationScore: 60, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: [], teamsJoined: [], followers: [], following: [], postsCount: 0 },
  { id: '@deepa_1010', name: 'Deepa Mehta', email: 'deepa@example.com', avatar: 'https://i.pravatar.cc/150?u=deepa', bio: 'Fitness coach', location: 'Pune', preferredSports: [SportType.OTHER], roles: [UserRole.VOLUNTEER], xp: 900, reputationScore: 95, achievements: [], stats: [], tournamentsCreated: [], tournamentsJoined: [], tournamentsFollowed: [], teamsCreated: [], teamsJoined: [], followers: [], following: [], postsCount: 0 },
];

// --- Teams (20) ---
export const MOCK_TEAMS: Team[] = Array.from({ length: 20 }, (_, i) => ({
  id: `TEAM_${i + 1}`,
  name: `Team ${['Thunder', 'Warriors', 'Kings', 'Royals', 'Strikers', 'United', 'City', 'Bulls', 'Eagles', 'Titans'][i % 10]} ${Math.floor(i / 10) + 1}`,
  captainId: MOCK_USERS[i % 10].id,
  playerIds: [MOCK_USERS[i % 10].id],
  logo: `https://picsum.photos/100/100?random=${i + 100}`,
  description: 'A passionate group of players dedicated to the game.',
  createdBy: MOCK_USERS[i % 10].id,
  createdAt: new Date(Date.now() - 86400000 * (i * 10)).toISOString(),
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
  commentary: status === MatchStatus.LIVE ? [{ id: 'c1', timestamp: Date.now(), text: 'Match started!', type: 'START', icon: '📢', color: 'green' }] : [],
  lastUpdatedAt: new Date().toISOString(),
  lastUpdatedBy: 'System',
  details: getMockDetails(sport, tA) // Populate mock details
});

const getMockDetails = (sport: SportType, teamAId: string) => {
  if (sport === SportType.CRICKET) return { currentInning: 1, battingTeamId: teamAId, runs: 142, wickets: 3, overs: 18, balls: 2, recentBalls: ['1', '4', '0', 'W', '6', '1'] };
  if (sport === SportType.FOOTBALL) return { period: '2H', timeElapsed: 72, homeGoals: 2, awayGoals: 1, homeCards: {yellow:1, red:0}, awayCards: {yellow:2, red:0} };
  return {};
}

export const MOCK_MATCHES: Match[] = [
  // Live Matches
  {...createMatch('#MATCH_101', '#TOUR_10001', 'TEAM_1', 'TEAM_2', MatchStatus.LIVE, SportType.CRICKET), scoreA: '142/3 (18.2)', scoreB: 'Yet to bat'},
  {...createMatch('#MATCH_102', '#TOUR_10001', 'TEAM_3', 'TEAM_4', MatchStatus.LIVE, SportType.CRICKET), scoreA: '56/1 (6.0)', scoreB: 'Yet to bat'},
  
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
    description: 'High intensity tennis ball cricket tournament in the heart of Bangalore.',
    volunteers: [],
    teamSize: 11,
    maxTeams: 8,
    joinRequests: [],
    format: TournamentFormat.LEAGUE,
    currentStage: 'League Stage'
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
    description: '5-a-side football on turf. Rain or shine, the game goes on.',
    volunteers: [],
    teamSize: 5,
    maxTeams: 16,
    joinRequests: [],
    format: TournamentFormat.LEAGUE,
    currentStage: 'Group Stage'
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
    description: 'Community Kabaddi league for under-19 players.',
    volunteers: [],
    teamSize: 7,
    maxTeams: 8,
    joinRequests: [],
    format: TournamentFormat.KNOCKOUT,
    currentStage: 'Finals'
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
    description: 'Doubles badminton tournament. Open for all ages.',
    volunteers: [],
    teamSize: 2,
    maxTeams: 32,
    joinRequests: [],
    format: TournamentFormat.KNOCKOUT
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
    description: 'Inter-corporate cricket tournament. Weekend matches only.',
    volunteers: [],
    teamSize: 11,
    maxTeams: 16,
    joinRequests: [],
    format: TournamentFormat.LEAGUE
  }
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: '@arjun_1001',
    type: NotificationType.GENERAL,
    title: 'Welcome to TournaMate',
    message: 'Thanks for joining! Create your first tournament today.',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    icon: 'smile'
  },
  {
    id: 'notif_2',
    userId: '@arjun_1001',
    type: NotificationType.MATCH_STARTING,
    title: 'Match Starting',
    message: 'Team 1 vs Team 2 is live now!',
    actionUrl: AppView.MATCH_DETAILS,
    actionData: { id: '#MATCH_101' },
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    icon: 'clock'
  }
];

export const MOCK_ACTIVITY_FEED: ActivityFeedItem[] = [
  {
    id: 'act_1',
    type: 'TOURNAMENT_CREATED',
    title: 'Gully Cricket Championship Created',
    description: 'Arjun Sharma started a new cricket tournament in Bangalore.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    entityId: '#TOUR_10001',
    view: AppView.TOURNAMENT_DETAILS,
    sport: SportType.CRICKET
  },
  {
    id: 'act_2',
    type: 'MATCH_COMPLETED',
    title: 'Pro Kabaddi Local Final',
    description: 'Team 9 defeated Team 10 in the finals!',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    entityId: '#MATCH_105',
    view: AppView.MATCH_DETAILS,
    sport: SportType.KABADDI
  },
  {
    id: 'act_3',
    type: 'MATCH_STARTED',
    title: 'Team 1 vs Team 2 Started',
    description: 'League match in Gully Cricket Championship is now live.',
    timestamp: new Date().toISOString(),
    entityId: '#MATCH_101',
    view: AppView.MATCH_DETAILS,
    sport: SportType.CRICKET
  }
];

// --- Social Posts ---
export const MOCK_POSTS: Post[] = [
  {
    id: 'post_1', authorId: '@arjun_1001', type: PostType.STATUS, content: 'Excited to host my first major cricket tournament! Teams are looking strong. 🏏🔥',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reactions: [{ type: 'FIRE', userId: '@rohan_1002', timestamp: Date.now() }, { type: 'LIKE', userId: '@vikram_1003', timestamp: Date.now() }],
    comments: [], media: ['https://images.unsplash.com/photo-1593341646261-28d8b2489c62?auto=format&fit=crop&w=600&q=80']
  },
  {
    id: 'post_2', authorId: '@rohan_1002', type: PostType.MATCH_RESULT, content: 'What a game! Narrow victory but we take those points. #MonsoonCup',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    matchId: '#MATCH_103', tournamentId: '#TOUR_10002',
    reactions: [{ type: 'BOLT', userId: '@arjun_1001', timestamp: Date.now() }],
    comments: [{ id: 'c1', postId: 'post_2', authorId: '@vikram_1003', content: 'Great defense in the second half!', mentions: [], createdAt: new Date(Date.now() - 80000000).toISOString() }]
  },
  {
    id: 'post_3', authorId: '@vikram_1003', type: PostType.ACHIEVEMENT, content: 'Honored to win the MVP award for Pro Kabaddi Local! 🏆 Thanks to my team.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    reactions: [{ type: 'LIKE', userId: '@arjun_1001', timestamp: Date.now() }],
    comments: []
  }
];

// --- Chats ---
export const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'room_1', type: 'DIRECT', participants: ['@arjun_1001', '@rohan_1002'],
    lastMessage: { id: 'm1', roomId: 'room_1', senderId: '@rohan_1002', content: 'Hey, what time is the final?', timestamp: new Date().toISOString(), read: false }
  },
  {
    id: 'room_2', type: 'TEAM', name: 'Team Thunder', participants: ['@arjun_1001', '@vikram_1003'],
    lastMessage: { id: 'm2', roomId: 'room_2', senderId: '@arjun_1001', content: 'Practice at 6 AM tomorrow boys.', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true }
  }
];