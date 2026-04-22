import { Ionicons } from '@expo/vector-icons';
import { Audio, ResizeMode, Video } from 'expo-av';
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
import { addFavorite, isFavorite, logMeditationSession, removeFavorite } from '../../firebase/firebaseUtils';

const P = {
  bg:          '#0d1117',
  card:        '#161b27',
  border:      'rgba(255,255,255,0.08)',
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  amber:       '#F59E0B',
  white:       '#FFFFFF',
  muted:       'rgba(255,255,255,0.5)',
  dim:         'rgba(255,255,255,0.25)',
  glass:       'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  error:       '#F87171',
  success:     '#34D399',
};

// ── Real photos per category ──────────────────────────────────
const CAT_PHOTOS = {
  focus:       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&fit=crop',
  sleep:       'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&q=80&fit=crop',
  mindfulness: 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=600&q=80&fit=crop',
  morning:     'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&q=80&fit=crop',
  anxiety:     'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80&fit=crop',
  stress:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&fit=crop',
  breathing:   'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80&fit=crop',
  relaxation:  'https://images.unsplash.com/photo-1439853949212-36a7ee5c01d9?w=600&q=80&fit=crop',
  sounds:      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80&fit=crop',
  general:     'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80&fit=crop',
};

// ── Fallback audio per category ───────────────────────────────
const FALLBACK_AUDIO = {
  sleep:       'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  focus:       'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  breathing:   'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  morning:     'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  anxiety:     'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  stress:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  mindfulness: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  relaxation:  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  sounds:      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  general:     'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

// ── Free guided meditation videos (YouTube embeds won't work in RN,
//    so we use direct MP4 links from archive.org / sample sources) ──
const FALLBACK_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'; // placeholder

const fmt = (ms) => {
  const s = Math.floor((ms ?? 0) / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const MeditationDetailScreen = ({ route, navigation }) => {
  const { meditation } = route.params;

  const soundRef    = useRef(null);
  const videoRef    = useRef(null);

  const [isLoading, setIsLoading]     = useState(false);
  const [isPlaying, setIsPlaying]     = useState(false);
  const [position, setPosition]       = useState(0);
  const [duration, setDuration]       = useState((meditation.duration ?? 10) * 60 * 1000);
  const [audioReady, setAudioReady]   = useState(false);
  const [audioError, setAudioError]   = useState(null);
  const [favorited, setFavorited]     = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);

  const catKey    = meditation.category?.toLowerCase() ?? 'general';
  const photo     = meditation.photo ?? CAT_PHOTOS[catKey] ?? CAT_PHOTOS.general;
  const audioUrl  = meditation.audioUrl ?? FALLBACK_AUDIO[catKey] ?? FALLBACK_AUDIO.general;
  const videoUrl  = meditation.videoUrl ?? null;
  const isVideo   = !!videoUrl;
  const isSoundscape = meditation.type === 'soundscape';
  const pct       = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

  // Check favorite
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    isFavorite(uid, meditation.firestoreId ?? meditation.id)
      .then(r => setFavorited(r)).catch(() => {});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // ── Load & play audio ─────────────────────────────────────
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
        { shouldPlay: true, isLooping: isSoundscape, volume: 1.0, progressUpdateIntervalMillis: 500 },
        onAudioStatus
      );
      soundRef.current = sound;
      setAudioReady(true);
      setIsPlaying(true);
      if (status.durationMillis) setDuration(status.durationMillis);
    } catch (err) {
      setAudioError('Could not load audio. Check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const onAudioStatus = (status) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis ?? 0);
    setIsPlaying(status.isPlaying ?? false);
    if (status.durationMillis) setDuration(status.durationMillis);
    if (status.durationMillis && status.positionMillis / status.durationMillis >= 0.8 && !sessionSaved) {
      setSessionSaved(true);
      saveSession();
    }
  };

  // ── Video status callback ─────────────────────────────────
  const onVideoStatus = (status) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying ?? false);
    setPosition(status.positionMillis ?? 0);
    if (status.durationMillis) setDuration(status.durationMillis);
    if (status.durationMillis && status.positionMillis / status.durationMillis >= 0.8 && !sessionSaved) {
      setSessionSaved(true);
      saveSession();
    }
  };

  // ── Play / Pause ──────────────────────────────────────────
  const handlePlayPause = async () => {
    if (isVideo) {
      if (isPlaying) await videoRef.current?.pauseAsync();
      else           await videoRef.current?.playAsync();
      return;
    }
    if (!audioReady) { await loadAudio(); return; }
    try {
      if (isPlaying) await soundRef.current?.pauseAsync();
      else           await soundRef.current?.playAsync();
    } catch { setAudioError('Playback error. Please try again.'); }
  };

  // ── Skip ──────────────────────────────────────────────────
  const handleSkip = async (seconds) => {
    const next = Math.max(0, Math.min(position + seconds * 1000, duration));
    if (isVideo) { await videoRef.current?.setPositionAsync(next); return; }
    if (audioReady) await soundRef.current?.setPositionAsync(next);
  };

  // ── Save session ──────────────────────────────────────────
  const saveSession = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await logMeditationSession(uid, {
        meditationId:    meditation.firestoreId ?? meditation.id,
        meditationTitle: meditation.title,
        duration:        meditation.duration ?? Math.round(duration / 60000),
        category:        meditation.category,
      });
    } catch {}
  };

  // ── Favorite ──────────────────────────────────────────────
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <View style={styles.backCircle}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </View>
        </TouchableOpacity>

        {/* ── Hero: Video or Photo ── */}
        {isVideo ? (
          <View style={styles.videoWrap}>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              onPlaybackStatusUpdate={onVideoStatus}
              useNativeControls={false}
              shouldPlay={false}
            />
            {/* Play overlay */}
            {!isPlaying && (
              <TouchableOpacity style={styles.videoOverlay} onPress={handlePlayPause}>
                <View style={styles.bigPlayBtn}>
                  <Ionicons name="play" size={36} color={P.white} />
                </View>
              </TouchableOpacity>
            )}
            {/* Pause tap area */}
            {isPlaying && (
              <TouchableOpacity style={styles.videoOverlay} onPress={handlePlayPause} activeOpacity={1} />
            )}
            {/* Video badge */}
            <View style={styles.videoBadge}>
              <Ionicons name="videocam-outline" size={12} color={P.white} />
              <Text style={styles.videoBadgeText}>Guided Video</Text>
            </View>
          </View>
        ) : (
          <ImageBackground source={{ uri: photo }} style={styles.hero} resizeMode="cover">
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={StyleSheet.absoluteFillObject} />
            {isSoundscape && (
              <View style={styles.soundBadge}>
                <Ionicons name="volume-medium-outline" size={12} color={P.white} />
                <Text style={styles.soundBadgeText}>Soundscape</Text>
              </View>
            )}
          </ImageBackground>
        )}

        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{meditation.title}</Text>
            <Text style={styles.subtitle}>
              {cap(meditation.category)} · {cap(meditation.difficulty ?? 'Beginner')}
            </Text>
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={22} color={favorited ? P.error : P.muted} />
          </TouchableOpacity>
        </View>

        {/* Pills */}
        <View style={styles.pills}>
          {[
            { icon: 'time-outline',      label: `${meditation.duration ?? '?'} min` },
            { icon: isVideo ? 'videocam-outline' : 'headset-outline', label: isVideo ? 'Video' : (isSoundscape ? 'Soundscape' : 'Audio') },
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
            <Text style={styles.descLabel}>ABOUT</Text>
            <Text style={styles.descText}>{meditation.description}</Text>
          </View>
        ) : null}

        {/* ── Audio Player (shown for non-video) ── */}
        {!isVideo && (
          <View style={styles.player}>
            <Text style={styles.playerLabel}>
              {isSoundscape ? 'AMBIENT AUDIO' : 'GUIDED AUDIO'}
            </Text>

            {/* Progress */}
            <TouchableOpacity
              style={styles.progressTrack}
              onPress={(e) => {
                if (!audioReady) return;
                const ratio = e.nativeEvent.locationX / e.nativeEvent.target;
                soundRef.current?.setPositionAsync(ratio * duration).catch(() => {});
              }}
              activeOpacity={1}
            >
              <LinearGradient
                colors={[P.teal, P.purpleSoft]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            </TouchableOpacity>

            <View style={styles.timesRow}>
              <Text style={styles.timeText}>{fmt(position)}</Text>
              <Text style={styles.timeText}>{fmt(duration)}</Text>
            </View>

            {audioError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={14} color={P.error} />
                <Text style={styles.errorText}>{audioError}</Text>
              </View>
            )}

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(-15)} disabled={!audioReady}>
                <Ionicons name="play-back-outline" size={20} color={audioReady ? P.white : P.dim} />
                <Text style={styles.skipLabel}>15</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playBtnWrap} onPress={handlePlayPause} disabled={isLoading} activeOpacity={0.88}>
                <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.playBtn}>
                  {isLoading
                    ? <ActivityIndicator color={P.white} size="large" />
                    : <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color={P.white} />
                  }
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(15)} disabled={!audioReady}>
                <Ionicons name="play-forward-outline" size={20} color={audioReady ? P.white : P.dim} />
                <Text style={styles.skipLabel}>15</Text>
              </TouchableOpacity>
            </View>

            {sessionSaved && (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={14} color={P.success} />
                <Text style={styles.savedText}>Session saved to your progress</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Video Controls ── */}
        {isVideo && (
          <View style={styles.player}>
            <Text style={styles.playerLabel}>GUIDED VIDEO</Text>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[P.teal, P.purpleSoft]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            </View>
            <View style={styles.timesRow}>
              <Text style={styles.timeText}>{fmt(position)}</Text>
              <Text style={styles.timeText}>{fmt(duration)}</Text>
            </View>
            <View style={styles.controls}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(-15)}>
                <Ionicons name="play-back-outline" size={20} color={P.white} />
                <Text style={styles.skipLabel}>15</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtnWrap} onPress={handlePlayPause} activeOpacity={0.88}>
                <LinearGradient colors={[P.teal, P.tealDark]} style={styles.playBtn}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color={P.white} />
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipBtn} onPress={() => handleSkip(15)}>
                <Ionicons name="play-forward-outline" size={20} color={P.white} />
                <Text style={styles.skipLabel}>15</Text>
              </TouchableOpacity>
            </View>
            {sessionSaved && (
              <View style={styles.savedRow}>
                <Ionicons name="checkmark-circle" size={14} color={P.success} />
                <Text style={styles.savedText}>Session saved to your progress</Text>
              </View>
            )}
          </View>
        )}

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="information-circle-outline" size={16} color={P.purpleSoft} />
          <Text style={styles.tipText}>
            {isVideo
              ? 'Follow along with the instructor at your own pace.'
              : isSoundscape
              ? 'Let the sounds wash over you. No need to focus — just relax.'
              : 'Find a quiet space, sit comfortably, and follow along.'}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: P.bg },
  scroll: { paddingBottom: 48 },

  backBtn:    { position: 'absolute', top: 16, left: 16, zIndex: 10 },
  backCircle: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },

  // Hero photo
  hero:       { height: 280, justifyContent: 'flex-end', paddingBottom: 16, paddingHorizontal: 16 },
  soundBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  soundBadgeText:{ fontSize: 11, color: P.white, fontWeight: '700' },

  // Video
  videoWrap:    { height: 260, backgroundColor: '#000', position: 'relative' },
  video:        { width: '100%', height: '100%' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  bigPlayBtn:   { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  videoBadge:   { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  videoBadgeText:{ fontSize: 11, color: P.white, fontWeight: '700' },

  // Info
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 20, paddingBottom: 12 },
  title:    { fontSize: 22, fontWeight: '800', color: P.white, marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: P.muted },
  favBtn:   { width: 42, height: 42, borderRadius: 13, backgroundColor: P.card, borderWidth: 1, borderColor: P.border, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  pills:    { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: P.border },
  pillText: { fontSize: 12, color: P.muted, fontWeight: '600', textTransform: 'capitalize' },

  descCard:  { marginHorizontal: 20, backgroundColor: P.card, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  descLabel: { fontSize: 11, color: P.muted, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  descText:  { fontSize: 14, color: P.muted, lineHeight: 22 },

  // Player
  player:       { marginHorizontal: 20, backgroundColor: P.card, borderRadius: 22, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: P.border },
  playerLabel:  { fontSize: 11, color: P.muted, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center', marginBottom: 20 },
  progressTrack:{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  timesRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  timeText:     { fontSize: 12, color: P.muted },
  errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(248,113,113,0.1)', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText:    { fontSize: 12, color: P.error, flex: 1 },
  controls:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  skipBtn:      { alignItems: 'center', gap: 3 },
  skipLabel:    { fontSize: 9, color: P.muted, fontWeight: '700' },
  playBtnWrap:  { borderRadius: 28, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  playBtn:      { width: 72, height: 72, justifyContent: 'center', alignItems: 'center' },
  savedRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 18 },
  savedText:    { fontSize: 12, color: P.success, fontWeight: '600' },

  tipCard:  { marginHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(124,62,237,0.08)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(124,62,237,0.2)' },
  tipText:  { flex: 1, fontSize: 13, color: P.muted, lineHeight: 20, fontStyle: 'italic' },
});

export default MeditationDetailScreen;