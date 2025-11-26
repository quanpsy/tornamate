
export enum SportType {
  CRICKET = 'Cricket',
  FOOTBALL = 'Football',
  KABADDI = 'Kabaddi',
  BADMINTON = 'Badminton',
  TENNIS = 'Tennis',
  OTHER = 'Other'
}

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED'
}

export enum TournamentFormat {
  LEAGUE = 'LEAGUE', // Round Robin
  KNOCKOUT = 'KNOCKOUT', // Single Elimination
  GROUP_KNOCKOUT = 'GROUP_KNOCKOUT'
}

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

// --- New Role & Permission Types ---

export enum UserRole {
  HOST = 'HOST',
  PLAYER = 'PLAYER',
  VOLUNTEER = 'VOLUNTEER',
  SPECTATOR = 'SPECTATOR'
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface VolunteerPermissions {
  canUpdateScores: boolean;
  canAddCommentary: boolean;
  matchIds?: string[]; // If undefined/empty, implies all matches in tournament
}

export interface VolunteerInvitation {
  id: string;
  tournamentId: string;
  inviterId: string;
  inviteeEmail: string;
  status: InvitationStatus;
  permissions: VolunteerPermissions;
  createdAt: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  inviterId: string;
  inviteeEmail: string;
  status: InvitationStatus;
  createdAt: number;
}

export interface TournamentJoinRequest {
  id: string;
  tournamentId: string;
  teamId: string;
  requesterId: string; // The captain who requested
  status: InvitationStatus;
  createdAt: number;
}

// --- Phase 6: Stats & Achievements ---

export interface SocialLink {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'web';
  url: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
  unlockedAt: string;
}

export interface CricketStats {
  runs: number;
  wickets: number;
  matches: number;
  highestScore: number;
  bestBowling: string; // "3/24"
  fifties: number;
  centuries: number;
  catches: number;
}

export interface FootballStats {
  matches: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
}

export interface UserStats {
  sport: SportType;
  matchesPlayed: number;
  tournamentsWon: number;
  wins: number;
  mvpAwards: number;
  cricket?: CricketStats;
  football?: FootballStats;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Mock password for Phase 2
  avatar: string; // URL
  coverPhoto?: string; // URL Phase 6
  bio?: string;
  location?: string;
  preferredSports: SportType[];
  roles: UserRole[]; 
  
  // Stats & Gamification Phase 6
  xp: number;
  reputationScore: number; // 0-100
  achievements: Achievement[];
  stats: UserStats[];
  socialLinks?: SocialLink[];

  tournamentsCreated: string[];
  tournamentsJoined: string[]; // As a player
  tournamentsFollowed: string[]; // As a spectator
  teamsCreated: string[]; // New
  teamsJoined: string[]; // New
  
  // Phase 8: Social Graph
  followers: string[];
  following: string[];
  postsCount: number;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  playerIds: string[];
  logo?: string;
  description?: string; // New
  createdBy: string; // New
  createdAt: string; // New
  stats?: {
    played: number;
    won: number;
    lost: number;
    draw: number;
  };
}

// --- Enhanced Commentary & Match Details ---

export interface CommentaryEvent {
  id: string;
  timestamp: number;
  text: string;
  type: 'GOAL' | 'WICKET' | 'FOUR' | 'SIX' | 'FOUL' | 'INFO' | 'START' | 'END' | 'PAUSE' | 'POINT';
  teamId?: string;
  playerId?: string;
  icon?: string; // Emoji or Icon name
  color?: string; // Hex or tailwind class
}

// Sport Specific Details
export interface CricketDetails {
  currentInning: 1 | 2;
  battingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number; // 0-5
  recentBalls: string[]; // ['1', '4', 'W', ...]
}

export interface FootballDetails {
  period: '1H' | '2H' | 'HT' | 'FT' | 'ET';
  timeElapsed: number; // minutes
  homeGoals: number;
  awayGoals: number;
  homeCards: { yellow: number; red: number };
  awayCards: { yellow: number; red: number };
}

export interface SetBasedDetails { // Badminton, Tennis
  currentSet: number;
  homeSetsWon: number;
  awaySetsWon: number;
  currentSetScore: { home: number; away: number };
  setScores: { home: number; away: number }[]; // History of sets
}

export interface KabaddiDetails {
  period: '1H' | '2H';
  homePoints: number;
  awayPoints: number;
  raidPoints: { home: number; away: number };
  tacklePoints: { home: number; away: number };
}

export type MatchDetails = CricketDetails | FootballDetails | SetBasedDetails | KabaddiDetails | Record<string, any>;

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string | null; // Null if TBD (e.g. Winner of Match X)
  teamBId: string | null;
  scoreA: string | number; // Display score
  scoreB: string | number; // Display score
  status: MatchStatus;
  startTime: string;
  location: string;
  commentary: CommentaryEvent[];
  sport: SportType;
  lastUpdatedBy?: string; 
  lastUpdatedAt?: string;
  details?: MatchDetails; // Granular state
  
  // Phase 4: Bracket & Fixture Fields
  round?: number; // 1 = Round of 16/League, 2 = QF, etc.
  group?: string; // 'A', 'B' for group stages
  nextMatchId?: string; // The ID of the match the winner advances to
  bracketIndex?: number; // 0 (Top slot), 1 (Bottom slot) in the next match
}

