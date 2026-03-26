import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const allMeditations = [
  {
    id: 1,
    title: 'Morning Meditation',
    subtitle: 'Clarity & Focus',
    duration: 10,
    category: 'Morning',
    icon: 'sunny',
    gradient: ['#1A826B', '#2BB092'],
    level: 'Beginner',
  },
  {
    id: 2,
    title: 'Anxiety Relief',
    subtitle: 'Calm Your Mind',
    duration: 12,
    category: 'Stress',
    icon: 'heart',
    gradient: ['#264653', '#2A9D8F'],
    level: 'All Levels',
  },
  {
    id: 3,
    title: 'Focus Session',
    subtitle: 'Productivity Boost',
    duration: 15,
    category: 'Focus',
    icon: 'bulb',
    gradient: ['#2A9D8F', '#21867A'],
    level: 'Beginner',
  },
  {
    id: 4,
    title: 'Body Scan',
    subtitle: 'Deep Relaxation',
    duration: 20,
    category: 'Relaxation',
    icon: 'body',
    gradient: ['#2BB092', '#82D1C1'],
    level: 'Intermediate',
  },
  {
    id: 5,
    title: 'Sleep Preparation',
    subtitle: 'Restful Sleep',
    duration: 25,
    category: 'Sleep',
    icon: 'moon',
    gradient: ['#1D3557', '#457B9D'],
    level: 'All Levels',
  },
  {
    id: 6,
    title: 'Loving Kindness',
    subtitle: 'Build Compassion',
    duration: 15,
    category: 'Emotional',
    icon: 'heart',
    gradient: ['#457B9D', '#1D3557'],
    level: 'Intermediate',
  },
  {
    id: 7,
    title: 'Nature Soundscape',
    subtitle: 'Forest Immersion',
    duration: 30,
    category: 'Sounds',
    icon: 'leaf',
    gradient: ['#116A55', '#2BB092'],
    level: 'Beginner',
  },
  {
    id: 8,
    title: 'Evening Reflection',
    subtitle: 'Daily Gratitude',
    duration: 10,
    category: 'Evening',
    icon: 'moon',
    gradient: ['#E76F51', '#F4A261'],
    level: 'Beginner',
  },
];

const categories = ['All', 'Morning', 'Focus', 'Stress', 'Sleep', 'Emotional'];

const MeditationScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeditations = allMeditations.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const MeditationCard = ({ meditation }) => (
    <TouchableOpacity
      style={styles.meditationCardWrapper}
      onPress={() =>
        navigation.navigate('MeditationDetail', { meditation })
      }
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={meditation.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.meditationCard}
      >
        <View style={styles.cardBlur} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.cardTitle}>{meditation.title}</Text>
              <Text style={styles.cardSubtitle}>{meditation.subtitle}</Text>
            </View>
            <View style={styles.cardIcon}>
              <Ionicons name={meditation.icon} size={28} color={colors.white} />
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color={colors.white} />
                <Text style={styles.metaText}>{meditation.duration}m</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="person" size={14} color={colors.white} />
                <Text style={styles.metaText}>{meditation.level}</Text>
              </View>
            </View>
            <View style={styles.playIcon}>
              <Ionicons name="play" size={18} color={meditation.gradient[0]} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meditation Library</Text>
          <Text style={styles.subtitle}>Find your perfect session</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={colors.lightGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search meditations..."
            placeholderTextColor={colors.lightGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.lightGray} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.resultsCount}>
          {filteredMeditations.length} {filteredMeditations.length === 1 ? 'session' : 'sessions'}
        </Text>

        <View style={styles.gridContainer}>
          {filteredMeditations.map((meditation) => (
            <MeditationCard key={meditation.id} meditation={meditation} />
          ))}
        </View>

        {filteredMeditations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.lightGray} />
            <Text style={styles.emptyStateText}>No meditations found</Text>
            <Text style={styles.emptyStateDesc}>Try adjusting your filters</Text>
          </View>
        )}
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
    marginBottom: spacing.lg,
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    height: 50,
    ...shadows.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text,
  },
  categoryScroll: {
    marginBottom: spacing.lg,
  },
  categoryContent: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    ...shadows.light,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.white,
  },
  resultsCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  gridContainer: {
    gap: spacing.md,
  },
  meditationCardWrapper: {
    marginBottom: spacing.md,
  },
  meditationCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
    minHeight: 140,
  },
  cardBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default MeditationScreen;