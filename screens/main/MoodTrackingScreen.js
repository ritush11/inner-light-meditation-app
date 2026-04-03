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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { getUserMoods, saveMoodEntry } from '../../firebase/firebaseUtils';

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

const MOODS = [
  { id: 1, emoji: '😊', label: 'Happy',    color: '#F59E0B', insight: 'Great energy! Try a focus session to channel this positivity.' },
  { id: 2, emoji: '😌', label: 'Calm',     color: '#2DD4BF', insight: 'Perfect state for mindfulness. Try a body scan session.' },
  { id: 3, emoji: '😴', label: 'Tired',    color: '#A78BFA', insight: 'Rest up. A short 5-min breathing session can restore energy.' },
  { id: 4, emoji: '😤', label: 'Stressed', color: '#F87171', insight: 'Breathe. A 10-min box breathing session can calm your system.' },
  { id: 5, emoji: '😢', label: 'Sad',      color: '#60A5FA', insight: 'It\'s okay to feel sad. Try a loving kindness meditation.' },
  { id: 6, emoji: '😠', label: 'Angry',    color: '#EF4444', insight: 'Take a breath. A 5-min mindfulness session helps regain clarity.' },
  { id: 7, emoji: '😰', label: 'Anxious',  color: '#FB923C', insight: 'Try the 4-7-8 breathing technique right now.' },
  { id: 8, emoji: '😐', label: 'Neutral',  color: '#94A3B8', insight: 'A calm state is a great foundation for intentional practice.' },
];

