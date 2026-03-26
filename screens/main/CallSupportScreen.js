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

const counselors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Anxiety & Depression',
    experience: '10 years',
    rating: 4.9,
    reviews: 324,
    hourlyRate: '$50',
    availability: 'Available Today',
    avatar: '👩‍⚕️',
    bio: 'Specializing in anxiety, depression, and stress management',
    languages: ['English', 'Spanish'],
    certifications: ['PhD', 'Therapist', 'Counselor'],
  },
  {
    id: 2,
    name: 'James Miller',
    specialty: 'Work & Life Balance',
    experience: '8 years',
    rating: 4.8,
    reviews: 256,
    hourlyRate: '$45',
    availability: 'Available in 2 hours',
    avatar: '👨‍⚕️',
    bio: 'Expert in helping with work stress and life transitions',
    languages: ['English'],
    certifications: ['Masters', 'Therapist'],
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    specialty: 'Mindfulness & Sleep',
    experience: '12 years',
    rating: 4.7,
    reviews: 412,
    hourlyRate: '$55',
    availability: 'Available Tomorrow',
    avatar: '👩‍⚕️',
    bio: 'Specializing in mindfulness meditation and sleep issues',
    languages: ['English', 'Spanish', 'Portuguese'],
    certifications: ['PhD', 'Therapist', 'Mindfulness Coach'],
  },
  {
    id: 4,
    name: 'Michael Chen',
    specialty: 'Relationships & Communication',
    experience: '7 years',
    rating: 4.8,
    reviews: 189,
    hourlyRate: '$48',
    availability: 'Available Today',
    avatar: '👨‍⚕️',
    bio: 'Expert in relationship counseling and communication skills',
    languages: ['English', 'Mandarin'],
    certifications: ['Masters', 'Therapist'],
  },
];

const CallSupportScreen = ({ navigation }) => {
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const handleBooking = (counselor) => {
    Alert.alert(
      'Booking Confirmed',
      `You have successfully booked a session with ${counselor.name}\n\nTime: 30 minutes from now\nRate: ${counselor.hourlyRate}/hour\n\nA confirmation has been sent to your email.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedCounselor(null);
          },
        },
      ]
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Support',
      'If you are in crisis, please contact:\n\n🚨 National Crisis Hotline: 1-800-273-8255\n\nWould you like to be connected to immediate support?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Call Now',
          onPress: () => Alert.alert('Connecting...', 'Connecting you to support services'),
        },
      ]
    );
  };

  // Counselor Detail View
  if (selectedCounselor) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => setSelectedCounselor(null)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>

          {/* Counselor Card */}
          <LinearGradient
            colors={['#8B7FD9', '#A89FE0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.counselorHeader}
          >
            <Text style={styles.avatar}>{selectedCounselor.avatar}</Text>
            <Text style={styles.counselorName}>{selectedCounselor.name}</Text>
            <Text style={styles.specialty}>{selectedCounselor.specialty}</Text>
            <View style={styles.ratingSection}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {selectedCounselor.rating} ({selectedCounselor.reviews} reviews)
              </Text>
            </View>
          </LinearGradient>

          {/* Info Sections */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="briefcase" size={18} color={colors.primary} />
                <View>
                  <Text style={styles.infoLabel}>Experience</Text>
                  <Text style={styles.infoValue}>{selectedCounselor.experience}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="cash" size={18} color={colors.primary} />
                <View>
                  <Text style={styles.infoLabel}>Hourly Rate</Text>
                  <Text style={styles.infoValue}>{selectedCounselor.hourlyRate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <View>
                  <Text style={styles.infoLabel}>Availability</Text>
                  <Text style={styles.infoValue}>{selectedCounselor.availability}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{selectedCounselor.bio}</Text>
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.tagsContainer}>
              {selectedCounselor.languages.map((lang, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Certifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.tagsContainer}>
              {selectedCounselor.certifications.map((cert, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.primary + '20' }]}
                >
                  <Text style={[styles.tagText, { color: colors.primary }]}>
                    {cert}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Booking Button */}
          <LinearGradient
            colors={['#4ECDC4', '#45B7AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookButton}
          >
            <TouchableOpacity
              style={styles.bookButtonContent}
              onPress={() => handleBooking(selectedCounselor)}
            >
              <Ionicons name="calendar" size={20} color={colors.white} />
              <Text style={styles.bookButtonText}>Book Session Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Support Screen
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
          <Text style={styles.title}>Call Support</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={handleEmergencyCall}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF5E8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emergencyContent}
          >
            <Ionicons name="alert-circle" size={24} color={colors.white} />
            <View style={{ flex: 1, marginLeft: spacing.lg }}>
              <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
              <Text style={styles.emergencyText}>
                24/7 Crisis support available
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="videocam" size={24} color="#4ECDC4" />
            <Text style={styles.infoCardTitle}>Video Calls</Text>
            <Text style={styles.infoCardText}>1-on-1 video sessions</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color="#8B7FD9" />
            <Text style={styles.infoCardTitle}>Flexible</Text>
            <Text style={styles.infoCardText}>Book at your pace</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={24} color="#FFB6C1" />
            <Text style={styles.infoCardTitle}>Private</Text>
            <Text style={styles.infoCardText}>100% Confidential</Text>
          </View>
        </View>

        {/* Counselors List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Counselors</Text>
          <Text style={styles.sectionSubtitle}>
            Connect with certified mental health professionals
          </Text>

          {counselors.map((counselor) => (
            <TouchableOpacity
              key={counselor.id}
              style={styles.counselorCard}
              onPress={() => setSelectedCounselor(counselor)}
            >
              <View style={styles.counselorLeft}>
                <Text style={styles.counselorAvatar}>{counselor.avatar}</Text>
              </View>

              <View style={styles.counselorCenter}>
                <Text style={styles.counselorCardName}>{counselor.name}</Text>
                <Text style={styles.counselorSpecialty}>
                  {counselor.specialty}
                </Text>
                <View style={styles.counselorMeta}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.metaText}>
                    {counselor.rating} • {counselor.experience}
                  </Text>
                </View>
              </View>

              <View style={styles.counselorRight}>
                <Text style={styles.hourlyRate}>{counselor.hourlyRate}</Text>
                <Text style={styles.availabilityText}>✓ Now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepContainer}>
            {[
              { icon: 'person', title: 'Choose Counselor', desc: 'Select from verified professionals' },
              { icon: 'calendar', title: 'Book Session', desc: 'Pick a convenient time' },
              { icon: 'videocam', title: 'Video Call', desc: 'Private 1-on-1 session' },
              { icon: 'checkmark', title: 'Get Support', desc: 'Professional guidance & care' },
            ].map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
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
  emergencyBanner: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  emergencyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.light,
  },
  infoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  infoCardText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
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
  counselorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  counselorLeft: {
    marginRight: spacing.lg,
  },
  counselorAvatar: {
    fontSize: 40,
  },
  counselorCenter: {
    flex: 1,
  },
  counselorCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  counselorSpecialty: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  counselorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  counselorRight: {
    alignItems: 'flex-end',
  },
  hourlyRate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  availabilityText: {
    fontSize: 11,
    color: colors.success,
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
  counselorHeader: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  avatar: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  counselorName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  specialty: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.light,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tag: {
    backgroundColor: '#F0F8F8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  bookButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  stepContainer: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.light,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: '#F0F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default CallSupportScreen;