import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { borderRadius, colors, spacing } from '../styles/theme';

const Button = ({
  onPress,
  title,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const variants = {
      primary: {
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
      secondary: {
        backgroundColor: colors.secondary,
      },
      outline: {
        backgroundColor: colors.transparent,
        borderWidth: 2,
        borderColor: colors.primary,
      },
    };

    const sizes = {
      small: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
      },
      medium: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      },
      large: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
      },
    };

    return [
      styles.button,
      variants[variant],
      sizes[size],
      disabled && styles.disabled,
      style,
    ];
  };

  const getTextStyle = () => {
    const variants = {
      primary: { color: colors.white },
      secondary: { color: colors.white },
      outline: { color: colors.primary },
    };

    return [styles.text, variants[variant], textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;