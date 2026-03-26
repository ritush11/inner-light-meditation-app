import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { auth } from './firebase/firebaseConfig';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

// Main Screens
import HomeScreen from './screens/main/HomeScreen';
import MeditationDetailScreen from './screens/main/MeditationDetailScreen';
import MeditationScreen from './screens/main/MeditationScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import ProgressScreen from './screens/main/ProgressScreen';

// New Feature Screens
import CallSupportScreen from './screens/main/CallSupportScreen';
import GoalsAchievementsScreen from './screens/main/GoalsAchievementsScreen';
import MentalHealthQuizScreen from './screens/main/MentalHealthQuizScreen';
import MoodTrackingScreen from './screens/main/MoodTrackingScreen';
import SleepStoriesScreen from './screens/main/SleepStoriesScreen';
import WellnessJournalScreen from './screens/main/WellnessJournalScreen';

// Context
import { UserProvider } from './context/UserContext';

// Icons
import { Ionicons } from '@expo/vector-icons';
import { colors } from './styles/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Meditate') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Support') {
            iconName = focused ? 'call' : 'call-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.lightGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.lightBorder,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Meditate"
        component={MeditationScreen}
        options={{ tabBarLabel: 'Meditate' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ tabBarLabel: 'Progress' }}
      />
      <Tab.Screen
        name="Support"
        component={CallSupportScreen}
        options={{ tabBarLabel: 'Support' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Stack (for screens that need header navigation)
function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MeditationDetail"
        component={MeditationDetailScreen}
        options={{
          animationEnabled: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MoodTracking"
        component={MoodTrackingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Journal"
        component={WellnessJournalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Quiz"
        component={MentalHealthQuizScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SleepStories"
        component={SleepStoriesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsAchievementsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <UserProvider>
      <NavigationContainer>
        {user ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </UserProvider>
  );
}