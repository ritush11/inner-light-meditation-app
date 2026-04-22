import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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

// ── Quiz data ─────────────────────────────────────────────────
const QUIZZES = [
  {
    id: 'stress_assessment', title: 'Stress Check',
    desc: 'How are you handling life\'s pressures?',
    icon: 'flame-outline', color: '#F87171',
    xpReward: 50, badge: 'Stress Analyst',
    questions: [
      { q: 'How stressed do you feel today?',        opts: ['Totally calm', 'Mildly stressed', 'Quite stressed', 'Very overwhelmed'], hint: 'Be honest with yourself' },
      { q: 'How often do you feel overwhelmed?',     opts: ['Rarely ever', 'Sometimes', 'Often', 'Almost always'], hint: 'Think about the past week' },
      { q: 'How well do you manage stress?',         opts: ['Excellent', 'Pretty well', 'Struggling', 'Not coping'], hint: 'Your coping strategies matter' },
      { q: 'How much does stress affect your day?',  opts: ['No impact', 'A little', 'Quite a bit', 'Completely'], hint: 'Consider your productivity' },
      { q: 'How tense or anxious do you feel?',      opts: ['Not at all', 'Slightly', 'Quite tense', 'Extremely'], hint: 'Physical tension counts too' },
    ],
  },
  {
    id: 'anxiety_checkin', title: 'Anxiety Check',
    desc: 'Understand your worry patterns',
    icon: 'pulse-outline', color: '#FB923C',
    xpReward: 50, badge: 'Mindful Observer',
    questions: [
      { q: 'How anxious do you feel right now?',              opts: ['Not at all', 'A little bit', 'Moderately', 'Very anxious'], hint: 'Right this moment' },
      { q: 'How often do you experience racing thoughts?',    opts: ['Rarely', 'Sometimes', 'Often', 'Almost always'], hint: 'Thoughts that won\'t slow down' },
      { q: 'Do you have trouble relaxing?',                   opts: ['Never', 'Sometimes', 'Often', 'Can\'t relax at all'], hint: 'Even in calm situations' },
      { q: 'How often do physical symptoms occur?',          opts: ['Never', 'Occasionally', 'Frequently', 'Constantly'], hint: 'e.g. racing heart, tight chest' },
      { q: 'Does anxiety interfere with your activities?',   opts: ['Not at all', 'Slightly', 'Moderately', 'Severely'], hint: 'Work, social life, daily tasks' },
    ],
  },
  {
    id: 'mood_wellness', title: 'Mood Check',
    desc: 'How is your emotional well-being?',
    icon: 'sunny-outline', color: '#F59E0B',
    xpReward: 50, badge: 'Mood Master',
    questions: [
      { q: 'How would you describe your overall mood?',     opts: ['Excellent', 'Pretty good', 'Up and down', 'Low'], hint: 'Your general emotional state' },
      { q: 'How often do you feel positive emotions?',      opts: ['Most of the time', 'Often', 'Sometimes', 'Rarely'], hint: 'Joy, gratitude, excitement' },
      { q: 'How connected do you feel to others?',          opts: ['Very connected', 'Connected', 'A bit isolated', 'Very isolated'], hint: 'Relationships and belonging' },
      { q: 'How motivated are you for daily activities?',   opts: ['Highly motivated', 'Motivated', 'Low motivation', 'No motivation'], hint: 'Getting things done' },
      { q: 'How satisfied are you with life right now?',    opts: ['Very satisfied', 'Satisfied', 'Dissatisfied', 'Very dissatisfied'], hint: 'Big picture view' },
    ],
  },
  {
    id: 'sleep_quality', title: 'Sleep Check',
    desc: 'How well are you really sleeping?',
    icon: 'moon-outline', color: '#A78BFA',
    xpReward: 50, badge: 'Sleep Scholar',
    questions: [
      { q: 'How many hours of sleep per night?',           opts: ['7–9 hours', '6–7 hours', '5–6 hours', 'Less than 5'], hint: 'Your average on weekdays' },
      { q: 'How often do you struggle to fall asleep?',    opts: ['Never', 'Rarely', 'Sometimes', 'Most nights'], hint: 'Lying awake at night' },
      { q: 'How refreshed do you feel after waking?',      opts: ['Very refreshed', 'Okay', 'Somewhat tired', 'Exhausted'], hint: 'First 30 minutes of the day' },
      { q: 'How often do you wake up during the night?',   opts: ['Never', 'Rarely', 'Sometimes', 'Often'], hint: 'Interruptions to sleep' },
      { q: 'How much does poor sleep affect your day?',    opts: ['Not at all', 'A little', 'Quite a lot', 'Significantly'], hint: 'Focus, mood, energy' },
    ],
  },
];

