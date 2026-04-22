import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, reload, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from './firebase/firebaseConfig';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Main Screens
import HomeScreen from './screens/main/HomeScreen';
import MeditationDetailScreen from './screens/main/MeditationDetailScreen';
import MeditationScreen from './screens/main/MeditationScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import ProgressScreen from './screens/main/ProgressScreen';

// Feature Screens
import CallSupportScreen from './screens/main/CallSupportScreen';
import DialingScreen from './screens/main/DialingScreen';
import GoalsAchievementsScreen from './screens/main/GoalsAchievementsScreen';
import MentalHealthQuizScreen from './screens/main/MentalHealthQuizScreen';
import MoodTrackingScreen from './screens/main/MoodTrackingScreen';
import ActiveCallScreen from './screens/main/OnCallScreen';
import SleepStoriesScreen from './screens/main/SleepStoriesScreen';
import WellnessJournalScreen from './screens/main/WellnessJournalScreen';

// Context
import { UserProvider } from './context/UserContext';

// Icons + Theme

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const P = {
  teal:    '#2DD4BF',
  tealDark:'#0F766E',
  navy:    '#0A1628',
  navyMid: '#112240',
  white:   '#FFFFFF',
  muted:   '#94A3B8',
  glass:   'rgba(255,255,255,0.06)',
  glassBorder:'rgba(255,255,255,0.1)',
};

