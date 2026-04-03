import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// ============================================================
// SECTION 1 — AUTHENTICATION
// ============================================================

export const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName });
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      photoURL: null,
      createdAt: new Date(),
      totalMinutes: 0,
      streak: 0,
      longestStreak: 0,
      sessionsCompleted: 0,
      lastSessionDate: null,
      notificationsEnabled: true,
      reminderTime: '08:00',
      bio: '',
    });
    return user;
  } catch (error) {
    throw error;
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// ============================================================
// SECTION 2 — USER PROFILE
// ============================================================

export const getUserData = async (userId) => {
  try {
    console.log('🔍 Looking for user doc:', userId);
    console.log('🔍 db instance:', db.app.name, db._databaseId?.database);
    
    const docRef = doc(db, 'users', userId);
    console.log('🔍 docRef path:', docRef.path);
    
    const docSnap = await getDoc(docRef);
    console.log('🔍 docSnap exists:', docSnap.exists());
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUserData = async (userId, data) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, data);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// ============================================================
// SECTION 3 — MEDITATION SESSIONS & PROGRESS
// ============================================================

export const getAllMeditations = async () => {
  try {
    // No orderBy = no composite index needed, sort client-side
    const querySnapshot = await getDocs(collection(db, 'meditations'));
    const meditations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return meditations.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return (a.title ?? '').localeCompare(b.title ?? '');
    });
  } catch (error) {
    console.error('Error fetching meditations:', error);
    return [];
  }
};

