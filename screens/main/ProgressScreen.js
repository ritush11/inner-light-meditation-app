import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../../firebase/firebaseConfig';
import { getRecentSessions, getUserAchievements, getUserData } from '../../firebase/firebaseUtils';

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
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildChart = (sessions) => {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return { label: DAY_LABELS[d.getDay()], dateStr: d.toISOString().split('T')[0], minutes: 0 };
  });
  sessions.forEach(s => {
    const date = s.completedAt?.toDate ? s.completedAt.toDate() : new Date(s.completedAt);
    const str  = date.toISOString().split('T')[0];
    const day  = days.find(d => d.dateStr === str);
    if (day) day.minutes += s.duration || 0;
  });
  const max = Math.max(...days.map(d => d.minutes), 1);
  return days.map(d => ({ ...d, pct: d.minutes / max }));
};

const ProgressScreen = () => {
  const [userData, setUserData]         = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [weekSessions, setWeekSessions] = useState([]);
  const [chartData, setChartData]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [timeframe, setTimeframe]       = useState('week');

  // useFocusEffect: reloads every time the Progress tab is opened
  useFocusEffect(useCallback(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      getUserData(uid),
      getUserAchievements(uid),
      getRecentSessions(uid, 7),
    ])
      .then(([user, a, s]) => {
        setUserData(user);
        setAchievements(a);
        setWeekSessions(s);
        setChartData(buildChart(s));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []));

  const totalWeekMin = weekSessions.reduce((s, x) => s + (x.duration || 0), 0);
  const avgMin       = weekSessions.length > 0 ? Math.round(totalWeekMin / 7) : 0;
  const bestDay      = chartData.length > 0 ? chartData.reduce((b, d) => d.minutes > b.minutes ? d : b, chartData[0]) : null;

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>OVERVIEW</Text>
          <Text style={styles.headerTitle}>Your Progress</Text>
        </View>

        {/* Stats Grid */}
        {loading ? (
          <ActivityIndicator color={P.teal} style={{ marginBottom: 28 }} />
        ) : (
          <View style={styles.statsGrid}>
            {[
              { icon: 'layers-outline', label: 'Sessions',     value: userData?.sessionsCompleted || 0, accent: P.teal,       sub: `${weekSessions.length} this week` },
              { icon: 'time-outline',   label: 'Minutes',      value: userData?.totalMinutes || 0,      accent: P.purpleSoft, sub: `${totalWeekMin} this week` },
              { icon: 'flame-outline',  label: 'Day Streak',   value: userData?.streak || 0,            accent: P.amber,      sub: 'days in a row 🔥' },
              { icon: 'ribbon-outline', label: 'Achievements', value: achievements.length,              accent: '#34D399',    sub: 'badges earned' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: s.accent + '20' }]}>
                  <Ionicons name={s.icon} size={20} color={s.accent} />
                </View>
                <Text style={[styles.statValue, { color: s.accent }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Weekly Chart */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Weekly Activity</Text>
            <View style={styles.timeframePills}>
              {['week', 'month', 'year'].map(t => (
                <TouchableOpacity key={t} onPress={() => setTimeframe(t)} style={timeframe === t ? styles.pillActive : styles.pillInactive}>
                  <Text style={timeframe === t ? styles.pillTextActive : styles.pillText}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chart}>
              {(chartData.length > 0 ? chartData : DAY_LABELS.map(l => ({ label: l, minutes: 0, pct: 0 }))).map((d, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    {d.minutes > 0 ? (
                      <LinearGradient
                        colors={[P.teal, P.tealDark]}
                        style={[styles.barFill, { height: `${Math.max(d.pct * 100, 6)}%` }]}
                      />
                    ) : (
                      <View style={[styles.barFill, styles.barEmpty, { height: '6%' }]} />
                    )}
                  </View>
                  <Text style={styles.barLabel}>{d.label}</Text>
                  {d.minutes > 0 && <Text style={styles.barMin}>{d.minutes}m</Text>}
                </View>
              ))}
            </View>

            {/* Summary */}
            <View style={styles.chartSummary}>
              {[
                { label: 'Total', value: `${totalWeekMin}m` },
                { label: 'Daily avg', value: `${avgMin}m` },
                { label: 'Best day', value: bestDay?.minutes > 0 ? bestDay.label : '—' },
              ].map((s, i) => (
                <View key={i} style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{s.label}</Text>
                  <Text style={styles.summaryValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Personal Best Banner */}
        {(userData?.longestStreak ?? 0) > 0 && (
          <View style={styles.section}>
            <LinearGradient colors={[P.amber + '20', P.amber + '08']} style={styles.bestBanner}>
              <View style={styles.bestLeft}>
                <Text style={styles.bestEmoji}>🏆</Text>
              </View>
              <View>
                <Text style={styles.bestLabel}>PERSONAL BEST</Text>
                <Text style={styles.bestValue}>{userData.longestStreak}-day streak</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {loading ? (
            <ActivityIndicator color={P.teal} />
          ) : achievements.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔒</Text>
              <Text style={styles.emptyTitle}>No badges yet</Text>
              <Text style={styles.emptyDesc}>Complete sessions to earn achievements!</Text>
            </View>
          ) : (
            <View style={styles.achieveGrid}>
              {achievements.map(a => (
                <View key={a.id} style={styles.achieveCard}>
                  <Text style={styles.achieveEmoji}>{a.icon}</Text>
                  <Text style={styles.achieveTitle} numberOfLines={2}>{a.title}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <View style={styles.tipsCard}>
            {[
              { icon: 'sunny-outline',     text: 'Morning sessions boost daily focus',   color: P.amber },
              { icon: 'repeat-outline',    text: 'Consistency builds lasting habits',     color: P.teal },
              { icon: 'shuffle-outline',   text: 'Try different session types',           color: P.purpleSoft },
              { icon: 'moon-outline',      text: 'Evening sessions improve sleep quality', color: '#60A5FA' },
            ].map((t, i) => (
              <View key={i} style={[styles.tipRow, i > 0 && styles.tipBorder]}>
                <View style={[styles.tipIcon, { backgroundColor: t.color + '20' }]}>
                  <Ionicons name={t.icon} size={16} color={t.color} />
                </View>
                <Text style={styles.tipText}>{t.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  glow:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.teal, opacity: 0.06 },

  header:      { marginBottom: 24 },
  headerLabel: { fontSize: 11, color: P.teal, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: P.white, letterSpacing: -0.5 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  statCard:  { width: '48%', backgroundColor: P.navyCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: P.glassBorder },
  statIconBox:{ width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, color: P.white, fontWeight: '600', marginBottom: 2 },
  statSub:   { fontSize: 11, color: P.muted },

  section:    { marginBottom: 28 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white },

  timeframePills: { flexDirection: 'row', gap: 6 },
  pillActive:     { backgroundColor: P.teal, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillInactive:   { backgroundColor: P.glass, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: P.glassBorder },
  pillText:       { fontSize: 12, color: P.muted, fontWeight: '600' },
  pillTextActive: { fontSize: 12, color: P.white, fontWeight: '700' },

  chartCard:    { backgroundColor: P.navyCard, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: P.glassBorder },
  chart:        { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, marginBottom: 20 },
  barCol:       { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barTrack:     { flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barFill:      { width: 22, borderRadius: 6 },
  barEmpty:     { backgroundColor: 'rgba(255,255,255,0.06)' },
  barLabel:     { fontSize: 10, color: P.muted, fontWeight: '600', marginTop: 6 },
  barMin:       { fontSize: 9, color: P.teal, fontWeight: '700' },

  chartSummary: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: P.glassBorder, paddingTop: 16 },
  summaryItem:  { alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: 11, color: P.muted, fontWeight: '500' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: P.white },

  bestBanner: { flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: P.amber + '30' },
  bestLeft:   { width: 48, height: 48, borderRadius: 14, backgroundColor: P.amber + '20', justifyContent: 'center', alignItems: 'center' },
  bestEmoji:  { fontSize: 24 },
  bestLabel:  { fontSize: 10, color: P.amber, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  bestValue:  { fontSize: 18, fontWeight: '800', color: P.white },

  emptyBox:   { backgroundColor: P.navyCard, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: P.glassBorder },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: P.white },
  emptyDesc:  { fontSize: 13, color: P.muted, textAlign: 'center' },

  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard: { width: '31%', backgroundColor: P.navyCard, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder, gap: 6 },
  achieveEmoji:{ fontSize: 28 },
  achieveTitle:{ fontSize: 11, color: P.muted, textAlign: 'center', fontWeight: '600' },

  tipsCard:  { backgroundColor: P.navyCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  tipRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  tipBorder: { borderTopWidth: 1, borderTopColor: P.glassBorder },
  tipIcon:   { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  tipText:   { fontSize: 13, color: P.muted, flex: 1, lineHeight: 18 },
});

export default ProgressScreen;