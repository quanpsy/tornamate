import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import {
  User, Tournament, Match, AppView, SportType, TournamentStatus, MatchStatus, TournamentFormat,
  Team, UserRole, VolunteerInvitation, InvitationStatus, VolunteerPermissions,
  TeamInvitation, TournamentJoinRequest, CommentaryEvent, MatchDetails,
  CricketDetails, FootballDetails, StandingsRow, AppNotification, NotificationType, ActivityFeedItem, UserStats,
  SearchCategory, FilterState, SavedSearch, Post, PostType, Comment, Reaction, ChatRoom, ChatMessage,
  AppSettings, AppTheme, FontSize
} from './types';
import { MOCK_USERS, MOCK_TOURNAMENTS, MOCK_MATCHES, MOCK_TEAMS, MOCK_NOTIFICATIONS, MOCK_ACTIVITY_FEED, MOCK_POSTS, MOCK_CHATS } from './services/mockData';
import { generateUserId, generateTournamentId, generateTeamId, formatScore, getInitialMatchDetails, getSportIcon, formatTimeAgo } from './utils';
import { generateFixtures, calculateStandings, advanceBracket } from './fixtures';
import { createInvitationNotification, createMatchStartNotification, createMatchResultNotification, createTournamentUpdateNotification } from './notifications';
import { calculateLevel, getTierColor } from './achievements';
import { performGlobalSearch, SearchResults } from './utils/search';
import { applyFilters } from './utils/filters';
import {
  Trophy, Search, PlusCircle, User as UserIcon, Home, Bell,
  ArrowLeft, MapPin, Users, Share2, Star, Calendar, RefreshCw,
  LogOut, Edit2, ChevronRight, Clock, Camera, Check, AlertCircle, Eye, EyeOff,
  UserPlus, Shield, X, Mail, Crown, Handshake, Play, Pause, Square, Mic, Send,
  Table as TableIcon, GitBranch, List, MessageSquare, Trash2, Settings, ToggleLeft, ToggleRight, Radio, Activity,
  Twitter, Linkedin, Facebook, Globe, Award, Zap, BarChart2, TrendingUp, Download, Filter, Map, Bookmark, History, XCircle,
  Heart, Flame, MessageCircle, MoreHorizontal, Image as ImageIcon, Smile, Moon, Sun, Monitor, HelpCircle, Lock, Database, Phone, FileText
} from 'lucide-react';

// --- Context Definitions ---
interface DataContextType {
  user: User | null;
  users: User[];
  tournaments: Tournament[];
  matches: Match[];
  teams: Team[];
  invitations: VolunteerInvitation[];
  teamInvitations: TeamInvitation[];
  joinRequests: TournamentJoinRequest[];
  notifications: AppNotification[];
  activityFeed: ActivityFeedItem[];
  posts: Post[];
  chats: ChatRoom[];
  unreadCount: number;
  // Settings Phase 9
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  deleteAccount: () => void;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeProfile: (data: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  createTournament: (t: Partial<Tournament>) => void;
  startTournament: (tournamentId: string) => void;
  createTeam: (t: Partial<Team>) => void;
  addCommentary: (matchId: string, text: string, type: any) => void;
  updateMatchScore: (matchId: string, details: any, commentaryEvent?: Partial<CommentaryEvent>, displayScores?: {a: string, b: string}) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  toggleFollowTournament: (id: string) => void;
  inviteVolunteer: (tournamentId: string, email: string, permissions: VolunteerPermissions) => Promise<boolean>;
  respondToInvitation: (invitationId: string, status: InvitationStatus) => void;
  invitePlayerToTeam: (teamId: string, email: string) => Promise<boolean>;
  respondToTeamInvitation: (invitationId: string, status: InvitationStatus) => void;
  requestJoinTournament: (tournamentId: string, teamId: string) => void;
  respondToJoinRequest: (requestId: string, status: InvitationStatus) => void;
  getUserTeams: () => Team[];
  addNotification: (n: AppNotification) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  getLeaderboard: (sport: SportType, metric: string) => User[];
  // Search Phase 7
  searchResults: SearchResults;
  performSearch: (query: string, filters?: FilterState) => void;
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  // Social Phase 8
  toggleFollowUser: (targetId: string) => void;
  createPost: (post: Partial<Post>) => void;
  reactToPost: (postId: string, type: 'LIKE' | 'FIRE' | 'BOLT') => void;
  addComment: (postId: string, content: string) => void;
  sendMessage: (roomId: string, content: string) => void;
  createChat: (participantIds: string[]) => string; // returns roomId
}

const AppContext = createContext<DataContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Default Settings ---
const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    emailEnabled: true,
    types: { teamInvites: true, matchUpdates: true, tournamentUpdates: true, social: true, messages: true }
  },
  display: { theme: 'light', fontSize: 'medium', dataSaver: false },
  privacy: { profileVisibility: 'public', showOnlineStatus: true, showStats: true },
  preferences: { autoRefresh: true, mediaAutoDownload: 'wifi' }
};

// --- Reusable Components ---

const ActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false, type = 'button', icon }) => {
  const baseStyles = "py-3.5 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide";
  
  const variants = {
    primary: "bg-brand-primary text-brand-black shadow-[0_4px_0_rgb(0,0,0)] active:shadow-none active:translate-y-1 border-2 border-brand-black hover:bg-yellow-400 disabled:bg-yellow-200 disabled:border-gray-400 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-0 dark:shadow-[0_4px_0_rgba(255,255,255,0.2)] dark:border-white",
    secondary: "bg-transparent text-brand-black border-2 border-brand-black hover:bg-gray-50 disabled:opacity-50 dark:text-white dark:border-white dark:hover:bg-white/10",
    ghost: "bg-transparent text-brand-gray hover:text-brand-black hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10",
    danger: "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    success: "bg-green-500 text-white shadow-[0_4px_0_rgb(21,128,61)] active:shadow-none active:translate-y-1 border-2 border-green-700 hover:bg-green-600 dark:border-green-400"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

const StatusBadge: React.FC<{ status: string | TournamentStatus | MatchStatus }> = ({ status }) => {
  const s = status.toString().toUpperCase();
  
  if (s === 'LIVE' || s === 'ONGOING') {
    return (
      <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 border-2 border-brand-primary px-2 py-1 rounded-md shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
        <span className="text-[10px] font-black text-brand-black dark:text-white tracking-wider">LIVE</span>
      </div>
    );
  }
  
  if (s === 'COMPLETED') {
    return <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border border-green-200 dark:border-green-800">COMPLETED</span>;
  }

  if (s === 'PAUSED') {
    return <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border border-orange-200 dark:border-orange-800">PAUSED</span>;
  }
  
  return <span className="bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border border-gray-200 dark:border-neutral-700">UPCOMING</span>;
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; bordered?: boolean }> = ({ children, className = '', onClick, bordered = false }) => (
  <div 
    onClick={onClick} 
    className={`bg-white dark:bg-[#1E1E1E] dark:text-white p-4 rounded-xl shadow-sm transition-all relative overflow-hidden ${bordered ? 'border-2 border-brand-primary' : 'border-2 border-transparent'} ${onClick ? 'cursor-pointer active:scale-[0.99] hover:border-brand-primary/50' : ''} ${className}`}
  >
    {children}
  </div>
);

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pb-24 min-h-screen bg-[#F5F5F5] dark:bg-[#121212] transition-colors duration-300 ${className}`}>
    {children}
  </div>
);

const TopAppBar: React.FC<{ 
  title: string; 
  showBack?: boolean; 
  onBack?: () => void; 
  rightAction?: React.ReactNode;
  transparent?: boolean;
}> = ({ title, showBack, onBack, rightAction, transparent = false }) => (
  <div className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between h-16 transition-all ${transparent ? 'bg-transparent' : 'bg-brand-primary border-b-2 border-brand-dark dark:border-neutral-800 dark:bg-[#1E1E1E]'}`}>
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className={`p-2 rounded-full hover:bg-white/20 transition-colors ${transparent ? 'text-white bg-black/20' : 'text-brand-black dark:text-white'}`}>
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      )}
      <h1 className={`font-black text-xl tracking-tight uppercase italic line-clamp-1 ${transparent ? 'text-white drop-shadow-md' : 'text-brand-black dark:text-white'}`}>{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {rightAction}
    </div>
  </div>
);

const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${
      active ? 'bg-brand-black text-brand-primary border-brand-black dark:border-white dark:bg-white dark:text-black' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-[#1E1E1E] dark:text-gray-300 dark:border-neutral-700'
    }`}
  >
    {label}
  </button>
);

const SearchBar: React.FC<{ 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  onFocus?: () => void;
  onClear?: () => void;
}> = ({ value, onChange, placeholder = "Search...", onFocus, onClear }) => (
  <div className="relative">
    <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      placeholder={placeholder}
      className="w-full pl-10 pr-10 py-3 bg-white dark:bg-[#1E1E1E] dark:text-white border-2 border-gray-200 dark:border-neutral-700 rounded-xl text-sm font-medium focus:border-brand-primary focus:outline-none transition-colors"
    />
    {value && (
      <button onClick={onClear} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
        <XCircle size={18} />
      </button>
    )}
  </div>
);

const Avatar: React.FC<{ src: string, alt: string, size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ src, alt, size = 'md' }) => {
   const sizeClass = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-16 h-16', xl: 'w-24 h-24' }[size];
   return (
      <img src={src} alt={alt} className={`${sizeClass} rounded-full object-cover border border-gray-200 dark:border-neutral-700`} />
   );
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange} 
    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-neutral-600'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
  </button>
);

const SettingsItem: React.FC<{ icon: React.ReactNode; label: string; value?: string; onClick?: () => void; rightElement?: React.ReactNode; danger?: boolean }> = ({ icon, label, value, onClick, rightElement, danger }) => (
  <div onClick={onClick} className={`p-4 flex items-center justify-between bg-white dark:bg-[#1E1E1E] ${onClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-neutral-800' : ''}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${danger ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'bg-gray-50 text-gray-600 dark:bg-neutral-800 dark:text-gray-300'}`}>
        {icon}
      </div>
      <div>
        <h4 className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-brand-black dark:text-white'}`}>{label}</h4>
        {value && <p className="text-xs text-gray-400">{value}</p>}
      </div>
    </div>
    {rightElement || (onClick && <ChevronRight size={18} className="text-gray-300" />)}
  </div>
);

// --- Phase 6 Components ---
const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-2xl font-black text-brand-black dark:text-white">{value}</div>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
  </div>
);

const AchievementBadge: React.FC<{ name: string, description: string, icon: string, tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND', unlockedAt: string }> = ({ name, description, icon, tier, unlockedAt }) => {
  const IconCmp = ({ name }: { name: string }) => {
    switch (name) {
      case 'Flag': return <Trophy size={20} />;
      case 'Trophy': return <Trophy size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Star': return <Star size={20} />;
      case 'Handshake': return <Handshake size={20} />;
      case 'Crown': return <Crown size={20} />;
      default: return <Award size={20} />;
    }
  };

  return (
    <div className={`relative p-4 rounded-xl border-2 flex flex-col items-center text-center gap-2 ${getTierColor(tier)}`}>
      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
        <IconCmp name={icon} />
      </div>
      <div>
        <h4 className="font-bold text-xs uppercase tracking-tight">{name}</h4>
        <p className="text-[10px] opacity-80 leading-tight mt-1">{description}</p>
      </div>
      <div className="text-[9px] font-mono mt-2 opacity-60 uppercase">{new Date(unlockedAt).toLocaleDateString()}</div>
    </div>
  );
};

const StatsChart: React.FC<{ data: number[] }> = ({ data }) => {
  if (data.length < 2) return <div className="h-24 flex items-center justify-center text-gray-400 text-xs">Not enough data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 80 - 10; // 10% padding
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="h-24 w-full relative">
       <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
         <polyline fill="none" stroke="#FDD835" strokeWidth="4" points={points} vectorEffect="non-scaling-stroke" />
         {data.map((val, idx) => {
           const x = (idx / (data.length - 1)) * 100;
           const y = 100 - ((val - min) / range) * 80 - 10;
           return <circle key={idx} cx={x} cy={y} r="3" className="fill-brand-black dark:fill-white" vectorEffect="non-scaling-stroke"/>
         })}
       </svg>
    </div>
  );
};