const ACTIVITIES = [
  { label: 'Meditation', icon: 'leaf-outline' },
  { label: 'Exercise',   icon: 'fitness-outline' },
  { label: 'Sleep',      icon: 'moon-outline' },
  { label: 'Work',       icon: 'briefcase-outline' },
  { label: 'Social',     icon: 'people-outline' },
  { label: 'Eating',     icon: 'restaurant-outline' },
  { label: 'Reading',    icon: 'book-outline' },
  { label: 'Music',      icon: 'musical-note-outline' },
];

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const MoodTrackingScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood]         = useState(null);
  const [selectedActs, setSelectedActs]         = useState([]);
  const [notes, setNotes]                       = useState('');
  const [intensity, setIntensity]               = useState(5);
  const [saving, setSaving]                     = useState(false);
  const [history, setHistory]                   = useState([]);
  const [loadingHistory, setLoadingHistory]     = useState(true);
  const [showHistory, setShowHistory]           = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoadingHistory(false); return; }
    getUserMoods(uid)
      .then(m => setHistory(m))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const toggleAct = (a) => setSelectedActs(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleSave = async () => {
    if (!selectedMood) { Alert.alert('Select a mood', 'Choose how you are feeling right now.'); return; }
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'You must be logged in.'); return; }
    setSaving(true);
    try {
      await saveMoodEntry(uid, {
        mood: selectedMood.label, emoji: selectedMood.emoji,
        color: selectedMood.color, intensity,
        activities: selectedActs, notes: notes.trim(),
      });
      Alert.alert('Saved! 💜', 'Your mood has been recorded.');
      setSelectedMood(null); setSelectedActs([]); setNotes(''); setIntensity(5);
      const m = await getUserMoods(uid);
      setHistory(m);
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>TRACK</Text>
            <Text style={styles.headerTitle}>Mood Journal</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowHistory(!showHistory)}>
            <Ionicons name={showHistory ? 'time' : 'time-outline'} size={20} color={P.teal} />
          </TouchableOpacity>
        </View>

        {/* History */}
        {showHistory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            {loadingHistory ? (
              <ActivityIndicator color={P.teal} />
            ) : history.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyText}>No entries yet</Text>
              </View>
            ) : (
              history.slice(0, 5).map(e => (
                <View key={e.id} style={styles.historyCard}>
                  <Text style={styles.historyEmoji}>{e.emoji ?? '😐'}</Text>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMood}>{e.mood}</Text>
                    <Text style={styles.historyDate}>{fmtDate(e.timestamp)}</Text>
                    {e.notes ? <Text style={styles.historyNote} numberOfLines={1}>{e.notes}</Text> : null}
                  </View>
                  <View style={styles.intensityBadge}>
                    <Text style={styles.intensityBadgeText}>{e.intensity}/10</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Mood Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <Text style={styles.sectionSub}>Track your daily emotions for better self-awareness</Text>
          <View style={styles.moodGrid}>
            {MOODS.map(m => {
              const active = selectedMood?.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.moodCard, active && { borderColor: m.color, borderWidth: 2, backgroundColor: m.color + '15' }]}
                  onPress={() => setSelectedMood(m)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={[styles.moodLabel, active && { color: m.color }]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Intensity */}
        {selectedMood && (
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Intensity</Text>
              <Text style={[styles.intensityVal, { color: selectedMood.color }]}>{intensity}/10</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[selectedMood.color + '40', selectedMood.color]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${intensity * 10}%` }]}
              />
            </View>
            <View style={styles.intensityBtns}>
              {[1,2,3,4,5,6,7,8,9,10].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[styles.intBtn, intensity === v && { backgroundColor: selectedMood.color }]}
                  onPress={() => setIntensity(v)}
                >
                  <Text style={[styles.intBtnText, intensity === v && { color: P.white }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.notesBox}>
            <Ionicons name="create-outline" size={18} color={P.muted} style={{ marginTop: 2 }} />
            <TextInput
              style={styles.notesInput}
              placeholder="How are you feeling today?"
              placeholderTextColor={P.dimmed}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
          </View>
        </View>

        {/* Insight */}
        <View style={styles.section}>
          <LinearGradient
            colors={selectedMood ? [selectedMood.color + 'DD', selectedMood.color + '99'] : ['rgba(45,212,191,0.15)', 'rgba(15,118,110,0.15)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[styles.insightCard, !selectedMood && styles.insightCardEmpty]}
          >
            <View style={styles.insightTop}>
              <View style={styles.insightIconBox}>
                <Ionicons name="bulb-outline" size={20} color={selectedMood ? P.white : P.teal} />
              </View>
              <Text style={[styles.insightTitle, !selectedMood && { color: P.teal }]}>
                {selectedMood ? `Feeling ${selectedMood.label}?` : 'Your Insight'}
              </Text>
            </View>
            <Text style={[styles.insightText, !selectedMood && { color: P.muted }]}>
              {selectedMood
                ? `💡 ${selectedMood.insight}`
                : '☝️ Select a mood above to get a personalised meditation recommendation.'}
            </Text>
          </LinearGradient>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88} style={styles.saveBtnWrap}>
          <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            {saving ? <ActivityIndicator color={P.white} /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={P.white} />
                <Text style={styles.saveBtnText}>Save Mood</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glow:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.teal, opacity: 0.06 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  iconBtn:     { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, color: P.teal, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: P.white, textAlign: 'center' },

  section:    { marginBottom: 28 },
  sectionTitle:{ fontSize: 16, fontWeight: '700', color: P.white, marginBottom: 6 },
  sectionSub: { fontSize: 12, color: P.muted, marginBottom: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  emptyBox:   { backgroundColor: P.navyCard, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: P.glassBorder },
  emptyEmoji: { fontSize: 32 },
  emptyText:  { fontSize: 14, color: P.muted },

  historyCard:      { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: P.glassBorder },
  historyEmoji:     { fontSize: 30, marginRight: 12 },
  historyInfo:      { flex: 1 },
  historyMood:      { fontSize: 15, fontWeight: '700', color: P.white },
  historyDate:      { fontSize: 11, color: P.muted, marginTop: 2 },
  historyNote:      { fontSize: 11, color: P.dimmed, marginTop: 2, fontStyle: 'italic' },
  intensityBadge:   { backgroundColor: P.glass, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: P.glassBorder },
  intensityBadgeText:{ fontSize: 12, fontWeight: '700', color: P.teal },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodCard: { width: '23%', backgroundColor: P.navyCard, borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  moodEmoji:{ fontSize: 30, marginBottom: 4 },
  moodLabel:{ fontSize: 11, color: P.muted, fontWeight: '600' },

  intensityVal: { fontSize: 18, fontWeight: '800' },
  progressTrack:{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 6 },
  intensityBtns:{ flexDirection: 'row', justifyContent: 'space-between' },
  intBtn:       { width: '9%', paddingVertical: 8, borderRadius: 10, backgroundColor: P.glass, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  intBtnText:   { fontSize: 12, fontWeight: '600', color: P.muted },

  actGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actCard:     { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: P.navyCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: P.glassBorder },
  actCardActive:{ backgroundColor: P.tealDark, borderColor: P.teal },
  actLabel:    { fontSize: 13, fontWeight: '600', color: P.muted },

  notesBox:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: P.navyCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: P.glassBorder },
  notesInput: { flex: 1, fontSize: 14, color: P.white, minHeight: 70, textAlignVertical: 'top' },

  insightCard:     { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  insightCardEmpty:{ borderColor: P.glassBorder },
  insightTop:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  insightIconBox:  { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  insightTitle:    { fontSize: 15, fontWeight: '700', color: P.white },
  insightText:     { fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 21 },

  saveBtnWrap: { borderRadius: 18, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  saveBtn:     { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: P.white },
});

export default MoodTrackingScreen;