export interface StandingsRow {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  draw: number;
  points: number;
  nrr?: number; // Net Run Rate (Cricket)
  gd?: number; // Goal Difference (Football)
}

export interface Tournament {
  id: string;
  name: string;
  organizerId: string;
  sport: SportType;
  teams: Team[];
  matches: Match[];
  status: TournamentStatus;
  startDate: string;
  endDate?: string;
  description?: string;
  location?: string;
  code?: string; // For private joining
  volunteers: {
    userId: string;
    permissions: VolunteerPermissions;
  }[];
  teamSize?: number; // Recommended/Max players per team
  maxTeams?: number; // Max teams in tournament
  joinRequests: TournamentJoinRequest[];
  
  // Phase 4
  format: TournamentFormat;
  currentStage?: string; // e.g., 'Group Stage', 'Semi-Finals'
}

// --- Phase 5: Notifications & Activity Feed ---

export enum NotificationType {
  INVITATION_RECEIVED = 'INVITATION_RECEIVED',
  MATCH_STARTING = 'MATCH_STARTING',
  MATCH_RESULT = 'MATCH_RESULT',
  TOURNAMENT_UPDATE = 'TOURNAMENT_UPDATE',
  GENERAL = 'GENERAL',
  SOCIAL = 'SOCIAL' // Phase 8: Likes, Comments, Follows
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: AppView;
  actionData?: any; // e.g. { id: '...' }
  read: boolean;
  createdAt: string; // ISO string
  icon?: string; // Lucide icon name or emoji
}

export interface ActivityFeedItem {
  id: string;
  type: 'TOURNAMENT_CREATED' | 'MATCH_COMPLETED' | 'TEAM_JOINED' | 'MATCH_STARTED';
  title: string;
  description: string;
  timestamp: string;
  entityId: string; // ID of tournament/match
  view?: AppView;
  imageUrl?: string;
  sport?: SportType;
}

// --- Phase 7: Search & Discovery ---

export enum SearchCategory {
  ALL = 'ALL',
  TOURNAMENTS = 'TOURNAMENTS',
  TEAMS = 'TEAMS',
  USERS = 'USERS',
  MATCHES = 'MATCHES'
}

export interface FilterState {
  sports: SportType[];
  status: (TournamentStatus | MatchStatus)[];
  location?: string;
  dateRange?: { start: string, end: string };
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: FilterState;
  createdAt: string;
}

// --- Phase 8: Social & Chat ---

export enum PostType {
  STATUS = 'STATUS',
  MATCH_RESULT = 'MATCH_RESULT',
  TOURNAMENT_UPDATE = 'TOURNAMENT_UPDATE',
  MATCH_HIGHLIGHT = 'MATCH_HIGHLIGHT',
  ACHIEVEMENT = 'ACHIEVEMENT'
}

export interface Reaction {
  type: 'LIKE' | 'FIRE' | 'BOLT';
  userId: string;
  timestamp: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  mentions: string[]; // userIds
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  content: string;
  media?: string[]; // URLs
  taggedUserIds?: string[];
  reactions: Reaction[];
  comments: Comment[];
  createdAt: string;
  
  // Relation links
  tournamentId?: string;
  matchId?: string;
  teamId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  type: 'DIRECT' | 'TEAM' | 'TOURNAMENT';
  name?: string; // For team/tourney
  participants: string[]; // userIds
  lastMessage?: ChatMessage;
  icon?: string; // URL
}

// --- Phase 9: Settings ---

export type AppTheme = 'light' | 'dark' | 'auto';
export type FontSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  notifications: {
    enabled: boolean;
    emailEnabled: boolean;
    types: {
      teamInvites: boolean;
      matchUpdates: boolean;
      tournamentUpdates: boolean;
      social: boolean;
      messages: boolean;
    };
    dndSchedule?: { start: string; end: string };
  };
  display: {
    theme: AppTheme;
    fontSize: FontSize;
    dataSaver: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showOnlineStatus: boolean;
    showStats: boolean;
  };
  preferences: {
    autoRefresh: boolean;
    mediaAutoDownload: 'always' | 'wifi' | 'never';
  };
}


// View Navigation State
export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  PROFILE_SETUP = 'PROFILE_SETUP',
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  DISCOVERY = 'DISCOVERY', // Phase 7
  CREATE_TOURNAMENT = 'CREATE_TOURNAMENT',
  CREATE_TEAM = 'CREATE_TEAM',
  MY_TOURNAMENTS = 'MY_TOURNAMENTS',
  TOURNAMENT_DETAILS = 'TOURNAMENT_DETAILS',
  TEAM_DETAILS = 'TEAM_DETAILS',
  MATCH_DETAILS = 'MATCH_DETAILS',
  MATCH_CONTROL = 'MATCH_CONTROL',
  PROFILE = 'PROFILE',
  EDIT_PROFILE = 'EDIT_PROFILE', 
  LEADERBOARD = 'LEADERBOARD', 
  NOTIFICATIONS = 'NOTIFICATIONS',
  ACTIVITY_FEED = 'ACTIVITY_FEED',
  SETTINGS = 'SETTINGS', // Phase 9 - Main Settings
  
  // Phase 8
  SOCIAL_FEED = 'SOCIAL_FEED',
  CREATE_POST = 'CREATE_POST',
  CHAT_LIST = 'CHAT_LIST',
  CHAT_ROOM = 'CHAT_ROOM'
}
