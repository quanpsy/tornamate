
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  User, Tournament, Match, AppView, SportType, TournamentStatus, MatchStatus,
  Team
} from './types';
import { MOCK_USERS, MOCK_TOURNAMENTS, MOCK_MATCHES, MOCK_TEAMS } from './services/mockData';
import { generateUserId, generateTournamentId } from './utils';
import {
  Trophy, Search, PlusCircle, User as UserIcon, Home, Bell,
  ArrowLeft, MapPin, Users, Share2, Star, Calendar, RefreshCw,
  LogOut, Edit2, ChevronRight, Clock, Camera, Check, AlertCircle, Eye, EyeOff
} from 'lucide-react';

// --- Context Definitions ---
interface DataContextType {
  user: User | null;
  users: User[];
  tournaments: Tournament[];
  matches: Match[];
  teams: Team[];
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeProfile: (data: Partial<User>) => void;
  updateUser: (updates: Partial<User>) => void;
  createTournament: (t: Partial<Tournament>) => void;
  addCommentary: (matchId: string, text: string, type: any) => void;
  toggleFollowTournament: (id: string) => void;
}

const AppContext = createContext<DataContextType | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

// --- Phase 1 & 2: Design System Components ---

const ActionButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, variant = 'primary', className = '', disabled = false, fullWidth = false, type = 'button' }) => {
  const baseStyles = "py-3.5 px-5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide";
  
  const variants = {
    primary: "bg-brand-primary text-brand-black shadow-[0_4px_0_rgb(0,0,0)] active:shadow-none active:translate-y-1 border-2 border-brand-black hover:bg-yellow-400 disabled:bg-yellow-200 disabled:border-gray-400 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-0",
    secondary: "bg-transparent text-brand-black border-2 border-brand-black hover:bg-gray-50 disabled:opacity-50",
    ghost: "bg-transparent text-brand-gray hover:text-brand-black hover:bg-gray-100"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const StatusBadge: React.FC<{ status: string | TournamentStatus | MatchStatus }> = ({ status }) => {
  const s = status.toString().toUpperCase();
  
  if (s === 'LIVE' || s === 'ONGOING') {
    return (
      <div className="flex items-center gap-1.5 bg-white border-2 border-brand-primary px-2 py-1 rounded-md shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
        <span className="text-[10px] font-black text-brand-black tracking-wider">LIVE</span>
      </div>
    );
  }
  
  if (s === 'COMPLETED') {
    return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border border-green-200">COMPLETED</span>;
  }
  
  return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] font-bold tracking-wide border border-gray-200">UPCOMING</span>;
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; bordered?: boolean }> = ({ children, className = '', onClick, bordered = false }) => (
  <div 
    onClick={onClick} 
    className={`bg-white p-4 rounded-xl shadow-sm transition-all relative overflow-hidden ${bordered ? 'border-2 border-brand-primary' : 'border-2 border-transparent'} ${onClick ? 'cursor-pointer active:scale-[0.99] hover:border-brand-primary/50' : ''} ${className}`}
  >
    {children}
  </div>
);

const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`pb-24 min-h-screen bg-[#F5F5F5] ${className}`}>
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
  <div className={`sticky top-0 z-40 px-4 py-3 flex items-center justify-between h-16 transition-all ${transparent ? 'bg-transparent' : 'bg-brand-primary border-b-2 border-brand-dark'}`}>
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 text-brand-black transition-colors">
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      )}
      <h1 className="font-black text-xl text-brand-black tracking-tight uppercase italic">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      {rightAction}
    </div>
  </div>
);

