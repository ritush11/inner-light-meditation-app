import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const ProgressScreen = () => {
  const { userData } = useUser();
  const [timeframe, setTimeframe] = useState('week');

  const stats = [
    {
      icon: 'leaf',
      label: 'Sessions',
      value: userData?.sessionsCompleted || 0,
      gradient: ['#1A826B', '#2BB092'],
      change: '+2 this week',
    },
    {
      icon: 'time',
      label: 'Minutes',
      value: userData?.totalMinutes || 0,
      gradient: ['#2A9D8F', '#21867A'],
      change: '+45 this week',
    },
    {
      icon: 'flame',
      label: 'Streak',
      value: userData?.streak || 0,
      gradient: ['#457B9D', '#1D3557'],
      change: 'days in a row',
    },
    {
      icon: 'star',
      label: 'Achievements',
      value: 5,
      gradient: ['#E9C46A', '#F4A261'],
      change: 'badges earned',
    },
  ];

  const weekData = [
    { day: 'Mon', minutes: 10, percentage: 0.33 },
    { day: 'Tue', minutes: 15, percentage: 0.5 },
    { day: 'Wed', minutes: 20, percentage: 0.67 },
    { day: 'Thu', minutes: 12, percentage: 0.4 },
    { day: 'Fri', minutes: 25, percentage: 0.83 },
    { day: 'Sat', minutes: 30, percentage: 1 },
    { day: 'Sun', minutes: 10, percentage: 0.33 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your mindfulness journey</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <LinearGradient
              key={index}
              colors={stat.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <View style={styles.statIcon}>
                <Ionicons name={stat.icon} size={24} color={colors.white} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statChange}>{stat.change}</Text>
            </LinearGradient>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.timeframeButtons}>
              {['week', 'month', 'year'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.timeframeButton,
                    timeframe === option && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setTimeframe(option)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      timeframe === option && styles.timeframeTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartContent}>
              {weekData.map((data, index) => (
                <View key={index} style={styles.barWrapper}>
                  <LinearGradient
                    colors={['#1A826B', '#2BB092']}
                    style={[styles.bar, { height: `${data.percentage * 100}%` }]}
                  />
                  <Text style={styles.barLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Total</Text>
              <Text style={styles.chartStatValue}>142 min</Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Average</Text>
              <Text style={styles.chartStatValue}>20 min/day</Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatLabel}>Best Day</Text>
              <Text style={styles.chartStatValue}>Saturday</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {[
              { icon: 'star', label: 'First Step', color: colors.warning },
              { icon: 'flame', label: '7-Day Streak', color: colors.primaryDark },
              { icon: 'trophy', label: '100 Minutes', color: colors.primaryLight },
              { icon: 'heart', label: 'Loving Kindness', color: colors.accent },
              { icon: 'book', label: 'Consistent', color: colors.primary },
              { icon: 'sparkles', label: 'Mindful', color: colors.warning },
            ].map((achievement, index) => (
              <LinearGradient
                key={index}
                colors={[achievement.color + '30', achievement.color + '10']}
                style={styles.achievementCard}
              >
                <Ionicons
                  name={achievement.icon}
                  size={32}
                  color={achievement.color}
                />
                <Text style={styles.achievementLabel}>{achievement.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mindfulness Tips</Text>
          {[
            { icon: 'checkmark-circle', text: 'Practice daily for best results', color: colors.primaryLight },
            { icon: 'checkmark-circle', text: 'Try different session types', color: colors.primary },
            { icon: 'checkmark-circle', text: 'Morning meditation boosts focus', color: colors.accent },
            { icon: 'checkmark-circle', text: 'Consistency builds the habit', color: colors.warning },
          ].map((tip, index) => (
            <LinearGradient
              key={index}
              colors={[colors.white, colors.background]}
              style={styles.tipCard}
            >
              <Ionicons name={tip.icon} size={20} color={tip.color} />
              <Text style={styles.tipText}>{tip.text}</Text>
            </LinearGradient>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  statChange: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
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
  timeframeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timeframeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    ...shadows.light,
  },
  timeframeButtonActive: {
    backgroundColor: colors.primary,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  timeframeTextActive: {
    color: colors.white,
  },
  chartContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chartStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  achievementCard: {
    width: '31%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  achievementLabel: {
    fontSize: 11,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  tipText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
});

export default ProgressScreen;