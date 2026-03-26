import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const achievements = [
  { id: 1, icon: 'star', title: 'First Step', description: 'Complete your first meditation', unlockedAt: '2024-01-15' },
  { id: 2, icon: 'flame', title: '7-Day Streak', description: 'Meditate 7 days in a row', unlockedAt: '2024-01-22' },
  { id: 3, icon: 'trophy', title: '100 Minutes', description: 'Complete 100 total minutes', unlockedAt: '2024-02-01' },
  { id: 4, icon: 'heart', title: 'Loving Kindness', description: 'Complete a compassion session', unlockedAt: null },
  { id: 5, icon: 'book', title: 'Consistent', description: 'Maintain a 30-day streak', unlockedAt: null },
  { id: 6, icon: 'sparkles', title: 'Mindful Master', description: 'Complete 50 sessions', unlockedAt: null },
  { id: 7, icon: 'moon', title: 'Sleep Well', description: 'Complete 10 sleep stories', unlockedAt: null },
  { id: 8, icon: 'leaf', title: 'Nature Lover', description: 'Complete 5 nature meditations', unlockedAt: null },
];

const GoalsAchievementsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('achievements');
  const [goals, setGoals] = useState([
    { id: 1, title: 'Daily Meditation', target: 30, current: 15, frequency: 'every day' },
    { id: 2, title: 'Weekly Goal', target: 150, current: 89, frequency: 'every week' },
    { id: 3, title: 'Sleep Stories', target: 10, current: 3, frequency: 'monthly' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', frequency: 'every day' });

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) return;

    const goal = {
      id: goals.length + 1,
      title: newGoal.title,
      target: parseInt(newGoal.target),
      current: 0,
      frequency: newGoal.frequency,
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', target: '', frequency: 'every day' });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Goals & Achievements</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Stats Card */}
        <LinearGradient
          colors={['#4ECDC4', '#45B7AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{achievements.length - unlockedCount}</Text>
            <Text style={styles.statLabel}>Locked</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{Math.round((unlockedCount / achievements.length) * 100)}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </LinearGradient>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'achievements' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Ionicons
              name="star"
              size={18}
              color={activeTab === 'achievements' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'achievements' && styles.tabTextActive,
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'goals' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('goals')}
          >
            <Ionicons
              name="target"
              size={18}
              color={activeTab === 'goals' ? colors.white : colors.primary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'goals' && styles.tabTextActive,
              ]}
            >
              Goals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <View style={styles.section}>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <TouchableOpacity
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !achievement.unlockedAt && styles.achievementCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementIconBox,
                      achievement.unlockedAt && { backgroundColor: '#FFD70040' },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon}
                      size={32}
                      color={
                        achievement.unlockedAt ? '#FFD700' : '#CCCCCC'
                      }
                    />
                  </View>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDesc}>
                    {achievement.description}
                  </Text>
                  {achievement.unlockedAt && (
                    <Text style={styles.unlockedDate}>
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <View style={styles.section}>
            {goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalFrequency}>{goal.frequency}</Text>
                    </View>
                    <TouchableOpacity>
                      <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressBarBg}>
                      <LinearGradient
                        colors={['#4ECDC4', '#45B7AA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressBar,
                          { width: `${progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {goal.current}/{goal.target}
                    </Text>
                  </View>

                  <View style={styles.goalMilestones}>
                    {[25, 50, 75, 100].map((milestone) => (
                      <View key={milestone} style={styles.milestone}>
                        <View
                          style={[
                            styles.milestoneCircle,
                            goal.current >= (milestone / 100) * goal.target &&
                              styles.milestoneCircleActive,
                          ]}
                        />
                        <Text style={styles.milestoneLabel}>{milestone}%</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Add Goal Button */}
            <TouchableOpacity
              style={styles.addGoalButton}
              onPress={() => setModalVisible(true)}
            >
              <LinearGradient
                colors={['#4ECDC4', '#45B7AA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addGoalContent}
              >
                <Ionicons name="add" size={24} color={colors.white} />
                <Text style={styles.addGoalText}>Add New Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Ionicons name="heart" size={24} color="#FF6B9D" />
          <Text style={styles.motivationTitle}>Keep Going! 💪</Text>
          <Text style={styles.motivationText}>
            You're {unlockedCount} badges away from becoming a Mindfulness Master!
          </Text>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Goal title"
              value={newGoal.title}
              onChangeText={(text) =>
                setNewGoal({ ...newGoal, title: text })
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Target number"
              value={newGoal.target}
              onChangeText={(text) =>
                setNewGoal({ ...newGoal, target: text })
              }
              keyboardType="numeric"
            />

            <View style={styles.frequencySelector}>
              <Text style={styles.frequencyLabel}>Frequency</Text>
              <View style={styles.frequencyOptions}>
                {['every day', 'every week', 'monthly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      newGoal.frequency === freq &&
                        styles.frequencyOptionActive,
                    ]}
                    onPress={() =>
                      setNewGoal({ ...newGoal, frequency: freq })
                    }
                  >
                    <Text
                      style={[
                        styles.frequencyOptionText,
                        newGoal.frequency === freq &&
                          styles.frequencyOptionTextActive,
                      ]}
                    >
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <LinearGradient
              colors={['#4ECDC4', '#45B7AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalButton}
            >
              <TouchableOpacity
                style={styles.modalButtonContent}
                onPress={handleAddGoal}
              >
                <Text style={styles.modalButtonText}>Create Goal</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.xl,
    gap: spacing.sm,
    ...shadows.light,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  tabTextActive: {
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xl,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.light,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIconBox: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedDate: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  goalCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  goalFrequency: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
  goalMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestone: {
    alignItems: 'center',
  },
  milestoneCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: spacing.xs,
  },
  milestoneCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  milestoneLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  addGoalButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  addGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  motivationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.light,
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  motivationText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 14,
    color: colors.text,
  },
  frequencySelector: {
    marginBottom: spacing.lg,
  },
  frequencyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightBorder,
    alignItems: 'center',
  },
  frequencyOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  frequencyOptionTextActive: {
    color: colors.white,
  },
  modalButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalButtonContent: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default GoalsAchievementsScreen;