const BottomNavigation: React.FC<{ current: AppView, onChange: (view: AppView) => void }> = ({ current, onChange }) => {
  const navItems = [
    { view: AppView.HOME, icon: <Home size={22} />, label: 'Home' },
    { view: AppView.SEARCH, icon: <Search size={22} />, label: 'Search' },
    { view: AppView.CREATE_TOURNAMENT, icon: <PlusCircle size={28} />, label: 'Create', isMain: true },
    { view: AppView.MY_TOURNAMENTS, icon: <Trophy size={22} />, label: 'My Games' },
    { view: AppView.PROFILE, icon: <UserIcon size={22} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-brand-dark text-white pb-safe pt-2 px-4 flex justify-between items-end z-50 h-[80px] rounded-t-2xl shadow-[0_-5px_10px_rgba(0,0,0,0.2)]">
      {navItems.map((item) => {
        const isActive = current === item.view;
        return (
          <button
            key={item.label}
            onClick={() => onChange(item.view)}
            className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${
              item.isMain ? '-mt-8' : 'pb-3'
            }`}
          >
            <div className={`
              ${item.isMain 
                ? 'bg-brand-primary text-brand-black p-4 rounded-full border-4 border-brand-dark shadow-lg transform active:scale-90 transition-transform' 
                : isActive ? 'text-brand-primary scale-110' : 'text-gray-400'
              }
            `}>
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

// --- Helper Components for Home ---

const SectionHeader: React.FC<{ title: string, action?: string, onAction?: () => void }> = ({ title, action, onAction }) => (
  <div className="flex items-center justify-between mb-3 px-1">
    <h2 className="text-lg font-black uppercase italic text-brand-dark tracking-tight">{title}</h2>
    {action && (
      <button onClick={onAction} className="text-xs font-bold text-brand-primary bg-brand-dark px-2 py-1 rounded hover:bg-black transition-colors">
        {action}
      </button>
    )}
  </div>
);

const SkeletonLoader: React.FC<{ height?: string, className?: string }> = ({ height = "h-40", className = "" }) => (
  <div className={`bg-gray-200 animate-pulse rounded-xl ${height} ${className}`}></div>
);

const TournamentCard: React.FC<{ 
  tournament: Tournament; 
  onClick: () => void; 
  isFollowed: boolean; 
  onToggleFollow: (e: React.MouseEvent) => void 
}> = ({ tournament, onClick, isFollowed, onToggleFollow }) => {
  const isLive = tournament.status === TournamentStatus.ONGOING;
  
  return (
    <Card onClick={onClick} bordered={isLive} className="h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <StatusBadge status={tournament.status} />
          <button 
            onClick={onToggleFollow} 
            className={`p-1.5 rounded-full transition-all ${isFollowed ? 'bg-brand-primary text-brand-black shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            <Star size={16} fill={isFollowed ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
        </div>
        
        <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2">{tournament.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-3">
           <span>By {tournament.organizerId}</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-400">
         <div className="flex items-center gap-3">
           <span className="flex items-center gap-1"><MapPin size={12}/> {tournament.location?.split(',')[0] || 'Unknown'}</span>
           <span className="flex items-center gap-1"><Users size={12}/> {tournament.teams.length}</span>
         </div>
         <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{tournament.sport}</span>
      </div>
    </Card>
  );
};

// --- Helper Input Components ---

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-1">{label}</label>}
    <input
      className={`w-full p-4 bg-white border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors font-medium ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'} ${className}`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
  </div>
);

const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }> = ({ label, error, className = '', ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4 w-full relative">
      {label && <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-1">{label}</label>}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full p-4 bg-white border-2 rounded-xl focus:outline-none focus:ring-0 transition-colors font-medium pr-12 ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-brand-primary'} ${className}`}
          {...props}
        />
        <button 
          type="button"
          onClick={() => setShow(!show)} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black"
        >
          {show ? <EyeOff size={20}/> : <Eye size={20}/>}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
    </div>
  );
}

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className="mb-4 w-full">
    {label && <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-1">{label}</label>}
    <select
      className={`w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-0 transition-colors font-medium appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// --- Phase 2: Auth Views ---

const SplashPage: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="h-screen w-full bg-brand-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black opacity-5 rounded-full"></div>
      
      <div className="animate-bounce mb-6 relative z-10">
        <div className="bg-brand-black p-6 rounded-2xl shadow-[8px_8px_0_rgba(255,255,255,0.5)]">
          <Trophy size={64} className="text-brand-primary" />
        </div>
      </div>
      <h1 className="text-5xl font-black text-brand-black tracking-tighter mb-2 italic uppercase relative z-10">TournaMate</h1>
      <p className="text-brand-black font-bold tracking-widest uppercase text-xs relative z-10">The Arena awaits</p>
    </div>
  );
};

const LoginView: React.FC<{ onSignupClick: () => void, onSuccess: () => void }> = ({ onSignupClick, onSuccess }) => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F5F5F5] flex flex-col justify-center p-6">
      <div className="mb-8">
        <h2 className="text-4xl font-black text-brand-black mb-2 italic uppercase">Welcome Back</h2>
        <div className="h-2 w-20 bg-brand-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Manage tournaments, track stats, and conquer the leaderboard.</p>
      </div>

      <Card className="p-6 shadow-lg border-none mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="hello@tournamate.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <PasswordInput 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          
          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-brand-gray hover:text-brand-black">Forgot Password?</button>
          </div>

          <ActionButton fullWidth type="submit" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </ActionButton>
        </form>
      </Card>

      <div className="text-center">
        <p className="text-sm text-gray-500 font-medium">
          Don't have an account? <br/>
          <button onClick={onSignupClick} className="mt-2 font-bold text-brand-black underline decoration-brand-primary decoration-4 underline-offset-2 hover:text-brand-primary hover:decoration-black transition-colors">
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

const SignupView: React.FC<{ onLoginClick: () => void, onSuccess: () => void }> = ({ onLoginClick, onSuccess }) => {
  const { signup } = useAppContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const success = await signup(name, email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Email already exists');
      }
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F5] flex flex-col justify-center p-6">
      <div className="mb-6">
        <h2 className="text-4xl font-black text-brand-black mb-2 italic uppercase">Join the Arena</h2>
        <div className="h-2 w-20 bg-brand-primary mb-4"></div>
        <p className="text-gray-600 font-medium">Start your journey to become a legend.</p>
      </div>

      <Card className="p-6 shadow-lg border-none mb-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}

          <Input 
            label="Full Name" 
            placeholder="e.g. Virat Kohli" 
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="hello@tournamate.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <PasswordInput 
            label="Password" 
            placeholder="Create a password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <PasswordInput 
            label="Confirm Password" 
            placeholder="Repeat password" 
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />

          <ActionButton fullWidth type="submit" disabled={loading} className="mt-4">
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </ActionButton>
        </form>
      </Card>

      <div className="text-center pb-6">
        <p className="text-sm text-gray-500 font-medium">
          Already a member? <br/>
          <button onClick={onLoginClick} className="mt-2 font-bold text-brand-black underline decoration-brand-primary decoration-4 underline-offset-2 hover:text-brand-primary hover:decoration-black transition-colors">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
};

const ProfileSetupView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const { user, completeProfile } = useAppContext();
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);

  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleSave = () => {
    completeProfile({
      bio,
      location,
      preferredSports: selectedSports
    });
    onFinish();
  };

  return (
    <PageContainer className="bg-white">
      <TopAppBar title="Setup Profile" transparent />
      
      <div className="px-6 pb-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-brand-primary flex items-center justify-center overflow-hidden">
               {user?.avatar ? (
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <UserIcon size={48} className="text-gray-300" />
               )}
            </div>
            <div className="absolute bottom-0 right-0 bg-brand-black text-white p-2 rounded-full border-2 border-white">
              <Camera size={16} />
            </div>
          </div>
          <h2 className="text-xl font-black mt-4">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.id}</p>
        </div>

        <div className="space-y-6">
          <Input 
            label="Location" 
            placeholder="City, State (e.g. Mumbai, MH)" 
            value={location}
            onChange={e => setLocation(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Preferred Sports</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(SportType).map((sport) => {
                const isSelected = selectedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-brand-primary border-brand-black text-brand-black shadow-[2px_2px_0_black] -translate-y-0.5' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand-primary'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-2">Bio</label>
             <textarea 
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-0 font-medium h-28 resize-none"
                placeholder="Tell us about your playing style..."
                value={bio}
                onChange={e => setBio(e.target.value)}
             />
          </div>
          
          <div className="pt-4">
             <ActionButton fullWidth onClick={handleSave}>SAVE & CONTINUE</ActionButton>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

// --- Main Views (Phase 3: Home & Nav) ---

const HomeView: React.FC<{ setView: (v: AppView) => void, setDetailId: (id: string) => void }> = ({ setView, setDetailId }) => {
  const { matches, tournaments, user, toggleFollowTournament } = useAppContext();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  // Filter Logic
  const liveTournaments = tournaments.filter(t => t.status === TournamentStatus.ONGOING);
  const trendingTournaments = [...tournaments].sort((a, b) => b.teams.length - a.teams.length);
  const nearbyTournaments = tournaments.filter(t => user?.location && t.location?.toLowerCase().includes(user.location.split(',')[0].toLowerCase().trim()));
  const recommendedTournaments = tournaments.filter(t => user?.preferredSports.includes(t.sport));
  
  // Recent Updates (Simulated from Matches)
  const recentMatches = matches
    .filter(m => m.status === MatchStatus.LIVE || m.status === MatchStatus.COMPLETED)
    .filter(m => user?.tournamentsFollowed.includes(m.tournamentId))
    .slice(0, 3);

  return (
    <PageContainer>
      <TopAppBar 
        title={`Hi, ${user?.name.split(' ')[0]}`} 
        rightAction={
          <div className="flex gap-3">
             <button onClick={handleRefresh} className={`p-2 rounded-full text-brand-dark hover:bg-black/5 ${refreshing ? 'animate-spin' : ''}`}>
                <RefreshCw size={20} />
             </button>
             <div className="relative p-2">
                <Bell size={24} className="text-brand-dark" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-brand-primary"></span>
             </div>
          </div>
        } 
      />
      
      <div className="space-y-8 pb-8">
        
        {/* LIVE SECTION (Carousel) */}
        <section className="pt-4">
          <SectionHeader title="Live Action" />
          {loading ? (
             <div className="flex gap-4 overflow-hidden px-4">
                <SkeletonLoader className="min-w-[280px] h-40" />
                <SkeletonLoader className="min-w-[280px] h-40" />
             </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-0 px-4 snap-x">
              {liveTournaments.length > 0 ? liveTournaments.map(t => (
                <div key={t.id} className="min-w-[280px] snap-center">
                  <TournamentCard 
                    tournament={t} 
                    onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
                    isFollowed={user?.tournamentsFollowed.includes(t.id) || false}
                    onToggleFollow={(e) => { e.stopPropagation(); toggleFollowTournament(t.id); }}
                  />
                </div>
              )) : (
                <div className="w-full px-4">
                   <div className="p-6 bg-white rounded-xl border-2 border-dashed border-gray-300 text-center text-gray-400 text-sm font-medium">
                     No live tournaments at the moment.
                   </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RECENT UPDATES (Feed) */}
        {recentMatches.length > 0 && (
          <section className="px-4">
             <SectionHeader title="Recent Updates" />
             <div className="space-y-3">
               {recentMatches.map(m => (
                 <div key={m.id} onClick={() => { setDetailId(m.id); setView(AppView.MATCH_DETAILS); }} className="bg-brand-dark text-white p-4 rounded-xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
                    <div>
                      <div className="text-[10px] text-brand-primary font-bold uppercase mb-1">{m.sport} • {m.status}</div>
                      <div className="text-sm font-bold">{m.scoreA} vs {m.scoreB}</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                 </div>
               ))}
             </div>
          </section>
        )}

        {/* TRENDING (Grid) */}
        <section className="px-4">
           <SectionHeader title="Trending Now" action="See All" />
           {loading ? (
              <div className="grid grid-cols-1 gap-4">
                 <SkeletonLoader height="h-32" />
                 <SkeletonLoader height="h-32" />
              </div>
           ) : (
              <div className="grid grid-cols-1 gap-4">
                {trendingTournaments.slice(0, 3).map(t => (
                  <TournamentCard 
                    key={t.id} 
                    tournament={t} 
                    onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
                    isFollowed={user?.tournamentsFollowed.includes(t.id) || false}
                    onToggleFollow={(e) => { e.stopPropagation(); toggleFollowTournament(t.id); }}
                  />
                ))}
              </div>
           )}
        </section>

        {/* NEARBY (Horizontal) */}
        {nearbyTournaments.length > 0 && (
           <section className="px-4">
             <SectionHeader title="Near You" />
             <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">
               {nearbyTournaments.map(t => (
                 <div key={t.id} className="min-w-[240px] snap-center">
                    <TournamentCard 
                      tournament={t} 
                      onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
                      isFollowed={user?.tournamentsFollowed.includes(t.id) || false}
                      onToggleFollow={(e) => { e.stopPropagation(); toggleFollowTournament(t.id); }}
                    />
                 </div>
               ))}
             </div>
           </section>
        )}

        {/* RECOMMENDED */}
        <section className="px-4">
           <SectionHeader title="Recommended For You" />
           {loading ? (
             <SkeletonLoader height="h-32" />
           ) : (
             <div className="space-y-4">
                {recommendedTournaments.length > 0 ? recommendedTournaments.slice(0, 2).map(t => (
                  <TournamentCard 
                    key={t.id} 
                    tournament={t} 
                    onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }}
                    isFollowed={user?.tournamentsFollowed.includes(t.id) || false}
                    onToggleFollow={(e) => { e.stopPropagation(); toggleFollowTournament(t.id); }}
                  />
                )) : (
                  <div className="text-center text-gray-500 text-sm p-4">Update your sports preferences to see recommendations.</div>
                )}
             </div>
           )}
        </section>

      </div>
    </PageContainer>
  );
};

const SearchFilterView: React.FC<{ setDetailId: (id: string) => void, setView: (v: AppView) => void }> = ({ setDetailId, setView }) => {
  const { tournaments } = useAppContext();
  const [query, setQuery] = useState('');

  const filtered = tournaments.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <PageContainer>
      <TopAppBar title="Discover" />
      <div className="p-4 sticky top-16 bg-[#F5F5F5] z-30 pb-2">
        <div className="relative">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input 
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-0 font-medium shadow-sm"
            placeholder="Find tournaments, teams..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {filtered.map(t => (
          <Card key={t.id} onClick={() => { setDetailId(t.id); setView(AppView.TOURNAMENT_DETAILS); }} className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-primary rounded-lg flex flex-col items-center justify-center border-2 border-brand-black shadow-[2px_2px_0_black]">
              <Trophy size={20} className="text-brand-black" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-brand-black">{t.name}</h4>
              <p className="text-xs text-gray-500 font-medium">{t.sport} • {t.location}</p>
            </div>
            <ChevronRight className="text-gray-300" size={20} />
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

const CreateTournamentView: React.FC<{ setView: (v: AppView) => void }> = ({ setView }) => {
  const { createTournament, user } = useAppContext();
  const [form, setForm] = useState<Partial<Tournament>>({
    name: '',
    sport: SportType.CRICKET,
    location: user?.location || '',
    description: ''
  });

  const handleCreate = () => {
    createTournament({
      ...form,
      organizerId: user?.id,
      startDate: new Date().toISOString(),
      status: TournamentStatus.UPCOMING
    });
    setView(AppView.MY_TOURNAMENTS);
  };

  return (
    <PageContainer>
      <TopAppBar title="Host Event" />
      <div className="p-4 space-y-5">
        <Card>
          <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">Basic Details</h3>
          <Input 
            label="Tournament Name" 
            placeholder="e.g. Sunday Super League" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          
          <Select 
            label="Sport Type" 
            value={form.sport} 
            onChange={e => setForm({...form, sport: e.target.value as SportType})}
          >
            {Object.values(SportType).map(s => <option key={s} value={s}>{s}</option>)}
          </Select>

          <Input 
            label="Location / Venue" 
            placeholder="e.g. Indiranagar Turf" 
            value={form.location} 
            onChange={e => setForm({...form, location: e.target.value})} 
          />
        </Card>

        <Card>
          <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">Format & Rules</h3>
           <div className="mb-4">
            <label className="block text-xs font-bold text-brand-gray uppercase tracking-wider mb-1">Description</label>
            <textarea 
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-0 font-medium h-32 resize-none"
              placeholder="Entry fees, squad size, match duration..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>
        </Card>

        <ActionButton fullWidth onClick={handleCreate}>CREATE & LAUNCH</ActionButton>
      </div>
    </PageContainer>
  );
};

const MatchDetailView: React.FC<{ id: string, onBack: () => void }> = ({ id, onBack }) => {
  const { matches, teams } = useAppContext();
  const match = matches.find(m => m.id === id);
  
  if (!match) return <div>Match Not Found</div>;
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);

  return (
    <PageContainer>
      <TopAppBar title="Match Center" showBack onBack={onBack} />
      
      {/* Scoreboard */}
      <div className="bg-brand-dark text-white pb-10 pt-6 px-6 rounded-b-[30px] relative shadow-xl">
        <div className="flex justify-between items-center mb-8">
           <div className="flex flex-col items-center w-1/3">
             <div className="w-20 h-20 bg-white/10 rounded-full mb-3 flex items-center justify-center border-2 border-brand-primary">
               <span className="text-2xl font-black text-brand-primary">{teamA?.name[0]}</span>
             </div>
             <h3 className="font-bold text-sm text-center leading-tight">{teamA?.name}</h3>
           </div>
           
           <div className="w-1/3 flex flex-col items-center">
              <StatusBadge status={match.status} />
              <div className="text-3xl font-black text-brand-primary mt-4 tracking-tighter">
                {match.scoreA}
              </div>
              <div className="text-xs text-gray-400 my-1">VS</div>
              <div className="text-3xl font-black text-brand-primary tracking-tighter">
                {match.scoreB}
              </div>
           </div>

           <div className="flex flex-col items-center w-1/3">
             <div className="w-20 h-20 bg-white/10 rounded-full mb-3 flex items-center justify-center border-2 border-white/20">
               <span className="text-2xl font-black text-white">{teamB?.name[0]}</span>
             </div>
             <h3 className="font-bold text-sm text-center leading-tight">{teamB?.name}</h3>
           </div>
        </div>
        
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-11/12 bg-white p-3 rounded-xl shadow-lg flex justify-between items-center text-xs font-bold text-gray-500 border border-gray-100">
           <span className="flex items-center gap-1"><MapPin size={14} className="text-brand-primary"/> {match.location}</span>
           <span>{match.sport}</span>
        </div>
      </div>

      <div className="mt-10 px-4">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 uppercase italic">
          <div className="p-1.5 bg-brand-primary text-brand-black rounded-md"><Clock size={16}/></div>
          Live Commentary
        </h3>
        
        <div className="space-y-0 relative">
          <div className="absolute left-[22px] top-4 bottom-4 w-0.5 bg-gray-200"></div>
          {match.commentary.sort((a,b) => b.timestamp - a.timestamp).map((c) => (
             <div key={c.id} className="relative pl-12 py-2 group">
               <div className="absolute left-[14px] top-4 w-4 h-4 bg-white border-4 border-brand-dark rounded-full z-10 group-first:border-brand-primary transition-colors"></div>
               <Card className="p-3 border-l-4 border-l-brand-dark group-first:border-l-brand-primary">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{c.type}</span>
                    <span className="text-[10px] font-mono text-gray-400">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="font-medium text-sm text-brand-black">{c.text}</p>
               </Card>
             </div>
          ))}
          {match.commentary.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm font-medium italic">
              Match hasn't started yet. Stay tuned!
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

const ProfileView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAppContext();
  
  return (
    <PageContainer>
      <TopAppBar title="My Profile" rightAction={<button onClick={onLogout}><LogOut size={20} className="text-red-500 hover:text-red-700"/></button>} />
      
      <div className="bg-brand-primary pt-6 pb-16 px-6 relative mb-12">
         <div className="flex flex-col items-center relative z-10">
            <div className="w-28 h-28 rounded-full bg-brand-black p-1 mb-4 shadow-xl">
               <img src={user?.avatar} className="w-full h-full rounded-full object-cover border-2 border-white" alt="Avatar"/>
            </div>
            <h2 className="text-2xl font-black text-brand-black">{user?.name}</h2>
            <p className="font-medium text-brand-dark/70 text-sm">{user?.id}</p>
            {user?.location && <p className="flex items-center gap-1 text-xs font-bold mt-2"><MapPin size={10}/> {user.location}</p>}
         </div>
         {/* Curved Separator */}
         <div className="absolute bottom-0 left-0 w-full h-10 bg-[#F5F5F5] rounded-t-[30px]"></div>
      </div>

      <div className="px-4 -mt-6 relative z-20 space-y-4">
         <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center justify-center py-6">
               <span className="text-3xl font-black text-brand-primary stroke-black drop-shadow-sm">{user?.tournamentsCreated.length}</span>
               <span className="text-xs font-bold text-gray-400 uppercase mt-1">Hosted</span>
            </Card>
            <Card className="flex flex-col items-center justify-center py-6">
               <span className="text-3xl font-black text-brand-primary drop-shadow-sm">{user?.tournamentsJoined.length || 0}</span>
               <span className="text-xs font-bold text-gray-400 uppercase mt-1">Played</span>
            </Card>
         </div>
         
         {user?.preferredSports && user.preferredSports.length > 0 && (
           <Card>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {user.preferredSports.map(s => (
                  <span key={s} className="px-2 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-600">{s}</span>
                ))}
              </div>
           </Card>
         )}

         <Card className="space-y-1">
           <MenuItem icon={<Edit2 size={18}/>} label="Edit Profile" />
           <div className="h-px bg-gray-100"></div>
           <MenuItem icon={<Bell size={18}/>} label="Notifications" />
           <div className="h-px bg-gray-100"></div>
           <MenuItem icon={<Share2 size={18}/>} label="Share App" />
         </Card>

         <div className="text-center text-xs text-gray-400 font-bold mt-8">
            TournaMate v1.0.0
         </div>
      </div>
    </PageContainer>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <button className="w-full py-3 px-2 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors group">
     <div className="flex items-center gap-3 text-brand-gray group-hover:text-brand-black">
       {icon}
       <span className="font-medium">{label}</span>
     </div>
     <ChevronRight size={16} className="text-gray-300" />
  </button>
);

// --- Main App Logic ---

const AppContent: React.FC = () => {
  const { user } = useAppContext();
  const [view, setView] = useState<AppView>(AppView.SPLASH);
  const [detailId, setDetailId] = useState<string>('');

  // Auto-redirect based on auth state
  useEffect(() => {
    if (view === AppView.SPLASH) return; // Wait for splash

    if (!user) {
       if (view !== AppView.LOGIN && view !== AppView.SIGNUP) {
         setView(AppView.LOGIN);
       }
    } else {
      // If user exists but has no location/sports, force profile setup
      const isProfileIncomplete = !user.location || user.preferredSports.length === 0;
      
      if (isProfileIncomplete) {
        if (view !== AppView.PROFILE_SETUP) {
           setView(AppView.PROFILE_SETUP);
        }
      } else {
        // Profile is complete. Only redirect if currently on an auth/onboarding page
        if (view === AppView.LOGIN || view === AppView.SIGNUP || view === AppView.PROFILE_SETUP) {
          setView(AppView.HOME);
        }
      }
    }
  }, [user, view]);

  const handleSplashFinish = () => {
    if (user) {
      if (!user.location || user.preferredSports.length === 0) {
        setView(AppView.PROFILE_SETUP);
      } else {
        setView(AppView.HOME);
      }
    } else {
      setView(AppView.LOGIN);
    }
  };

  switch (view) {
    case AppView.SPLASH:
      return <SplashPage onFinish={handleSplashFinish} />;
    case AppView.LOGIN:
      return <LoginView onSignupClick={() => setView(AppView.SIGNUP)} onSuccess={() => setView(AppView.HOME)} />;
    case AppView.SIGNUP:
      return <SignupView onLoginClick={() => setView(AppView.LOGIN)} onSuccess={() => setView(AppView.PROFILE_SETUP)} />;
    case AppView.PROFILE_SETUP:
      return <ProfileSetupView onFinish={() => setView(AppView.HOME)} />;
    case AppView.TOURNAMENT_DETAILS:
      return <div className="pb-24"><TopAppBar title="Tournament" showBack onBack={() => setView(AppView.HOME)} /> <div className="p-4">Details for {detailId}</div></div>;
    case AppView.MATCH_DETAILS:
      return <MatchDetailView id={detailId} onBack={() => setView(AppView.HOME)} />;
    case AppView.CREATE_TOURNAMENT:
      return <div className="h-screen flex flex-col"><CreateTournamentView setView={setView} /><BottomNavigation current={view} onChange={setView} /></div>;
    case AppView.MY_TOURNAMENTS:
      return (
        <PageContainer>
           <TopAppBar title="My Games" />
           <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 opacity-50">
             <Trophy size={64} className="mb-4 text-gray-300"/>
             <h3 className="font-bold text-lg">No Tournaments Yet</h3>
             <p className="text-sm text-gray-500 mt-2">Join a tournament or host your own to get started.</p>
           </div>
           <BottomNavigation current={view} onChange={setView} />
        </PageContainer>
      );
    default:
      // Authenticated Tabbed Views
      return (
        <div className="min-h-screen bg-[#F5F5F5]">
          {view === AppView.HOME && <HomeView setView={setView} setDetailId={setDetailId} />}
          {view === AppView.SEARCH && <SearchFilterView setView={setView} setDetailId={setDetailId} />}
          {view === AppView.PROFILE && <ProfileView onLogout={() => setView(AppView.LOGIN)} />}
          <BottomNavigation current={view} onChange={setView} />
        </div>
      );
  }
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  
  // Load user from local storage on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('tournamate_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check against mock users first
    let foundUser = MOCK_USERS.find(u => u.email === email);
    
    if (!foundUser) {
       const stored = localStorage.getItem('tournamate_user');
       if (stored) {
         const u = JSON.parse(stored);
         if (u.email === email) foundUser = u;
       }
    }

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('tournamate_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    if (MOCK_USERS.some(u => u.email === email)) return false;
    
    const newUser: User = {
      id: generateUserId(name),
      name,
      email,
      password, // In real app, hash this
      avatar: `https://ui-avatars.com/api/?name=${name}&background=FDD835&color=000`,
      preferredSports: [],
      tournamentsCreated: [],
      tournamentsJoined: [],
      tournamentsFollowed: []
    };
    
    setUser(newUser);
    localStorage.setItem('tournamate_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tournamate_user');
  };

  const completeProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('tournamate_user', JSON.stringify(updated));
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('tournamate_user', JSON.stringify(updated));
  };

  const createTournament = (t: Partial<Tournament>) => {
    const newT: Tournament = {
      ...(t as Tournament),
      id: generateTournamentId(),
      matches: [],
      teams: []
    };
    setTournaments([newT, ...tournaments]);
    if (user) {
      const updatedUser = { ...user, tournamentsCreated: [...user.tournamentsCreated, newT.id] };
      setUser(updatedUser);
      localStorage.setItem('tournamate_user', JSON.stringify(updatedUser));
    }
  };

  const addCommentary = (matchId: string, text: string, type: any) => {
    setMatches(prev => prev.map(m => m.id === matchId ? {
      ...m, commentary: [...m.commentary, { id: `c_${Date.now()}`, timestamp: Date.now(), text, type }]
    } : m));
  };

  const toggleFollowTournament = (id: string) => {
    if (!user) return;
    const isFollowing = user.tournamentsFollowed.includes(id);
    let newFollows;
    if (isFollowing) {
      newFollows = user.tournamentsFollowed.filter(tid => tid !== id);
    } else {
      newFollows = [...user.tournamentsFollowed, id];
    }
    const updated = { ...user, tournamentsFollowed: newFollows };
    setUser(updated);
    localStorage.setItem('tournamate_user', JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{
      user, users: MOCK_USERS, tournaments, matches, teams: MOCK_TEAMS,
      login, signup, logout, completeProfile, updateUser,
      createTournament, addCommentary, toggleFollowTournament
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
