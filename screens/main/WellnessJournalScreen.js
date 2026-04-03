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
import { deleteJournalEntry, getUserJournalEntries, saveJournalEntry } from '../../firebase/firebaseUtils';

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
};

const PROMPTS = [
  'What made you smile today?',
  'What are you grateful for?',
  'How did meditation help you today?',
  'What challenged you today?',
  'What are your goals for tomorrow?',
  'How are you feeling right now?',
  'What lessons did you learn today?',
  'Who did you appreciate today?',
];

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((new Date() - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const WellnessJournalScreen = ({ navigation }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [entry, setEntry]                   = useState('');
  const [entries, setEntries]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [deletingId, setDeletingId]         = useState(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    try { setEntries(await getUserJournalEntries(uid)); }
    catch {}
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!selectedPrompt || !entry.trim()) {
      Alert.alert('Incomplete', 'Please select a prompt and write your thoughts.');
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) { Alert.alert('Error', 'You must be logged in.'); return; }
    setSaving(true);
    try {
      await saveJournalEntry(uid, { title: selectedPrompt, prompt: selectedPrompt, entry: entry.trim(), mood: null, tags: [] });
      Alert.alert('Saved! 📝', 'Your journal entry has been saved.');
      setSelectedPrompt(null);
      setEntry('');
      await loadEntries();
    } catch { Alert.alert('Error', 'Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeletingId(id);
        try { await deleteJournalEntry(id); setEntries(prev => prev.filter(e => e.id !== id)); }
        catch { Alert.alert('Error', 'Failed to delete.'); }
        finally { setDeletingId(null); }
      }},
    ]);
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
            <Text style={styles.headerLabel}>REFLECT</Text>
            <Text style={styles.headerTitle}>Wellness Journal</Text>
          </View>
          <View style={styles.entriesBadge}>
            <Text style={styles.entriesBadgeText}>{entries.length}</Text>
          </View>
        </View>

        {/* Banner */}
        <LinearGradient colors={[P.purpleSoft, P.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.bannerRing} />
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTitle}>Today's Reflection</Text>
            <Text style={styles.bannerSub}>Write, reflect, and grow every day</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Ionicons name="pencil-outline" size={26} color={P.white} />
          </View>
        </LinearGradient>

        {/* Prompts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Writing Prompts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsRow}>
            {PROMPTS.map((p, i) => {
              const active = selectedPrompt === p;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedPrompt(p)}
                  activeOpacity={0.8}
                  style={styles.promptWrap}
                >
                  {active ? (
                    <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promptCard}>
                      <Text style={styles.promptTextActive}>{p}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.promptCardInactive}>
                      <Text style={styles.promptText}>{p}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Prompt + Input */}
        <View style={styles.section}>
          {selectedPrompt && (
            <View style={styles.selectedPrompt}>
              <Ionicons name="chatbubble-outline" size={16} color={P.teal} />
              <Text style={styles.selectedPromptText} numberOfLines={2}>{selectedPrompt}</Text>
            </View>
          )}

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder={selectedPrompt ? 'Write your thoughts here...' : 'Select a prompt above or write freely...'}
              placeholderTextColor={P.dimmed}
              multiline
              numberOfLines={8}
              value={entry}
              onChangeText={setEntry}
              textAlignVertical="top"
            />
          </View>

          <Text style={styles.charCount}>{entry.length} characters</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.88} style={styles.saveBtnWrap}>
          <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
            {saving ? <ActivityIndicator color={P.white} /> : (
              <>
                <Ionicons name="save-outline" size={20} color={P.white} />
                <Text style={styles.saveBtnText}>Save Entry</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Entries</Text>

          {loading ? (
            <ActivityIndicator color={P.teal} style={{ marginVertical: 24 }} />
          ) : entries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📖</Text>
              <Text style={styles.emptyTitle}>No entries yet</Text>
              <Text style={styles.emptyDesc}>Write your first journal entry above!</Text>
            </View>
          ) : (
            entries.map(e => (
              <View key={e.id} style={styles.entryCard}>
                <View style={styles.entryTop}>
                  <View style={styles.entryMeta}>
                    <Text style={styles.entryDate}>{fmtDate(e.timestamp)}</Text>
                    <Text style={styles.entryPrompt} numberOfLines={1}>{e.prompt || e.title}</Text>
                  </View>
                  <Ionicons name="book-outline" size={20} color={P.purpleSoft} />
                </View>

                <Text style={styles.entryText} numberOfLines={3}>{e.entry}</Text>

                <View style={styles.entryActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="eye-outline" size={15} color={P.teal} />
                    <Text style={[styles.actionText, { color: P.teal }]}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(e.id)} disabled={deletingId === e.id}>
                    {deletingId === e.id
                      ? <ActivityIndicator size="small" color={P.error} />
                      : <>
                          <Ionicons name="trash-outline" size={15} color={P.error} />
                          <Text style={[styles.actionText, { color: P.error }]}>Delete</Text>
                        </>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glow:   { position: 'absolute', top: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.purpleSoft, opacity: 0.06 },

  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  iconBtn:      { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  headerLabel:  { fontSize: 10, color: P.purpleSoft, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle:  { fontSize: 18, fontWeight: '800', color: P.white, textAlign: 'center' },
  entriesBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  entriesBadgeText: { fontSize: 14, fontWeight: '800', color: P.purpleSoft },

  banner:     { borderRadius: 22, padding: 22, marginBottom: 28, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: P.purple, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  bannerRing: { position: 'absolute', top: -30, right: 60, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  bannerLeft: { flex: 1 },
  bannerTitle:{ fontSize: 18, fontWeight: '800', color: P.white, marginBottom: 4 },
  bannerSub:  { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  bannerIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 14 },

  promptsRow:         { gap: 10, paddingRight: 4 },
  promptWrap:         { },
  promptCard:         { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, minWidth: 170 },
  promptCardInactive: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, minWidth: 170, backgroundColor: P.navyCard, borderWidth: 1, borderColor: P.glassBorder },
  promptText:         { fontSize: 12, color: P.muted, fontWeight: '600', textAlign: 'center' },
  promptTextActive:   { fontSize: 12, color: P.white, fontWeight: '700', textAlign: 'center' },

  selectedPrompt:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: P.teal + '40' },
  selectedPromptText: { fontSize: 13, color: P.teal, fontWeight: '600', flex: 1 },

  inputBox:   { backgroundColor: P.navyCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: P.glassBorder, marginBottom: 8 },
  input:      { fontSize: 14, color: P.white, minHeight: 180, lineHeight: 22 },
  charCount:  { fontSize: 11, color: P.dimmed, textAlign: 'right' },

  saveBtnWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 28, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  saveBtn:     { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: P.white },

  emptyBox:   { backgroundColor: P.navyCard, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: P.glassBorder },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: P.white },
  emptyDesc:  { fontSize: 13, color: P.muted, textAlign: 'center' },

  entryCard:    { backgroundColor: P.navyCard, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: P.glassBorder },
  entryTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: P.glassBorder },
  entryMeta:    { flex: 1, marginRight: 10 },
  entryDate:    { fontSize: 11, color: P.teal, fontWeight: '700', marginBottom: 3 },
  entryPrompt:  { fontSize: 13, fontWeight: '700', color: P.white },
  entryText:    { fontSize: 13, color: P.muted, lineHeight: 20, marginBottom: 12 },
  entryActions: { flexDirection: 'row', gap: 16 },
  actionBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText:   { fontSize: 12, fontWeight: '600' },
});

export default WellnessJournalScreen;