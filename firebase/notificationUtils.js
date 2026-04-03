import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { updateUserData } from './firebaseUtils';

// ── Configure how notifications appear when app is open ──────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ── Request notification permissions ─────────────────────────
export const requestNotificationPermissions = async () => {
  try {
    if (Platform.OS === 'web') {
      console.log('Push notifications not supported on web');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// ── Get Expo Push Token ───────────────────────────────────────
export const getExpoPushToken = async () => {
  try {
    if (Platform.OS === 'web') return null;

    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

// ── Schedule daily meditation reminder ───────────────────────
export const scheduleDailyReminder = async (hour = 8, minute = 0) => {
  try {
    if (Platform.OS === 'web') return null;

    // Cancel existing reminders first
    await cancelAllReminders();

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧘 Time to Meditate',
        body: 'Your daily mindfulness session is waiting. Take a moment for yourself.',
        sound: true,
        data: { type: 'daily_reminder' },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    console.log('✅ Daily reminder scheduled at', `${hour}:${minute.toString().padStart(2, '0')}`);
    return identifier;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
};

// ── Cancel all scheduled notifications ───────────────────────
export const cancelAllReminders = async () => {
  try {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All reminders cancelled');
  } catch (error) {
    console.error('Error cancelling reminders:', error);
  }
};

// ── Send immediate local notification ────────────────────────
export const sendLocalNotification = async (title, body, data = {}) => {
  try {
    if (Platform.OS === 'web') return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
      },
      trigger: null, // null = send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// ── Send session complete notification ───────────────────────
export const sendSessionCompleteNotification = async (meditationTitle, duration) => {
  await sendLocalNotification(
    '🎉 Session Complete!',
    `You just completed ${duration} minutes of ${meditationTitle}. Amazing work!`,
    { type: 'session_complete' }
  );
};

// ── Send streak notification ──────────────────────────────────
export const sendStreakNotification = async (streakCount) => {
  const messages = {
    3:  '🔥 3-day streak! You\'re building a great habit!',
    7:  '💪 7-day streak! One full week of mindfulness!',
    14: '🌟 2-week streak! You\'re on fire!',
    30: '👑 30-day streak! You\'re a mindfulness master!',
  };

  const message = messages[streakCount];
  if (message) {
    await sendLocalNotification(
      `🔥 ${streakCount}-Day Streak!`,
      message,
      { type: 'streak_milestone', streak: streakCount }
    );
  }
};

// ── Setup notifications for a user ───────────────────────────
export const setupNotificationsForUser = async (userId, reminderTime = '08:00') => {
  try {
    if (Platform.OS === 'web') return false;

    const granted = await requestNotificationPermissions();
    if (!granted) return false;

    const token = await getExpoPushToken();

    // Parse reminder time
    const [hour, minute] = reminderTime.split(':').map(Number);
    await scheduleDailyReminder(hour, minute);

    // Save token to Firestore
    if (token && userId) {
      await updateUserData(userId, { expoPushToken: token });
    }

    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

// ── Get all scheduled notifications (for debugging) ──────────
export const getScheduledNotifications = async () => {
  try {
    if (Platform.OS === 'web') return [];
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduled.length);
    return scheduled;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};