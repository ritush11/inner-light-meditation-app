import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const moods = [
  { id: 1, emoji: '😊', label: 'Happy', color: '#FFD700' },
  { id: 2, emoji: '😌', label: 'Calm', color: '#4ECDC4' },
  { id: 3, emoji: '😴', label: 'Tired', color: '#8B7FD9' },
  { id: 4, emoji: '😤', label: 'Stressed', color: '#FF6B9D' },
  { id: 5, emoji: '😢', label: 'Sad', color: '#6B9FD9' },
  { id: 6, emoji: '😠', label: 'Angry', color: '#FF5733' },
  { id: 7, emoji: '😰', label: 'Anxious', color: '#FFA500' },
  { id: 8, emoji: '😐', label: 'Neutral', color: '#A0A0A0' },
];

const activities = [
  'Meditation',
  'Exercise',
  'Sleep',
  'Work',
  'Social',
  'Eating',
  'Reading',
  'Music',
];

const MoodTrackingScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const [intensity, setIntensity] = useState(5);

  const toggleActivity = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleSaveMood = () => {
    if (!selectedMood) {
      Alert.alert('Please select a mood', 'Choose how you are feeling right now');
      return;
    }
    Alert.alert('Mood Saved!', 'Your mood has been recorded successfully 💜');
    setSelectedMood(null);
    setSelectedActivities([]);
    setNotes('');
    setIntensity(5);
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
          <Text style={styles.title}>Mood Tracking</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* How are you feeling? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <Text style={styles.sectionSubtitle}>
            Track your daily emotions for better self-awareness
          </Text>

          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodCard,
                  selectedMood?.id === mood.id && styles.moodCardActive,
                  { borderColor: mood.color },
                ]}
                onPress={() => setSelectedMood(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Intensity */}
        {selectedMood && (
          <View style={styles.section}>
            <View style={styles.intensityHeader}>
              <Text style={styles.sectionTitle}>Intensity</Text>
              <Text style={styles.intensityValue}>{intensity}/10</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Low</Text>
              <View style={styles.slider}>
                <LinearGradient
                  colors={[selectedMood.color + '40', selectedMood.color]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.sliderFill, { width: `${intensity * 10}%` }]}
                />
              </View>
              <Text style={styles.sliderLabel}>High</Text>
            </View>
            <View style={styles.sliderInput}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    intensity === value && styles.sliderButtonActive,
                  ]}
                  onPress={() => setIntensity(value)}
                >
                  <Text
                    style={[
                      styles.sliderButtonText,
                      intensity === value && styles.sliderButtonTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* What activities? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What activities today?</Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.activityCard,
                  selectedActivities.includes(activity) && styles.activityCardActive,
                ]}
                onPress={() => toggleActivity(activity)}
              >
                <Ionicons
                  name={getActivityIcon(activity)}
                  size={20}
                  color={
                    selectedActivities.includes(activity)
                      ? colors.white
                      : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.activityLabel,
                    selectedActivities.includes(activity) &&
                      styles.activityLabelActive,
                  ]}
                >
                  {activity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add notes (optional)</Text>
          <View style={styles.notesInput}>
            <Ionicons name="create" size={20} color={colors.primary} />
            <Text
              style={styles.notesText}
              onPress={() => {
                Alert.prompt('Add notes', 'How are you feeling today?', [
                  { text: 'Cancel', onPress: () => {} },
                  {
                    text: 'Save',
                    onPress: (text) => setNotes(text),
                  },
                ]);
              }}
            >
              {notes || 'Tap to add notes...'}
            </Text>
          </View>
        </View>

        {/* Insights */}
        <LinearGradient
          colors={['#4ECDC4', '#45B7AA']}
          style={styles.insightCard}
        >
          <View style={styles.insightHeader}>
            <Ionicons name="bulb" size={24} color={colors.white} />
            <Text style={styles.insightTitle}>Daily Insight</Text>
          </View>
          <Text style={styles.insightText}>
            💡 Based on your mood, try a 10-minute relaxation meditation to
            balance your emotions.
          </Text>
        </LinearGradient>

        {/* Save Button */}
        <LinearGradient
          colors={['#4ECDC4', '#45B7AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButton}
        >
          <TouchableOpacity style={styles.saveButtonContent} onPress={handleSaveMood}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>Save Mood</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const getActivityIcon = (activity) => {
  const icons = {
    Meditation: 'leaf',
    Exercise: 'fitness',
    Sleep: 'moon',
    Work: 'briefcase',
    Social: 'people',
    Eating: 'restaurant',
    Reading: 'book',
    Music: 'musical-note',
  };
  return icons[activity] || 'help-circle';
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  moodCard: {
    width: '23%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    ...shadows.light,
  },
  moodCardActive: {
    backgroundColor: '#F0F8F8',
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  intensityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  intensityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  slider: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  sliderInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    width: '9%',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sliderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sliderButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  sliderButtonTextActive: {
    color: colors.white,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  activityCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightBorder,
    ...shadows.light,
  },
  activityCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  activityLabelActive: {
    color: colors.white,
  },
  notesInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.light,
  },
  notesText: {
    marginLeft: spacing.md,
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  insightCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  insightText: {
    fontSize: 13,
    color: colors.white,
    lineHeight: 20,
  },
  saveButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});

export default MoodTrackingScreen;