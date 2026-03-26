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

const quizzes = [
  {
    id: 1,
    title: 'Stress Level Assessment',
    description: 'Evaluate your current stress levels',
    icon: 'alert-circle',
    color: '#FF6B9D',
    duration: '5 min',
    questions: 5,
  },
  {
    id: 2,
    title: 'Anxiety Check-In',
    description: 'Understand your anxiety patterns',
    icon: 'warning',
    color: '#FFA500',
    duration: '5 min',
    questions: 6,
  },
  {
    id: 3,
    title: 'Mood Wellness Quiz',
    description: 'Overall emotional well-being assessment',
    icon: 'happy',
    color: '#FFD700',
    duration: '7 min',
    questions: 8,
  },
  {
    id: 4,
    title: 'Sleep Quality Assessment',
    description: 'Evaluate your sleep patterns',
    icon: 'moon',
    color: '#8B7FD9',
    duration: '6 min',
    questions: 7,
  },
];

const quizQuestions = {
  1: [
    {
      question: 'How stressed do you feel today?',
      options: ['Not stressed', 'Mildly stressed', 'Moderately stressed', 'Very stressed'],
    },
    {
      question: 'How often do you feel overwhelmed?',
      options: ['Rarely', 'Sometimes', 'Often', 'Very often'],
    },
    {
      question: 'How well do you manage stress?',
      options: ['Excellent', 'Good', 'Fair', 'Poor'],
    },
    {
      question: 'Impact on daily activities?',
      options: ['No impact', 'Minimal', 'Moderate', 'Significant'],
    },
    {
      question: 'Need for stress management?',
      options: ['Not needed', 'Somewhat', 'Moderately', 'Definitely'],
    },
  ],
};

const MentalHealthQuizScreen = ({ navigation }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const startQuiz = (quizId) => {
    setSelectedQuiz(quizId);
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions[selectedQuiz].length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizStarted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setQuizCompleted(false);
  };

  const getScore = () => {
    return Math.round((answers.length / quizQuestions[selectedQuiz].length) * 100);
  };

  // Quiz Results Screen
  if (quizCompleted) {
    const score = getScore();
    const quiz = quizzes.find((q) => q.id === selectedQuiz);

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={resetQuiz}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>

          <LinearGradient
            colors={[quiz.color, quiz.color + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.resultsHeader}
          >
            <Ionicons name={quiz.icon} size={64} color={colors.white} />
            <Text style={styles.resultsTitle}>Quiz Completed!</Text>
            <Text style={styles.resultsSubtitle}>{quiz.title}</Text>
          </LinearGradient>

          {/* Score Circle */}
          <View style={styles.scoreSection}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{score}%</Text>
              <Text style={styles.scoreLabel}>Your Score</Text>
            </View>
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Results</Text>

            {score >= 80 && (
              <View style={styles.insightCard}>
                <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.insightTitle}>Great Job! 🎉</Text>
                  <Text style={styles.insightText}>
                    Your results show you're managing well. Keep up your wellness routine!
                  </Text>
                </View>
              </View>
            )}

            {score >= 50 && score < 80 && (
              <View style={styles.insightCard}>
                <Ionicons name="alert" size={24} color="#FFA500" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.insightTitle}>Room for Improvement</Text>
                  <Text style={styles.insightText}>
                    Consider trying meditation to improve your well-being.
                  </Text>
                </View>
              </View>
            )}

            {score < 50 && (
              <View style={styles.insightCard}>
                <Ionicons name="warning" size={24} color="#FF6B9D" />
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.insightTitle}>Take Care of Yourself</Text>
                  <Text style={styles.insightText}>
                    We recommend seeking support and practicing mindfulness.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>

            {[
              { title: '10-min Calming Meditation', icon: 'leaf', color: '#4ECDC4' },
              { title: 'Deep Breathing Exercise', icon: 'wind', color: '#8B7FD9' },
              { title: 'Relaxation Soundscape', icon: 'musical-notes', color: '#FFB6C1' },
            ].map((rec, index) => (
              <TouchableOpacity key={index} style={styles.recommendationCard}>
                <View
                  style={[
                    styles.recIcon,
                    { backgroundColor: rec.color + '20' },
                  ]}
                >
                  <Ionicons name={rec.icon} size={20} color={rec.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recTitle}>{rec.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.lightGray} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Save Results Button */}
          <LinearGradient
            colors={['#4ECDC4', '#45B7AA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButton}
          >
            <TouchableOpacity
              style={styles.actionButtonContent}
              onPress={() => {
                Alert.alert('Results Saved!', 'Your quiz results have been saved to your profile');
                resetQuiz();
              }}
            >
              <Ionicons name="save" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Save Results</Text>
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            onPress={resetQuiz}
            style={styles.backToQuizzesButton}
          >
            <Text style={styles.backToQuizzesText}>Back to Quizzes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz in Progress
  if (quizStarted && selectedQuiz) {
    const quiz = quizzes.find((q) => q.id === selectedQuiz);
    const questions = quizQuestions[selectedQuiz] || [];
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.quizHeader}>
            <TouchableOpacity onPress={resetQuiz}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[quiz.color, quiz.color + '80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of {questions.length}
            </Text>
          </View>

          {/* Question */}
          {currentQ && (
            <View style={styles.questionSection}>
              <Text style={styles.questionText}>{currentQ.question}</Text>

              {/* Answer Options */}
              <View style={styles.optionsContainer}>
                {currentQ.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionButton}
                    onPress={() => handleAnswer(option)}
                  >
                    <View style={styles.optionCircle} />
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz Selection Screen
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
          <Text style={styles.title}>Mental Health Quiz</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Intro */}
        <LinearGradient
          colors={['#8B7FD9', '#A89FE0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.introCard}
        >
          <Ionicons name="help-circle" size={32} color={colors.white} />
          <Text style={styles.introTitle}>Self-Reflection Quizzes</Text>
          <Text style={styles.introText}>
            Take our interactive quizzes to understand your mental health better and get personalized recommendations.
          </Text>
        </LinearGradient>

        {/* Quiz List */}
        <View style={styles.section}>
          {quizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              style={styles.quizCard}
              onPress={() => startQuiz(quiz.id)}
            >
              <View
                style={[
                  styles.quizIconBox,
                  { backgroundColor: quiz.color + '20' },
                ]}
              >
                <Ionicons name={quiz.icon} size={28} color={quiz.color} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.quizCardTitle}>{quiz.title}</Text>
                <Text style={styles.quizCardDesc}>{quiz.description}</Text>
                <View style={styles.quizMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{quiz.duration}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="list" size={14} color={colors.textSecondary} />
                    <Text style={styles.metaText}>{quiz.questions} Questions</Text>
                  </View>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.lightGray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            These quizzes are for self-reflection only. For professional mental health support, please consult a healthcare provider.
          </Text>
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
  introCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  introTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.md,
  },
  introText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  section: {
    marginBottom: spacing.xl,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  quizIconBox: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quizCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quizCardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quizMeta: {
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#F0F8F8',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  infoText: {
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBarBg: {
    height: 6,
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
  questionSection: {
    marginBottom: spacing.xl,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.lightBorder,
    ...shadows.light,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
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
  resultsHeader: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginTop: spacing.lg,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.light,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  insightText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  recIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  backToQuizzesButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  backToQuizzesText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default MentalHealthQuizScreen;