import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const quotes = [
  'The present moment is filled with joy and peace.',
  'Your mind is a powerful tool for healing.',
  'Every breath is a fresh start.',
  'Peace comes from within.',
  'You are stronger than you think.',
  'Mindfulness is the path to happiness.',
  'Let go of what you cannot control.',
  'Your potential is limitless.',
];

const featuredMeditations = [
  {
    id: 1,
    title: 'Morning Calm',
    subtitle: 'Start your day with clarity',
    duration: 10,
    icon: 'sunny',
    gradient: ['#1A826B', '#2BB092'],
    description: 'Begin your day with clarity and focus',
  },
  {
    id: 2,
    title: 'Focus Session',
    subtitle: 'Enhance your concentration',
    duration: 15,
    icon: 'bulb',
    gradient: ['#2A9D8F', '#21867A'],
    description: 'Boost your productivity and focus',
  },
  {
    id: 3,
    title: 'Evening Peace',
    subtitle: 'Wind down before sleep',
    duration: 20,
    icon: 'moon',
    gradient: ['#457B9D', '#1D3557'],
    description: 'Relax and prepare for restful sleep',
  },
];

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Friend');
  const [userStats, setUserStats] = useState({
    sessionsCompleted: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [dailyQuote, setDailyQuote] = useState('');

  useEffect(() => {
    // Get user display name from Firebase Auth
    if (auth.currentUser?.displayName) {
      setUserName(auth.currentUser.displayName);
      console.log('User name from Firebase:', auth.currentUser.displayName);
    } else {
      setUserName('Friend');
    }

    // Set daily quote
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    setDailyQuote(quotes[dayOfYear % quotes.length]);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome, {userName.split(' ')[0]}
            </Text>
            <Text style={styles.subtitle}>Let's find your inner peace</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationIcon}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications" size={22} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Daily Quote Card - Modern Design */}
        <LinearGradient
          colors={['#1A826B', '#2BB092']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quoteCard}
        >
          <View style={styles.quoteContent}>
            <Ionicons name="sparkles" size={24} color={colors.white} />
            <Text style={styles.quoteText}>{dailyQuote}</Text>
            <View style={styles.quoteDots}>
              <View style={styles.dot} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        </LinearGradient>

        {/* Stats Section - Beautiful Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <Ionicons name="leaf" size={28} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{userStats.sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#F0FDF4', '#DCFCE7']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <Ionicons name="time" size={28} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{userStats.totalMinutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#FFFBEB', '#FEF3C7']}
            style={styles.statCard}
          >
            <View style={styles.statIcon}>
              <Ionicons name="flame" size={28} color={colors.accent} />
            </View>
            <Text style={styles.statValue}>{userStats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </LinearGradient>
        </View>

        {/* Suggested For You Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested For You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Meditation')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Featured Meditation Cards */}
          {featuredMeditations.map((meditation) => (
            <TouchableOpacity
              key={meditation.id}
              style={styles.meditationCardWrapper}
              onPress={() =>
                navigation.navigate('MeditationDetail', { meditation })
              }
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={meditation.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.meditationCard}
              >
                <View style={styles.meditationHeader}>
                  <View>
                    <Text style={styles.meditationTitle}>{meditation.title}</Text>
                    <Text style={styles.meditationSubtitle}>
                      {meditation.subtitle}
                    </Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Ionicons name="headset" size={16} color={colors.white} />
                    <Text style={styles.durationText}>{meditation.duration}m</Text>
                  </View>
                </View>

                <Text style={styles.meditationDescription}>
                  {meditation.description}
                </Text>

                <View style={styles.meditationFooter}>
                  <Ionicons name={meditation.icon} size={32} color={colors.white} />
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={16} color={meditation.gradient[0]} />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Start Button */}
        <View style={styles.quickStartSection}>
          <LinearGradient
            colors={['#1C2B2D', '#116A55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quickStartButton}
          >
            <Ionicons name="play-circle" size={32} color={colors.white} />
            <View style={styles.quickStartText}>
              <Text style={styles.quickStartTitle}>Ready to meditate?</Text>
              <Text style={styles.quickStartDesc}>Start your session now</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </LinearGradient>
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendingScroll}>
            {['Sleep', 'Focus', 'Stress', 'Energy'].map((category, index) => (
              <LinearGradient
                key={index}
                colors={
                  [
                    ['#1A826B', '#2BB092'],
                    ['#2A9D8F', '#21867A'],
                    ['#457B9D', '#1D3557'],
                    ['#E9C46A', '#F4A261'],
                  ][index]
                }
                style={styles.trendingCard}
              >
                <Text style={styles.trendingLabel}>{category}</Text>
                <Text style={styles.trendingCount}>12+ sessions</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  notificationIcon: {
    padding: spacing.sm,
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  quoteCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  quoteContent: {
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: 24,
  },
  quoteDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  meditationCardWrapper: {
    marginBottom: spacing.md,
  },
  meditationCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  meditationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  meditationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  meditationSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  durationText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  meditationDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  meditationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStartSection: {
    marginBottom: spacing.xl,
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
    gap: spacing.md,
  },
  quickStartText: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  quickStartDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  trendingScroll: {
    marginTop: spacing.md,
  },
  trendingCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    justifyContent: 'center',
    ...shadows.light,
    minWidth: 120,
  },
  trendingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  trendingCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
});

export default HomeScreen;