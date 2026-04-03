import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
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
import {
  getAllMeditations,
  getDailyQuote, getUserData, getUserProgressStats
} from '../../firebase/firebaseUtils';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyLight:   '#1E3A5F',
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

const CATEGORY_GRADIENTS = {
  focus:       ['#2DD4BF', '#0F766E'],
  mindfulness: ['#0F766E', '#134E4A'],
  sleep:       ['#7C3AED', '#A78BFA'],
  morning:     ['#F59E0B', '#EF4444'],
  anxiety:     ['#A78BFA', '#7C3AED'],
  stress:      ['#EF4444', '#F59E0B'],
  breathing:   ['#2DD4BF', '#A78BFA'],
  general:     ['#0F766E', '#2DD4BF'],
};

const CATEGORY_ICONS = {
  focus:       'bulb-outline',
  mindfulness: 'leaf-outline',
  sleep:       'moon-outline',
  morning:     'sunny-outline',
  anxiety:     'heart-outline',
  stress:      'water-outline',
  breathing:   'sparkles-outline',
  general:     'headset-outline',
};

const EXPLORE_CATS = [
  { label: 'Sleep',     key: 'sleep',     emoji: '🌙', colors: ['#7C3AED', '#A78BFA'] },
  { label: 'Focus',     key: 'focus',     emoji: '🎯', colors: ['#2DD4BF', '#0F766E'] },
  { label: 'Breathing', key: 'breathing', emoji: '🌬️', colors: ['#2DD4BF', '#A78BFA'] },
  { label: 'Morning',   key: 'morning',   emoji: '☀️', colors: ['#F59E0B', '#EF4444'] },
];

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName]         = useState('Friend');
  const [userStats, setUserStats]       = useState(null);
  const [dailyQuote, setDailyQuote]     = useState(null);
  const [meditations, setMeditations]   = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [loadingMeds, setLoadingMeds]   = useState(true);

  // Load quote + meditations once on mount
  useEffect(() => {
    getDailyQuote().then(q => setDailyQuote(q)).catch(() => null).finally(() => setLoadingQuote(false));
    getAllMeditations().then(d => setMeditations(d)).catch(() => setMeditations([])).finally(() => setLoadingMeds(false));
  }, []);

  // Reload username + stats on every focus — catches profile name changes
  useFocusEffect(useCallback(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) { setLoadingStats(false); return; }
    // Read name from Firestore so profile edits are reflected
    getUserData(currentUser.uid)
      .then(d => { if (d?.displayName) setUserName(d.displayName); })
      .catch(() => setUserName(currentUser.displayName || 'Friend'));
    setLoadingStats(true);
    getUserProgressStats(currentUser.uid)
      .then(s => setUserStats(s))
      .catch(() => null)
      .finally(() => setLoadingStats(false));
  }, []));

  const featured = meditations.slice(0, 3);
  const stats = {
    sessionsCompleted: userStats?.sessionsCompleted ?? 0,
    totalMinutes:      userStats?.totalMinutes      ?? 0,
    streak:            userStats?.streak            ?? 0,
  };
  const quoteText   = dailyQuote?.text   ?? 'The present moment is filled with joy and peace.';
  const quoteAuthor = dailyQuote?.author ?? '';
  const greeting    = (() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })();

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTeal} />
      <View style={styles.glowPurple} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{userName.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={[P.teal, P.purpleSoft]} style={styles.avatar}>
              <Ionicons name="person-outline" size={20} color={P.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {loadingStats ? (
            <ActivityIndicator color={P.teal} style={{ flex: 1, height: 80 }} />
          ) : (
            [
              { icon: 'layers-outline', value: stats.sessionsCompleted, label: 'Sessions', accent: P.teal },
              { icon: 'time-outline',   value: stats.totalMinutes,      label: 'Minutes',  accent: P.purpleSoft },
              { icon: 'flame-outline',  value: stats.streak,            label: 'Streak 🔥', accent: P.amber },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.accent + '20' }]}>
                  <Ionicons name={s.icon} size={20} color={s.accent} />
                </View>
                <Text style={[styles.statValue, { color: s.accent }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))
          )}
        </View>

        {/* ── Quote ── */}
        <View style={styles.quoteCard}>
          <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quoteLine} />
          <View style={styles.quoteBody}>
            <View style={styles.quoteBadgeRow}>
              <Text style={styles.quoteStar}>✦</Text>
              <Text style={styles.quoteBadge}>DAILY REFLECTION</Text>
            </View>
            {loadingQuote ? (
              <ActivityIndicator color={P.teal} />
            ) : (
              <>
                <Text style={styles.quoteText}>"{quoteText}"</Text>
                {quoteAuthor ? <Text style={styles.quoteAuthor}>— {quoteAuthor}</Text> : null}
              </>
            )}
          </View>
        </View>

        {/* ── Quick Start ── */}
        <TouchableOpacity activeOpacity={0.88} onPress={() => navigation.navigate('Meditate')} style={styles.quickCard}>
          <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
          <View style={styles.quickGlowDot} />
          <View style={styles.quickLeft}>
            <Text style={styles.quickLabel}>SESSION</Text>
            <Text style={styles.quickTitle}>Ready to meditate?</Text>
            <Text style={styles.quickSub}>Tap to start a session now</Text>
          </View>
          <View style={styles.quickPlayBtn}>
            <Ionicons name="play" size={22} color={P.teal} />
          </View>
        </TouchableOpacity>

        {/* ── Suggested ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Suggested For You</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Meditate')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loadingMeds ? (
            <ActivityIndicator color={P.teal} style={{ marginVertical: 24 }} />
          ) : featured.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🧘</Text>
              <Text style={styles.emptyText}>No sessions available</Text>
            </View>
          ) : (
            featured.map((med) => {
              const gradient = CATEGORY_GRADIENTS[med.category] ?? CATEGORY_GRADIENTS.general;
              const icon     = CATEGORY_ICONS[med.category]     ?? 'headset-outline';
              return (
                <TouchableOpacity
                  key={med.id}
                  style={styles.medCard}
                  onPress={() => navigation.navigate('MeditationDetail', { meditation: med })}
                  activeOpacity={0.88}
                >
                  <LinearGradient colors={gradient} style={styles.medIconBox}>
                    <Ionicons name={icon} size={22} color={P.white} />
                  </LinearGradient>
                  <View style={styles.medInfo}>
                    <Text style={styles.medTitle} numberOfLines={1}>{med.title}</Text>
                    <Text style={styles.medMeta} numberOfLines={1}>
                      {med.category?.charAt(0).toUpperCase() + med.category?.slice(1)}
                      {med.difficulty ? ` · ${med.difficulty}` : ''}
                    </Text>
                  </View>
                  <View style={styles.medRight}>
                    <View style={styles.durBadge}>
                      <Ionicons name="time-outline" size={11} color={P.teal} />
                      <Text style={styles.durText}>{med.duration}m</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={P.dimmed} style={{ marginTop: 6 }} />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── Explore ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
            {EXPLORE_CATS.map(cat => (
              <TouchableOpacity key={cat.key} activeOpacity={0.85} onPress={() => navigation.navigate('Meditate', { filterCategory: cat.key })}>
                <LinearGradient colors={cat.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.catCard}>
                  <View style={styles.catGlow} />
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catLabel}>{cat.label}</Text>
                  <Text style={styles.catCount}>{meditations.filter(m => m.category === cat.key).length} sessions</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Tip ── */}
        <View style={styles.tipCard}>
          <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.tipBar} />
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>💡  Mindfulness Tip</Text>
            <Text style={styles.tipText}>Even 5 minutes of daily meditation can significantly reduce stress and sharpen focus over time.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },

  glowTeal:   { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: P.teal,   opacity: 0.06 },
  glowPurple: { position: 'absolute', bottom: 100, left: -80, width: 260, height: 260, borderRadius: 130, backgroundColor: P.purple, opacity: 0.06 },

  // Header
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 13, color: P.muted, fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 26, fontWeight: '800', color: P.white, letterSpacing: -0.5 },
  avatar:   { width: 46, height: 46, borderRadius: 15, justifyContent: 'center', alignItems: 'center', shadowColor: P.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: P.navyCard, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  statIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue:{ fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel:{ fontSize: 10, color: P.muted, fontWeight: '600', textAlign: 'center' },

  // Quote
  quoteCard:  { flexDirection: 'row', backgroundColor: P.navyCard, borderRadius: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  quoteLine:  { width: 4 },
  quoteBody:  { flex: 1, padding: 18 },
  quoteBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  quoteStar:  { fontSize: 10, color: P.teal },
  quoteBadge: { fontSize: 10, color: P.teal, fontWeight: '700', letterSpacing: 1.5 },
  quoteText:  { fontSize: 15, color: P.white, fontWeight: '500', lineHeight: 24, marginBottom: 8, fontStyle: 'italic' },
  quoteAuthor:{ fontSize: 12, color: P.muted },

  // Quick Start
  quickCard:    { borderRadius: 22, padding: 22, marginBottom: 28, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 },
  quickGlowDot: { position: 'absolute', top: -30, right: 60, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)' },
  quickLeft:    { flex: 1 },
  quickLabel:   { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  quickTitle:   { fontSize: 18, fontWeight: '800', color: P.white, marginBottom: 2 },
  quickSub:     { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  quickPlayBtn: { width: 50, height: 50, borderRadius: 16, backgroundColor: P.white, justifyContent: 'center', alignItems: 'center' },

  // Section
  section:     { marginBottom: 28 },
  sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:{ fontSize: 17, fontWeight: '800', color: P.white, letterSpacing: -0.3 },
  seeAll:      { fontSize: 13, color: P.teal, fontWeight: '600' },

  emptyBox:   { backgroundColor: P.navyCard, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: P.glassBorder },
  emptyEmoji: { fontSize: 36 },
  emptyText:  { fontSize: 14, color: P.muted },

  // Med Cards
  medCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: P.glassBorder },
  medIconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  medInfo:    { flex: 1 },
  medTitle:   { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 4 },
  medMeta:    { fontSize: 12, color: P.muted, textTransform: 'capitalize' },
  medRight:   { alignItems: 'flex-end' },
  durBadge:   { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(45,212,191,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  durText:    { fontSize: 11, color: P.teal, fontWeight: '700' },

  // Categories
  catCard:  { width: 120, height: 120, borderRadius: 22, padding: 16, justifyContent: 'flex-end', overflow: 'hidden' },
  catGlow:  { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  catEmoji: { fontSize: 26, marginBottom: 6 },
  catLabel: { fontSize: 13, fontWeight: '800', color: P.white, marginBottom: 2 },
  catCount: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  // Tip
  tipCard: { flexDirection: 'row', backgroundColor: P.navyCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  tipBar:  { width: 4 },
  tipBody: { flex: 1, padding: 18 },
  tipTitle:{ fontSize: 14, fontWeight: '700', color: P.white, marginBottom: 6 },
  tipText: { fontSize: 12, color: P.muted, lineHeight: 18 },
});

export default HomeScreen;