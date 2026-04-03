import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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
  addFavorite,
  getAllSleepStories,
  isFavorite,
  logSleepStoryView,
  removeFavorite,
} from '../../firebase/firebaseUtils';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyCard:    '#162035',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  indigo:      '#4F46E5',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  error:       '#F87171',
};

const CATEGORY_GRADIENTS = {
  nature:   ['#134E4A', '#1a5f4a'],
  cozy:     ['#4c1d95', '#7C3AED'],
  peaceful: ['#1e1b4b', '#3730a3'],
  general:  ['#0F766E', '#2DD4BF'],
};

const CATEGORY_EMOJI = {
  nature:   '🌲',
  cozy:     '🌧️',
  peaceful: '🧘',
  general:  '🌙',
};

const getGradient = (s) => s.gradient ?? CATEGORY_GRADIENTS[s.category?.toLowerCase()] ?? CATEGORY_GRADIENTS.general;
const getEmoji    = (s) => s.thumbnail ?? CATEGORY_EMOJI[s.category?.toLowerCase()] ?? '🌙';
const cap         = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ── Story Card ────────────────────────────────────────────────
const StoryCard = ({ story, onPress }) => {
  const gradient = getGradient(story);
  const emoji    = getEmoji(story);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(story)} activeOpacity={0.88}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardThumb}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
        <View style={styles.cardOverlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={16} color={gradient[0]} />
          </View>
        </View>
      </LinearGradient>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{story.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {story.narrator ?? cap(story.category)} · {story.duration}m
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={styles.ratingText}>{story.rating ?? '4.8'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────
const SleepStoriesScreen = ({ navigation }) => {
  const [stories, setStories]               = useState([]);
  const [selected, setSelected]             = useState(null);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [filterType, setFilterType]         = useState('all');
  const [loading, setLoading]               = useState(true);
  const [favorited, setFavorited]           = useState(false);
  const [togglingFav, setTogglingFav]       = useState(false);

  useEffect(() => {
    getAllSleepStories()
      .then(d => setStories(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    isFavorite(uid, selected.firestoreId ?? selected.id).then(r => setFavorited(r)).catch(() => {});
  }, [selected]);

  const categories  = ['all', ...new Set(stories.map(s => s.category).filter(Boolean))];
  const filtered    = stories.filter(s => filterType === 'all' || (s.category ?? '').toLowerCase() === filterType.toLowerCase());

  const handlePlay = async (content) => {
    setIsPlaying(p => !p);
    if (!isPlaying) {
      const uid = auth.currentUser?.uid;
      if (uid) logSleepStoryView(uid, content.firestoreId ?? content.id, content.title).catch(() => {});
    }
  };

  const handleFav = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !selected) return;
    const id = selected.firestoreId ?? selected.id;
    setTogglingFav(true);
    try {
      if (favorited) { await removeFavorite(uid, id); setFavorited(false); }
      else           { await addFavorite(uid, id);    setFavorited(true); }
    } catch {}
    finally { setTogglingFav(false); }
  };

  // ── Detail View ───────────────────────────────────────────
  if (selected) {
    const gradient = getGradient(selected);
    const emoji    = getEmoji(selected);
    return (
      <SafeAreaView style={styles.root}>
        <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          <TouchableOpacity style={styles.backBtn} onPress={() => { setSelected(null); setIsPlaying(false); }}>
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={22} color={P.white} />
            </View>
          </TouchableOpacity>

          {/* Hero */}
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailHero}>
            <View style={styles.heroRing} />
            <Text style={styles.detailEmoji}>{emoji}</Text>
            {isPlaying && (
              <View style={styles.playingBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.playingText}>Now Playing</Text>
              </View>
            )}
          </LinearGradient>

          {/* Info */}
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selected.title}</Text>
            <Text style={styles.detailMeta}>{selected.narrator ?? cap(selected.category)}</Text>

            <View style={styles.detailPills}>
              <View style={styles.pill}>
                <Ionicons name="time-outline" size={13} color={P.teal} />
                <Text style={styles.pillText}>{selected.duration} min</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="star-outline" size={13} color="#F59E0B" />
                <Text style={styles.pillText}>{selected.rating ?? '4.8'}</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="musical-notes-outline" size={13} color={P.purpleSoft} />
                <Text style={styles.pillText}>{cap(selected.category)}</Text>
              </View>
            </View>

            <Text style={styles.detailDesc}>{selected.description}</Text>

            {/* Info note */}
            <View style={styles.infoNote}>
              <Ionicons name="moon-outline" size={16} color={P.purpleSoft} />
              <Text style={styles.infoNoteText}>Perfect for falling asleep. Set a sleep timer below.</Text>
            </View>

            {/* Sleep Timer */}
            <Text style={styles.timerLabel}>Sleep Timer</Text>
            <View style={styles.timerRow}>
              {['5 min', '15 min', '30 min', '45 min'].map((t, i) => (
                <TouchableOpacity key={i} style={styles.timerBtn}>
                  <Text style={styles.timerBtnText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Play */}
            <TouchableOpacity onPress={() => handlePlay(selected)} activeOpacity={0.88} style={styles.playBtnWrap}>
              <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.playBtn}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={P.white} />
                <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Play Now'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Favorite */}
            <TouchableOpacity
              style={[styles.favBtn, favorited && styles.favBtnActive]}
              onPress={handleFav}
              disabled={togglingFav}
            >
              {togglingFav ? <ActivityIndicator size="small" color={P.teal} /> : (
                <>
                  <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color={favorited ? P.error : P.teal} />
                  <Text style={[styles.favBtnText, favorited && { color: P.error }]}>
                    {favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List View ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowPurple} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>BEDTIME</Text>
            <Text style={styles.headerTitle}>Sleep Stories</Text>
          </View>
          <View style={[styles.backCircle, { backgroundColor: 'rgba(124,62,237,0.15)', borderColor: P.purpleSoft + '40' }]}>
            <Ionicons name="moon-outline" size={20} color={P.purpleSoft} />
          </View>
        </View>

        {/* Banner */}
        <LinearGradient colors={[P.purple, P.indigo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.bannerRing} />
          <Text style={styles.bannerEmoji}>🌙</Text>
          <Text style={styles.bannerTitle}>Rest & Drift Away</Text>
          <Text style={styles.bannerSub}>Calming stories for deep, peaceful sleep</Text>
        </LinearGradient>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {categories.map(cat => {
            const active = filterType === cat;
            return (
              <TouchableOpacity key={cat} onPress={() => setFilterType(cat)} activeOpacity={0.8}>
                {active ? (
                  <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.filterPill}>
                    <Text style={styles.filterTextActive}>{cap(cat)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.filterPill, styles.filterPillInactive]}>
                    <Text style={styles.filterText}>{cap(cat)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count */}
        <Text style={styles.countLabel}>
          <Text style={{ color: P.teal, fontWeight: '700' }}>{filtered.length}</Text>
          {' '}stories available
        </Text>

        {/* Grid */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={P.teal} />
            <Text style={styles.loadingText}>Loading stories...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyTitle}>No stories found</Text>
            <Text style={styles.emptyDesc}>Try a different filter</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map(s => (
              <View key={s.firestoreId ?? s.id} style={styles.gridItem}>
                <StoryCard story={s} onPress={(story) => { setSelected(story); setIsPlaying(false); }} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  glowPurple: { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.purple, opacity: 0.07 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn:     { marginBottom: 20 },
  backCircle:  { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, color: P.purpleSoft, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: P.white, textAlign: 'center' },

  banner:     { borderRadius: 22, padding: 28, alignItems: 'center', marginBottom: 24, overflow: 'hidden', shadowColor: P.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  bannerRing: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bannerEmoji:{ fontSize: 40, marginBottom: 10 },
  bannerTitle:{ fontSize: 22, fontWeight: '800', color: P.white, marginBottom: 4 },
  bannerSub:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },

  filterScroll: { marginBottom: 16 },
  filterRow:    { gap: 8, paddingRight: 4 },
  filterPill:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterPillInactive: { backgroundColor: P.navyCard, borderWidth: 1, borderColor: P.glassBorder },
  filterText:         { fontSize: 13, color: P.muted, fontWeight: '600' },
  filterTextActive:   { fontSize: 13, color: P.white, fontWeight: '700' },

  countLabel:  { fontSize: 13, color: P.muted, marginBottom: 14 },

  loadingBox:  { alignItems: 'center', paddingVertical: 60, gap: 14 },
  loadingText: { fontSize: 14, color: P.muted },
  emptyBox:    { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji:  { fontSize: 48 },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: P.white },
  emptyDesc:   { fontSize: 13, color: P.muted },

  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47.5%' },

  card:       { backgroundColor: P.navyCard, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  cardThumb:  { height: 140, justifyContent: 'center', alignItems: 'center' },
  cardEmoji:  { fontSize: 44 },
  cardOverlay:{ position: 'absolute', bottom: 8, right: 8 },
  playCircle: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  cardBody:   { padding: 12 },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: P.white, marginBottom: 3 },
  cardMeta:   { fontSize: 11, color: P.muted, marginBottom: 5 },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 11, color: P.muted, fontWeight: '600' },

  // Detail
  detailHero:   { height: 260, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden', shadowColor: P.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10 },
  heroRing:     { position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: 70, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  detailEmoji:  { fontSize: 80 },
  playingBadge: { position: 'absolute', bottom: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  pulseDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: P.teal },
  playingText:  { color: P.white, fontSize: 12, fontWeight: '600' },

  detailCard:  { backgroundColor: P.navyCard, borderRadius: 24, padding: 22, borderWidth: 1, borderColor: P.glassBorder },
  detailTitle: { fontSize: 22, fontWeight: '800', color: P.white, marginBottom: 4 },
  detailMeta:  { fontSize: 13, color: P.muted, marginBottom: 14, textTransform: 'capitalize' },
  detailPills: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  pill:        { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: P.glass, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: P.glassBorder },
  pillText:    { fontSize: 11, color: P.muted, fontWeight: '600' },
  detailDesc:  { fontSize: 13, color: P.muted, lineHeight: 21, marginBottom: 16 },

  infoNote:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: P.purpleSoft + '30' },
  infoNoteText: { fontSize: 12, color: P.purpleSoft, flex: 1, lineHeight: 18 },

  timerLabel: { fontSize: 14, fontWeight: '700', color: P.white, marginBottom: 12 },
  timerRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  timerBtn:   { flex: 1, marginHorizontal: 3, paddingVertical: 10, borderRadius: 12, backgroundColor: P.glass, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  timerBtnText:{ fontSize: 12, fontWeight: '600', color: P.muted },

  playBtnWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 12, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  playBtn:     { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  playBtnText: { fontSize: 16, fontWeight: '700', color: P.white },

  favBtn:       { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, borderWidth: 1.5, borderColor: P.teal, backgroundColor: P.glass },
  favBtnActive: { borderColor: P.error, backgroundColor: 'rgba(248,113,113,0.08)' },
  favBtnText:   { fontSize: 15, fontWeight: '700', color: P.teal },
});

export default SleepStoriesScreen;