import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  amber:       '#F59E0B',
  error:       '#F87171',
  success:     '#34D399',
  glass:       'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',
};

const RING_AUDIO     = 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c518c8d49e.mp3';
const AMBIENT_AUDIO  = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3';

const ActiveCallScreen = ({ navigation, route }) => {
  const { line } = route.params;

  const [muted, setMuted]         = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [status, setStatus]       = useState('Ringing...');

  const soundRef   = useRef(null);
  const timerRef   = useRef(null);
  const connectRef = useRef(null);

  useEffect(() => {
    startRinging();

    // After 4s → connected + switch to ambient
    connectRef.current = setTimeout(async () => {
      setStatus('Connected');
      await switchToAmbient();
    }, 4000);

    // Start elapsed counter
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    return () => {
      clearTimeout(connectRef.current);
      clearInterval(timerRef.current);
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const startRinging = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS:      false,
        staysActiveInBackground: true,
        playsInSilentModeIOS:    true,
        shouldDuckAndroid:       true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri: RING_AUDIO },
        { shouldPlay: true, isLooping: true, volume: 0.8 }
      );
      soundRef.current = sound;
    } catch (e) {
      console.log('Ringing audio error:', e.message);
    }
  };

  const switchToAmbient = async () => {
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: AMBIENT_AUDIO },
        { shouldPlay: true, isLooping: true, volume: 0.4 }
      );
      soundRef.current = sound;
    } catch (e) {
      console.log('Ambient audio error:', e.message);
    }
  };

  const handleMute = async () => {
    const next = !muted;
    setMuted(next);
    try {
      await soundRef.current?.setVolumeAsync(next ? 0 : (speakerOn ? 1.0 : 0.4));
    } catch {}
  };

  const handleSpeaker = async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    try {
      await soundRef.current?.setVolumeAsync(muted ? 0 : (next ? 1.0 : 0.4));
    } catch {}
  };

  const handleEnd = async () => {
    clearTimeout(connectRef.current);
    clearInterval(timerRef.current);
    try {
      await soundRef.current?.stopAsync();
      await soundRef.current?.unloadAsync();
    } catch {}
    navigation.popToTop();
  };

  const fmt = (sec) =>
    `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`;

  const isConnected = status === 'Connected';

  return (
    <SafeAreaView style={s.root}>
      <LinearGradient colors={[P.navy, '#0c1a2e', P.tealDeep]} style={StyleSheet.absoluteFillObject} />

      {/* Rings */}
      <View style={s.ring3} />
      <View style={s.ring2} />
      <View style={s.ring1} />

      <View style={s.content}>

        {/* Avatar */}
        <LinearGradient colors={[line.color, line.color + '80']} style={s.avatar}>
          <Ionicons name={line.icon} size={58} color={P.white} />
        </LinearGradient>

        <Text style={s.name}>{line.name}</Text>
        <Text style={s.role}>{line.role}</Text>
        <Text style={s.number}>{line.number}</Text>

        {/* Status */}
        <View style={s.statusRow}>
          <View style={[s.statusDot, {
            backgroundColor: isConnected ? P.success : P.amber,
          }]} />
          <Text style={[s.statusText, {
            color: isConnected ? P.success : P.amber,
          }]}>
            {isConnected ? fmt(elapsed) : status}
          </Text>
        </View>

        {/* Audio wave (visible when connected) */}
        {isConnected && (
          <View style={s.wave}>
            {[10, 20, 30, 20, 14, 24, 16].map((h, i) => (
              <View key={i} style={[s.bar, {
                height: muted ? 4 : h,
                backgroundColor: muted ? P.muted : P.teal,
              }]} />
            ))}
          </View>
        )}

        {/* Controls */}
        <View style={s.controls}>

          {/* Mute */}
          <TouchableOpacity style={s.ctrl} onPress={handleMute}>
            <View style={[s.ctrlBtn, muted && s.ctrlBtnActive]}>
              <Ionicons
                name={muted ? 'mic-off' : 'mic-outline'}
                size={26}
                color={muted ? P.navy : P.white}
              />
            </View>
            <Text style={s.ctrlLabel}>{muted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* End Call */}
          <View style={s.ctrl}>
            <TouchableOpacity style={s.endBtn} onPress={handleEnd}>
              <Ionicons
                name="call"
                size={32}
                color={P.white}
                style={{ transform: [{ rotate: '135deg' }] }}
              />
            </TouchableOpacity>
            <Text style={s.ctrlLabel}>End Call</Text>
          </View>

          {/* Speaker */}
          <TouchableOpacity style={s.ctrl} onPress={handleSpeaker}>
            <View style={[s.ctrlBtn, speakerOn && s.ctrlBtnActive]}>
              <Ionicons
                name={speakerOn ? 'volume-high' : 'volume-medium-outline'}
                size={26}
                color={speakerOn ? P.navy : P.white}
              />
            </View>
            <Text style={s.ctrlLabel}>Speaker</Text>
          </TouchableOpacity>

        </View>

        {/* Secure note */}
        <View style={s.note}>
          <Ionicons name="lock-closed-outline" size={13} color={P.muted} />
          <Text style={s.noteText}>Confidential & secure call</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:    { flex: 1, justifyContent: 'center', alignItems: 'center' },

  ring1:   { position: 'absolute', width: 300, height: 300, borderRadius: 150, borderWidth: 1.5, borderColor: 'rgba(45,212,191,0.18)' },
  ring2:   { position: 'absolute', width: 420, height: 420, borderRadius: 210, borderWidth: 1,   borderColor: 'rgba(45,212,191,0.09)' },
  ring3:   { position: 'absolute', width: 540, height: 540, borderRadius: 270, borderWidth: 1,   borderColor: 'rgba(45,212,191,0.04)' },

  content: { alignItems: 'center', paddingHorizontal: 40 },

  avatar:  { width: 136, height: 136, borderRadius: 46, justifyContent: 'center', alignItems: 'center', marginBottom: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 28, elevation: 14 },
  name:    { fontSize: 26, fontWeight: '800', color: P.white, marginBottom: 6, textAlign: 'center' },
  role:    { fontSize: 14, color: P.muted,  marginBottom: 4, textAlign: 'center' },
  number:  { fontSize: 16, color: P.teal,   fontWeight: '700', marginBottom: 20 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  statusText:{ fontSize: 20, fontWeight: '700' },

  wave:  { flexDirection: 'row', alignItems: 'center', gap: 5, height: 36, marginBottom: 52 },
  bar:   { width: 5, borderRadius: 4 },

  controls:    { flexDirection: 'row', alignItems: 'flex-end', gap: 40, marginBottom: 44 },
  ctrl:        { alignItems: 'center', gap: 10 },
  ctrlBtn:     { width: 66, height: 66, borderRadius: 22, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  ctrlBtnActive:{ backgroundColor: P.white },
  ctrlLabel:   { fontSize: 12, color: P.muted, fontWeight: '600' },
  endBtn:      { width: 84, height: 84, borderRadius: 28, backgroundColor: P.error, justifyContent: 'center', alignItems: 'center', shadowColor: P.error, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 18, elevation: 12 },

  note:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  noteText: { fontSize: 12, color: P.muted },
});

export default ActiveCallScreen;