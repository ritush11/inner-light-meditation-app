import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../styles/theme';

const Card = ({
  title,
  subtitle,
  duration,
  icon,
  onPress,
  style,
  variant = 'default', // 'default', 'featured'
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        variant === 'featured' && styles.cardFeatured,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon || 'leaf'}
          size={32}
          color={variant === 'featured' ? colors.white : colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            variant === 'featured' && styles.titleFeatured,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              variant === 'featured' && styles.subtitleFeatured,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {duration && (
        <View style={styles.durationContainer}>
          <Text
            style={[
              styles.duration,
              variant === 'featured' && styles.durationFeatured,
            ]}
          >
            {duration} min
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  cardFeatured: {
    backgroundColor: colors.primary,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  titleFeatured: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  subtitleFeatured: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  durationContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  durationFeatured: {
    color: colors.primary,
  },
});

export default Card;