// ── Email Verification Gate Screen ────────────────────────────
const VerifyEmailScreen = ({ user }) => {
  const [resending, setResending]   = useState(false);
  const [checking, setChecking]     = useState(false);
  const [countdown, setCountdown]   = useState(0);

  const handleResend = async () => {
    setResending(true);
    try {
      await sendEmailVerification(user);
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
      }, 1000);
      Alert.alert('Email Sent ✅', 'Verification email resent. Check your inbox.');
    } catch (err) {
      Alert.alert('Error', 'Could not resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await reload(user);
      if (!user.emailVerified) {
        Alert.alert('Not Yet Verified', 'Your email has not been verified yet.\n\nPlease check your inbox and click the verification link.');
      }
      // If verified, onAuthStateChanged in App.js will auto-navigate
    } catch {
      Alert.alert('Error', 'Could not check verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
  };

  return (
    <SafeAreaView style={verifyStyles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, '#134E4A']} style={StyleSheet.absoluteFillObject} />
      <View style={verifyStyles.glow} />

      <View style={verifyStyles.content}>
        {/* Icon */}
        <LinearGradient colors={[P.teal, '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={verifyStyles.iconBox}>
          <Ionicons name="mail-outline" size={44} color={P.white} />
        </LinearGradient>

        <Text style={verifyStyles.title}>Verify Your Email</Text>
        <Text style={verifyStyles.desc}>
          We sent a verification link to:
        </Text>
        <Text style={verifyStyles.email}>{user?.email}</Text>
        <Text style={verifyStyles.subdesc}>
          Please check your inbox and click the link to activate your account. Don't forget to check your spam folder.
        </Text>

        {/* Steps */}
        <View style={verifyStyles.stepsCard}>
          {[
            { icon: 'mail-outline',          text: 'Open your email inbox' },
            { icon: 'search-outline',        text: 'Find the email from Inner Light' },
            { icon: 'checkmark-circle-outline', text: 'Click the verification link' },
          ].map((s, i) => (
            <View key={i} style={[verifyStyles.stepRow, i > 0 && verifyStyles.stepBorder]}>
              <View style={verifyStyles.stepIconBox}>
                <Ionicons name={s.icon} size={18} color={P.teal} />
              </View>
              <Text style={verifyStyles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>

        {/* Check button */}
        <TouchableOpacity onPress={handleCheckVerification} disabled={checking} activeOpacity={0.88} style={verifyStyles.primaryBtnWrap}>
          <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={verifyStyles.primaryBtn}>
            {checking ? <ActivityIndicator color={P.white} /> : (
              <>
                <Ionicons name="refresh-outline" size={18} color={P.white} />
                <Text style={verifyStyles.primaryBtnText}>I've Verified My Email</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend button */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resending || countdown > 0}
          style={[verifyStyles.secondaryBtn, (resending || countdown > 0) && { opacity: 0.5 }]}
        >
          {resending ? (
            <ActivityIndicator size="small" color={P.teal} />
          ) : (
            <Text style={verifyStyles.secondaryBtnText}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity onPress={handleLogout} style={verifyStyles.signOutBtn}>
          <Text style={verifyStyles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Navigation ────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')          iconName = focused ? 'home'        : 'home-outline';
          else if (route.name === 'Meditate') iconName = focused ? 'leaf'        : 'leaf-outline';
          else if (route.name === 'Progress') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          else if (route.name === 'Support')  iconName = focused ? 'call'        : 'call-outline';
          else if (route.name === 'Profile')  iconName = focused ? 'person'      : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor:   '#2DD4BF',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: '#0A1628',
          borderTopColor: '#112240',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarLabelStyle: { fontSize: 11, marginTop: 2, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}        options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Meditate" component={MeditationScreen}  options={{ tabBarLabel: 'Meditate' }} />
      <Tab.Screen name="Progress" component={ProgressScreen}    options={{ tabBarLabel: 'Progress' }} />
      <Tab.Screen name="Support"  component={CallSupportScreen} options={{ tabBarLabel: 'Support' }} />
      <Tab.Screen name="Profile"  component={ProfileScreen}     options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs"          component={MainTabNavigator}        />
      <Stack.Screen name="MeditationDetail"  component={MeditationDetailScreen}  />
      <Stack.Screen name="MoodTracking"      component={MoodTrackingScreen}      />
      <Stack.Screen name="Journal"           component={WellnessJournalScreen}   />
      <Stack.Screen name="Quiz"              component={MentalHealthQuizScreen}  />
      <Stack.Screen name="SleepStories"      component={SleepStoriesScreen}      />
      <Stack.Screen name="Goals"             component={GoalsAchievementsScreen} />
      <Stack.Screen name="Dialing"           component={DialingScreen}           options={{ headerShown: false, animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ActiveCall"        component={ActiveCallScreen}        options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
    </Stack.Navigator>
  );
}

// ── Ensure user document exists ───────────────────────────────
const ensureUserDocument = async (currentUser) => {
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid:               currentUser.uid,
        email:             currentUser.email,
        displayName:       currentUser.displayName || 'User',
        photoURL:          null,
        bio:               '',
        totalMinutes:      0,
        sessionsCompleted: 0,
        streak:            0,
        longestStreak:     0,
        lastSessionDate:   null,
        notificationsEnabled: true,
        reminderTime:      '08:00',
        createdAt:         new Date(),
      });
    }
  } catch (err) {
    console.error('Error ensuring user document:', err.message);
  }
};

// ── Root App ──────────────────────────────────────────────────
export default function AppNavigator() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Reload to get fresh emailVerified status
        try { await reload(currentUser); } catch {}
        setIsVerified(currentUser.emailVerified);
        if (currentUser.emailVerified) {
          await ensureUserDocument(currentUser);
        }
      } else {
        setIsVerified(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: P.navy }}>
        <LinearGradient colors={[P.navy, P.navyMid]} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color={P.teal} />
        <Text style={{ color: P.muted, marginTop: 16, fontSize: 14 }}>Loading...</Text>
      </View>
    );
  }

  // Not logged in → show auth screens
  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Logged in but email not verified → show verification gate
  if (!isVerified) {
    return <VerifyEmailScreen user={user} />;
  }

  // Fully authenticated and verified → show main app
  return (
    <UserProvider>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </UserProvider>
  );
}

// ── Verify Email Screen Styles ────────────────────────────────
const verifyStyles = StyleSheet.create({
  root:    { flex: 1 },
  glow:    { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.teal, opacity: 0.07 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', alignItems: 'center', paddingTop: 40, paddingBottom: 40 },

  iconBox:  { width: 100, height: 100, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 28, shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  title:    { fontSize: 26, fontWeight: '800', color: P.white, marginBottom: 10, textAlign: 'center' },
  desc:     { fontSize: 14, color: P.muted, marginBottom: 4, textAlign: 'center' },
  email:    { fontSize: 15, fontWeight: '700', color: P.teal, marginBottom: 14, textAlign: 'center' },
  subdesc:  { fontSize: 13, color: P.muted, textAlign: 'center', lineHeight: 20, marginBottom: 28 },

  stepsCard:  { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, marginBottom: 28, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  stepBorder: { borderTopWidth: 1, borderTopColor: P.glassBorder },
  stepIconBox:{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(45,212,191,0.12)', justifyContent: 'center', alignItems: 'center' },
  stepText:   { fontSize: 14, color: P.muted },

  primaryBtnWrap: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 12, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  primaryBtn:     { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: P.white },

  secondaryBtn:     { width: '100%', height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: P.glassBorder, marginBottom: 16, backgroundColor: P.glass },
  secondaryBtnText: { fontSize: 14, color: P.teal, fontWeight: '600' },

  signOutBtn:  { padding: 10 },
  signOutText: { fontSize: 13, color: P.muted },
});