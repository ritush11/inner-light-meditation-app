import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
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

const C = {
  bg:     '#0d1117',
  card:   '#161b27',
  border: 'rgba(255,255,255,0.07)',
  white:  '#FFFFFF',
  muted:  'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.2)',
  teal:   '#2DD4BF',
  tealDk: '#0F766E',
  purple: '#7C3AED',
  soft:   '#A78BFA',
  amber:  '#F59E0B',
  error:  '#F87171',
  success:'#34D399',
};

// ── Real Unsplash photos per sleep category ──────────────────
const CAT_PHOTOS = {
  nature:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80&fit=crop',
  cozy:     'https://images.unsplash.com/photo-1515283850704-f3dc3ccbbf93?w=600&q=80&fit=crop',
  peaceful: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80&fit=crop',
  ocean:    'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80&fit=crop',
  forest:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80&fit=crop',
  rain:     'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80&fit=crop',
  space:    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80&fit=crop',
  general:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&fit=crop',
};

// Fallback audio if Firestore story has no audioUrl
const FALLBACK_AUDIO = 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3';

const cap  = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const fmt  = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

const getPhoto = (story) => {
  if (story.photo) return story.photo;
  const key = story.category?.toLowerCase() ?? 'general';
  return CAT_PHOTOS[key] ?? CAT_PHOTOS.general;
};