// --- Phase 8 Social Components ---

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
   const { users, user, reactToPost, matches, teams } = useAppContext();
   const author = users.find(u => u.id === post.authorId);
   const [showComments, setShowComments] = useState(false);
   
   const match = post.matchId ? matches.find(m => m.id === post.matchId) : null;
   const teamA = match ? teams.find(t => t.id === match.teamAId) : null;
   const teamB = match ? teams.find(t => t.id === match.teamBId) : null;
   
   const hasLiked = post.reactions.some(r => r.userId === user?.id && r.type === 'LIKE');

   return (
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border-2 border-gray-100 dark:border-neutral-800 mb-4 overflow-hidden">
         <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Avatar src={author?.avatar || ''} alt={author?.name || ''} size="sm" />
               <div>
                  <h4 className="text-sm font-bold text-brand-black dark:text-white">{author?.name}</h4>
                  <p className="text-[10px] text-gray-400">{formatTimeAgo(post.createdAt)} • {post.type.replace('_', ' ')}</p>
               </div>
            </div>
            <button className="text-gray-400"><MoreHorizontal size={18}/></button>
         </div>
         
         {post.content && <div className="px-3 pb-2 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</div>}
         
         {post.media && post.media.length > 0 && (
            <div className="w-full h-64 bg-gray-100 dark:bg-neutral-800">
               <img src={post.media[0]} className="w-full h-full object-cover" />
            </div>
         )}

         {/* Match Highlight Embed */}
         {match && (
            <div className="mx-3 mb-3">
               <ScoreBoard match={match} teamA={teamA} teamB={teamB} dark={false} />
            </div>
         )}
         
         <div className="px-3 py-2 border-t border-gray-50 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => reactToPost(post.id, 'LIKE')} className={`flex items-center gap-1 text-xs font-bold ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  <Heart size={18} fill={hasLiked ? 'currentColor' : 'none'} /> {post.reactions.length || ''}
               </button>
               <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <MessageCircle size={18} /> {post.comments.length || ''}
               </button>
               <button className="flex items-center gap-1 text-xs font-bold text-gray-500">
                  <Share2 size={18} />
               </button>
            </div>
         </div>

         {showComments && (
            <div className="bg-gray-50 dark:bg-neutral-900 p-3 space-y-3">
               {post.comments.map(c => {
                  const cAuthor = users.find(u => u.id === c.authorId);
                  return (
                     <div key={c.id} className="flex gap-2 items-start">
                        <Avatar src={cAuthor?.avatar || ''} alt={cAuthor?.name || ''} size="sm" />
                        <div className="bg-white dark:bg-[#1E1E1E] p-2 rounded-r-xl rounded-bl-xl shadow-sm text-xs dark:text-gray-200">
                           <span className="font-bold block dark:text-white">{cAuthor?.name}</span>
                           {c.content}
                        </div>
                     </div>
                  );
               })}
               <div className="flex gap-2 mt-2">
                   <input className="flex-1 text-xs p-2 rounded-full border border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white" placeholder="Write a comment..." />
                   <button className="text-brand-primary"><Send size={18}/></button>
               </div>
            </div>
         )}
      </div>
   );
};

