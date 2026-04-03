import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { addFavorite, isFavorite, logMeditationSession, removeFavorite } from '../../firebase/firebaseUtils';

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
  glass:       'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  error:       '#F87171',
  success:     '#34D399',
};

const CAT_GRADIENTS = {
  focus:       ['#0d4f6e', '#1a8a9a'],
  sleep:       ['#2d1b69', '#7b2d8b'],
  mindfulness: ['#0f4c2a', '#1a8a5a'],
  morning:     ['#7b3a0d', '#c45e1a'],
  anxiety:     ['#1a2d7b', '#5e3aad'],
  stress:      ['#5e1a3a', '#ad2d6e'],
  breathing:   ['#0d3d6e', '#1a6aaa'],
  relaxation:  ['#0d5e4f', '#1aaa8a'],
  sounds:      ['#0d4a3d', '#1a8a7a'],
  general:     ['#1a3a5e', '#2d6aaa'],
};

const CAT_ICONS = {
  focus:       'bulb-outline',
  sleep:       'moon-outline',
  mindfulness: 'leaf-outline',
  morning:     'sunny-outline',
  anxiety:     'heart-outline',
  stress:      'water-outline',
  breathing:   'fitness-outline',
  relaxation:  'body-outline',
  sounds:      'musical-notes-outline',
  general:     'headset-outline',
};

// Reliable fallback audio per category
const FALLBACK_AUDIO = {
  sleep:       'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3',
  focus:       'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3',
  breathing:   'https://cdn.pixabay.com/download/audio/2021/11/01/audio_cb756dd941.mp3',
  morning:     'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946ef970a0.mp3',
  anxiety:     'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  stress:      'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  mindfulness: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3',
  relaxation:  'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3',
  sounds:      'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112ce94.mp3',
  general:     'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3',
};

