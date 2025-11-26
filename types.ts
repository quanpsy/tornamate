
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

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Mock password for Phase 2
  avatar: string; // URL
  bio?: string;
  location?: string;
  preferredSports: SportType[];
  tournamentsCreated: string[];
  tournamentsJoined: string[]; // As a player
  tournamentsFollowed: string[]; // As a spectator
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  playerIds: string[];
  logo?: string;
  stats?: {
    played: number;
    won: number;
    lost: number;
    draw: number;
  };
}

export interface CommentaryEvent {
  id: string;
  timestamp: number;
  text: string;
  type: 'GOAL' | 'WICKET' | 'FOUR' | 'SIX' | 'FOUL' | 'INFO';
  teamId?: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
  scoreA: string | number;
  scoreB: string | number;
  status: MatchStatus;
  startTime: string;
  location: string;
  commentary: CommentaryEvent[];
  sport: SportType;
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
}

// View Navigation State
export enum AppView {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  PROFILE_SETUP = 'PROFILE_SETUP',
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  CREATE_TOURNAMENT = 'CREATE_TOURNAMENT',
  MY_TOURNAMENTS = 'MY_TOURNAMENTS',
  TOURNAMENT_DETAILS = 'TOURNAMENT_DETAILS',
  MATCH_DETAILS = 'MATCH_DETAILS',
  PROFILE = 'PROFILE',
  NOTIFICATIONS = 'NOTIFICATIONS'
}