const calcScore  = (ans) => !ans.length ? 0 : Math.round(ans.map(i => [100,75,50,25][i]).reduce((a,b)=>a+b,0)/ans.length);
const getLabel   = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs Care';
const getColor   = (s) => s >= 80 ? P.success : s >= 60 ? P.amber : s >= 40 ? '#FB923C' : P.error;
const getXP      = (s) => s >= 80 ? 50 : s >= 60 ? 35 : s >= 40 ? 20 : 15;
const getRecs    = (s) => {
  if (s >= 80) return ['Maintain your current wellness routine', 'Try advanced meditation to deepen your practice', 'Help others by sharing your wellness journey'];
  if (s >= 60) return ['Add a 10-minute daily meditation session', 'Practice box breathing when feeling tense', 'Keep a daily wellness journal for 7 days'];
  if (s >= 40) return ['Start with a 5-minute guided meditation daily', 'Try the 4-7-8 breathing technique before bed', 'Consider speaking with a wellness counsellor'];
  return ['Please speak with a mental health professional', 'Use the Support tab to access helplines', 'Begin with just 3 minutes of breathing daily'];
};

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ── Score ring (animated) ─────────────────────────────────────
const ScoreRing = ({ score, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);
  return (
    <View style={st.ringWrap}>
      <View style={[st.ringOuter, { borderColor: color + '30' }]}>
        <View style={[st.ringInner, { borderColor: color }]}>
          <Text style={[st.ringScore, { color }]}>{score}%</Text>
          <Text style={[st.ringLabel, { color }]}>{getLabel(score)}</Text>
        </View>
      </View>
      {/* XP burst */}
      <View style={[st.xpBurst, { backgroundColor: color }]}>
        <Text style={st.xpBurstText}>+{getXP(score)} XP</Text>
      </View>
    </View>
  );
};

