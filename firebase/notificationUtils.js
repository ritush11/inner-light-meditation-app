import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'inner-light-default';

// ── How notifications appear when app is in foreground ────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Set up Android notification channel ───────────────────────
// Required for Android 8+ (API 26+). Must be called before
// scheduling any notifications on Android.
export const setupNotificationChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name:             'Inner Light Reminders',
    importance:       Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor:       '#2DD4BF',
    sound:            true,
  });
};

// ── Request permissions ───────────────────────────────────────
// On iOS this shows the system permission popup.
// On Android 13+ (API 33+) this is also required.
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return false;
  try {
    await setupNotificationChannel();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

// ── Schedule daily meditation reminder ────────────────────────
// Works on physical iOS device (Expo Go) and physical Android device.
// Does NOT work on simulators or web.
export const scheduleDailyReminder = async (hour = 8, minute = 0) => {
  if (Platform.OS === 'web') return null;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;

    await Notifications.cancelAllScheduledNotificationsAsync();

    // iOS and Android use different trigger formats
    const trigger = Platform.OS === 'ios'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: CHANNEL_ID,
        };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Meditate',
        body:  'Your daily mindfulness session is waiting. Take a moment for yourself.',
        sound: true,
        data:  { type: 'daily_reminder' },
      },
      trigger,
    });

    return id;
  } catch (err) {
    console.error('Schedule reminder error:', err.message);
    return null;
  }
};

// ── Cancel all scheduled notifications ───────────────────────
export const cancelAllReminders = async () => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
};

// ── Send an immediate local notification ─────────────────────
// trigger: null = fires instantly. Works on iOS + Android physical device.
export const sendLocalNotification = async (title, body, data = {}) => {
  if (Platform.OS === 'web') return;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data,
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: null,
    });
  } catch (err) {
    console.error('Send notification error:', err.message);
  }
};

// ── Session complete notification ─────────────────────────────
export const sendSessionCompleteNotification = async (title, duration) => {
  await sendLocalNotification(
    'Session Complete!',
    `You completed ${duration} min of "${title}". Great work!`,
    { type: 'session_complete' }
  );
};

// ── Streak milestone notification ─────────────────────────────
export const sendStreakNotification = async (streak) => {
  const milestones = {
    3:  { title: '3-Day Streak!',  body: "You're building a great habit!" },
    7:  { title: '7-Day Streak!',  body: 'One full week of mindfulness!' },
    14: { title: '14-Day Streak!', body: "Two weeks strong — you're on fire!" },
    30: { title: '30-Day Streak!', body: "30 days! You're a mindfulness master!" },
  };
  const m = milestones[streak];
  if (m) await sendLocalNotification(m.title, m.body, { type: 'streak', streak });
};

// ── Achievement unlocked notification ────────────────────────
export const sendAchievementNotification = async (achievementTitle) => {
  await sendLocalNotification(
    'Achievement Unlocked!',
    `You earned: "${achievementTitle}"`,
    { type: 'achievement' }
  );
};

// ── Setup on login ────────────────────────────────────────────
export const setupNotificationsForUser = async (reminderTime = '08:00') => {
  if (Platform.OS === 'web') return false;
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return false;
    const [hour, minute] = reminderTime.split(':').map(Number);
    await scheduleDailyReminder(hour, minute);
    return true;
  } catch {
    return false;
  }
};

// ── Test notification ─────────────────────────────────────────
export const sendTestNotification = async () => {
  await sendLocalNotification(
    'Notifications Working!',
    'Inner Light notifications are set up correctly on your device.',
    { type: 'test' }
  );
};