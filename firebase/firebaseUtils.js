import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

// ========== AUTHENTICATION ==========

export const signUpUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: email,
      displayName: displayName,
      createdAt: serverTimestamp(),
      totalMinutes: 0,
      streak: 0,
      sessionsCompleted: 0,
      lastSessionDate: null,
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
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

// ========== USER DATA ==========

export const getUserData = async (userId) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUserData = async (userId, data) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
      await updateDoc(userDocRef, data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// ========== MEDITATION DATA ==========

export const getAllMeditations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'meditations'));
    const meditations = [];
    querySnapshot.forEach((doc) => {
      meditations.push({ id: doc.id, ...doc.data() });
    });
    return meditations;
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

// ========== MOOD TRACKING ==========

export const saveMoodEntry = async (userId, moodData) => {
  try {
    const docRef = await addDoc(collection(db, 'moods'), {
      uid: userId,
      mood: moodData.mood,
      intensity: moodData.intensity,
      activities: moodData.activities,
      notes: moodData.notes,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving mood:', error);
    return null;
  }
};

export const getUserMoods = async (userId) => {
  try {
    const q = query(collection(db, 'moods'), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    const moods = [];
    querySnapshot.forEach((doc) => {
      moods.push({ id: doc.id, ...doc.data() });
    });
    return moods;
  } catch (error) {
    console.error('Error fetching moods:', error);
    return [];
  }
};

// ========== JOURNAL ENTRIES ==========

export const saveJournalEntry = async (userId, entryData) => {
  try {
    const docRef = await addDoc(collection(db, 'journals'), {
      uid: userId,
      prompt: entryData.prompt,
      entry: entryData.entry,
      mood: entryData.mood,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return null;
  }
};

export const getUserJournalEntries = async (userId) => {
  try {
    const q = query(collection(db, 'journals'), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return [];
  }
};

// ========== QUIZ RESULTS ==========

export const saveQuizResult = async (userId, quizData) => {
  try {
    const docRef = await addDoc(collection(db, 'quizResults'), {
      uid: userId,
      quizId: quizData.quizId,
      quizTitle: quizData.quizTitle,
      score: quizData.score,
      answers: quizData.answers,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    return null;
  }
};

export const getUserQuizResults = async (userId) => {
  try {
    const q = query(collection(db, 'quizResults'), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return [];
  }
};