// ── Story Card ────────────────────────────────────────────────
const StoryCard = ({ story, onPress }) => {
  const photo = getPhoto(story);
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(story)} activeOpacity={0.88}>
      <ImageBackground source={{ uri: photo }} style={styles.cardThumb} resizeMode="cover">
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFillObject} />
        {/* Play button */}
        <View style={styles.cardPlay}>
          <Ionicons name="play" size={14} color={C.white} />
        </View>
        {/* Duration badge */}
        <View style={styles.durBadge}>
          <Ionicons name="time-outline" size={10} color={C.white} />
          <Text style={styles.durText}>{story.duration}m</Text>
        </View>
      </ImageBackground>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{story.title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>
          {story.narrator ?? cap(story.category)}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color={C.amber} />
          <Text style={styles.ratingText}>{story.rating ?? '4.8'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Audiobook Player (Detail) ─────────────────────────────────
const StoryDetailScreen = ({ story, onBack }) => {
  const soundRef = useRef(null);

  const [isLoading, setIsLoading]   = useState(false);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [position, setPosition]     = useState(0);
  const [duration, setDuration]     = useState((story.duration ?? 30) * 60 * 1000);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [favorited, setFavorited]   = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [timerLeft, setTimerLeft]   = useState(0);
  const timerRef = useRef(null);

  const photo    = getPhoto(story);
  const audioUrl = story.audioUrl ?? FALLBACK_AUDIO;
  const pct      = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    isFavorite(uid, story.firestoreId ?? story.id).then(r => setFavorited(r)).catch(() => {});
    return () => {
      clearInterval(timerRef.current);
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ── Load audio ──────────────────────────────────────────
  const loadAudio = async () => {
    if (audioReady || isLoading) return;
    setIsLoading(true);
    setAudioError(null);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS:         false,
        staysActiveInBackground:    true,
        playsInSilentModeIOS:       true,
        shouldDuckAndroid:          true,
        playThroughEarpieceAndroid: false,
      });
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, isLooping: false, volume: 1.0, progressUpdateIntervalMillis: 500 },
        onStatus
      );
      soundRef.current = sound;
      setAudioReady(true);
      setIsPlaying(true);
      if (status.durationMillis) setDuration(status.durationMillis);

      // Log view
      const uid = auth.currentUser?.uid;
      if (uid) logSleepStoryView(uid, story.firestoreId ?? story.id, story.title).catch(() => {});
    } catch {
      setAudioError('Could not load audio. Check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const onStatus = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis ?? 0);
    setIsPlaying(status.isPlaying ?? false);
    if (status.durationMillis) setDuration(status.durationMillis);
  };

  const handlePlayPause = async () => {
    if (!audioReady) { await loadAudio(); return; }
    try {
      if (isPlaying) await soundRef.current?.pauseAsync();
      else           await soundRef.current?.playAsync();
    } catch { setAudioError('Playback error.'); }
  };

  const handleSkip = async (sec) => {
    const next = Math.max(0, Math.min(position + sec * 1000, duration));
    if (audioReady) await soundRef.current?.setPositionAsync(next).catch(() => {});
  };

  const handleFavorite = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const id = story.firestoreId ?? story.id;
    try {
      if (favorited) { await removeFavorite(uid, id); setFavorited(false); }
      else           { await addFavorite(uid, id);    setFavorited(true); }
    } catch {}
  };

  // ── Sleep timer ──────────────────────────────────────────
  const startSleepTimer = async (minutes) => {
    clearInterval(timerRef.current);
    setSleepTimer(minutes);
    setTimerLeft(minutes * 60);
    timerRef.current = setInterval(async () => {
      setTimerLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          soundRef.current?.pauseAsync().catch(() => {});
          setSleepTimer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelTimer = () => {
    clearInterval(timerRef.current);
    setSleepTimer(null);
    setTimerLeft(0);
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScroll}>

        {/* Back */}
        <TouchableOpacity style={styles.detailBack} onPress={onBack}>
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={22} color={C.white} />
          </View>
        </TouchableOpacity>

        {/* Hero Photo */}
        <ImageBackground source={{ uri: photo }} style={styles.detailHero} resizeMode="cover">
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFillObject} />
          <View style={styles.detailHeroBottom}>
            <View style={styles.audiobookBadge}>
              <Ionicons name="headset-outline" size={12} color={C.white} />
              <Text style={styles.audiobookText}>Audio Story</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Title */}
        <View style={styles.detailTitleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailTitle}>{story.title}</Text>
            <Text style={styles.detailNarrator}>
              {story.narrator ?? cap(story.category)} · {story.duration} min
            </Text>
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={22} color={favorited ? C.error : C.muted} />
          </TouchableOpacity>
        </View>

        {/* Rating + pills */}
        <View style={styles.detailMeta}>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={12} color={C.amber} />
            <Text style={styles.ratingPillText}>{story.rating ?? '4.8'} ({story.reviews ?? '0'})</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="headset-outline" size={12} color={C.teal} />
            <Text style={styles.pillText}>{cap(story.category)}</Text>
          </View>
        </View>

        {/* Description */}
        {story.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descLabel}>ABOUT THIS STORY</Text>
            <Text style={styles.descText}>{story.description}</Text>
          </View>
        ) : null}

        {/* ── Audiobook Player ── */}
        <View style={styles.playerCard}>
          <Text style={styles.playerLabel}>AUDIO PLAYER</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[C.teal, C.soft]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${pct}%` }]}
            />
          </View>
          <View style={styles.timesRow}>
            <Text style={styles.timeText}>{fmt(position)}</Text>
            <Text style={styles.timeText}>{fmt(duration)}</Text>
          </View>

          {audioError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={C.error} />
              <Text style={styles.errorText}>{audioError}</Text>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(-15)} disabled={!audioReady}>
              <Ionicons name="play-back-outline" size={20} color={audioReady ? C.white : C.dim} />
              <Text style={styles.skipLabel}>15</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.playBtnWrap} onPress={handlePlayPause} disabled={isLoading} activeOpacity={0.88}>
              <LinearGradient colors={[C.teal, C.tealDk]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.playBtn}>
                {isLoading
                  ? <ActivityIndicator color={C.white} size="large" />
                  : <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color={C.white} />
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(15)} disabled={!audioReady}>
              <Ionicons name="play-forward-outline" size={20} color={audioReady ? C.white : C.dim} />
              <Text style={styles.skipLabel}>15</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sleep Timer ── */}
        <View style={styles.timerCard}>
          <View style={styles.timerHeader}>
            <View style={styles.timerHeaderLeft}>
              <Ionicons name="moon-outline" size={16} color={C.soft} />
              <Text style={styles.timerTitle}>Sleep Timer</Text>
            </View>
            {sleepTimer && (
              <TouchableOpacity onPress={cancelTimer}>
                <Text style={styles.timerCancel}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {sleepTimer ? (
            <View style={styles.timerActive}>
              <Text style={styles.timerCountdown}>
                {Math.floor(timerLeft / 60)}:{(timerLeft % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.timerSubtext}>Audio will stop when timer ends</Text>
            </View>
          ) : (
            <View style={styles.timerBtns}>
              {[5, 15, 30, 45, 60].map(m => (
                <TouchableOpacity key={m} style={styles.timerBtn} onPress={() => startSleepTimer(m)}>
                  <Text style={styles.timerBtnText}>{m} min</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ── Main List Screen ──────────────────────────────────────────
const SleepStoriesScreen = ({ navigation }) => {
  const [stories, setStories]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    getAllSleepStories()
      .then(d => setStories(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return <StoryDetailScreen story={selected} onBack={() => setSelected(null)} />;
  }

  const categories = ['all', ...new Set(stories.map(s => s.category).filter(Boolean))];
  const filtered   = filterType === 'all' ? stories : stories.filter(s => (s.category ?? '').toLowerCase() === filterType);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={C.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>BEDTIME</Text>
            <Text style={styles.headerTitle}>Sleep Stories</Text>
          </View>
          <View style={[styles.backCircle, { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.3)' }]}>
            <Ionicons name="moon-outline" size={20} color={C.soft} />
          </View>
        </View>

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {categories.map(cat => {
            const active = filterType === cat;
            return (
              <TouchableOpacity key={cat} onPress={() => setFilterType(cat)} activeOpacity={0.8}
                style={[styles.filterPill, active && styles.filterPillActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {cap(cat)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count */}
        <Text style={styles.countLabel}>
          <Text style={{ color: C.teal, fontWeight: '700' }}>{filtered.length}</Text> stories
        </Text>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={C.teal} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🌙</Text>
            <Text style={styles.emptyText}>No stories found</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map(s => (
              <View key={s.firestoreId ?? s.id} style={styles.gridItem}>
                <StoryCard story={s} onPress={(story) => setSelected(story)} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backCircle:  { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, color: C.soft, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.white, textAlign: 'center' },

  filterScroll: { marginBottom: 14 },
  filterRow:    { gap: 8, paddingRight: 4 },
  filterPill:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  filterPillActive: { backgroundColor: C.teal, borderColor: C.teal },
  filterText:       { fontSize: 13, color: C.muted, fontWeight: '600' },
  filterTextActive: { fontSize: 13, color: C.white, fontWeight: '700' },

  countLabel: { fontSize: 13, color: C.muted, marginBottom: 16 },
  loader:     { alignItems: 'center', paddingVertical: 60 },
  emptyBox:   { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText:  { fontSize: 16, color: C.muted },

  // 2-col grid
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47.5%' },

  // Story card
  card:      { backgroundColor: C.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  cardThumb: { height: 130, justifyContent: 'space-between', padding: 8, flexDirection: 'column' },
  cardPlay:  { alignSelf: 'flex-end', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center' },
  durBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start' },
  durText:   { fontSize: 9, color: C.white, fontWeight: '700' },
  cardBody:  { padding: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 3 },
  cardMeta:  { fontSize: 11, color: C.muted, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText:{ fontSize: 11, color: C.muted },

  // Detail
  detailScroll: { paddingBottom: 48 },
  detailBack:   { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  detailHero:   { height: 300, justifyContent: 'flex-end' },
  detailHeroBottom: { padding: 20 },
  audiobookBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  audiobookText:  { fontSize: 11, color: C.white, fontWeight: '700' },

  detailTitleRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, paddingBottom: 10 },
  detailTitle:    { fontSize: 22, fontWeight: '800', color: C.white, marginBottom: 4 },
  detailNarrator: { fontSize: 13, color: C.muted },
  favBtn:         { width: 42, height: 42, borderRadius: 13, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  detailMeta: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  ratingPillText: { fontSize: 12, color: C.muted },
  pill:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: C.border },
  pillText:   { fontSize: 12, color: C.muted, fontWeight: '600' },

  descCard:  { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  descLabel: { fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  descText:  { fontSize: 14, color: C.muted, lineHeight: 22 },

  // Player
  playerCard:   { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 22, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  playerLabel:  { fontSize: 11, color: C.muted, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center', marginBottom: 20 },
  progressTrack:{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  timesRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  timeText:     { fontSize: 12, color: C.muted },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText:    { fontSize: 12, color: C.error, flex: 1 },
  controls:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  skipBtn:      { alignItems: 'center', gap: 3 },
  skipLabel:    { fontSize: 9, color: C.muted, fontWeight: '700' },
  playBtnWrap:  { borderRadius: 28, overflow: 'hidden', shadowColor: C.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  playBtn:      { width: 72, height: 72, justifyContent: 'center', alignItems: 'center' },

  // Sleep timer
  timerCard:      { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  timerHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timerHeaderLeft:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  timerTitle:     { fontSize: 14, fontWeight: '700', color: C.white },
  timerCancel:    { fontSize: 13, color: C.error, fontWeight: '600' },
  timerActive:    { alignItems: 'center', gap: 6 },
  timerCountdown: { fontSize: 36, fontWeight: '800', color: C.soft },
  timerSubtext:   { fontSize: 12, color: C.muted },
  timerBtns:      { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  timerBtn:       { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  timerBtnText:   { fontSize: 12, color: C.muted, fontWeight: '600' },
});

export default SleepStoriesScreen;