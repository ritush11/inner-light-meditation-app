import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { getUserData } from '../../firebase/firebaseUtils';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userStats, setUserStats] = useState({
    sessionsCompleted: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get display name and email from Firebase Auth
        if (auth.currentUser) {
          setUserName(auth.currentUser.displayName || 'User');
          setUserEmail(auth.currentUser.email || '');

          // Get user stats from Firestore
          const userData = await getUserData(auth.currentUser.uid);
          if (userData) {
            setUserStats({
              sessionsCompleted: userData.sessionsCompleted || 0,
              totalMinutes: userData.totalMinutes || 0,
              streak: userData.streak || 0,
            });

            // Get preferences
            if (userData.preferences) {
              setNotifications(userData.preferences.notifications !== false);
              setSoundEnabled(userData.preferences.soundEnabled !== false);
              setDarkMode(userData.preferences.darkMode || false);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const performLogout = async () => {
    try {
      console.log('Logging out...');
      await signOut(auth);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        window.alert(error.message || 'Failed to logout. Please try again.');
      } else {
        Alert.alert('Logout Error', error.message || 'Failed to logout. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', onPress: () => {} },
          {
            text: 'Logout',
            onPress: performLogout,
            style: 'destructive',
          },
        ]
      );
    }
  };

  const handlePreferenceChange = async (preference, value) => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      // Update local state
      if (preference === 'notifications') setNotifications(value);
      if (preference === 'soundEnabled') setSoundEnabled(value);
      if (preference === 'darkMode') setDarkMode(value);

      // Update in Firestore (you would implement this in firebaseUtils)
      // For now, just update locally
      console.log(`${preference} updated to ${value}`);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={['#1A826B', '#2BB092']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={56} color={colors.white} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userName}</Text>
              <Text style={styles.email}>{userEmail}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={18} color={colors.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.sessionsCompleted}
            </Text>
            <Text style={styles.statText}>Sessions</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userStats.totalMinutes}
            </Text>
            <Text style={styles.statText}>Minutes</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userStats.streak}</Text>
            <Text style={styles.statText}>Streak</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications" size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Meditation reminders
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => handlePreferenceChange('notifications', value)}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="volume-high" size={20} color={colors.primaryLight} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Sound</Text>
                <Text style={styles.settingDescription}>
                  Audio during sessions
                </Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(value) => handlePreferenceChange('soundEnabled', value)}
              trackColor={{ false: colors.lightGray, true: colors.primaryLight }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Ionicons name="moon" size={20} color={colors.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Coming soon
                </Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => handlePreferenceChange('darkMode', value)}
              trackColor={{ false: colors.lightGray, true: colors.warning }}
              thumbColor={colors.warning}
              disabled
            />
          </View>
        </View>

        {/* More Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Features</Text>

          {[
            { id: 'Journal', icon: 'book', label: 'Wellness Journal', description: 'Write daily reflections', color: colors.primary },
            { id: 'MoodTracking', icon: 'happy', label: 'Mood Tracking', description: 'Record daily emotions', color: '#E76F51' },
            { id: 'Quiz', icon: 'help-circle', label: 'Mental Health Quiz', description: 'Interactive self-reflection', color: '#2A9D8F' },
            { id: 'SleepStories', icon: 'moon', label: 'Sleep Stories', description: 'Bedtime audio content', color: '#264653' },
            { id: 'Goals', icon: 'flag', label: 'Goals & Achievements', description: 'Track your milestones', color: '#E9C46A' },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helpItem}
              onPress={() => navigation.navigate(item.id)}
            >
              <View style={styles.helpLeft}>
                <View style={[styles.helpIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>

          {[
            { icon: 'help-circle', label: 'FAQ', description: 'Frequently asked questions', color: colors.primary },
            { icon: 'document-text', label: 'About', description: 'About Inner Light', color: colors.primaryLight },
            { icon: 'shield-checkmark', label: 'Privacy', description: 'Privacy policy', color: colors.accent },
          ].map((item, index) => (
            <TouchableOpacity key={index} style={styles.helpItem}>
              <View style={styles.helpLeft}>
                <View style={[styles.helpIcon, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#264653', '#2A9D8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutContent}
          >
            <Ionicons name="log-out" size={20} color={colors.white} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>Inner Light v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    justifyContent: 'space-between',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.light,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: colors.lightBorder,
    height: '70%',
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: '#FAFBFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  version: {
    fontSize: 12,
    color: colors.lightGray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
});

export default ProfileScreen;