// ── Main component ────────────────────────────────────────────
const MentalHealthQuizScreen = ({ navigation }) => {
  const [phase, setPhase]           = useState('home');   // home | quiz | results
  const [selectedId, setSelectedId] = useState(null);
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState([]);
  const [chosen, setChosen]         = useState(null);     // highlight selected before advancing
  const [saving, setSaving]         = useState(false);
  const [pastResults, setPastResults] = useState([]);
  const [loadingHist, setLoadingHist] = useState(true);

  // animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnim     = useRef(new Animated.Value(0)).current;
  const shakeAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoadingHist(false); return; }
    getUserQuizResults(uid).then(r => setPastResults(r)).catch(() => {}).finally(() => setLoadingHist(false));
  }, []);

  const quiz = QUIZZES.find(q => q.id === selectedId);
  const questions = quiz?.questions || [];
  const score = calcScore(answers);

  const animateCard = () => {
    cardAnim.setValue(0);
    Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
  };

  const startQuiz = (id) => {
    setSelectedId(id);
    setCurrentQ(0);
    setAnswers([]);
    setChosen(null);
    progressAnim.setValue(0);
    setPhase('quiz');
    animateCard();
  };

  const handleAnswer = (idx) => {
    if (chosen !== null) return;   // prevent double tap
    setChosen(idx);

    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      const nextQ = currentQ + 1;

      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: nextQ / questions.length,
        duration: 400,
        useNativeDriver: false,
      }).start();

      if (nextQ < questions.length) {
        setCurrentQ(nextQ);
        setChosen(null);
        animateCard();
      } else {
        setPhase('results');
      }
    }, 400);
  };

  const reset = () => {
    setPhase('home');
    setSelectedId(null);
    setCurrentQ(0);
    setAnswers([]);
    setChosen(null);
    progressAnim.setValue(0);
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'You must be logged in.'); return; }
    setSaving(true);
    try {
      await saveQuizResult(uid, {
        quizId: selectedId, quizTitle: quiz.title,
        score, maxScore: 100, category: selectedId,
        resultLabel: getLabel(score), answers,
        recommendations: getRecs(score),
        xpEarned: getXP(score),
      });
      Alert.alert('Saved!', `You earned +${getXP(score)} XP! Keep going.`);
      const r = await getUserQuizResults(uid);
      setPastResults(r);
      reset();
    } catch { Alert.alert('Error', 'Failed to save results.'); }
    finally { setSaving(false); }
  };

  // ── RESULTS SCREEN ─────────────────────────────────────────
  if (phase === 'results' && quiz) {
    const sColor = getColor(score);
    const recs   = getRecs(score);
    const xp     = getXP(score);
    return (
      <SafeAreaView style={st.root}>
        <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

          {/* Hero */}
          <LinearGradient colors={[quiz.color + 'CC', quiz.color + '44']} style={st.resultsHero}>
            <View style={st.heroRing} />
            <View style={st.heroRing2} />
            <Ionicons name={quiz.icon} size={48} color={P.white} />
            <Text style={st.heroComplete}>Quiz Complete!</Text>
            <Text style={st.heroTitle}>{quiz.title}</Text>
            {/* XP badge */}
            <View style={st.xpBadge}>
              <Ionicons name="star" size={14} color={P.amber} />
              <Text style={st.xpBadgeText}>+{xp} XP Earned</Text>
            </View>
          </LinearGradient>

          {/* Score ring */}
          <ScoreRing score={score} color={sColor} />

          {/* Per-question breakdown */}
          <View style={st.breakdownCard}>
            <Text style={st.breakdownTitle}>Your Answers</Text>
            {questions.map((q, i) => {
              const pts = [100,75,50,25][answers[i]];
              const c = pts >= 75 ? P.success : pts >= 50 ? P.amber : P.error;
              return (
                <View key={i} style={[st.breakRow, i > 0 && st.breakBorder]}>
                  <View style={[st.breakDot, { backgroundColor: c }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.breakQ} numberOfLines={1}>{q.q}</Text>
                    <Text style={[st.breakA, { color: c }]}>{q.opts[answers[i]]}</Text>
                  </View>
                  <Text style={[st.breakPts, { color: c }]}>{pts}pts</Text>
                </View>
              );
            })}
          </View>

          {/* Badge earned */}
          <View style={[st.badgeCard, { borderColor: quiz.color + '50' }]}>
            <LinearGradient colors={[quiz.color + '20', 'transparent']} style={StyleSheet.absoluteFillObject} />
            <View style={[st.badgeIconBox, { backgroundColor: quiz.color + '25' }]}>
              <Ionicons name="ribbon" size={26} color={quiz.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.badgeLabel}>BADGE EARNED</Text>
              <Text style={[st.badgeName, { color: quiz.color }]}>{quiz.badge}</Text>
              <Text style={st.badgeDesc}>Complete all 4 quizzes to unlock the Wellness Champion achievement</Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={st.recsCard}>
            <Text style={st.recsTitle}>Your Action Plan</Text>
            {recs.map((r, i) => (
              <View key={i} style={st.recRow}>
                <View style={[st.recNum, { backgroundColor: sColor + '20' }]}>
                  <Text style={[st.recNumText, { color: sColor }]}>{i + 1}</Text>
                </View>
                <Text style={st.recText}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88} style={st.saveBtnWrap}>
            <LinearGradient colors={[sColor, sColor + 'BB']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={st.saveBtn}>
              {saving
                ? <Text style={st.saveBtnText}>Saving...</Text>
                : <><Ionicons name="trophy-outline" size={18} color={P.white} /><Text style={st.saveBtnText}>Save & Earn XP</Text></>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={st.backBtn} onPress={reset}>
            <Text style={st.backBtnText}>Back to Quizzes</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUIZ QUESTION SCREEN ────────────────────────────────────
  if (phase === 'quiz' && quiz) {
    const q         = questions[currentQ];
    const pct       = currentQ / questions.length;
    const qNum      = currentQ + 1;
    const totalQ    = questions.length;

    return (
      <SafeAreaView style={st.root}>
        <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />

        <View style={st.quizTopBar}>
          {/* Back */}
          <TouchableOpacity style={st.quizBackBtn} onPress={reset}>
            <Ionicons name="close" size={20} color={P.muted} />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={st.progressWrap}>
            <Animated.View style={[st.progressFill, {
              width: progressAnim.interpolate({ inputRange:[0,1], outputRange:['0%','100%'] }),
              backgroundColor: quiz.color,
            }]} />
          </View>

          {/* Q counter */}
          <View style={[st.qCounter, { backgroundColor: quiz.color + '20' }]}>
            <Text style={[st.qCounterText, { color: quiz.color }]}>{qNum}/{totalQ}</Text>
          </View>
        </View>

        {/* XP strip */}
        <View style={st.xpStrip}>
          <Ionicons name="star" size={13} color={P.amber} />
          <Text style={st.xpStripText}>+{quiz.xpReward} XP available</Text>
          <View style={st.xpStripDot} />
          <Ionicons name="ribbon-outline" size={13} color={quiz.color} />
          <Text style={[st.xpStripText, { color: quiz.color }]}>Earn "{quiz.badge}" badge</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.quizScroll} keyboardShouldPersistTaps="handled">

          <Animated.View style={[st.qCard, {
            opacity: cardAnim,
            transform: [{ translateY: cardAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }],
          }]}>
            {/* Hint */}
            <View style={st.hintRow}>
              <Ionicons name="bulb-outline" size={13} color={P.amber} />
              <Text style={st.hintText}>{q.hint}</Text>
            </View>

            {/* Question */}
            <Text style={st.questionText}>{q.q}</Text>

            {/* Step dots */}
            <View style={st.stepDots}>
              {questions.map((_, i) => (
                <View key={i} style={[
                  st.stepDot,
                  i < currentQ && { backgroundColor: quiz.color },
                  i === currentQ && { backgroundColor: quiz.color, width: 18 },
                  i > currentQ && { backgroundColor: P.dimmed },
                ]} />
              ))}
            </View>
          </Animated.View>

          {/* Answer options */}
          <View style={st.optionsWrap}>
            {q.opts.map((opt, i) => {
              const isSelected = chosen === i;
              const isPast     = chosen !== null && chosen !== i;
              const optColor   = [P.success, P.teal, P.amber, P.error][i];
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleAnswer(i)}
                  activeOpacity={0.82}
                  disabled={chosen !== null}
                  style={[
                    st.option,
                    isSelected && { borderColor: optColor, backgroundColor: optColor + '18' },
                    isPast && { opacity: 0.35 },
                  ]}
                >
                  <LinearGradient
                    colors={isSelected ? [optColor + '30', optColor + '10'] : ['transparent', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {/* Color bar left */}
                  <View style={[st.optBar, { backgroundColor: optColor }]} />
                  {/* Radio */}
                  <View style={[st.radio, isSelected && { backgroundColor: optColor, borderColor: optColor }]}>
                    {isSelected && <Ionicons name="checkmark" size={13} color={P.white} />}
                  </View>
                  <Text style={[st.optText, isSelected && { color: P.white, fontWeight: '700' }]}>{opt}</Text>
                  {/* Score preview */}
                  <View style={[st.optScore, { backgroundColor: optColor + '15' }]}>
                    <Text style={[st.optScoreText, { color: optColor }]}>{[100,75,50,25][i]}pts</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── HOME SCREEN ─────────────────────────────────────────────
  const totalXP = pastResults.reduce((sum, r) => sum + (r.xpEarned || getXP(r.score)), 0);
  const level   = totalXP < 50 ? 1 : totalXP < 150 ? 2 : totalXP < 300 ? 3 : 4;
  const levelName = ['Beginner', 'Explorer', 'Practitioner', 'Mindfulness Master'][level - 1];
  const levelColor = [P.muted, P.teal, P.purpleSoft, P.amber][level - 1];

  return (
    <SafeAreaView style={st.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={st.glow1} />
      <View style={st.glow2} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

        {/* Header */}
        <View style={st.header}>
          <Text style={st.headerSub}>MENTAL WELLNESS</Text>
          <Text style={st.headerTitle}>Health Quizzes</Text>
        </View>

        {/* Level / XP card */}
        <LinearGradient colors={[P.tealDark + 'AA', P.purple + '66']} style={st.levelCard}>
          <View style={st.levelLeft}>
            <View style={[st.levelBadge, { backgroundColor: levelColor + '25', borderColor: levelColor + '60' }]}>
              <Ionicons name="shield-checkmark" size={18} color={levelColor} />
            </View>
            <View>
              <Text style={st.levelTitle}>{levelName}</Text>
              <Text style={st.levelXP}>{totalXP} XP earned</Text>
            </View>
          </View>
          <View style={st.levelRight}>
            <Text style={st.levelNum}>Lv.{level}</Text>
            <View style={st.levelBar}>
              <View style={[st.levelFill, { width: `${Math.min((totalXP % 150) / 1.5, 100)}%`, backgroundColor: levelColor }]} />
            </View>
            <Text style={st.levelNext}>Next: {150 - (totalXP % 150)} XP</Text>
          </View>
        </LinearGradient>

        {/* Stats row */}
        <View style={st.statsRow}>
          {[
            { icon: 'clipboard-outline',  label: 'Taken',    value: pastResults.length, color: P.teal },
            { icon: 'star-outline',       label: 'Total XP', value: totalXP,            color: P.amber },
            { icon: 'trending-up-outline',label: 'Best',     value: pastResults.length ? Math.max(...pastResults.map(r=>r.score)) + '%' : '-', color: P.purpleSoft },
          ].map((s, i) => (
            <View key={i} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '20' }]}>
                <Ionicons name={s.icon} size={16} color={s.color} />
              </View>
              <Text style={[st.statVal, { color: s.color }]}>{s.value}</Text>
              <Text style={st.statLbl}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quiz cards */}
        <Text style={st.sectionTitle}>Choose a Quiz</Text>
        <View style={st.quizGrid}>
          {QUIZZES.map((qz) => {
            const best = pastResults.filter(r => r.quizId === qz.id);
            const lastScore = best.length ? best[0].score : null;
            const done = lastScore !== null;
            return (
              <TouchableOpacity key={qz.id} onPress={() => startQuiz(qz.id)} activeOpacity={0.88} style={st.quizCard}>
                <LinearGradient colors={[qz.color + '22', 'transparent']} style={StyleSheet.absoluteFillObject} />
                <View style={[st.quizCardTop, { borderBottomColor: qz.color + '30' }]}>
                  <View style={[st.quizIcon, { backgroundColor: qz.color + '25' }]}>
                    <Ionicons name={qz.icon} size={26} color={qz.color} />
                  </View>
                  {done && (
                    <View style={[st.doneBadge, { backgroundColor: getColor(lastScore) + '25', borderColor: getColor(lastScore) + '60' }]}>
                      <Text style={[st.doneBadgeText, { color: getColor(lastScore) }]}>{lastScore}%</Text>
                    </View>
                  )}
                </View>
                <Text style={st.quizCardTitle}>{qz.title}</Text>
                <Text style={st.quizCardDesc}>{qz.desc}</Text>
                <View style={st.quizCardBottom}>
                  <View style={st.xpPill}>
                    <Ionicons name="star" size={10} color={P.amber} />
                    <Text style={st.xpPillText}>+{qz.xpReward} XP</Text>
                  </View>
                  <View style={[st.quizCardBtn, { backgroundColor: qz.color }]}>
                    <Text style={st.quizCardBtnText}>{done ? 'Retry' : 'Start'}</Text>
                    <Ionicons name={done ? 'refresh-outline' : 'arrow-forward'} size={12} color={P.white} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Past results */}
        {pastResults.length > 0 && (
          <View style={st.histSection}>
            <Text style={st.sectionTitle}>Past Results</Text>
            {pastResults.slice(0, 6).map((r, i) => {
              const c = getColor(r.score);
              return (
                <View key={r.id || i} style={st.histRow}>
                  <View style={[st.histDot, { backgroundColor: c }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.histTitle}>{r.quizTitle}</Text>
                    <Text style={st.histDate}>{fmtDate(r.timestamp)}</Text>
                  </View>
                  <View style={[st.histScore, { backgroundColor: c + '20', borderColor: c + '50' }]}>
                    <Text style={[st.histScoreText, { color: c }]}>{r.score}%</Text>
                  </View>
                  <Text style={[st.histLabel, { color: c }]}>{r.resultLabel}</Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const st = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glow1:  { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.teal,   opacity: 0.06 },
  glow2:  { position: 'absolute', bottom: 60, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: P.purple, opacity: 0.06 },

  header:     { marginBottom: 20 },
  headerSub:  { fontSize: 11, color: P.teal, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle:{ fontSize: 28, fontWeight: '800', color: P.white, letterSpacing: -0.5 },

  // Level card
  levelCard:   { borderRadius: 22, padding: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: P.glassBorder },
  levelLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge:  { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  levelTitle:  { fontSize: 16, fontWeight: '700', color: P.white },
  levelXP:     { fontSize: 12, color: P.muted, marginTop: 2 },
  levelRight:  { alignItems: 'flex-end', gap: 4 },
  levelNum:    { fontSize: 22, fontWeight: '800', color: P.white },
  levelBar:    { width: 80, height: 5, backgroundColor: P.glass, borderRadius: 3, overflow: 'hidden' },
  levelFill:   { height: '100%', borderRadius: 3 },
  levelNext:   { fontSize: 10, color: P.dimmed },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, backgroundColor: P.navyCard, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder, gap: 6 },
  statIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statVal:  { fontSize: 18, fontWeight: '800' },
  statLbl:  { fontSize: 10, color: P.muted, fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 14 },

  quizGrid: { gap: 12, marginBottom: 32 },
  quizCard: { backgroundColor: P.navyCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  quizCardTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1 },
  quizIcon:      { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  doneBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  doneBadgeText: { fontSize: 13, fontWeight: '800' },
  quizCardTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 4 },
  quizCardDesc:  { fontSize: 13, color: P.muted, marginBottom: 14, lineHeight: 18 },
  quizCardBottom:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpPill:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.amber + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  xpPillText:    { fontSize: 12, color: P.amber, fontWeight: '700' },
  quizCardBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  quizCardBtnText:{ fontSize: 13, fontWeight: '700', color: P.white },

  // Past results
  histSection: { marginBottom: 20 },
  histRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: P.navyCard, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: P.glassBorder },
  histDot:     { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  histTitle:   { fontSize: 13, fontWeight: '600', color: P.white },
  histDate:    { fontSize: 11, color: P.dimmed, marginTop: 1 },
  histScore:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, marginLeft: 4 },
  histScoreText:{ fontSize: 12, fontWeight: '800' },
  histLabel:   { fontSize: 11, fontWeight: '600', marginLeft: 4, minWidth: 68, textAlign: 'right' },

  // ── Quiz screen ──
  quizTopBar:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  quizBackBtn:  { width: 36, height: 36, borderRadius: 11, backgroundColor: P.glass, justifyContent: 'center', alignItems: 'center' },
  progressWrap: { flex: 1, height: 8, backgroundColor: P.glass, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  qCounter:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  qCounterText: { fontSize: 12, fontWeight: '700' },

  xpStrip:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: P.glassBorder },
  xpStripText:{ fontSize: 11, color: P.muted, fontWeight: '600' },
  xpStripDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: P.dimmed },

  quizScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  qCard:      { backgroundColor: P.navyCard, borderRadius: 22, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: P.glassBorder },
  hintRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  hintText:   { fontSize: 12, color: P.amber, fontStyle: 'italic' },
  questionText:{ fontSize: 20, fontWeight: '800', color: P.white, lineHeight: 28, marginBottom: 18 },
  stepDots:   { flexDirection: 'row', gap: 6 },
  stepDot:    { width: 8, height: 8, borderRadius: 4 },

  optionsWrap: { gap: 12 },
  option:      { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: P.glassBorder, gap: 12, overflow: 'hidden' },
  optBar:      { width: 4, height: 36, borderRadius: 2, flexShrink: 0 },
  radio:       { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: P.muted, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  optText:     { flex: 1, fontSize: 15, color: P.muted, fontWeight: '500' },
  optScore:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  optScoreText:{ fontSize: 11, fontWeight: '700' },

  // ── Results screen ──
  resultsHero: { borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 0, overflow: 'hidden' },
  heroRing:    { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', top: -40, right: -40 },
  heroRing2:   { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', bottom: -30, left: -20 },
  heroComplete:{ fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginTop: 14, textTransform: 'uppercase' },
  heroTitle:   { fontSize: 22, fontWeight: '800', color: P.white, marginBottom: 10 },
  xpBadge:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  xpBadgeText: { fontSize: 13, fontWeight: '700', color: P.amber },

  ringWrap:   { alignItems: 'center', marginVertical: 24 },
  ringOuter:  { width: 150, height: 150, borderRadius: 75, borderWidth: 10, justifyContent: 'center', alignItems: 'center' },
  ringInner:  { width: 120, height: 120, borderRadius: 60, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: P.navyCard },
  ringScore:  { fontSize: 32, fontWeight: '800' },
  ringLabel:  { fontSize: 13, fontWeight: '600', marginTop: 2 },
  xpBurst:    { position: 'absolute', right: 80, top: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  xpBurstText:{ fontSize: 11, fontWeight: '800', color: P.white },

  breakdownCard:  { backgroundColor: P.navyCard, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: P.glassBorder },
  breakdownTitle: { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 14 },
  breakRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  breakBorder:    { borderTopWidth: 1, borderTopColor: P.glassBorder },
  breakDot:       { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  breakQ:         { fontSize: 12, color: P.muted, marginBottom: 3 },
  breakA:         { fontSize: 13, fontWeight: '600' },
  breakPts:       { fontSize: 13, fontWeight: '800', minWidth: 40, textAlign: 'right' },

  badgeCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1.5, overflow: 'hidden', backgroundColor: P.navyCard },
  badgeIconBox:   { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  badgeLabel:     { fontSize: 10, fontWeight: '700', color: P.muted, letterSpacing: 1.5, marginBottom: 4 },
  badgeName:      { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  badgeDesc:      { fontSize: 11, color: P.dimmed, lineHeight: 16 },

  recsCard:   { backgroundColor: P.navyCard, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: P.glassBorder },
  recsTitle:  { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 14 },
  recRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  recNum:     { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  recNumText: { fontSize: 13, fontWeight: '800' },
  recText:    { flex: 1, fontSize: 14, color: P.muted, lineHeight: 20 },

  saveBtnWrap:{ borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
  saveBtn:    { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText:{ fontSize: 16, fontWeight: '700', color: P.white },
  backBtn:    { alignItems: 'center', paddingVertical: 14 },
  backBtnText:{ fontSize: 15, color: P.muted, fontWeight: '600' },
});

export default MentalHealthQuizScreen;