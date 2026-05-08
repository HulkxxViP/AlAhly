import { useCallback, useEffect, useRef } from 'react';

export function useNotifications() {
  const permissionRef = useRef<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      permissionRef.current = Notification.permission;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    permissionRef.current = result;
    return result === 'granted';
  }, []);

  const notify = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/ahly-logo.png',
        badge: '/ahly-logo.png',
        ...options,
      });
    }
  }, []);

  const notifyMatchStart = useCallback((home: string, away: string, competition: string) => {
    notify(`${home} vs ${away}`, {
      body: `${competition} — Match has started!`,
      tag: `match-${home}-${away}`,
    });
  }, [notify]);

  const notifyGoal = useCallback((home: string, away: string, scorer: string, homeScore: number, awayScore: number) => {
    notify(`GOAL! ${scorer} ⚽`, {
      body: `${home} ${homeScore}-${awayScore} ${away}`,
      tag: `goal-${Date.now()}`,
    });
  }, [notify]);

  const notifyMatchEnd = useCallback((home: string, away: string, homeScore: number, awayScore: number) => {
    notify(`Full Time: ${home} ${homeScore}-${awayScore} ${away}`, {
      body: 'Match has ended.',
      tag: `ft-${home}-${away}`,
    });
  }, [notify]);

  return { requestPermission, notify, notifyMatchStart, notifyGoal, notifyMatchEnd, permission: permissionRef.current };
}
