
import { AppNotification, NotificationType, AppView } from './types';

export const createInvitationNotification = (userId: string, type: 'TEAM' | 'VOLUNTEER', name: string, id: string): AppNotification => ({
  id: `NOTIF_${Date.now()}_${Math.random()}`,
  userId,
  type: NotificationType.INVITATION_RECEIVED,
  title: `${type === 'TEAM' ? 'Team' : 'Volunteer'} Invitation`,
  message: `You have been invited to join ${name} as a ${type === 'TEAM' ? 'player' : 'volunteer'}.`,
  actionUrl: AppView.NOTIFICATIONS,
  actionData: { invitationId: id },
  read: false,
  createdAt: new Date().toISOString(),
  icon: 'mail'
});

export const createMatchStartNotification = (userId: string, matchName: string, matchId: string): AppNotification => ({
  id: `NOTIF_${Date.now()}_${Math.random()}`,
  userId,
  type: NotificationType.MATCH_STARTING,
  title: 'Match Starting Soon',
  message: `${matchName} is starting now! Tune in for live updates.`,
  actionUrl: AppView.MATCH_DETAILS,
  actionData: { id: matchId },
  read: false,
  createdAt: new Date().toISOString(),
  icon: 'clock'
});

export const createMatchResultNotification = (userId: string, matchName: string, result: string, matchId: string): AppNotification => ({
  id: `NOTIF_${Date.now()}_${Math.random()}`,
  userId,
  type: NotificationType.MATCH_RESULT,
  title: 'Match Completed',
  message: `${matchName}: ${result}`,
  actionUrl: AppView.MATCH_DETAILS,
  actionData: { id: matchId },
  read: false,
  createdAt: new Date().toISOString(),
  icon: 'trophy'
});

export const createTournamentUpdateNotification = (userId: string, tournamentName: string, update: string, tournamentId: string): AppNotification => ({
  id: `NOTIF_${Date.now()}_${Math.random()}`,
  userId,
  type: NotificationType.TOURNAMENT_UPDATE,
  title: tournamentName,
  message: update,
  actionUrl: AppView.TOURNAMENT_DETAILS,
  actionData: { id: tournamentId },
  read: false,
  createdAt: new Date().toISOString(),
  icon: 'info'
});
