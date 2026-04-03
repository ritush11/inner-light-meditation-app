import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseConfig';
import {
  getUserData,
  getUserProgressStats,
  logMeditationSession,
  updateUserData as updateUserDataInFirestore,
} from '../firebase/firebaseUtils';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Auto-load user data when auth state changes ───────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Fetch user data from Firestore ────────────────────────
  const fetchUserData = useCallback(async (userId) => {
    try {
      setLoading(true);
      const data = await getUserData(userId);
      if (data) setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Refresh stats after a session is logged ───────────────
  // Call this from any screen after completing a session
  const refreshUserData = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      setStatsLoading(true);
      const data = await getUserData(uid);
      if (data) setUserData(data);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Update specific fields on user profile ─────────────────
  const updateUserData = useCallback(async (userId, updates) => {
    try {
      await updateUserDataInFirestore(userId, updates);
      // Update local state immediately for responsiveness
      setUserData((prev) => prev ? { ...prev, ...updates } : updates);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }, []);

  // ── Log a meditation session + auto-refresh stats ─────────
  // This replaces addMeditationSession and properly updates
  // streak, totalMinutes, sessionsCompleted and achievements
  const addMeditationSession = useCallback(async (userId, sessionData) => {
    try {
      // Log session via firebaseUtils (handles streak + achievements)
      const sessionId = await logMeditationSession(userId, {
        meditationId:    sessionData.meditationId ?? sessionData.id ?? 'unknown',
        meditationTitle: sessionData.title ?? sessionData.meditationTitle ?? 'Meditation',
        duration:        sessionData.duration ?? 0,
        category:        sessionData.category ?? 'general',
      });

      // Auto-refresh user stats so HomeScreen + ProgressScreen update
      await refreshUserData();

      return sessionId;
    } catch (error) {
      console.error('Error adding meditation session:', error);
      throw error;
    }
  }, [refreshUserData]);

  // ── Get full progress stats (for ProgressScreen) ──────────
  const getProgressStats = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    try {
      return await getUserProgressStats(uid);
    } catch (error) {
      console.error('Error getting progress stats:', error);
      return null;
    }
  }, []);

  // ── Update local stats optimistically (instant UI update) ──
  // Call this right after a session to update UI before Firestore responds
  const updateStatsOptimistically = useCallback((duration) => {
    setUserData((prev) => {
      if (!prev) return prev;
      const now = new Date();
      const lastDate = prev.lastSessionDate
        ? new Date(prev.lastSessionDate?.toDate?.() ?? prev.lastSessionDate)
        : null;
      const isNewDay = !lastDate ||
        now.toDateString() !== lastDate.toDateString();

      return {
        ...prev,
        totalMinutes:      (prev.totalMinutes || 0) + duration,
        sessionsCompleted: (prev.sessionsCompleted || 0) + 1,
        streak:            isNewDay ? (prev.streak || 0) + 1 : (prev.streak || 0),
        lastSessionDate:   now,
      };
    });
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        statsLoading,
        currentUser,
        setCurrentUser,
        fetchUserData,
        refreshUserData,
        updateUserData,
        addMeditationSession,
        getProgressStats,
        updateStatsOptimistically,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};