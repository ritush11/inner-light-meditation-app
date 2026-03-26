import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { auth } from '../../firebase/firebaseConfig';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const MeditationDetailScreen = ({ route, navigation }) => {
  const { meditation } = route.params;
  const { addMeditationSession } = useUser();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= meditation.duration * 60) {
            setIsPlaying(false);
            return meditation.duration * 60;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, meditation.duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSessionComplete = async () => {
    try {
      await addMeditationSession(auth.currentUser.uid, {
        meditationId: meditation.id,
        title: meditation.title,
        duration: meditation.duration,
        completedAt: new Date(),
      });

      Alert.alert(
        'Great Job!',
        `You completed ${meditation.title}! Keep up the mindfulness practice.`,
        [
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );

      setIsPlaying(false);
      setCurrentTime(0);
    } catch (error) {
      Alert.alert('Error', 'Failed to save session. Please try again.');
    }
  };

  const progressPercentage =
    meditation && meditation.duration 
      ? (currentTime / (meditation.duration * 60)) * 100 
      : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        <LinearGradient
          colors={meditation.gradient || ['#1A826B', '#2BB092']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.artContainer}
        >
          <View style={styles.meditationIcon}>
            <Ionicons name={meditation.icon} size={80} color={colors.white} />
          </View>
        </LinearGradient>

        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{meditation.title}</Text>
              <Text style={styles.subtitle}>{meditation.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? colors.error : colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            {meditation.description ||
              'This meditation session is designed to help you find peace and clarity. Follow along with the guided instructions for the best experience.'}
          </Text>

          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.infoText}>{meditation.duration} min</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="volume-high" size={18} color={colors.primary} />
              <Text style={styles.infoText}>Guided</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={18} color={colors.primary} />
              <Text style={styles.infoText}>4.8★</Text>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={['#F8F9FA', '#FFFFFF']}
          style={styles.playerContainer}
        >
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={meditation.gradient || ['#1A826B', '#2BB092']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progressPercentage}%` }]}
              />
            </View>
            <Text style={styles.timeText}>
              {formatTime(meditation.duration * 60)}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color={colors.primary} />
            </TouchableOpacity>

            <LinearGradient
              colors={meditation.gradient || ['#1A826B', '#2BB092']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.playButton,
                isPlaying && styles.playButtonActive,
              ]}
            >
              <TouchableOpacity onPress={handlePlayPause}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color={colors.white}
                />
              </TouchableOpacity>
            </LinearGradient>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons
                name="play-skip-forward"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.volumeControl}>
            <Ionicons name="volume-low" size={20} color={colors.primary} />
            <View style={styles.volumeSlider} />
            <Ionicons name="volume-high" size={20} color={colors.primary} />
          </View>
        </LinearGradient>

        <View style={styles.featuresSection}>
          <Text style={styles.featureTitle}>What to Expect</Text>
          {[
            'Calming background music',
            'Clear spoken guidance',
            'Nature soundscapes',
            'Relaxation techniques',
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.success}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionsSection}>
          <LinearGradient
            colors={meditation.gradient || ['#1A826B', '#2BB092']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButton}
          >
            <TouchableOpacity
              style={styles.buttonContent}
              onPress={() => {
                if (!isPlaying && currentTime === 0) {
                  handlePlayPause();
                } else if (currentTime >= meditation.duration * 60) {
                  handleSessionComplete();
                }
              }}
            >
              <Text style={styles.buttonText}>
                {isPlaying ? 'Pause & Resume Later' : 'Start Meditation'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {currentTime > 0 && currentTime < meditation.duration * 60 && (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleSessionComplete}
            >
              <Text style={styles.finishButtonText}>Finish Now</Text>
            </TouchableOpacity>
          )}
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
  artContainer: {
    width: '100%',
    height: 280,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  meditationIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  favoriteButton: {
    padding: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.light,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: spacing.sm,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  playerContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  timeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  controlButton: {
    paddingHorizontal: spacing.lg,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    ...shadows.medium,
  },
  playButtonActive: {
    opacity: 0.9,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
  },
  featuresSection: {
    marginBottom: spacing.xl,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  featureText: {
    marginLeft: spacing.md,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  buttonContent: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  finishButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...shadows.light,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default MeditationDetailScreen;