const fmt = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const MeditationDetailScreen = ({ route, navigation }) => {
  const { meditation } = route.params;

  const soundRef    = useRef(null);
  const intervalRef = useRef(null);

  const [isLoading, setIsLoading]   = useState(false);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [position, setPosition]     = useState(0);
  const [duration, setDuration]     = useState((meditation.duration ?? 10) * 60 * 1000);
  const [audioReady, setAudioReady] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [favorited, setFavorited]   = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const catKey   = meditation.category?.toLowerCase() ?? 'general';
  const gradient = meditation.gradient ?? CAT_GRADIENTS[catKey] ?? CAT_GRADIENTS.general;
  const icon     = CAT_ICONS[catKey] ?? 'headset-outline';
  const audioUrl = meditation.audioUrl ?? FALLBACK_AUDIO[catKey] ?? FALLBACK_AUDIO.general;
  const pct      = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;
  const isSoundscape = meditation.type === 'soundscape';

  // Check favorite
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    isFavorite(uid, meditation.firestoreId ?? meditation.id)
      .then(r => setFavorited(r))
      .catch(() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ── Load audio ──────────────────────────────────────────────
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

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay:  true,
          isLooping:   isSoundscape,
          volume:      1.0,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setAudioReady(true);
      setIsPlaying(true);

      if (status.durationMillis) setDuration(status.durationMillis);
    } catch (err) {
      console.error('Audio load error:', err.message);
      setAudioError('Could not load audio. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Playback status callback ────────────────────────────────
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis ?? 0);
    setIsPlaying(status.isPlaying ?? false);
    if (status.durationMillis) setDuration(status.durationMillis);

    // Auto-save session when 80% complete
    if (
      status.durationMillis &&
      status.positionMillis / status.durationMillis >= 0.8 &&
      !sessionSaved
    ) {
      setSessionSaved(true);
      handleSaveSession();
    }
  };

  // ── Play / Pause ────────────────────────────────────────────
  const handlePlayPause = async () => {
    if (!audioReady) {
      await loadAudio();
      return;
    }
    try {
      if (isPlaying) {
        await soundRef.current?.pauseAsync();
      } else {
        await soundRef.current?.playAsync();
      }
    } catch (err) {
      setAudioError('Playback error. Please try again.');
    }
  };

  // ── Restart ─────────────────────────────────────────────────
  const handleRestart = async () => {
    try {
      await soundRef.current?.setPositionAsync(0);
      await soundRef.current?.playAsync();
      setSessionSaved(false);
    } catch {}
  };

  // ── Save session to Firestore ────────────────────────────────
  const handleSaveSession = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await logMeditationSession(uid, {
        meditationId:    meditation.firestoreId ?? meditation.id,
        meditationTitle: meditation.title,
        duration:        meditation.duration ?? Math.round(duration / 60000),
        category:        meditation.category,
      });
    } catch (err) {
      console.error('Session save error:', err.message);
    }
  };

  // ── Favorite toggle ──────────────────────────────────────────
  const handleFavorite = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const id = meditation.firestoreId ?? meditation.id;
    try {
      if (favorited) { await removeFavorite(uid, id); setFavorited(false); }
      else           { await addFavorite(uid, id);    setFavorited(true); }
    } catch {}
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </View>
        </TouchableOpacity>

        {/* Hero */}
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroRing1} />
          <View style={styles.heroRing2} />
          <View style={styles.heroIconBox}>
            <Ionicons name={icon} size={52} color={P.white} />
          </View>
          {isSoundscape && (
            <View style={styles.soundscapeBadge}>
              <Ionicons name="volume-medium-outline" size={12} color={P.white} />
              <Text style={styles.soundscapeBadgeText}>Soundscape</Text>
            </View>
          )}
        </LinearGradient>

        {/* Title + Favorite */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{meditation.title}</Text>
            <Text style={styles.subtitle}>
              {cap(meditation.category)} · {cap(meditation.difficulty ?? meditation.level ?? 'Beginner')}
            </Text>
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite}>
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={favorited ? P.error : P.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Stats pills */}
        <View style={styles.pillsRow}>
          {[
            { icon: 'time-outline',   label: `${meditation.duration ?? '?'} min` },
            { icon: 'mic-outline',    label: (meditation.type ?? 'Guided') },
            { icon: 'bar-chart-outline', label: cap(meditation.difficulty ?? 'Beginner') },
          ].map((p, i) => (
            <View key={i} style={styles.pill}>
              <Ionicons name={p.icon} size={13} color={P.teal} />
              <Text style={styles.pillText}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        {meditation.description ? (
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>About</Text>
            <Text style={styles.descText}>{meditation.description}</Text>
          </View>
        ) : null}

        {/* Audio Player */}
        <View style={styles.player}>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[P.teal, P.purpleSoft]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${pct}%` }]}
            />
          </View>
          {/* Times */}
          <View style={styles.timesRow}>
            <Text style={styles.timeText}>{fmt(position)}</Text>
            <Text style={styles.timeText}>{fmt(duration)}</Text>
          </View>

          {/* Error */}
          {audioError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={P.error} />
              <Text style={styles.errorText}>{audioError}</Text>
            </View>
          ) : null}

          {/* Controls */}
          <View style={styles.controls}>
            {/* Restart */}
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={handleRestart}
              disabled={!audioReady}
            >
              <Ionicons name="play-skip-back-outline" size={22} color={audioReady ? P.white : P.dimmed} />
            </TouchableOpacity>

            {/* Play / Pause */}
            <TouchableOpacity
              style={styles.playBtnWrap}
              onPress={handlePlayPause}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.playBtn}>
                {isLoading ? (
                  <ActivityIndicator color={P.white} size="large" />
                ) : (
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color={P.white} />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Forward 15s */}
            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={async () => {
                if (!audioReady) return;
                const next = Math.min(position + 15000, duration);
                await soundRef.current?.setPositionAsync(next);
              }}
              disabled={!audioReady}
            >
              <Ionicons name="play-skip-forward-outline" size={22} color={audioReady ? P.white : P.dimmed} />
            </TouchableOpacity>
          </View>

          {/* Session saved indicator */}
          {sessionSaved && (
            <View style={styles.savedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={P.success} />
              <Text style={styles.savedText}>Session saved to your progress</Text>
            </View>
          )}
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={16} color={P.purpleSoft} />
          <Text style={styles.tipText}>
            {isSoundscape
              ? 'Let the sounds wash over you. No need to focus — just relax and breathe.'
              : 'Find a quiet space, sit comfortably, and follow along at your own pace.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },

  backBtn:    { marginBottom: 20 },
  backCircle: { width: 42, height: 42, borderRadius: 13, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },

  hero:        { height: 240, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  heroRing1:   { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  heroRing2:   { position: 'absolute', width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  heroIconBox: { width: 100, height: 100, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  soundscapeBadge:    { position: 'absolute', bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  soundscapeBadgeText:{ fontSize: 11, color: P.white, fontWeight: '700' },

  titleRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  title:     { fontSize: 24, fontWeight: '800', color: P.white, marginBottom: 4, letterSpacing: -0.3 },
  subtitle:  { fontSize: 13, color: P.muted },
  favBtn:    { width: 42, height: 42, borderRadius: 13, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  pillsRow:  { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pill:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P.navyCard, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: P.glassBorder },
  pillText:  { fontSize: 12, color: P.muted, fontWeight: '600', textTransform: 'capitalize' },

  descCard:  { backgroundColor: P.navyCard, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: P.glassBorder },
  descTitle: { fontSize: 12, color: P.muted, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  descText:  { fontSize: 14, color: P.muted, lineHeight: 22 },

  // Player
  player:       { backgroundColor: P.navyCard, borderRadius: 24, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: P.glassBorder },
  progressTrack:{ height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  timesRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  timeText:     { fontSize: 12, color: P.muted, fontWeight: '600' },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 10, padding: 10, marginBottom: 10 },
  errorText:    { fontSize: 12, color: P.error, flex: 1 },
  controls:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 8 },
  ctrlBtn:      { width: 48, height: 48, borderRadius: 15, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  playBtnWrap:  { borderRadius: 26, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  playBtn:      { width: 76, height: 76, justifyContent: 'center', alignItems: 'center' },
  savedBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16 },
  savedText:    { fontSize: 12, color: P.success, fontWeight: '600' },

  tipCard:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(124,62,237,0.08)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: P.purpleSoft + '30' },
  tipText:   { flex: 1, fontSize: 13, color: P.muted, lineHeight: 20, fontStyle: 'italic' },
});

export default MeditationDetailScreen;