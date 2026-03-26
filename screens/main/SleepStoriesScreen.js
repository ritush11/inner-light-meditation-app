import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const sleepContent = [
  {
    id: 1,
    type: 'story',
    title: 'The Enchanted Forest',
    narrator: 'Emma Watson',
    duration: 28,
    rating: 4.8,
    reviews: 234,
    thumbnail: '🌲',
    description: 'A magical journey through an ancient forest',
    gradient: ['#1a5f4a', '#2d8b78'],
  },
  {
    id: 2,
    type: 'story',
    title: 'Ocean Waves',
    narrator: 'David Attenborough',
    duration: 32,
    rating: 4.9,
    reviews: 512,
    thumbnail: '🌊',
    description: 'Drift to sleep with gentle ocean sounds',
    gradient: ['#1e3a8a', '#2563eb'],
  },
  {
    id: 3,
    type: 'soundscape',
    title: 'Rain on Roof',
    category: 'Nature Sounds',
    duration: 45,
    rating: 4.7,
    reviews: 189,
    thumbnail: '🌧️',
    description: 'Peaceful rain sounds perfect for sleep',
    gradient: ['#4c5aa0', '#7c7ee0'],
  },
  {
    id: 4,
    type: 'soundscape',
    title: 'Forest Ambience',
    category: 'Nature Sounds',
    duration: 50,
    rating: 4.6,
    reviews: 276,
    thumbnail: '🌲',
    description: 'Birds chirping in a peaceful forest',
    gradient: ['#2d5016', '#3d7c1f'],
  },
  {
    id: 5,
    type: 'story',
    title: 'Starry Night Tales',
    narrator: 'Tom Hiddleston',
    duration: 25,
    rating: 4.8,
    reviews: 445,
    thumbnail: '⭐',
    description: 'Bedtime stories under the stars',
    gradient: ['#1a1a3a', '#3d2645'],
  },
  {
    id: 6,
    type: 'soundscape',
    title: 'Mountain Stream',
    category: 'Nature Sounds',
    duration: 55,
    rating: 4.9,
    reviews: 328,
    thumbnail: '💧',
    description: 'Gentle flowing water sounds',
    gradient: ['#1a5f4a', '#2d8b78'],
  },
];

const SleepStoriesScreen = ({ navigation }) => {
  const [selectedContent, setSelectedContent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const filteredContent = sleepContent.filter(
    (content) => filterType === 'all' || content.type === filterType
  );

  const ContentCard = ({ content }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => setSelectedContent(content)}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={content.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardImage}
      >
        <Text style={styles.thumbnail}>{content.thumbnail}</Text>
        <View style={styles.cardOverlay}>
          <Ionicons name="play-circle" size={48} color={colors.white} />
        </View>
      </LinearGradient>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {content.title}
        </Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {content.narrator || content.category} • {content.duration}m
        </Text>
        <View style={styles.ratingBar}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {content.rating} ({content.reviews})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (selectedContent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => setSelectedContent(null)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>

          <LinearGradient
            colors={selectedContent.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailImage}
          >
            <Text style={styles.detailThumbnail}>{selectedContent.thumbnail}</Text>
          </LinearGradient>

          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{selectedContent.title}</Text>
            <Text style={styles.detailMeta}>
              {selectedContent.narrator || selectedContent.category}
            </Text>

            <View style={styles.detailStats}>
              <View style={styles.stat}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <Text style={styles.statText}>{selectedContent.duration} min</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text style={styles.statText}>
                  {selectedContent.rating} ({selectedContent.reviews})
                </Text>
              </View>
            </View>

            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{selectedContent.description}</Text>

            {/* Playback Info */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={styles.infoText}>
                Perfect for falling asleep. Set your preferred sleep timer below.
              </Text>
            </View>

            {/* Sleep Timer */}
            <Text style={styles.timerTitle}>Sleep Timer</Text>
            <View style={styles.timerOptions}>
              {['5 min', '15 min', '30 min', '45 min'].map((time, index) => (
                <TouchableOpacity key={index} style={styles.timerButton}>
                  <Text style={styles.timerButtonText}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Play Button */}
            <LinearGradient
              colors={selectedContent.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playButton}
            >
              <TouchableOpacity
                style={styles.playButtonContent}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={colors.white}
                />
                <Text style={styles.playButtonText}>
                  {isPlaying ? 'Pause' : 'Play Now'}
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Add to Favorites */}
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
              <Text style={styles.favoriteText}>Add to Favorites</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.title}>Sleep Stories</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Banner */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Ionicons name="moon" size={40} color={colors.white} />
          <Text style={styles.bannerTitle}>Rest & Sleep</Text>
          <Text style={styles.bannerSubtitle}>
            Drift into deep sleep with our collection
          </Text>
        </LinearGradient>

        {/* Filters */}
        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'story' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('story')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'story' && styles.filterTextActive,
              ]}
            >
              Stories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'soundscape' && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType('soundscape')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'soundscape' && styles.filterTextActive,
              ]}
            >
              Soundscapes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Grid */}
        <View style={styles.contentGrid}>
          {filteredContent.map((content) => (
            <View key={content.id} style={{ width: '48%' }}>
              <ContentCard content={content} />
            </View>
          ))}
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  banner: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.md,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  filterSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  filterButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    ...shadows.light,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  contentCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.light,
  },
  cardImage: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    fontSize: 48,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  detailImage: {
    height: 250,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  detailThumbnail: {
    fontSize: 80,
  },
  detailContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  detailStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F8',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  timerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  timerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  timerButton: {
    width: '23%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.lightBorder,
    alignItems: 'center',
  },
  timerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  playButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  playButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  favoriteText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default SleepStoriesScreen;