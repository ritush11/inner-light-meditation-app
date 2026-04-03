import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { getUserQuizResults, saveQuizResult } from '../../firebase/firebaseUtils';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyCard:    '#162035',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  amber:       '#F59E0B',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  error:       '#F87171',
  success:     '#34D399',
};

const QUIZZES = [
  { id: 'stress_assessment', title: 'Stress Assessment',    desc: 'Evaluate your current stress levels',      icon: 'alert-circle-outline', color: '#F87171',  questions: 5 },
  { id: 'anxiety_checkin',   title: 'Anxiety Check-In',     desc: 'Understand your anxiety patterns',         icon: 'warning-outline',      color: '#FB923C',  questions: 5 },
  { id: 'mood_wellness',     title: 'Mood Wellness',         desc: 'Overall emotional well-being assessment',  icon: 'happy-outline',        color: '#F59E0B',  questions: 5 },
  { id: 'sleep_quality',     title: 'Sleep Quality',         desc: 'Evaluate your sleep patterns',             icon: 'moon-outline',         color: '#A78BFA',  questions: 5 },
];

const QUESTIONS = {
  stress_assessment: [
    { question: 'How stressed do you feel today?',        options: ['Not stressed', 'Mildly stressed', 'Moderately stressed', 'Very stressed'] },
    { question: 'How often do you feel overwhelmed?',     options: ['Rarely', 'Sometimes', 'Often', 'Very often'] },
    { question: 'How well do you manage stress?',         options: ['Excellent', 'Good', 'Fair', 'Poor'] },
    { question: 'How much does stress impact your day?',  options: ['No impact', 'Minimal', 'Moderate', 'Significant'] },
    { question: 'How tense or anxious do you feel?',      options: ['Not at all', 'A little', 'Quite a bit', 'Extremely'] },
  ],
  anxiety_checkin: [
    { question: 'How anxious do you feel right now?',                  options: ['Not at all', 'A little', 'Moderately', 'Very anxious'] },
    { question: 'How often do you experience worry?',                   options: ['Rarely', 'Sometimes', 'Often', 'Almost always'] },
    { question: 'Do you have trouble relaxing?',                        options: ['Never', 'Sometimes', 'Often', 'Always'] },
    { question: 'How often do physical symptoms of anxiety occur?',     options: ['Never', 'Occasionally', 'Frequently', 'Constantly'] },
    { question: 'Does anxiety interfere with your daily activities?',   options: ['Not at all', 'Slightly', 'Moderately', 'Severely'] },
  ],
  mood_wellness: [
    { question: 'How would you describe your overall mood today?',      options: ['Excellent', 'Good', 'Fair', 'Poor'] },
    { question: 'How often do you feel positive emotions?',             options: ['Most of the time', 'Often', 'Sometimes', 'Rarely'] },
    { question: 'How connected do you feel to others?',                 options: ['Very connected', 'Connected', 'Somewhat isolated', 'Very isolated'] },
    { question: 'How motivated are you to do daily activities?',        options: ['Highly motivated', 'Motivated', 'Low motivation', 'No motivation'] },
    { question: 'How satisfied are you with your life right now?',      options: ['Very satisfied', 'Satisfied', 'Dissatisfied', 'Very dissatisfied'] },
  ],
  sleep_quality: [
    { question: 'How many hours of sleep do you get per night?',    options: ['7-9 hours', '6-7 hours', '5-6 hours', 'Less than 5'] },
    { question: 'How often do you have trouble falling asleep?',     options: ['Never', 'Rarely', 'Sometimes', 'Often'] },
    { question: 'How refreshed do you feel after waking up?',        options: ['Very refreshed', 'Refreshed', 'Somewhat tired', 'Very tired'] },
    { question: 'How often do you wake up during the night?',        options: ['Never', 'Rarely', 'Sometimes', 'Often'] },
    { question: 'How much does poor sleep affect your day?',         options: ['Not at all', 'Slightly', 'Moderately', 'Significantly'] },
  ],
};

const calcScore = (answers) => {
  if (!answers.length) return 0;
  const pts = answers.map(i => i === 0 ? 100 : i === 1 ? 75 : i === 2 ? 50 : 25);
  return Math.round(pts.reduce((a, b) => a + b, 0) / pts.length);
};

const getLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Attention';
};

