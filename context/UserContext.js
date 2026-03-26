import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { createContext, useState } from 'react';
import { db } from '../firebase/firebaseConfig';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  // Update user data
  const updateUserData = async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
      setUserData((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Create user profile on signup
  const createUserProfile = async (userId, email, displayName) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        email,
        displayName,
        createdAt: new Date(),
        totalMinutes: 0,
        streak: 0,
        sessionsCompleted: 0,
        favoriteSession: null,
        preferences: {
          notifications: true,
          soundEnabled: true,
          darkMode: false,
        },
      });
      fetchUserData(userId);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Add meditation session to progress
  const addMeditationSession = async (userId, sessionData) => {
    try {
      const userRef = doc(db, 'users', userId);
      const currentData = userData || {};
      
      const updatedData = {
        totalMinutes: (currentData.totalMinutes || 0) + sessionData.duration,
        sessionsCompleted: (currentData.sessionsCompleted || 0) + 1,
        lastSessionDate: new Date(),
      };

      await updateDoc(userRef, updatedData);
      setUserData((prev) => ({ ...prev, ...updatedData }));
    } catch (error) {
      console.error('Error adding meditation session:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        currentUser,
        setCurrentUser,
        fetchUserData,
        updateUserData,
        createUserProfile,
        addMeditationSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use UserContext
export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};