// --- Settings View ---
const SettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { settings, updateSettings, deleteAccount, user, logout } = useAppContext();
  const [view, setView] = useState<'MAIN' | 'ACCOUNT' | 'NOTIFICATIONS' | 'DISPLAY' | 'PRIVACY' | 'DATA'>('MAIN');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-4 py-2 bg-gray-50 dark:bg-[#121212] border-b border-gray-100 dark:border-neutral-800">
      <h3 className="text-xs font-black uppercase text-gray-400">{label}</h3>
    </div>
  );

  const renderMain = () => (
    <div className="divide-y divide-gray-100 dark:divide-neutral-800">
      <SectionHeader label="Account" />
      <SettingsItem icon={<UserIcon size={20} />} label="Account Settings" onClick={() => setView('ACCOUNT')} />
      <SettingsItem icon={<Shield size={20} />} label="Privacy" onClick={() => setView('PRIVACY')} />

      <SectionHeader label="App" />
      <SettingsItem icon={<Bell size={20} />} label="Notifications" onClick={() => setView('NOTIFICATIONS')} />
      <SettingsItem icon={<Monitor size={20} />} label="Display & Theme" value={settings.display.theme} onClick={() => setView('DISPLAY')} />
      <SettingsItem icon={<Database size={20} />} label="Data & Storage" onClick={() => setView('DATA')} />

      <SectionHeader label="Support" />
      <SettingsItem icon={<HelpCircle size={20} />} label="Help & Support" onClick={() => alert("Help Center Coming Soon")} />
      <SettingsItem icon={<FileText size={20} />} label="Terms & Policy" onClick={() => alert("Terms Coming Soon")} />

      <div className="p-4 mt-4">
         <ActionButton variant="secondary" fullWidth onClick={logout} icon={<LogOut size={18} />}>Log Out</ActionButton>
         <div className="mt-4 text-center">
            <button onClick={() => setShowDeleteModal(true)} className="text-xs font-bold text-red-500">Delete Account</button>
         </div>
         <p className="text-center text-[10px] text-gray-400 mt-4">Version 1.0.0</p>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="divide-y divide-gray-100 dark:divide-neutral-800">
      <SettingsItem 
        icon={<Bell size={20} />} 
        label="Push Notifications" 
        rightElement={<ToggleSwitch checked={settings.notifications.enabled} onChange={() => updateSettings({ notifications: { ...settings.notifications, enabled: !settings.notifications.enabled } })} />} 
      />
      <SettingsItem 
        icon={<Mail size={20} />} 
        label="Email Notifications" 
        rightElement={<ToggleSwitch checked={settings.notifications.emailEnabled} onChange={() => updateSettings({ notifications: { ...settings.notifications, emailEnabled: !settings.notifications.emailEnabled } })} />} 
      />
      
      <SectionHeader label="Types" />
      <SettingsItem 
        icon={<Users size={20} />} 
        label="Team Invites" 
        rightElement={<ToggleSwitch checked={settings.notifications.types.teamInvites} onChange={() => updateSettings({ notifications: { ...settings.notifications, types: { ...settings.notifications.types, teamInvites: !settings.notifications.types.teamInvites } } })} />} 
      />
      <SettingsItem 
        icon={<Trophy size={20} />} 
        label="Match Updates" 
        rightElement={<ToggleSwitch checked={settings.notifications.types.matchUpdates} onChange={() => updateSettings({ notifications: { ...settings.notifications, types: { ...settings.notifications.types, matchUpdates: !settings.notifications.types.matchUpdates } } })} />} 
      />
      <SettingsItem 
        icon={<MessageCircle size={20} />} 
        label="Messages" 
        rightElement={<ToggleSwitch checked={settings.notifications.types.messages} onChange={() => updateSettings({ notifications: { ...settings.notifications, types: { ...settings.notifications.types, messages: !settings.notifications.types.messages } } })} />} 
      />
    </div>
  );

  const renderDisplay = () => (
    <div className="divide-y divide-gray-100 dark:divide-neutral-800">
       <SectionHeader label="Theme" />
       <div className="p-4 flex gap-3">
          {['light', 'dark', 'auto'].map((t) => (
             <button 
                key={t}
                onClick={() => updateSettings({ display: { ...settings.display, theme: t as AppTheme } })}
                className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 ${settings.display.theme === t ? 'border-brand-primary bg-brand-primary/10 text-brand-black dark:text-white' : 'border-gray-200 dark:border-neutral-700 text-gray-500'}`}
             >
                {t === 'light' ? <Sun size={24}/> : t === 'dark' ? <Moon size={24}/> : <Monitor size={24}/>}
                <span className="text-xs font-bold uppercase">{t}</span>
             </button>
          ))}
       </div>

       <SectionHeader label="Font Size" />
       <div className="p-4">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs">A</span>
             <span className="text-xl font-bold">A</span>
          </div>
          <input 
             type="range" min="0" max="2" step="1" 
             value={settings.display.fontSize === 'small' ? 0 : settings.display.fontSize === 'medium' ? 1 : 2}
             onChange={(e) => {
                const val = parseInt(e.target.value);
                const size = val === 0 ? 'small' : val === 1 ? 'medium' : 'large';
                updateSettings({ display: { ...settings.display, fontSize: size } });
             }}
             className="w-full accent-brand-primary"
          />
          <div className="flex justify-between mt-1 text-[10px] text-gray-400 uppercase font-bold">
             <span>Small</span>
             <span>Medium</span>
             <span>Large</span>
          </div>
       </div>

       <SectionHeader label="Performance" />
       <SettingsItem 
          icon={<Zap size={20} />} 
          label="Data Saver" 
          value="Reduce image quality"
          rightElement={<ToggleSwitch checked={settings.display.dataSaver} onChange={() => updateSettings({ display: { ...settings.display, dataSaver: !settings.display.dataSaver } })} />} 
       />
    </div>
  );

  const renderPrivacy = () => (
     <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        <SettingsItem 
           icon={<Eye size={20} />} 
           label="Profile Visibility"
           value={settings.privacy.profileVisibility.toUpperCase()} 
           onClick={() => {
              const next = settings.privacy.profileVisibility === 'public' ? 'friends' : settings.privacy.profileVisibility === 'friends' ? 'private' : 'public';
              updateSettings({ privacy: { ...settings.privacy, profileVisibility: next } });
           }}
        />
        <SettingsItem 
           icon={<Activity size={20} />} 
           label="Show Online Status" 
           rightElement={<ToggleSwitch checked={settings.privacy.showOnlineStatus} onChange={() => updateSettings({ privacy: { ...settings.privacy, showOnlineStatus: !settings.privacy.showOnlineStatus } })} />} 
        />
        <SettingsItem 
           icon={<BarChart2 size={20} />} 
           label="Show Stats Publicly" 
           rightElement={<ToggleSwitch checked={settings.privacy.showStats} onChange={() => updateSettings({ privacy: { ...settings.privacy, showStats: !settings.privacy.showStats } })} />} 
        />
     </div>
  );

  const renderData = () => (
     <div className="divide-y divide-gray-100 dark:divide-neutral-800">
        <SettingsItem icon={<Trash2 size={20} />} label="Clear Cache" value="24 MB" onClick={() => alert("Cache Cleared")} />
        <SettingsItem icon={<Download size={20} />} label="Export My Data" onClick={() => {
           const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
           const downloadAnchorNode = document.createElement('a');
           downloadAnchorNode.setAttribute("href",     dataStr);
           downloadAnchorNode.setAttribute("download", "tournamate_data.json");
           document.body.appendChild(downloadAnchorNode); // required for firefox
           downloadAnchorNode.click();
           downloadAnchorNode.remove();
        }} />
     </div>
  );

  return (
    <PageContainer>
      <TopAppBar 
         title={view === 'MAIN' ? 'Settings' : view.charAt(0) + view.slice(1).toLowerCase().replace('_', ' ')} 
         showBack 
         onBack={() => view === 'MAIN' ? onBack() : setView('MAIN')} 
      />
      
      <div className="pb-10">
         {view === 'MAIN' && renderMain()}
         {view === 'ACCOUNT' && <div className="p-4 text-center text-gray-400">Account Details form same as Edit Profile</div>}
         {view === 'NOTIFICATIONS' && renderNotifications()}
         {view === 'DISPLAY' && renderDisplay()}
         {view === 'PRIVACY' && renderPrivacy()}
         {view === 'DATA' && renderData()}
      </div>

      {showDeleteModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-sm rounded-xl p-6 shadow-xl">
               <h3 className="text-lg font-black text-red-600 mb-2">Delete Account?</h3>
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">This action cannot be undone. All your data, stats, and teams will be permanently removed.</p>
               <div className="flex gap-3">
                  <ActionButton variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>CANCEL</ActionButton>
                  <ActionButton variant="danger" fullWidth onClick={() => { deleteAccount(); setShowDeleteModal(false); }}>DELETE</ActionButton>
               </div>
            </div>
         </div>
      )}
    </PageContainer>
  );
};

// --- Updated ScoreBoard to support Dark Mode ---
const ScoreBoard: React.FC<{ match: Match, teamA?: Team, teamB?: Team, dark?: boolean }> = ({ match, teamA, teamB, dark = false }) => {
  // Logic updated to handle dark mode context if needed, but props control local override
  // For global dark mode, we check logic inside classNames
  
  const { a: scoreA, b: scoreB } = formatScore(match);

  return (
    <div className={`bg-white dark:bg-[#1E1E1E] py-6 px-6 rounded-b-[30px] relative shadow-xl z-20 transition-colors border-b-2 border-brand-primary`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-center w-1/3">
          <div className={`w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full mb-2 flex items-center justify-center border-2 border-brand-primary`}>
            {teamA?.logo ? <img src={teamA.logo} className="w-full h-full rounded-full object-cover" /> : <span className="text-xl font-black text-brand-primary">{teamA?.name?.[0]}</span>}
          </div>
          <h3 className={`font-bold text-xs text-center leading-tight text-brand-black dark:text-white line-clamp-1`}>{teamA?.name || 'TBD'}</h3>
        </div>
        
        <div className="w-1/3 flex flex-col items-center">
          <StatusBadge status={match.status} />
          <div className="flex items-end gap-1 mt-3">
             <div className="text-3xl font-black text-brand-primary tracking-tighter leading-none">{scoreA}</div>
          </div>
          <div className={`text-[10px] text-gray-500 dark:text-gray-400 font-bold my-1 uppercase`}>VS</div>
          <div className="text-3xl font-black text-brand-primary tracking-tighter leading-none">{scoreB}</div>
        </div>

        <div className="flex flex-col items-center w-1/3">
          <div className={`w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full mb-2 flex items-center justify-center border-2 border-gray-200 dark:border-neutral-700`}>
            {teamB?.logo ? <img src={teamB.logo} className="w-full h-full rounded-full object-cover" /> : <span className={`text-xl font-black text-gray-400`}>{teamB?.name?.[0]}</span>}
          </div>
          <h3 className={`font-bold text-xs text-center leading-tight text-brand-black dark:text-white line-clamp-1`}>{teamB?.name || 'TBD'}</h3>
        </div>
      </div>
    </div>
  );
};


// --- View Components ---

const SocialFeedView: React.FC<{ setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ setDetailId, setView }) => {
   const { posts, user } = useAppContext();
   const sortedPosts = [...posts].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

   return (
      <PageContainer>
         <TopAppBar title="Feed" rightAction={
             <div className="flex gap-2">
                 <button onClick={() => setView(AppView.CREATE_POST)} className="p-2 text-brand-black dark:text-white"><PlusCircle size={24} /></button>
                 <button onClick={() => setView(AppView.CHAT_LIST)} className="p-2 text-brand-black dark:text-white"><MessageCircle size={24} /></button>
             </div>
         } />
         <div className="p-4">
            {sortedPosts.map(post => (
               <PostCard key={post.id} post={post} />
            ))}
            {sortedPosts.length === 0 && (
               <div className="text-center py-20 text-gray-400">
                  <p>No posts yet. Follow people or create a post!</p>
               </div>
            )}
         </div>
      </PageContainer>
   );
};

const CreatePostView: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => {
   const { createPost, user } = useAppContext();
   const [content, setContent] = useState('');
   
   const handlePost = () => {
      if(!content.trim()) return;
      createPost({ content, type: PostType.STATUS, authorId: user?.id });
      setView(AppView.SOCIAL_FEED);
   };

   return (
      <PageContainer>
         <TopAppBar title="New Post" showBack onBack={() => setView(AppView.SOCIAL_FEED)} />
         <div className="p-4">
            <div className="flex gap-3 mb-4">
               <Avatar src={user?.avatar || ''} alt={user?.name || ''} />
               <div className="flex-1">
                   <h4 className="font-bold text-sm text-brand-black dark:text-white">{user?.name}</h4>
                   <span className="text-xs text-brand-primary font-bold border border-brand-primary px-1 rounded">Public</span>
               </div>
            </div>
            <textarea 
               value={content}
               onChange={e => setContent(e.target.value)}
               placeholder="What's happening on the field?"
               className="w-full h-40 p-4 text-lg outline-none resize-none placeholder:text-gray-300 bg-transparent dark:text-white"
            />
            <div className="flex gap-4 border-t border-gray-100 dark:border-neutral-800 pt-4 mb-6">
                <button className="text-brand-primary flex items-center gap-2 text-sm font-bold"><ImageIcon size={20}/> Photo</button>
                <button className="text-brand-primary flex items-center gap-2 text-sm font-bold"><Trophy size={20}/> Achievement</button>
            </div>
            <ActionButton onClick={handlePost} fullWidth disabled={!content.trim()}>POST</ActionButton>
         </div>
      </PageContainer>
   );
};

const ChatListView: React.FC<{ setView: (v: AppView) => void, setDetailId: (id: string) => void }> = ({ setView, setDetailId }) => {
    const { chats, user, users } = useAppContext();
    const myChats = chats.filter(c => c.participants.includes(user?.id || ''));

    const getChatName = (c: ChatRoom) => {
        if (c.type === 'DIRECT') {
            const otherId = c.participants.find(p => p !== user?.id);
            const otherUser = users.find(u => u.id === otherId);
            return otherUser?.name || 'Unknown User';
        }
        return c.name;
    };

    return (
        <PageContainer>
            <TopAppBar title="Messages" showBack onBack={() => setView(AppView.SOCIAL_FEED)} />
            <div className="p-4">
                {myChats.map(chat => (
                    <div key={chat.id} onClick={() => { setDetailId(chat.id); setView(AppView.CHAT_ROOM); }} className="flex items-center gap-3 p-3 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 mb-2">
                         <div className="w-12 h-12 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center font-bold text-gray-500">
                             {getChatName(chat)?.[0]}
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between">
                                 <h4 className="font-bold text-brand-black dark:text-white">{getChatName(chat)}</h4>
                                 <span className="text-[10px] text-gray-400">{chat.lastMessage ? formatTimeAgo(chat.lastMessage.timestamp) : ''}</span>
                             </div>
                             <p className="text-xs text-gray-500 truncate">{chat.lastMessage?.content || 'Start a conversation'}</p>
                         </div>
                    </div>
                ))}
            </div>
        </PageContainer>
    );
};

const ChatRoomView: React.FC<{ chatId: string, onBack: () => void }> = ({ chatId, onBack }) => {
    const { chats, user, sendMessage } = useAppContext();
    const chat = chats.find(c => c.id === chatId);
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>(chat?.lastMessage ? [chat.lastMessage] : []);

    const handleSend = () => {
        if(!msg.trim()) return;
        sendMessage(chatId, msg);
        setMessages([...messages, {
            id: `new_${Date.now()}`, roomId: chatId, senderId: user?.id || '', content: msg, timestamp: new Date().toISOString(), read: false
        }]);
        setMsg('');
    };

    if(!chat) return <div>Chat not found</div>;

    return (
        <div className="flex flex-col h-screen bg-[#F5F5F5] dark:bg-[#121212]">
             <TopAppBar title={chat.type === 'DIRECT' ? 'Chat' : chat.name || 'Chat'} showBack onBack={onBack} />
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {messages.map(m => {
                     const isMe = m.senderId === user?.id;
                     return (
                         <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[75%] p-3 rounded-xl text-sm ${isMe ? 'bg-brand-primary text-brand-black rounded-tr-none' : 'bg-white dark:bg-[#1E1E1E] dark:text-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                                 {m.content}
                             </div>
                         </div>
                     );
                 })}
             </div>
             <div className="p-3 bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-neutral-800 flex gap-2">
                 <input value={msg} onChange={e => setMsg(e.target.value)} className="flex-1 bg-gray-100 dark:bg-neutral-800 dark:text-white rounded-full px-4 py-2 text-sm outline-none" placeholder="Type a message..." />
                 <button onClick={handleSend} className="p-2 bg-brand-black text-brand-primary rounded-full"><Send size={18}/></button>
             </div>
        </div>
    );
};

const DiscoveryView: React.FC<{ setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ setDetailId, setView }) => {
  const { tournaments, matches, user } = useAppContext();
  
  const trendingTournaments = tournaments.slice(0, 3);
  const liveMatches = matches.filter(m => m.status === MatchStatus.LIVE);
  const recommended = tournaments.filter(t => user?.preferredSports.includes(t.sport)).slice(0, 3);
  const nearMe = tournaments.filter(t => user?.location && t.location?.includes(user.location)).slice(0, 3);

  const Section = ({ title, icon, children }: any) => (
    <section className="mb-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="font-black text-sm uppercase flex items-center gap-2 text-brand-black dark:text-white">{icon} {title}</h3>
        <button className="text-[10px] font-bold text-brand-primary bg-brand-black dark:bg-white dark:text-brand-black px-2 py-1 rounded">VIEW ALL</button>
      </div>
      <div className="flex overflow-x-auto gap-4 px-4 pb-2 no-scrollbar">
        {children}
      </div>
    </section>
  );

  const CompactCard = ({ title, subtitle, badge, onClick, image }: any) => (
    <div onClick={onClick} className="min-w-[200px] w-[200px] bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-800 active:scale-95 transition-transform">
      <div className="h-24 bg-gray-200 dark:bg-neutral-800 relative">
        {image && <img src={image} className="w-full h-full object-cover" />}
        {badge && <div className="absolute top-2 right-2">{badge}</div>}
      </div>
      <div className="p-3">
        <h4 className="font-bold text-sm truncate text-brand-black dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <PageContainer>
      <TopAppBar title="Discovery" rightAction={<button onClick={() => setView(AppView.SEARCH)} className="text-brand-black dark:text-white"><Search size={22} /></button>} />
      
      {liveMatches.length > 0 && (
        <Section title="Live Now" icon={<Radio className="text-red-500 animate-pulse" size={16} />}>
          {liveMatches.map(m => (
            <div key={m.id} onClick={() => { setDetailId(m.id); setView(AppView.MATCH_DETAILS); }} className="min-w-[260px] bg-brand-dark p-4 rounded-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-ping"/></div>
               <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-400">{m.sport}</span>
                  <span className="text-xs font-mono text-brand-primary">{m.scoreA} - {m.scoreB}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span>Team A</span>
                  <span className="text-xs text-gray-500">VS</span>
                  <span>Team B</span>
               </div>
            </div>
          ))}
        </Section>
      )}

      <Section title="Trending" icon={<TrendingUp size={16} />}>
        {trendingTournaments.map(t => (
          <CompactCard 
            key={t.id}
            title={t.name}
            subtitle={`${t.teams.length} Teams • ${t.location}`}
            image={`https://source.unsplash.com/random/400x200?${t.sport}`}
            onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
          />
        ))}
      </Section>

      <Section title="Recommended For You" icon={<Star size={16} className="text-yellow-500"/>}>
        {recommended.length > 0 ? recommended.map(t => (
           <CompactCard 
            key={t.id}
            title={t.name}
            subtitle={t.sport}
            onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
          />
        )) : <div className="text-xs text-gray-400 px-4">No recommendations yet. Update your interests!</div>}
      </Section>

    </PageContainer>
  );
};

const EnhancedSearchView: React.FC<{ setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ setDetailId, setView }) => {
  const { performSearch, searchResults, searchHistory, addToSearchHistory, clearSearchHistory, user } = useAppContext();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchCategory>(SearchCategory.ALL);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ sports: [], status: [] });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query, filters);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, filters, performSearch]);

  const hasResults = query && (searchResults.tournaments.length > 0 || searchResults.teams.length > 0 || searchResults.users.length > 0 || searchResults.matches.length > 0);

  const ResultSection = ({ title, data, renderItem }: any) => (
     data.length > 0 ? (
      <div className="mb-6">
        <h3 className="font-bold text-xs uppercase text-gray-400 mb-2 px-4">{title} ({data.length})</h3>
        <div className="space-y-2 px-4">
          {data.map(renderItem)}
        </div>
      </div>
    ) : null
  );

  return (
    <PageContainer>
      <div className="sticky top-0 z-30 bg-[#F5F5F5] dark:bg-[#121212] pt-2 pb-2 transition-colors">
         <div className="flex items-center gap-2 px-4 mb-2">
            <button onClick={() => setView(AppView.DISCOVERY)} className="p-2 -ml-2 rounded-full text-brand-black dark:text-white"><ArrowLeft size={20}/></button>
            <div className="flex-1">
               <SearchBar value={query} onChange={setQuery} placeholder="Search..." onClear={() => setQuery('')} />
            </div>
            <button onClick={() => setShowFilterSheet(true)} className={`p-3 rounded-xl border-2 transition-colors ${filters.sports.length > 0 || filters.status.length > 0 ? 'bg-brand-black text-brand-primary border-brand-black' : 'bg-white dark:bg-[#1E1E1E] dark:text-white dark:border-neutral-700 border-gray-200'}`}>
               <Filter size={18} />
            </button>
         </div>
         
         {query && (
            <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar pb-2">
               {Object.values(SearchCategory).map(cat => (
                  <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 ${activeTab === cat ? 'bg-brand-primary border-brand-black text-brand-black' : 'bg-white dark:bg-[#1E1E1E] dark:text-gray-400 dark:border-neutral-800 border-transparent text-gray-500'}`}>
                     {cat}
                  </button>
               ))}
            </div>
         )}
      </div>

      {!query && (
         <div className="p-4">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-sm text-gray-400 uppercase flex items-center gap-2"><History size={14}/> Recent Searches</h3>
               {searchHistory.length > 0 && <button onClick={clearSearchHistory} className="text-[10px] text-red-500 font-bold">CLEAR</button>}
            </div>
            <div className="flex flex-wrap gap-2">
               {searchHistory.map((s, i) => (
                  <button key={i} onClick={() => setQuery(s)} className="px-3 py-1.5 bg-white dark:bg-[#1E1E1E] dark:text-gray-300 border border-gray-200 dark:border-neutral-800 rounded-lg text-sm text-gray-600 hover:border-brand-primary">
                     {s}
                  </button>
               ))}
               {searchHistory.length === 0 && <span className="text-xs text-gray-400 italic">No recent searches</span>}
            </div>
         </div>
      )}

      {query && !hasResults && (
         <div className="p-10 text-center text-gray-400">
            <Search size={48} className="mx-auto mb-4 opacity-20"/>
            <p>No results found for "{query}"</p>
         </div>
      )}

      {query && (
         <div className="pt-2">
            {(activeTab === 'ALL' || activeTab === 'TOURNAMENTS') && (
               <ResultSection 
                  title="Tournaments" 
                  data={searchResults.tournaments} 
                  renderItem={(t: Tournament) => (
                     <Card key={t.id} onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }} className="flex justify-between items-center">
                        <div>
                           <h4 className="font-bold text-sm text-brand-black dark:text-white">{t.name}</h4>
                           <p className="text-xs text-gray-500">{t.sport} • {t.location}</p>
                        </div>
                        <StatusBadge status={t.status} />
                     </Card>
                  )} 
               />
            )}
            {(activeTab === 'ALL' || activeTab === 'TEAMS') && (
               <ResultSection 
                  title="Teams" 
                  data={searchResults.teams} 
                  renderItem={(t: Team) => (
                     <Card key={t.id} onClick={() => { setDetailId(t.id); setView(AppView.TEAM_DETAILS); }} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden"><img src={t.logo} className="w-full h-full object-cover"/></div>
                        <div><h4 className="font-bold text-sm text-brand-black dark:text-white">{t.name}</h4></div>
                     </Card>
                  )} 
               />
            )}
            {(activeTab === 'ALL' || activeTab === 'MATCHES') && (
               <ResultSection 
                  title="Matches" 
                  data={searchResults.matches} 
                  renderItem={(m: Match) => (
                     <Card key={m.id} onClick={() => { setDetailId(m.id); setView(AppView.MATCH_DETAILS); }} className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500">{m.scoreA} vs {m.scoreB}</span>
                        <StatusBadge status={m.status} />
                     </Card>
                  )} 
               />
            )}
            {(activeTab === 'ALL' || activeTab === 'USERS') && (
               <ResultSection 
                  title="Users" 
                  data={searchResults.users} 
                  renderItem={(u: User) => (
                     <Card key={u.id} className="flex items-center gap-3">
                        <img src={u.avatar} className="w-8 h-8 rounded-full" />
                        <div>
                           <h4 className="font-bold text-sm text-brand-black dark:text-white">{u.name}</h4>
                           <p className="text-[10px] text-gray-500">{u.roles.join(', ')}</p>
                        </div>
                     </Card>
                  )} 
               />
            )}
         </div>
      )}
      
      {showFilterSheet && <FilterSheet filters={filters} setFilters={setFilters} onClose={() => setShowFilterSheet(false)} />}
    </PageContainer>
  );
};

const FilterSheet: React.FC<{ filters: FilterState, setFilters: (f: FilterState) => void, onClose: () => void }> = ({ filters, setFilters, onClose }) => {
   const toggleSport = (s: SportType) => {
      setFilters({ ...filters, sports: filters.sports.includes(s) ? filters.sports.filter(x => x !== s) : [...filters.sports, s] });
   };
   const toggleStatus = (s: TournamentStatus | MatchStatus) => {
      setFilters({ ...filters, status: filters.status.includes(s) ? filters.status.filter(x => x !== s) : [...filters.status, s] });
   };
   const clearAll = () => setFilters({ sports: [], status: [] });

   return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
         <div className="bg-white dark:bg-[#1E1E1E] dark:text-white w-full max-w-md rounded-t-3xl p-6 space-y-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
               <h3 className="font-black text-lg">Filters</h3>
               <button onClick={clearAll} className="text-xs font-bold text-red-500">RESET</button>
            </div>
            
            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Sport</label>
               <div className="flex flex-wrap gap-2">
                  {Object.values(SportType).map(s => (
                     <FilterChip key={s} label={s} active={filters.sports.includes(s)} onClick={() => toggleSport(s)} />
                  ))}
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Status</label>
               <div className="flex flex-wrap gap-2">
                  {[TournamentStatus.UPCOMING, TournamentStatus.ONGOING, TournamentStatus.COMPLETED].map(s => (
                     <FilterChip key={s} label={s.replace('_', ' ')} active={filters.status.includes(s)} onClick={() => toggleStatus(s)} />
                  ))}
               </div>
            </div>

            <div>
               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Location</label>
               <input 
                  value={filters.location || ''} 
                  onChange={e => setFilters({...filters, location: e.target.value})} 
                  placeholder="Enter city..." 
                  className="w-full p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl border-none outline-none text-sm font-bold"
               />
            </div>

            <ActionButton onClick={onClose} fullWidth>APPLY FILTERS</ActionButton>
         </div>
      </div>
   );
};

const ProfileView: React.FC<{ onLogout: () => void, setView: (v: AppView) => void }> = ({ onLogout, setView }) => {
   const { user, activityFeed, getUserTeams, toggleFollowUser } = useAppContext();
   const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements'>('overview');
   
   if (!user) return null;
   
   const { level, progress, nextLevelXp } = calculateLevel(user.xp || 0);
   const primaryStats = user.stats.find(s => user.preferredSports.includes(s.sport)) || user.stats[0];

   return (
      <PageContainer>
         <div className="relative">
            <div className="h-32 w-full bg-brand-dark overflow-hidden">
               {user.coverPhoto ? <img src={user.coverPhoto} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-gradient-to-r from-brand-dark to-gray-800" />}
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
               <button onClick={() => setView(AppView.SETTINGS)} className="p-2 bg-white/20 backdrop-blur rounded-full text-white"><Settings size={18} /></button>
            </div>
            <div className="px-4 -mt-10 flex justify-between items-end relative z-10">
               <div className="flex items-end gap-3">
                  <div className="w-24 h-24 rounded-2xl border-4 border-brand-primary bg-white dark:bg-neutral-800 overflow-hidden shadow-lg">
                     <img src={user.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div className="pb-1">
                     <h2 className="text-xl font-black text-brand-black dark:text-white leading-none mb-1">{user.name}</h2>
                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Level {level}</p>
                  </div>
               </div>
               <button onClick={() => setView(AppView.EDIT_PROFILE)} className="mb-1 bg-white dark:bg-[#1E1E1E] dark:text-white border-2 border-brand-black dark:border-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">EDIT</button>
            </div>
         </div>
         
         <div className="px-4 mt-4 flex items-center gap-6 text-sm">
             <div className="flex flex-col items-center">
                 <span className="font-black text-brand-black dark:text-white">{user.followers?.length || 0}</span>
                 <span className="text-xs text-gray-400 font-bold uppercase">Followers</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="font-black text-brand-black dark:text-white">{user.following?.length || 0}</span>
                 <span className="text-xs text-gray-400 font-bold uppercase">Following</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="font-black text-brand-black dark:text-white">{user.postsCount || 0}</span>
                 <span className="text-xs text-gray-400 font-bold uppercase">Posts</span>
             </div>
         </div>
         
         <div className="px-4 mt-4">
            <div className="bg-gray-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
               <div className="bg-brand-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
               <span>XP: {user.xp || 0}</span>
               <span>Next: {nextLevelXp}</span>
            </div>
         </div>

         <div className="p-4">
            {user.bio && <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{user.bio}</p>}
            {user.socialLinks && (
               <div className="flex gap-3 mb-6">
                  {user.socialLinks.map((link, idx) => (
                     <a key={idx} href={link.url} target="_blank" className="p-2 bg-white dark:bg-[#1E1E1E] border-2 border-gray-100 dark:border-neutral-800 rounded-lg text-gray-600 dark:text-gray-400 hover:text-brand-primary hover:border-brand-primary">
                        {link.platform === 'twitter' ? <Twitter size={16}/> : link.platform === 'linkedin' ? <Linkedin size={16}/> : <Globe size={16}/>}
                     </a>
                  ))}
               </div>
            )}

            <div className="flex space-x-6 overflow-x-auto no-scrollbar border-b border-gray-200 dark:border-neutral-800 mb-6">
               {['overview', 'stats', 'achievements'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-400'}`}>
                     {tab}
                  </button>
               ))}
            </div>

            {activeTab === 'overview' && (
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                     <StatCard label="Tournaments" value={user.tournamentsJoined.length + user.tournamentsCreated.length} icon={<Trophy size={20} className="text-brand-black dark:text-white"/>} color="bg-brand-primary"/>
                     <StatCard label="Matches" value={primaryStats?.matchesPlayed || 0} icon={<Activity size={20} className="text-blue-600"/>} color="bg-blue-100 dark:bg-blue-900/30"/>
                  </div>
                  
                  <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-neutral-800">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm text-brand-black dark:text-white">Teams</h3>
                        <span className="text-xs text-brand-primary font-bold">VIEW ALL</span>
                     </div>
                     <div className="space-y-3">
                        {getUserTeams().map(t => (
                           <div key={t.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-neutral-800 overflow-hidden"><img src={t.logo} className="w-full h-full object-cover"/></div>
                              <div>
                                 <h4 className="font-bold text-xs text-brand-black dark:text-white">{t.name}</h4>
                                 <p className="text-[10px] text-gray-400">Captain</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'stats' && (
               <div className="space-y-4">
                  {primaryStats ? (
                     <>
                        <div className="bg-white dark:bg-[#1E1E1E] p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                           <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-brand-black dark:text-white"><BarChart2 size={16}/> Performance Trend</h3>
                           <StatsChart data={[10, 45, 30, 60, 55, 80, 70]} />
                        </div>
                        {primaryStats.sport === SportType.CRICKET && primaryStats.cricket && (
                           <div className="grid grid-cols-2 gap-3">
                              <StatCard label="Runs" value={primaryStats.cricket.runs} icon={<Activity size={18}/>} color="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"/>
                              <StatCard label="Wickets" value={primaryStats.cricket.wickets} icon={<Zap size={18}/>} color="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"/>
                              <StatCard label="High Score" value={primaryStats.cricket.highestScore} icon={<TrendingUp size={18}/>} color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"/>
                              <StatCard label="Best Bowl" value={primaryStats.cricket.bestBowling} icon={<Target size={18}/>} color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"/>
                           </div>
                        )}
                        {primaryStats.sport === SportType.FOOTBALL && primaryStats.football && (
                           <div className="grid grid-cols-2 gap-3">
                              <StatCard label="Goals" value={primaryStats.football.goals} icon={<Activity size={18}/>} color="bg-green-100 text-green-700"/>
                              <StatCard label="Assists" value={primaryStats.football.assists} icon={<Users size={18}/>} color="bg-blue-100 text-blue-700"/>
                           </div>
                        )}
                     </>
                  ) : <div className="text-center py-10 text-gray-400">No stats recorded yet.</div>}
               </div>
            )}

            {activeTab === 'achievements' && (
               <div className="grid grid-cols-2 gap-3">
                  {user.achievements.map(a => (
                     <AchievementBadge key={a.id} {...a} />
                  ))}
                  {user.achievements.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400 text-xs">Play more matches to unlock badges!</div>}
               </div>
            )}
         </div>
      </PageContainer>
   );
};

const EditProfileView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user, updateUser } = useAppContext();
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  
  const handleSave = () => {
     updateUser({ bio, location });
     onBack();
  };

  return (
     <PageContainer>
        <TopAppBar title="Edit Profile" showBack onBack={onBack} />
        <div className="p-4 space-y-4">
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Display Name</label>
              <input value={user?.name} disabled className="w-full mt-1 p-3 bg-gray-100 dark:bg-neutral-800 rounded-xl text-gray-500 text-sm font-bold" />
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full mt-1 p-3 border-2 border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-xl text-sm focus:border-brand-primary outline-none" placeholder="Tell us about yourself..." />
           </div>
           <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Location</label>
              <div className="relative">
                 <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400"/>
                 <input value={location} onChange={e => setLocation(e.target.value)} className="w-full mt-1 p-3 pl-10 border-2 border-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white rounded-xl text-sm focus:border-brand-primary outline-none" />
              </div>
           </div>
           <ActionButton onClick={handleSave} fullWidth>SAVE CHANGES</ActionButton>
        </div>
     </PageContainer>
  );
};

const LeaderboardView: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => {
   const { getLeaderboard } = useAppContext();
   const [sport, setSport] = useState<SportType>(SportType.CRICKET);
   const [metric, setMetric] = useState('runs'); // runs, wickets
   
   const leaders = getLeaderboard(sport, metric);
   
   return (
      <PageContainer>
         <TopAppBar title="Leaderboard" showBack onBack={() => setView(AppView.HOME)} />
         <div className="p-4 bg-white dark:bg-[#1E1E1E] border-b border-gray-200 dark:border-neutral-800">
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
               {[SportType.CRICKET, SportType.FOOTBALL, SportType.KABADDI].map(s => (
                  <button key={s} onClick={() => { setSport(s); setMetric(s === SportType.CRICKET ? 'runs' : 'goals'); }} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${sport === s ? 'bg-brand-black text-brand-primary' : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400'}`}>
                     {s}
                  </button>
               ))}
            </div>
            <div className="flex gap-4 border-b border-gray-100 dark:border-neutral-800">
               {sport === SportType.CRICKET ? (
                  <>
                     <button onClick={() => setMetric('runs')} className={`pb-2 text-xs font-bold uppercase ${metric === 'runs' ? 'border-b-2 border-brand-primary text-brand-black dark:text-white' : 'text-gray-400'}`}>Most Runs</button>
                     <button onClick={() => setMetric('wickets')} className={`pb-2 text-xs font-bold uppercase ${metric === 'wickets' ? 'border-b-2 border-brand-primary text-brand-black dark:text-white' : 'text-gray-400'}`}>Most Wickets</button>
                  </>
               ) : (
                  <button onClick={() => setMetric('goals')} className={`pb-2 text-xs font-bold uppercase ${metric === 'goals' ? 'border-b-2 border-brand-primary text-brand-black dark:text-white' : 'text-gray-400'}`}>Top Scorers</button>
               )}
            </div>
         </div>
         
         <div className="p-2 space-y-2">
            {leaders.map((u, idx) => {
               const stat = u.stats.find(s => s.sport === sport);
               const val = sport === SportType.CRICKET ? (metric === 'runs' ? stat?.cricket?.runs : stat?.cricket?.wickets) : stat?.football?.goals;
               
               return (
                  <div key={u.id} className={`flex items-center p-3 rounded-xl border-2 ${idx === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-brand-primary' : 'bg-white dark:bg-[#1E1E1E] border-transparent'}`}>
                     <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-full mr-3 ${idx === 0 ? 'bg-brand-primary text-brand-black' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'}`}>{idx + 1}</div>
                     <img src={u.avatar} className="w-10 h-10 rounded-full bg-gray-200 object-cover mr-3" />
                     <div className="flex-1">
                        <h4 className="font-bold text-sm text-brand-black dark:text-white">{u.name}</h4>
                        <p className="text-[10px] text-gray-500 uppercase">{u.location}</p>
                     </div>
                     <div className="text-lg font-black text-brand-black dark:text-white">{val || 0}</div>
                  </div>
               );
            })}
            {leaders.length === 0 && <div className="text-center py-10 text-gray-400">No data available</div>}
         </div>
      </PageContainer>
   );
};

// --- Helper for Stats Chart placeholder ---
const Target: React.FC<{ size: number }> = ({ size }) => <div style={{width:size, height:size}} className="rounded-full border-2 border-current flex items-center justify-center"><div className="w-1/2 h-1/2 bg-current rounded-full"></div></div>;

// --- Other existing components (retained for completeness) ---

const StandingsTable: React.FC<{ rows: StandingsRow[], sport: SportType }> = ({ rows, sport }) => {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1E1E1E] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-brand-primary text-brand-black uppercase text-[10px] font-black tracking-wider">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">Pts</th>
              <th className="px-2 py-3 text-center">{sport === SportType.FOOTBALL ? 'GD' : 'NRR'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 text-brand-black dark:text-gray-300">
             {rows.length === 0 && (
                <tr>
                   <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">No matches played yet</td>
                </tr>
             )}
            {rows.map((row, idx) => (
              <tr key={row.teamId} className={idx < 2 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}>
                <td className="px-4 py-3 font-bold text-gray-800 dark:text-white line-clamp-1 max-w-[120px]">{row.teamName}</td>
                <td className="px-2 py-3 text-center text-gray-600 dark:text-gray-400">{row.played}</td>
                <td className="px-2 py-3 text-center text-green-600 dark:text-green-400 font-medium">{row.won}</td>
                <td className="px-2 py-3 text-center text-red-500 dark:text-red-400">{row.lost}</td>
                <td className="px-2 py-3 text-center text-gray-500">{row.draw}</td>
                <td className="px-2 py-3 text-center font-black text-brand-black dark:text-white">{row.points}</td>
                <td className="px-2 py-3 text-center text-gray-500 text-xs">{sport === SportType.FOOTBALL ? row.gd : row.nrr?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BracketView: React.FC<{ matches: Match[], teams: Team[] }> = ({ matches, teams }) => {
  const rounds = matches.reduce((acc, match) => {
    const r = match.round || 1;
    if (!acc[r]) acc[r] = [];
    acc[r].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const roundNumbers = Object.keys(rounds).map(Number).sort((a,b) => a-b);

  if (roundNumbers.length === 0) return <div className="p-8 text-center text-gray-400">Bracket will appear here once tournament starts.</div>;

  return (
    <div className="flex overflow-x-auto space-x-8 p-4 no-scrollbar pb-12">
      {roundNumbers.map((roundNum, rIdx) => {
         const roundName = rIdx === roundNumbers.length - 1 ? 'Finals' : 
                           rIdx === roundNumbers.length - 2 ? 'Semi Finals' : 
                           rIdx === roundNumbers.length - 3 ? 'Quarter Finals' : `Round ${roundNum}`;
         return (
            <div key={roundNum} className="flex flex-col gap-6 min-w-[220px]">
               <h3 className="text-center font-black text-xs uppercase tracking-widest text-brand-gray dark:text-gray-400 mb-2 sticky left-0">{roundName}</h3>
               {rounds[roundNum].sort((a,b) => (a.bracketIndex || 0) - (b.bracketIndex || 0)).map((match, mIdx) => {
                 const teamA = teams.find(t => t.id === match.teamAId);
                 const teamB = teams.find(t => t.id === match.teamBId);
                 const isCompleted = match.status === MatchStatus.COMPLETED;
                 
                 return (
                   <div key={match.id} className="relative flex flex-col justify-center">
                     {roundNum < roundNumbers[roundNumbers.length-1] && (
                        <div className={`absolute -right-8 top-1/2 w-8 border-t-2 ${isCompleted ? 'border-brand-primary' : 'border-gray-200 dark:border-neutral-700'}`}></div>
                     )}
                     
                     <div className={`bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border-2 overflow-hidden ${match.status === MatchStatus.LIVE ? 'border-brand-primary' : 'border-gray-100 dark:border-neutral-800'}`}>
                        <div className={`p-2 flex justify-between items-center ${match.teamAId ? 'bg-white dark:bg-[#1E1E1E]' : 'bg-gray-50 dark:bg-neutral-800'} border-b border-gray-50 dark:border-neutral-800`}>
                           <span className={`text-xs font-bold truncate max-w-[120px] dark:text-white ${!match.teamAId && 'text-gray-400 italic'}`}>{teamA?.name || 'TBD'}</span>
                           <span className="font-mono text-xs font-black dark:text-white">{match.scoreA}</span>
                        </div>
                        <div className={`p-2 flex justify-between items-center ${match.teamBId ? 'bg-white dark:bg-[#1E1E1E]' : 'bg-gray-50 dark:bg-neutral-800'}`}>
                           <span className={`text-xs font-bold truncate max-w-[120px] dark:text-white ${!match.teamBId && 'text-gray-400 italic'}`}>{teamB?.name || 'TBD'}</span>
                           <span className="font-mono text-xs font-black dark:text-white">{match.scoreB}</span>
                        </div>
                     </div>
                     <div className="text-[10px] text-gray-400 text-center mt-1">
                        {match.status === MatchStatus.COMPLETED ? 'FT' : new Date(match.startTime).toLocaleDateString()}
                     </div>
                   </div>
                 );
               })}
            </div>
         );
      })}
    </div>
  );
};

const NotificationBanner: React.FC<{ notification: AppNotification | null, onClose: () => void }> = ({ notification, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification && !visible) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
      <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border-2 border-brand-primary p-4 flex items-start gap-3">
         <div className="bg-brand-primary/20 p-2 rounded-full text-brand-dark">
            <Bell size={18} />
         </div>
         <div className="flex-1">
            <h4 className="font-bold text-sm text-brand-black dark:text-white">{notification?.title}</h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{notification?.message}</p>
         </div>
         <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
         </button>
      </div>
    </div>
  );
};

const NotificationItem: React.FC<{ notification: AppNotification, onClick: () => void }> = ({ notification, onClick }) => {
   const { markAsRead } = useAppContext();
   
   return (
      <div 
         onClick={() => { markAsRead(notification.id); onClick(); }}
         className={`p-4 bg-white dark:bg-[#1E1E1E] rounded-xl border-l-4 shadow-sm mb-3 flex gap-3 transition-colors active:bg-gray-50 dark:active:bg-neutral-800 ${notification.read ? 'border-gray-200 dark:border-neutral-700 opacity-70' : 'border-brand-primary'}`}
      >
         <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0 ${notification.read ? 'bg-gray-100 dark:bg-neutral-800 dark:text-gray-400' : 'bg-brand-primary/10 text-brand-dark'}`}>
            {notification.type === NotificationType.INVITATION_RECEIVED ? <Mail size={18} /> : 
             notification.type === NotificationType.MATCH_STARTING ? <Clock size={18} /> :
             notification.type === NotificationType.MATCH_RESULT ? <Trophy size={18} /> : <Bell size={18} />}
         </div>
         <div className="flex-1">
            <div className="flex justify-between items-start">
               <h4 className={`text-sm ${notification.read ? 'font-medium text-gray-700 dark:text-gray-400' : 'font-bold text-brand-black dark:text-white'}`}>{notification.title}</h4>
               <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(notification.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
         </div>
         {!notification.read && <div className="h-2 w-2 rounded-full bg-brand-primary mt-2"></div>}
      </div>
   );
};

const NotificationCenter: React.FC<{ setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ setDetailId, setView }) => {
   const { notifications, clearNotifications } = useAppContext();
   const unread = notifications.filter(n => !n.read);
   const read = notifications.filter(n => n.read);
   const handleNotifClick = (n: AppNotification) => {
      if (n.actionUrl) {
         if (n.actionData?.id) setDetailId(n.actionData.id);
         setView(n.actionUrl);
      }
   };

   return (
      <PageContainer>
         <TopAppBar title="Notifications" rightAction={
            notifications.length > 0 && <button onClick={clearNotifications} className="text-xs font-bold text-gray-500 px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded">CLEAR ALL</button>
         } />
         <div className="p-4">
            {notifications.length === 0 && (
               <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No notifications yet</p>
               </div>
            )}
            {unread.length > 0 && (
               <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 px-1">New</h3>
                  {unread.map(n => <NotificationItem key={n.id} notification={n} onClick={() => handleNotifClick(n)} />)}
               </div>
            )}
            {read.length > 0 && (
               <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 px-1">Earlier</h3>
                  {read.map(n => <NotificationItem key={n.id} notification={n} onClick={() => handleNotifClick(n)} />)}
               </div>
            )}
         </div>
      </PageContainer>
   );
};

// --- Main App Logic ---

const BottomNavigation: React.FC<{ current: AppView, onChange: (view: AppView) => void }> = ({ current, onChange }) => {
   const { unreadCount } = useAppContext();
   const navItems = [
    { view: AppView.HOME, icon: <Home size={22} />, label: 'Home' },
    { view: AppView.DISCOVERY, icon: <Map size={22} />, label: 'Discover' },
    { view: AppView.CREATE_TOURNAMENT, icon: <PlusCircle size={28} />, label: 'Create', isMain: true },
    { view: AppView.SOCIAL_FEED, icon: <Activity size={22} />, label: 'Feed' },
    { view: AppView.PROFILE, icon: <UserIcon size={22} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-brand-dark text-white pb-safe pt-2 px-4 flex justify-between items-end z-50 h-[80px] rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.2)]">
      {navItems.map((item) => {
        const isActive = current === item.view || 
                         (item.view === AppView.CREATE_TOURNAMENT && current === AppView.CREATE_TEAM) ||
                         (item.view === AppView.DISCOVERY && current === AppView.SEARCH) ||
                         (item.view === AppView.SOCIAL_FEED && (current === AppView.CREATE_POST || current === AppView.CHAT_LIST));
        return (
          <button
            key={item.label}
            onClick={() => onChange(item.view)}
            className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${item.isMain ? '-mt-8' : 'pb-3'} relative`}
          >
            <div className={`${item.isMain ? 'bg-brand-primary text-brand-black p-4 rounded-full border-4 border-brand-dark shadow-lg transform active:scale-90 transition-transform' : isActive ? 'text-brand-primary scale-110' : 'text-gray-400'}`}>
               {item.icon}
            </div>
            {!item.isMain && (
              <span className={`text-[10px] mt-1 font-bold tracking-wide ${isActive ? 'text-brand-primary' : 'text-gray-500'}`}>
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAppContext();
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [detailId, setDetailId] = useState<string>('');
  const [activeBanner, setActiveBanner] = useState<AppNotification | null>(null);

  useEffect(() => {
    if (view === AppView.SPLASH) return;
    if (!user && view !== AppView.LOGIN && view !== AppView.SIGNUP) setView(AppView.LOGIN);
    if (user && (view === AppView.LOGIN || view === AppView.SIGNUP)) setView(AppView.HOME);
  }, [user, view]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#121212]">
      <NotificationBanner notification={activeBanner} onClose={() => setActiveBanner(null)} />
      
      {view === AppView.SPLASH && <SplashPage onFinish={() => setView(user ? AppView.HOME : AppView.LOGIN)} />}
      {view === AppView.LOGIN && <LoginView onSignupClick={() => setView(AppView.SIGNUP)} onSuccess={() => setView(AppView.HOME)} />}
      {view === AppView.SIGNUP && <SignupView onLoginClick={() => setView(AppView.LOGIN)} onSuccess={() => setView(AppView.PROFILE_SETUP)} />}
      {view === AppView.PROFILE_SETUP && <ProfileSetupView onFinish={() => setView(AppView.HOME)} />}
      
      {view === AppView.HOME && <HomeView setDetailId={setDetailId} setView={setView} />}
      {view === AppView.DISCOVERY && <div className="flex flex-col h-screen"><DiscoveryView setDetailId={setDetailId} setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {view === AppView.SEARCH && <div className="flex flex-col h-screen"><EnhancedSearchView setDetailId={setDetailId} setView={setView} /><BottomNavigation current={AppView.DISCOVERY} onChange={setView} /></div>}
      
      {view === AppView.MY_TOURNAMENTS && <div className="flex flex-col h-screen"><MyContentView setDetailId={setDetailId} setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {/* Activity Feed Replaced by Social Feed */}
      {view === AppView.SOCIAL_FEED && <div className="flex flex-col h-screen"><SocialFeedView setDetailId={setDetailId} setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {view === AppView.CREATE_POST && <div className="h-screen flex flex-col"><CreatePostView setView={setView} /><BottomNavigation current={AppView.SOCIAL_FEED} onChange={setView} /></div>}
      {view === AppView.CHAT_LIST && <div className="h-screen flex flex-col"><ChatListView setView={setView} setDetailId={setDetailId} /><BottomNavigation current={AppView.SOCIAL_FEED} onChange={setView} /></div>}
      {view === AppView.CHAT_ROOM && <ChatRoomView chatId={detailId} onBack={() => setView(AppView.CHAT_LIST)} />}
      
      {view === AppView.LEADERBOARD && <div className="flex flex-col h-screen"><LeaderboardView setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      
      {view === AppView.TOURNAMENT_DETAILS && <TournamentDetailView id={detailId} onBack={() => setView(AppView.HOME)} setDetailId={setDetailId} setView={setView} />}
      {view === AppView.TEAM_DETAILS && <TeamDetailView id={detailId} onBack={() => setView(AppView.MY_TOURNAMENTS)} />}
      {view === AppView.MATCH_DETAILS && <EnhancedMatchDetailView id={detailId} onBack={() => setView(AppView.TOURNAMENT_DETAILS)} setView={setView} />}
      {view === AppView.MATCH_CONTROL && <MatchControlPanel id={detailId} onBack={() => setView(AppView.MATCH_DETAILS)} />}
      
      {view === AppView.CREATE_TOURNAMENT && <div className="h-screen flex flex-col"><CreateTournamentView setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {view === AppView.CREATE_TEAM && <div className="h-screen flex flex-col"><CreateTeamView setView={setView} /><BottomNavigation current={AppView.CREATE_TOURNAMENT} onChange={setView} /></div>}
      
      {view === AppView.PROFILE && <div className="h-screen flex flex-col"><ProfileView onLogout={() => setView(AppView.LOGIN)} setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {view === AppView.EDIT_PROFILE && <div className="h-screen flex flex-col"><EditProfileView onBack={() => setView(AppView.PROFILE)} /><BottomNavigation current={AppView.PROFILE} onChange={setView} /></div>}
      
      {view === AppView.NOTIFICATIONS && <div className="h-screen flex flex-col"><NotificationCenter setDetailId={setDetailId} setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>}
      {/* Settings replaces NotificationSettings */}
      {view === AppView.SETTINGS && <SettingsView onBack={() => setView(AppView.PROFILE)} />}

      {[AppView.HOME].includes(view) && <BottomNavigation current={view} onChange={setView} />}
      
      {/* Banner Listener */}
      <BannerListener setActiveBanner={setActiveBanner} />
    </div>
  );
};

const BannerListener: React.FC<{ setActiveBanner: (n: AppNotification) => void }> = ({ setActiveBanner }) => {
   const { notifications } = useAppContext();
   const lastNotifRef = useRef<string>('');
   useEffect(() => {
      if (notifications.length > 0) {
         const latest = notifications[0];
         if (latest.id !== lastNotifRef.current && !latest.read) {
            setActiveBanner(latest);
            lastNotifRef.current = latest.id;
         }
      }
   }, [notifications, setActiveBanner]);
   return null;
}

// --- Minimal implementations ---
const SplashPage: React.FC<any> = ({ onFinish }) => { useEffect(() => { setTimeout(onFinish, 2000); }, [onFinish]); return <div className="h-screen w-full bg-brand-primary flex items-center justify-center"><Trophy size={64} className="animate-bounce"/></div>; };
const LoginView: React.FC<any> = ({ onSignupClick, onSuccess }) => { const { login } = useAppContext(); const [e, setE] = useState(''); const [p, setP] = useState(''); return <div className="h-screen flex flex-col justify-center p-6"><h2 className="text-4xl font-black mb-6 text-brand-black dark:text-white">LOGIN</h2><input className="mb-4 p-4 border-2 rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input className="mb-4 p-4 border-2 rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)}/><ActionButton onClick={async()=>{if(await login(e,p)) onSuccess()}}>LOG IN</ActionButton><button onClick={onSignupClick} className="mt-4 font-bold text-sm text-brand-black dark:text-white">Create Account</button></div>; };
const SignupView: React.FC<any> = ({ onLoginClick, onSuccess }) => { const { signup } = useAppContext(); const [n, setN] = useState(''); const [e, setE] = useState(''); const [p, setP] = useState(''); return <div className="min-h-screen flex flex-col justify-center p-6"><h2 className="text-3xl font-black mb-4 text-brand-black dark:text-white">SIGN UP</h2><input className="mb-3 p-4 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Name" value={n} onChange={x=>setN(x.target.value)}/><input className="mb-3 p-4 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Email" value={e} onChange={x=>setE(x.target.value)}/><input className="mb-3 p-4 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" type="password" placeholder="Password" value={p} onChange={x=>setP(x.target.value)}/><ActionButton onClick={async()=>{if(await signup(n,e,p)) onSuccess()}}>CREATE ACCOUNT</ActionButton><button onClick={onLoginClick} className="mt-4 text-sm font-bold text-brand-black dark:text-white">Log In</button></div>; };
const ProfileSetupView: React.FC<any> = ({ onFinish }) => { const { completeProfile } = useAppContext(); const [l, setL] = useState(''); return <div className="h-screen p-6 bg-white dark:bg-[#121212]"><h2 className="text-2xl font-black mb-4 text-brand-black dark:text-white">SETUP</h2><input className="w-full p-4 border-2 rounded-xl mb-4 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Location" value={l} onChange={x=>setL(x.target.value)}/><ActionButton onClick={()=>{completeProfile({location: l, preferredSports: [SportType.CRICKET]}); onFinish()}}>FINISH</ActionButton></div>; };
const CreateTeamView: React.FC<any> = ({ setView }) => { const { createTeam } = useAppContext(); const [n, setN] = useState(''); return <PageContainer><TopAppBar title="Create Team"/><div className="p-4"><input className="w-full p-4 border-2 rounded-xl mb-4 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Team Name" value={n} onChange={x=>setN(x.target.value)}/><ActionButton onClick={()=>{createTeam({name:n}); setView(AppView.MY_TOURNAMENTS)}}>CREATE</ActionButton></div></PageContainer>; };
const TeamDetailView: React.FC<any> = ({ onBack }) => <PageContainer><TopAppBar title="Team" showBack onBack={onBack}/><div className="p-4 text-brand-black dark:text-white">Team Details Here</div></PageContainer>;
const MyContentView: React.FC<any> = ({ setDetailId, setView }) => { const { getUserTeams } = useAppContext(); return <PageContainer><TopAppBar title="My Hub"/><div className="p-4 space-y-4">{getUserTeams().map(t=><Card key={t.id} onClick={()=>{setDetailId(t.id); setView(AppView.TEAM_DETAILS)}}><span className="text-brand-black dark:text-white">{t.name}</span></Card>)}</div></PageContainer>; };
const HomeView: React.FC<any> = ({ setDetailId, setView }) => { const { tournaments } = useAppContext(); return <PageContainer><TopAppBar title="Home" rightAction={<button onClick={()=>setView(AppView.NOTIFICATIONS)} className="p-2 text-brand-black dark:text-white"><Bell size={20}/></button>}/><div className="p-4 space-y-4">{tournaments.map(t=><Card key={t.id} onClick={()=>{setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS)}}><span className="text-brand-black dark:text-white">{t.name}</span></Card>)}</div></PageContainer>; };
const CreateTournamentView: React.FC<any> = ({ setView }) => { const { createTournament, user } = useAppContext(); const [n, setN] = useState(''); return <PageContainer><TopAppBar title="Host"/><div className="p-4"><input className="w-full p-4 border-2 rounded-xl mb-4 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white" placeholder="Tournament Name" value={n} onChange={x=>setN(x.target.value)}/><ActionButton onClick={()=>{createTournament({name:n, organizerId: user?.id, sport: SportType.CRICKET}); setView(AppView.MY_TOURNAMENTS)}}>CREATE</ActionButton></div></PageContainer>; };
const MatchControlPanel: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => { const { matches, teams, updateMatchScore, updateMatchStatus } = useAppContext(); const match = matches.find(m => m.id === id); if (!match) return <div>Match Not Found</div>; const teamA = teams.find(t => t.id === match.teamAId); const teamB = teams.find(t => t.id === match.teamBId); const handleScoreUpdate = (text: string, type: any = 'INFO') => { updateMatchScore(match.id, match.details, { text, type }); }; const toggleMatchState = () => { if (match.status === MatchStatus.LIVE) updateMatchStatus(match.id, MatchStatus.PAUSED); else if (match.status === MatchStatus.PAUSED || match.status === MatchStatus.SCHEDULED) updateMatchStatus(match.id, MatchStatus.LIVE); }; return <div className="min-h-screen bg-brand-dark pb-safe"><TopAppBar title="Match Control" showBack onBack={onBack} rightAction={<div className="flex gap-2"><button onClick={toggleMatchState} className={`p-2 rounded-full font-bold text-xs flex items-center gap-1 ${match.status === MatchStatus.LIVE ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>{match.status === MatchStatus.LIVE ? <Pause size={14}/> : <Play size={14}/>}{match.status === MatchStatus.LIVE ? 'PAUSE' : 'START'}</button><button onClick={() => updateMatchStatus(match.id, MatchStatus.COMPLETED)} className="p-2 bg-red-600 text-white rounded-full"><Square size={14} fill="currentColor" /></button></div>} /><ScoreBoard match={match} teamA={teamA} teamB={teamB} dark /><div className="p-4"><div className="grid grid-cols-3 gap-3 mb-6"><button onClick={() => handleScoreUpdate("Goal/Run Scored!", "GOAL")} className="bg-green-600 p-4 rounded-xl text-white font-black">SCORE</button><button onClick={() => handleScoreUpdate("Foul/Wicket!", "WICKET")} className="bg-red-600 p-4 rounded-xl text-white font-black">OUT/FOUL</button><button onClick={() => handleScoreUpdate("Good Play", "INFO")} className="bg-blue-600 p-4 rounded-xl text-white font-black">INFO</button></div></div></div>; };
const EnhancedMatchDetailView: React.FC<{ id: string, onBack: () => void, setView: (v: AppView) => void }> = ({ id, onBack, setView }) => { const { matches, teams, user, tournaments } = useAppContext(); const [activeTab, setActiveTab] = useState<'live' | 'info' | 'stats'>('live'); const scrollRef = useRef<HTMLDivElement>(null); const match = matches.find(m => m.id === id); if (!match) return <div>Match Not Found</div>; const teamA = teams.find(t => t.id === match.teamAId); const teamB = teams.find(t => t.id === match.teamBId); const tournament = tournaments.find(t => t.id === match.tournamentId); const isHost = user?.id === tournament?.organizerId; const canManage = isHost; return <PageContainer className="h-screen flex flex-col overflow-hidden"><TopAppBar title={`${tournament?.name}`} showBack onBack={onBack} rightAction={canManage && (<button onClick={() => setView(AppView.MATCH_CONTROL)} className="bg-brand-black text-brand-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Edit2 size={12} /> MANAGE</button>)}/><div className="shrink-0"><ScoreBoard match={match} teamA={teamA} teamB={teamB} /></div><div className="flex border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#1E1E1E] shrink-0">{['live', 'info', 'stats'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-400'}`}>{tab}</button>))}</div><div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121212] relative p-4" ref={scrollRef}>{activeTab === 'live' && match.commentary.map(c => <div key={c.id} className="bg-white dark:bg-[#1E1E1E] dark:text-gray-200 p-3 rounded mb-2 text-sm shadow-sm">{c.text}</div>)}{activeTab === 'info' && <div className="text-center text-gray-500">Match Info</div>}</div></PageContainer>; };
const TournamentDetailView: React.FC<{ id: string, onBack: () => void, setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ id, onBack, setDetailId, setView }) => { const { tournaments, matches, teams, user, startTournament } = useAppContext(); const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'table' | 'bracket'>('fixtures'); const t = tournaments.find(x => x.id === id); if (!t) return <div>Not Found</div>; const tournamentMatches = matches.filter(m => m.tournamentId === id); const isHost = user?.id === t.organizerId; const standings = calculateStandings(tournamentMatches, t.teams, t.sport); return <PageContainer className="h-screen flex flex-col"><TopAppBar title={t.name} showBack onBack={onBack} /><div className="bg-white dark:bg-[#1E1E1E] p-4 pb-0 shadow-sm z-10"><div className="flex justify-between items-start mb-4"><div><h2 className="text-2xl font-black text-brand-black dark:text-white">{t.name}</h2><div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mt-1"><span className="bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{t.sport}</span><span>• {t.format.replace('_', ' ')}</span></div></div>{isHost && t.status === TournamentStatus.UPCOMING && (<ActionButton onClick={() => startTournament(t.id)} className="py-2 px-4 text-xs">START TOURNAMENT</ActionButton>)}</div><div className="flex space-x-6 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-neutral-800">{['overview', 'fixtures', 'table', 'bracket'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-400'}`}>{tab === 'table' ? 'Standings' : tab}</button>))}</div></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{activeTab === 'overview' && (<div className="space-y-4"><Card><h3 className="font-bold mb-2 text-brand-black dark:text-white">Description</h3><p className="text-sm text-gray-600 dark:text-gray-300">{t.description}</p></Card><Card><h3 className="font-bold mb-2 text-brand-black dark:text-white">Teams ({t.teams.length})</h3><div className="flex flex-wrap gap-2">{t.teams.map(tm => <span key={tm.id} className="bg-gray-100 dark:bg-neutral-800 dark:text-white px-2 py-1 rounded text-xs font-medium">{tm.name}</span>)}</div></Card></div>)}{activeTab === 'fixtures' && (<div className="space-y-3">{tournamentMatches.length === 0 && <div className="text-center text-gray-400 py-10">Fixtures will be generated when tournament starts.</div>}{tournamentMatches.sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(m => { const tA = teams.find(x => x.id === m.teamAId); const tB = teams.find(x => x.id === m.teamBId); return (<Card key={m.id} onClick={() => { setDetailId(m.id); setView(AppView.MATCH_DETAILS); }} className="flex justify-between items-center py-3"><div className="flex-1 text-right font-bold text-sm truncate text-brand-black dark:text-white">{tA?.name || 'TBD'}</div><div className="px-3 flex flex-col items-center"><span className="text-[10px] text-gray-400 font-mono mb-1">{new Date(m.startTime).toLocaleDateString()}</span><div className="bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded font-mono text-xs font-black dark:text-white">{m.scoreA} - {m.scoreB}</div></div><div className="flex-1 text-left font-bold text-sm truncate text-brand-black dark:text-white">{tB?.name || 'TBD'}</div></Card>)})}</div>)}{activeTab === 'table' && <StandingsTable rows={standings} sport={t.sport} />}{activeTab === 'bracket' && <BracketView matches={tournamentMatches} teams={t.teams} />}</div></PageContainer>; };

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS.map(t => ({...t, format: TournamentFormat.LEAGUE}))); 
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [invitations, setInvitations] = useState<VolunteerInvitation[]>([]);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [joinRequests, setJoinRequests] = useState<TournamentJoinRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>(MOCK_ACTIVITY_FEED);
  
  // Phase 8 State
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [chats, setChats] = useState<ChatRoom[]>(MOCK_CHATS);

  // Phase 9 Settings
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Search State Phase 7
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResults>({ tournaments: [], teams: [], users: [], matches: [] });

  useEffect(() => { const s = localStorage.getItem('tournamate_user'); if (s) setUser(JSON.parse(s)); }, []);
  
  // Theme Application Logic
  useEffect(() => {
     const root = window.document.documentElement;
     const isDark = settings.display.theme === 'dark' || (settings.display.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
     if (isDark) {
        root.classList.add('dark');
     } else {
        root.classList.remove('dark');
     }
  }, [settings.display.theme]);

  const login = async (e: string, p: string) => { const u = users.find(x => x.email === e); if(u) { setUser(u); localStorage.setItem('tournamate_user', JSON.stringify(u)); return true; } return false; };
  
  const signup = async (n: string, e: string, p: string) => { 
    const u: User = { 
      id: generateUserId(n), 
      name: n, 
      email: e, 
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=random`, 
      bio: '', 
      location: '', 
      preferredSports: [], 
      roles: [UserRole.SPECTATOR], 
      xp: 0, 
      reputationScore: 50, 
      achievements: [], 
      stats: [], 
      tournamentsCreated: [], 
      tournamentsJoined: [], 
      tournamentsFollowed: [], 
      teamsCreated: [], 
      teamsJoined: [], 
      followers: [], 
      following: [], 
      postsCount: 0 
    }; 
    setUsers([...users, u]); 
    setUser(u); 
    localStorage.setItem('tournamate_user', JSON.stringify(u)); 
    return true; 
  };
  
  const logout = () => { setUser(null); localStorage.removeItem('tournamate_user'); };
  
  const completeProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    setUsers(users.map(u => u.id === user.id ? updated : u));
    localStorage.setItem('tournamate_user', JSON.stringify(updated));
  };
  
  const updateUser = (updates: Partial<User>) => completeProfile(updates);

  const createTournament = (t: Partial<Tournament>) => {
    if (!user) return;
    const newT: Tournament = {
      id: generateTournamentId(),
      name: t.name || 'New Tournament',
      organizerId: t.organizerId || user.id,
      sport: t.sport || SportType.CRICKET,
      teams: [],
      matches: [],
      status: TournamentStatus.UPCOMING,
      startDate: new Date().toISOString(),
      volunteers: [],
      joinRequests: [],
      format: t.format || TournamentFormat.LEAGUE
    };
    setTournaments([...tournaments, newT]);
    setUser({...user, tournamentsCreated: [...user.tournamentsCreated, newT.id]});
    addNotification({ id: `n_${Date.now()}`, userId: user.id, type: NotificationType.GENERAL, title: 'Tournament Created', message: `You created ${newT.name}`, read: false, createdAt: new Date().toISOString(), icon: 'flag' });
  };
  
  const startTournament = (tournamentId: string) => {
    const t = tournaments.find(x => x.id === tournamentId);
    if (!t || t.status !== TournamentStatus.UPCOMING) return;
    
    // Generate Fixtures
    const generatedMatches = generateFixtures(t);
    setMatches([...matches, ...generatedMatches]);
    
    // Update Tournament
    const updatedT = { ...t, status: TournamentStatus.ONGOING, matches: generatedMatches };
    setTournaments(tournaments.map(x => x.id === tournamentId ? updatedT : x));
    
    // Notify
    t.teams.forEach(team => {
       createTournamentUpdateNotification(team.captainId, t.name, "Tournament has started! Check fixtures.", t.id);
    });
  };

  const createTeam = (t: Partial<Team>) => {
    if (!user) return;
    const newT: Team = {
      id: generateTeamId(t.name || 'Team'),
      name: t.name || 'New Team',
      captainId: user.id,
      playerIds: [user.id],
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || 'T')}&background=random`,
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };
    setTeams([...teams, newT]);
    setUser({...user, teamsCreated: [...user.teamsCreated, newT.id], teamsJoined: [...user.teamsJoined, newT.id]});
  };

  const addCommentary = (matchId: string, text: string, type: any = 'INFO') => {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;
    const newEvent: CommentaryEvent = { id: `c_${Date.now()}`, timestamp: Date.now(), text, type };
    const updatedMatch = { ...m, commentary: [newEvent, ...m.commentary], lastUpdatedAt: new Date().toISOString() };
    setMatches(matches.map(x => x.id === matchId ? updatedMatch : x));
  };

  const updateMatchScore = (matchId: string, details: any, commentaryEvent?: Partial<CommentaryEvent>, displayScores?: {a: string, b: string}) => {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;
    
    let updatedMatch = { ...m, details, lastUpdatedAt: new Date().toISOString() };
    
    if (displayScores) {
       updatedMatch.scoreA = displayScores.a;
       updatedMatch.scoreB = displayScores.b;
    } else {
       // Auto-update display score based on details (simplified)
       const { a, b } = formatScore(updatedMatch);
       updatedMatch.scoreA = a;
       updatedMatch.scoreB = b;
    }
    
    if (commentaryEvent) {
       const newEvent: CommentaryEvent = { 
         id: `c_${Date.now()}`, 
         timestamp: Date.now(), 
         text: commentaryEvent.text || '', 
         type: commentaryEvent.type || 'INFO' 
       };
       updatedMatch.commentary = [newEvent, ...updatedMatch.commentary];
    }

    // Bracket Advancement Logic if Match Completed
    if (updatedMatch.status === MatchStatus.COMPLETED && updatedMatch.nextMatchId) {
       // Determine winner
       // Simplified: Team A wins if scoreA > scoreB string comparison (mock)
       // Real app needs better parsing
       const winnerId = updatedMatch.scoreA > updatedMatch.scoreB ? updatedMatch.teamAId : updatedMatch.teamBId;
       if (winnerId) {
          // Update next match
          // We need to update the ENTIRE matches array
          // Since setMatches replaces it, we can calculate it here
          // But we are inside map... complex.
          // Let's do it in the setMatches call or separate effect?
          // For now, simpler: Just update this match, and let a separate logic handle bracket? 
          // Or update the matches array entirely here.
       }
    }

    // If completed, check for next match update
    let newMatches = matches.map(x => x.id === matchId ? updatedMatch : x);
    
    if (updatedMatch.status === MatchStatus.COMPLETED && updatedMatch.nextMatchId) {
        // Simplified winner calc
        const winnerId = updatedMatch.scoreA > updatedMatch.scoreB ? updatedMatch.teamAId : updatedMatch.teamBId;
        if (winnerId) {
            newMatches = advanceBracket(updatedMatch, winnerId, newMatches);
        }
    }

    setMatches(newMatches);
  };
  
  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
     setMatches(matches.map(m => m.id === matchId ? { ...m, status } : m));
     if (status === MatchStatus.LIVE) {
         // Notify followers
         const m = matches.find(x => x.id === matchId);
         if (m) {
             const t = tournaments.find(x => x.id === m.tournamentId);
             addNotification(createMatchStartNotification(user?.id || '', `${m.scoreA} vs ${m.scoreB}`, m.id));
         }
     }
  };

  const toggleFollowTournament = (id: string) => { /* ... */ };

  const inviteVolunteer = async (tournamentId: string, email: string, permissions: VolunteerPermissions) => {
     const inv: VolunteerInvitation = {
        id: `inv_${Date.now()}`, tournamentId, inviterId: user?.id || '', inviteeEmail: email, status: InvitationStatus.PENDING, permissions, createdAt: Date.now()
     };
     setInvitations([...invitations, inv]);
     return true;
  };
  
  const respondToInvitation = (id: string, status: InvitationStatus) => {
     setInvitations(invitations.map(i => i.id === id ? { ...i, status } : i));
  };
  
  const invitePlayerToTeam = async (teamId: string, email: string) => {
      const inv: TeamInvitation = {
          id: `tinv_${Date.now()}`, teamId, inviterId: user?.id || '', inviteeEmail: email, status: InvitationStatus.PENDING, createdAt: Date.now()
      };
      setTeamInvitations([...teamInvitations, inv]);
      // Notify (Mock: finding user by email)
      const target = users.find(u => u.email === email);
      if (target) {
          const team = teams.find(t => t.id === teamId);
          addNotification(createInvitationNotification(target.id, 'TEAM', team?.name || 'Team', inv.id));
      }
      return true;
  };
  
  const respondToTeamInvitation = (id: string, status: InvitationStatus) => {
      setTeamInvitations(teamInvitations.map(i => i.id === id ? { ...i, status } : i));
      if (status === InvitationStatus.ACCEPTED) {
          const inv = teamInvitations.find(i => i.id === id);
          if (inv && user) {
              const team = teams.find(t => t.id === inv.teamId);
              if (team) {
                  const updatedTeam = { ...team, playerIds: [...team.playerIds, user.id] };
                  setTeams(teams.map(t => t.id === team.id ? updatedTeam : t));
                  setUser({ ...user, teamsJoined: [...user.teamsJoined, team.id] });
              }
          }
      }
  };
  
  const requestJoinTournament = (tournamentId: string, teamId: string) => {
      const req: TournamentJoinRequest = {
          id: `jreq_${Date.now()}`, tournamentId, teamId, requesterId: user?.id || '', status: InvitationStatus.PENDING, createdAt: Date.now()
      };
      setJoinRequests([...joinRequests, req]);
  };
  
  const respondToJoinRequest = (requestId: string, status: InvitationStatus) => {
      setJoinRequests(joinRequests.map(r => r.id === requestId ? { ...r, status } : r));
      if (status === InvitationStatus.ACCEPTED) {
          const req = joinRequests.find(r => r.id === requestId);
          if (req) {
              const t = tournaments.find(x => x.id === req.tournamentId);
              const team = teams.find(x => x.id === req.teamId);
              if (t && team) {
                  const updatedT = { ...t, teams: [...t.teams, team] };
                  setTournaments(tournaments.map(x => x.id === t.id ? updatedT : x));
              }
          }
      }
  };

  const getUserTeams = () => teams.filter(t => t.playerIds.includes(user?.id || ''));

  const addNotification = (n: AppNotification) => setNotifications([n, ...notifications]);
  const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const getLeaderboard = (sport: SportType, metric: string) => {
      return [...users].sort((a, b) => {
          const statA = a.stats.find(s => s.sport === sport);
          const statB = b.stats.find(s => s.sport === sport);
          // Simplified metric extraction
          let valA = 0, valB = 0;
          if (sport === SportType.CRICKET) {
              valA = metric === 'runs' ? (statA?.cricket?.runs || 0) : (statA?.cricket?.wickets || 0);
              valB = metric === 'runs' ? (statB?.cricket?.runs || 0) : (statB?.cricket?.wickets || 0);
          } else if (sport === SportType.FOOTBALL) {
              valA = statA?.football?.goals || 0;
              valB = statB?.football?.goals || 0;
          }
          return valB - valA;
      });
  };

  // Search
  const performSearch = (query: string, filters?: FilterState) => {
      let results = performGlobalSearch(query, { tournaments, teams, users, matches });
      if (filters) {
          // Simplified: apply filters to results (assuming types match)
          // In real implementation, filter logic might need adaptation
          const filtered = applyFilters(results, filters);
          setSearchResults(filtered);
      } else {
          setSearchResults(results);
      }
  };
  
  const addToSearchHistory = (q: string) => {
     if (!searchHistory.includes(q)) setSearchHistory([q, ...searchHistory].slice(0, 5));
  };
  
  const clearSearchHistory = () => setSearchHistory([]);

  // Settings
  const updateSettings = (s: Partial<AppSettings>) => {
      setSettings(prev => ({ ...prev, ...s }));
      // In real app, persist settings
  };

  const deleteAccount = () => {
      if (!user) return;
      setUsers(users.filter(u => u.id !== user.id));
      logout();
  };

  // Social
  const toggleFollowUser = (targetId: string) => {
      if (!user) return;
      const isFollowing = user.following.includes(targetId);
      if (isFollowing) {
          setUser({ ...user, following: user.following.filter(id => id !== targetId) });
          // Update target's followers count in mock
          const target = users.find(u => u.id === targetId);
          if(target) target.followers = target.followers.filter(id => id !== user.id);
      } else {
          setUser({ ...user, following: [...user.following, targetId] });
          const target = users.find(u => u.id === targetId);
          if(target) target.followers.push(user.id);
      }
  };

  const createPost = (post: Partial<Post>) => {
      const newPost: Post = {
          id: `post_${Date.now()}`,
          authorId: user?.id || '',
          type: post.type || PostType.STATUS,
          content: post.content || '',
          media: post.media || [],
          taggedUserIds: [],
          reactions: [],
          comments: [],
          createdAt: new Date().toISOString(),
          ...post
      };
      setPosts([newPost, ...posts]);
      if(user) setUser({ ...user, postsCount: (user.postsCount || 0) + 1 });
  };

  const reactToPost = (postId: string, type: 'LIKE' | 'FIRE' | 'BOLT') => {
      if (!user) return;
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      
      const existing = post.reactions.find(r => r.userId === user.id);
      if (existing) {
          // Remove if same type (toggle), or update type? Let's just remove for toggle
          const updatedReactions = post.reactions.filter(r => r.userId !== user.id);
          setPosts(posts.map(p => p.id === postId ? { ...p, reactions: updatedReactions } : p));
      } else {
          const newReaction: Reaction = { type, userId: user.id, timestamp: Date.now() };
          setPosts(posts.map(p => p.id === postId ? { ...p, reactions: [...p.reactions, newReaction] } : p));
      }
  };

  const addComment = (postId: string, content: string) => {
      if (!user) return;
      const newComment: Comment = {
          id: `c_${Date.now()}`, postId, authorId: user.id, content, mentions: [], createdAt: new Date().toISOString()
      };
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const sendMessage = (roomId: string, content: string) => {
      if (!user) return;
      const chat = chats.find(c => c.id === roomId);
      if (!chat) return;
      
      const msg: ChatMessage = {
          id: `m_${Date.now()}`, roomId, senderId: user.id, content, timestamp: new Date().toISOString(), read: false
      };
      setChats(chats.map(c => c.id === roomId ? { ...c, lastMessage: msg } : c));
  };

  const createChat = (participantIds: string[]) => {
      const existing = chats.find(c => c.type === 'DIRECT' && c.participants.every(p => participantIds.includes(p)));
      if (existing) return existing.id;
      
      const newChat: ChatRoom = {
          id: `room_${Date.now()}`, type: 'DIRECT', participants: participantIds
      };
      setChats([...chats, newChat]);
      return newChat.id;
  };

  return (
    <AppContext.Provider value={{
      user, users, tournaments, matches, teams, invitations, teamInvitations, joinRequests, notifications, activityFeed, posts, chats, unreadCount: notifications.filter(n => !n.read).length,
      settings, updateSettings, deleteAccount,
      login, signup, logout, completeProfile, updateUser, createTournament, startTournament, createTeam,
      addCommentary, updateMatchScore, updateMatchStatus, toggleFollowTournament,
      inviteVolunteer, respondToInvitation, invitePlayerToTeam, respondToTeamInvitation, requestJoinTournament, respondToJoinRequest,
      getUserTeams, addNotification, markAsRead, clearNotifications, getLeaderboard,
      searchResults, performSearch, searchHistory, addToSearchHistory, clearSearchHistory,
      toggleFollowUser, createPost, reactToPost, addComment, sendMessage, createChat
    }}>
      {children}
    </AppContext.Provider>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;