const getRecs = (score) => {
  if (score >= 80) return ['Keep up your mindfulness routine!', 'Try advanced meditation sessions', 'Share your wellness tips with others'];
  if (score >= 60) return ['Try a 10-min daily meditation', 'Practice box breathing exercises', 'Keep a daily wellness journal'];
  return ['Start with 5-min guided meditation', 'Try the 4-7-8 breathing technique', 'Consider speaking with a professional'];
};

const getScoreColor = (score) => score >= 80 ? P.success : score >= 60 ? P.amber : P.error;

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const MentalHealthQuizScreen = ({ navigation }) => {
  const [selectedId, setSelectedId]     = useState(null);
  const [currentQ, setCurrentQ]         = useState(0);
  const [answers, setAnswers]           = useState([]);
  const [quizStarted, setQuizStarted]   = useState(false);
  const [quizDone, setQuizDone]         = useState(false);
  const [saving, setSaving]             = useState(false);
  const [pastResults, setPastResults]   = useState([]);
  const [loadingHist, setLoadingHist]   = useState(true);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoadingHist(false); return; }
    getUserQuizResults(uid).then(r => setPastResults(r)).catch(() => {}).finally(() => setLoadingHist(false));
  }, []);

  const startQuiz = (id) => { setSelectedId(id); setQuizStarted(true); setCurrentQ(0); setAnswers([]); setQuizDone(false); };
  const reset     = () => { setSelectedId(null); setQuizStarted(false); setCurrentQ(0); setAnswers([]); setQuizDone(false); };

  const handleAnswer = (idx) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    const qs = QUESTIONS[selectedId];
    if (currentQ < qs.length - 1) setCurrentQ(currentQ + 1);
    else setQuizDone(true);
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'You must be logged in.'); return; }
    const quiz  = QUIZZES.find(q => q.id === selectedId);
    const score = calcScore(answers);
    setSaving(true);
    try {
      await saveQuizResult(uid, {
        quizId: selectedId, quizTitle: quiz.title,
        score, maxScore: 100, category: selectedId,
        resultLabel: getLabel(score), answers,
        recommendations: getRecs(score),
      });
      Alert.alert('Saved! ✅', 'Your quiz results have been saved.');
      const r = await getUserQuizResults(uid);
      setPastResults(r);
      reset();
    } catch { Alert.alert('Error', 'Failed to save results.'); }
    finally { setSaving(false); }
  };

  // ── Results ───────────────────────────────────────────────
  if (quizDone && selectedId) {
    const quiz  = QUIZZES.find(q => q.id === selectedId);
    const score = calcScore(answers);
    const label = getLabel(score);
    const recs  = getRecs(score);
    const sColor = getScoreColor(score);

    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <TouchableOpacity style={styles.backCircle} onPress={reset}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </TouchableOpacity>

          {/* Results Hero */}
          <LinearGradient colors={[quiz.color + 'CC', quiz.color + '66']} style={styles.resultsHero}>
            <View style={styles.heroRing} />
            <Ionicons name={quiz.icon} size={52} color={P.white} />
            <Text style={styles.resultsBadge}>Quiz Complete!</Text>
            <Text style={styles.resultsQuizTitle}>{quiz.title}</Text>
          </LinearGradient>

          {/* Score circle */}
          <View style={styles.scoreWrap}>
            <View style={[styles.scoreCircle, { borderColor: sColor }]}>
              <Text style={[styles.scoreVal, { color: sColor }]}>{score}%</Text>
              <Text style={styles.scoreLabel}>{label}</Text>
            </View>
          </View>

          {/* Insight */}
          <View style={styles.insightCard}>
            <View style={[styles.insightIconBox, { backgroundColor: sColor + '20' }]}>
              <Ionicons name={score >= 80 ? 'checkmark-circle-outline' : score >= 60 ? 'alert-circle-outline' : 'heart-outline'} size={22} color={sColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>
                {score >= 80 ? 'Great Job! 🎉' : score >= 60 ? 'Room to Improve' : 'Take Care 💙'}
              </Text>
              <Text style={styles.insightText}>
                {score >= 80
                  ? 'You\'re managing well. Keep up your wellness routine!'
                  : score >= 60
                  ? 'Consider daily meditation to improve your well-being.'
                  : 'We recommend practicing mindfulness daily.'}
              </Text>
            </View>
          </View>

          {/* Recommendations */}
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <View style={styles.recsCard}>
            {recs.map((r, i) => (
              <View key={i} style={[styles.recRow, i > 0 && styles.recBorder]}>
                <View style={[styles.recDot, { backgroundColor: quiz.color }]} />
                <Text style={styles.recText}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88} style={styles.saveBtnWrap}>
            <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
              {saving ? <ActivityIndicator color={P.white} /> : (
                <>
                  <Ionicons name="save-outline" size={20} color={P.white} />
                  <Text style={styles.saveBtnText}>Save Results</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={reset}>
            <Text style={styles.outlineBtnText}>Back to Quizzes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Quiz in Progress ──────────────────────────────────────
  if (quizStarted && selectedId) {
    const quiz     = QUIZZES.find(q => q.id === selectedId);
    const qs       = QUESTIONS[selectedId];
    const question = qs[currentQ];
    const progress = ((currentQ + 1) / qs.length) * 100;

    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.quizHeader}>
            <TouchableOpacity style={styles.closeBtn} onPress={reset}>
              <Ionicons name="close" size={20} color={P.white} />
            </TouchableOpacity>
            <Text style={styles.quizHeaderTitle} numberOfLines={1}>{quiz.title}</Text>
            <Text style={styles.quizCounter}>{currentQ + 1}/{qs.length}</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[quiz.color, quiz.color + '80']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNum}>Question {currentQ + 1}</Text>
            <Text style={styles.questionText}>{question.question}</Text>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {question.options.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => handleAnswer(i)} activeOpacity={0.88}>
                <View style={[styles.optionDot, { borderColor: quiz.color }]} />
                <Text style={styles.optionText}>{opt}</Text>
                <Ionicons name="chevron-forward" size={16} color={P.dimmed} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Quiz List ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>SELF-CARE</Text>
            <Text style={styles.headerTitle}>Mental Health Quiz</Text>
          </View>
          <View style={[styles.backCircle, { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: P.purpleSoft + '40' }]}>
            <Ionicons name="help-circle-outline" size={20} color={P.purpleSoft} />
          </View>
        </View>

        {/* Intro Banner */}
        <LinearGradient colors={[P.purpleSoft, P.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.introBanner}>
          <View style={styles.bannerRing} />
          <Ionicons name="brain-outline" size={36} color={P.white} />
          <Text style={styles.bannerTitle}>Self-Reflection Quizzes</Text>
          <Text style={styles.bannerSub}>Understand your mental health and get personalised recommendations</Text>
        </LinearGradient>

        {/* Quiz Cards */}
        <Text style={styles.sectionTitle}>Choose a Quiz</Text>
        <View style={styles.quizList}>
          {QUIZZES.map(quiz => {
            const last = pastResults.find(r => r.quizId === quiz.id);
            return (
              <TouchableOpacity key={quiz.id} style={styles.quizCard} onPress={() => startQuiz(quiz.id)} activeOpacity={0.88}>
                <LinearGradient colors={[quiz.color + '25', quiz.color + '08']} style={styles.quizCardGrad} />
                <View style={[styles.quizIconBox, { backgroundColor: quiz.color + '20' }]}>
                  <Ionicons name={quiz.icon} size={26} color={quiz.color} />
                </View>
                <View style={styles.quizInfo}>
                  <Text style={styles.quizTitle}>{quiz.title}</Text>
                  <Text style={styles.quizDesc}>{quiz.desc}</Text>
                  <View style={styles.quizMeta}>
                    <View style={styles.metaPill}>
                      <Ionicons name="list-outline" size={12} color={P.muted} />
                      <Text style={styles.metaText}>{quiz.questions} questions</Text>
                    </View>
                    {last && (
                      <View style={[styles.metaPill, { backgroundColor: getScoreColor(last.score) + '20' }]}>
                        <Ionicons name="checkmark-circle-outline" size={12} color={getScoreColor(last.score)} />
                        <Text style={[styles.metaText, { color: getScoreColor(last.score) }]}>
                          Last: {last.score}%
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={P.dimmed} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Past Results */}
        {!loadingHist && pastResults.length > 0 && (
          <View style={styles.pastSection}>
            <Text style={styles.sectionTitle}>Recent Results</Text>
            <View style={styles.pastCard}>
              {pastResults.slice(0, 3).map((r, i) => (
                <View key={r.id} style={[styles.pastRow, i > 0 && styles.pastBorder]}>
                  <View style={styles.pastLeft}>
                    <Text style={styles.pastTitle} numberOfLines={1}>{r.quizTitle}</Text>
                    <Text style={styles.pastDate}>{fmtDate(r.timestamp)}</Text>
                  </View>
                  <View style={[styles.pastBadge, { backgroundColor: getScoreColor(r.score) + '20' }]}>
                    <Text style={[styles.pastScore, { color: getScoreColor(r.score) }]}>{r.score}%</Text>
                    <Text style={[styles.pastLabel, { color: getScoreColor(r.score) }]}>{r.resultLabel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glow:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.purpleSoft, opacity: 0.07 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backCircle:  { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, color: P.purpleSoft, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: P.white, textAlign: 'center' },

  introBanner: { borderRadius: 22, padding: 24, alignItems: 'center', marginBottom: 28, overflow: 'hidden', shadowColor: P.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
  bannerRing:  { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: P.white, marginTop: 12, marginBottom: 6 },
  bannerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 14 },

  quizList:    { gap: 10, marginBottom: 28 },
  quizCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  quizCardGrad:{ ...StyleSheet.absoluteFillObject },
  quizIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  quizInfo:    { flex: 1 },
  quizTitle:   { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 3 },
  quizDesc:    { fontSize: 12, color: P.muted, marginBottom: 8 },
  quizMeta:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.glass, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: P.glassBorder },
  metaText:    { fontSize: 11, color: P.muted, fontWeight: '600' },

  pastSection: { marginBottom: 28 },
  pastCard:    { backgroundColor: P.navyCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  pastRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  pastBorder:  { borderTopWidth: 1, borderTopColor: P.glassBorder },
  pastLeft:    { flex: 1, marginRight: 12 },
  pastTitle:   { fontSize: 14, fontWeight: '600', color: P.white },
  pastDate:    { fontSize: 11, color: P.muted, marginTop: 2 },
  pastBadge:   { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', minWidth: 80 },
  pastScore:   { fontSize: 16, fontWeight: '800' },
  pastLabel:   { fontSize: 10, fontWeight: '600', marginTop: 1 },

  // Quiz in progress
  quizHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  closeBtn:        { width: 38, height: 38, borderRadius: 11, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  quizHeaderTitle: { fontSize: 15, fontWeight: '700', color: P.white, flex: 1, textAlign: 'center', marginHorizontal: 10 },
  quizCounter:     { fontSize: 13, color: P.teal, fontWeight: '700' },

  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden', marginBottom: 28 },
  progressFill:  { height: '100%', borderRadius: 5 },

  questionCard: { backgroundColor: P.navyCard, borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: P.glassBorder },
  questionNum:  { fontSize: 11, color: P.teal, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  questionText: { fontSize: 18, fontWeight: '700', color: P.white, lineHeight: 26 },

  options:    { gap: 10 },
  optionBtn:  { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.glassBorder, gap: 12 },
  optionDot:  { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  optionText: { flex: 1, fontSize: 14, color: P.white, fontWeight: '500' },

  // Results
  resultsHero:      { borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  heroRing:         { position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  resultsBadge:     { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 2, marginTop: 14, marginBottom: 4 },
  resultsQuizTitle: { fontSize: 20, fontWeight: '800', color: P.white },

  scoreWrap:   { alignItems: 'center', marginBottom: 24 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: P.navyCard, justifyContent: 'center', alignItems: 'center', borderWidth: 4 },
  scoreVal:    { fontSize: 44, fontWeight: '800' },
  scoreLabel:  { fontSize: 13, color: P.muted, marginTop: 4, fontWeight: '600' },

  insightCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: P.navyCard, borderRadius: 18, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: P.glassBorder },
  insightIconBox: { width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  insightTitle:   { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 4 },
  insightText:    { fontSize: 13, color: P.muted, lineHeight: 20 },

  recsCard:   { backgroundColor: P.navyCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder, marginBottom: 24 },
  recRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  recBorder:  { borderTopWidth: 1, borderTopColor: P.glassBorder },
  recDot:     { width: 8, height: 8, borderRadius: 4 },
  recText:    { fontSize: 14, color: P.muted, flex: 1, lineHeight: 20 },

  saveBtnWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 12, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  saveBtn:     { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: P.white },
  outlineBtn:  { height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1.5, borderColor: P.glassBorder },
  outlineBtnText: { fontSize: 15, fontWeight: '700', color: P.muted },
});

export default MentalHealthQuizScreen;