export const getMeditationById = async (meditationId) => {
  try {
    const docRef = doc(db, 'meditations', meditationId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching meditation:', error);
    return null;
  }
};

export const getMeditationsByCategory = async (category) => {
  try {
    const q = query(collection(db, 'meditations'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching meditations by category:', error);
    return [];
  }
};

export const logMeditationSession = async (userId, sessionData) => {
  try {
    const now = new Date();

    // 1. Save session record
    const sessionRef = await addDoc(collection(db, 'sessions'), {
      uid: userId,
      meditationId: sessionData.meditationId,
      meditationTitle: sessionData.meditationTitle,
      duration: sessionData.duration,
      category: sessionData.category || 'general',
      completedAt: now,
    });

    console.log('📝 Session saved:', sessionRef.id);

    // 2. Fetch current user data
    const userData = await getUserData(userId);
    console.log('👤 userData:', userData ? 'found' : 'NOT FOUND');

    if (!userData) {
      console.error('❌ Cannot update stats — user document not found for uid:', userId);
      return sessionRef.id;
    }

    const todayStr = now.toISOString().split('T')[0];
    let newStreak = userData.streak || 0;
    let longestStreak = userData.longestStreak || 0;

    if (userData.lastSessionDate) {
      const last = userData.lastSessionDate instanceof Date
        ? userData.lastSessionDate
        : userData.lastSessionDate.toDate
          ? userData.lastSessionDate.toDate()
          : new Date(userData.lastSessionDate);
      const lastStr = last.toISOString().split('T')[0];
      const diffDays = Math.floor(
        (new Date(todayStr) - new Date(lastStr)) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 0) {
        // Same day — no streak change
      } else if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    if (newStreak > longestStreak) longestStreak = newStreak;

    const newSessionsCompleted = (userData.sessionsCompleted || 0) + 1;
    const newTotalMinutes = (userData.totalMinutes || 0) + (sessionData.duration || 0);

    // 3. Update user stats — use new Date() not Timestamp
    const updated = await updateUserData(userId, {
      totalMinutes: newTotalMinutes,
      sessionsCompleted: newSessionsCompleted,
      streak: newStreak,
      longestStreak: longestStreak,
      lastSessionDate: now,
    });

    console.log('📊 Stats updated:', updated, { newSessionsCompleted, newStreak, newTotalMinutes });

    // 4. Check and award achievements
    await checkAndAwardAchievements(userId, {
      sessionsCompleted: newSessionsCompleted,
      streak: newStreak,
      totalMinutes: newTotalMinutes,
    });

    return sessionRef.id;
  } catch (error) {
    console.error('Error logging session:', error);
    return null;
  }
};

export const getUserSessions = async (userId) => {
  try {
    const q = query(
      collection(db, 'sessions'),
      where('uid', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
};

export const getRecentSessions = async (userId, days = 7) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const q = query(
      collection(db, 'sessions'),
      where('uid', '==', userId),
      where('completedAt', '>=', since),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }
};

export const getUserProgressStats = async (userId) => {
  try {
    const [userData, recentSessions] = await Promise.all([
      getUserData(userId),
      getRecentSessions(userId, 7),
    ]);
    const weeklyMinutes = recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    return {
      totalMinutes:      userData?.totalMinutes      || 0,
      sessionsCompleted: userData?.sessionsCompleted  || 0,
      streak:            userData?.streak             || 0,
      longestStreak:     userData?.longestStreak      || 0,
      weeklyMinutes,
      recentSessions,
    };
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    return null;
  }
};

// ============================================================
// SECTION 4 — MOOD TRACKING
// ============================================================

export const saveMoodEntry = async (userId, moodData) => {
  try {
    const docRef = await addDoc(collection(db, 'moods'), {
      uid: userId,
      mood:       moodData.mood,
      intensity:  moodData.intensity,
      activities: moodData.activities || [],
      notes:      moodData.notes || '',
      timestamp:  new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving mood:', error);
    return null;
  }
};

export const getUserMoods = async (userId) => {
  try {
    const q = query(
      collection(db, 'moods'),
      where('uid', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching moods:', error);
    return [];
  }
};

export const getRecentMoods = async (userId, days = 30) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const q = query(
      collection(db, 'moods'),
      where('uid', '==', userId),
      where('timestamp', '>=', since),
      orderBy('timestamp', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching recent moods:', error);
    return [];
  }
};

export const deleteMoodEntry = async (moodId) => {
  try {
    await deleteDoc(doc(db, 'moods', moodId));
    return true;
  } catch (error) {
    console.error('Error deleting mood:', error);
    return false;
  }
};

// ============================================================
// SECTION 5 — WELLNESS JOURNAL
// ============================================================

export const saveJournalEntry = async (userId, entryData) => {
  try {
    const docRef = await addDoc(collection(db, 'journals'), {
      uid:       userId,
      title:     entryData.title || 'My Entry',
      prompt:    entryData.prompt || '',
      entry:     entryData.entry,
      mood:      entryData.mood || null,
      tags:      entryData.tags || [],
      timestamp: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return null;
  }
};

export const updateJournalEntry = async (entryId, updatedData) => {
  try {
    const entryRef = doc(db, 'journals', entryId);
    await updateDoc(entryRef, { ...updatedData, updatedAt: new Date() });
    return true;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return false;
  }
};

export const deleteJournalEntry = async (entryId) => {
  try {
    await deleteDoc(doc(db, 'journals', entryId));
    return true;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return false;
  }
};

export const getUserJournalEntries = async (userId) => {
  try {
    const q = query(
      collection(db, 'journals'),
      where('uid', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
};

// ============================================================
// SECTION 6 — MENTAL HEALTH QUIZ
// ============================================================

export const saveQuizResult = async (userId, quizData) => {
  try {
    const docRef = await addDoc(collection(db, 'quizResults'), {
      uid:             userId,
      quizId:          quizData.quizId,
      quizTitle:       quizData.quizTitle,
      score:           quizData.score,
      maxScore:        quizData.maxScore || 100,
      category:        quizData.category || 'general',
      resultLabel:     quizData.resultLabel || '',
      answers:         quizData.answers || [],
      recommendations: quizData.recommendations || [],
      timestamp:       new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return null;
  }
};

export const getUserQuizResults = async (userId) => {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('uid', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return [];
  }
};

export const getLatestQuizResult = async (userId, quizId) => {
  try {
    const q = query(
      collection(db, 'quizResults'),
      where('uid', '==', userId),
      where('quizId', '==', quizId),
      orderBy('timestamp', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const d = querySnapshot.docs[0];
      return { id: d.id, ...d.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching latest quiz result:', error);
    return null;
  }
};

// ============================================================
// SECTION 7 — GOALS & ACHIEVEMENTS
// ============================================================

export const createGoal = async (userId, goalData) => {
  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      uid:          userId,
      title:        goalData.title,
      description:  goalData.description || '',
      type:         goalData.type || 'custom',
      targetValue:  goalData.targetValue || 1,
      currentValue: 0,
      isCompleted:  false,
      deadline:     goalData.deadline ? new Date(goalData.deadline) : null,
      createdAt:    new Date(),
      completedAt:  null,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating goal:', error);
    return null;
  }
};

export const updateGoalProgress = async (goalId, currentValue, targetValue) => {
  try {
    const goalRef = doc(db, 'goals', goalId);
    const isCompleted = currentValue >= targetValue;
    await updateDoc(goalRef, {
      currentValue,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    });
    return true;
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return false;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    await deleteDoc(doc(db, 'goals', goalId));
    return true;
  } catch (error) {
    console.error('Error deleting goal:', error);
    return false;
  }
};

export const getUserGoals = async (userId) => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export const getUserAchievements = async (userId) => {
  try {
    const q = query(
      collection(db, 'achievements'),
      where('uid', '==', userId),
      orderBy('awardedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
};

export const checkAndAwardAchievements = async (userId, stats) => {
  const milestones = [
    { id: 'first_session',  title: 'First Step',             description: 'Completed your first meditation session!', icon: '🌱', condition: stats.sessionsCompleted >= 1  },
    { id: 'sessions_5',     title: 'Getting Started',         description: 'Completed 5 meditation sessions.',         icon: '⭐', condition: stats.sessionsCompleted >= 5  },
    { id: 'sessions_10',    title: 'Dedicated Meditator',     description: 'Completed 10 meditation sessions.',        icon: '🏅', condition: stats.sessionsCompleted >= 10 },
    { id: 'sessions_25',    title: 'Mindfulness Enthusiast',  description: 'Completed 25 meditation sessions.',        icon: '🌟', condition: stats.sessionsCompleted >= 25 },
    { id: 'sessions_50',    title: 'Inner Light Master',      description: 'Completed 50 meditation sessions!',        icon: '🏆', condition: stats.sessionsCompleted >= 50 },
    { id: 'streak_3',       title: '3-Day Streak',            description: 'Meditated 3 days in a row.',              icon: '🔥', condition: stats.streak >= 3  },
    { id: 'streak_7',       title: 'Week Warrior',            description: 'Meditated 7 days in a row!',              icon: '💪', condition: stats.streak >= 7  },
    { id: 'streak_30',      title: 'Monthly Master',          description: 'Meditated 30 days in a row!',             icon: '👑', condition: stats.streak >= 30 },
    { id: 'minutes_60',     title: '1 Hour of Peace',         description: 'Accumulated 60 total minutes.',           icon: '🕐', condition: stats.totalMinutes >= 60  },
    { id: 'minutes_300',    title: '5 Hours of Calm',         description: 'Accumulated 300 total minutes.',          icon: '🧘', condition: stats.totalMinutes >= 300 },
  ];

  try {
    const existing = await getUserAchievements(userId);
    const existingIds = existing.map((a) => a.achievementId);
    for (const milestone of milestones) {
      if (milestone.condition && !existingIds.includes(milestone.id)) {
        await addDoc(collection(db, 'achievements'), {
          uid:           userId,
          achievementId: milestone.id,
          title:         milestone.title,
          description:   milestone.description,
          icon:          milestone.icon,
          awardedAt:     new Date(),
        });
        console.log('🏆 Achievement awarded:', milestone.title);
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};

// ============================================================
// SECTION 8 — FAVORITES
// ============================================================

export const addFavorite = async (userId, meditationId) => {
  try {
    const favoriteId = `${userId}_${meditationId}`;
    await setDoc(doc(db, 'favorites', favoriteId), {
      uid: userId,
      meditationId,
      addedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

export const removeFavorite = async (userId, meditationId) => {
  try {
    const favoriteId = `${userId}_${meditationId}`;
    await deleteDoc(doc(db, 'favorites', favoriteId));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

export const isFavorite = async (userId, meditationId) => {
  try {
    const favoriteId = `${userId}_${meditationId}`;
    const docSnap = await getDoc(doc(db, 'favorites', favoriteId));
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const getUserFavorites = async (userId) => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('uid', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const favoriteIds = querySnapshot.docs.map((d) => d.data().meditationId);
    const meditations = await Promise.all(favoriteIds.map((id) => getMeditationById(id)));
    return meditations.filter(Boolean);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};

// ============================================================
// SECTION 9 — SLEEP STORIES
// ============================================================

export const getAllSleepStories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'sleepStories'));
    const stories = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return stories.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
  } catch (error) {
    console.error('Error fetching sleep stories:', error);
    return [];
  }
};

export const getSleepStoryById = async (storyId) => {
  try {
    const docRef = doc(db, 'sleepStories', storyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching sleep story:', error);
    return null;
  }
};

export const logSleepStoryView = async (userId, storyId, storyTitle) => {
  try {
    await addDoc(collection(db, 'sleepStoryViews'), {
      uid: userId,
      storyId,
      storyTitle,
      viewedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error('Error logging sleep story view:', error);
    return false;
  }
};

// ============================================================
// SECTION 10 — MOTIVATIONAL QUOTES
// ============================================================

export const getDailyQuote = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'quotes'));
    const quotes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (quotes.length === 0) return null;
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    return quotes[dayOfYear % quotes.length];
  } catch (error) {
    console.error('Error fetching daily quote:', error);
    return null;
  }
};

export const getAllQuotes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'quotes'));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
};

// ============================================================
// SECTION 11 — NOTIFICATION PREFERENCES
// ============================================================

export const updateNotificationSettings = async (userId, settings) => {
  try {
    await updateUserData(userId, {
      notificationsEnabled: settings.notificationsEnabled,
      reminderTime:         settings.reminderTime || '08:00',
      expoPushToken:        settings.expoPushToken || null,
    });
    return true;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return false;
  }
};

export const getNotificationSettings = async (userId) => {
  try {
    const userData = await getUserData(userId);
    return {
      notificationsEnabled: userData?.notificationsEnabled ?? true,
      reminderTime:         userData?.reminderTime         ?? '08:00',
      expoPushToken:        userData?.expoPushToken        ?? null,
    };
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return null;
  }
};