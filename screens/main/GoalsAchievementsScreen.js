import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { createGoal, deleteGoal, getUserAchievements, getUserGoals } from '../../firebase/firebaseUtils';

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

const ALL_ACHIEVEMENTS = [
  { id: 'first_session',  icon: '🌱', title: 'First Step',            description: 'Complete your first session' },
  { id: 'sessions_5',     icon: '⭐', title: 'Getting Started',        description: 'Complete 5 sessions' },
  { id: 'sessions_10',    icon: '🏅', title: 'Dedicated Meditator',    description: 'Complete 10 sessions' },
  { id: 'sessions_25',    icon: '🌟', title: 'Mindfulness Enthusiast', description: 'Complete 25 sessions' },
  { id: 'sessions_50',    icon: '🏆', title: 'Inner Light Master',     description: 'Complete 50 sessions' },
  { id: 'streak_3',       icon: '🔥', title: '3-Day Streak',           description: 'Meditate 3 days in a row' },
  { id: 'streak_7',       icon: '💪', title: 'Week Warrior',           description: 'Meditate 7 days in a row' },
  { id: 'streak_30',      icon: '👑', title: 'Monthly Master',         description: 'Meditate 30 days in a row' },
  { id: 'minutes_60',     icon: '🕐', title: '1 Hour of Peace',        description: 'Accumulate 60 total minutes' },
  { id: 'minutes_300',    icon: '🧘', title: '5 Hours of Calm',        description: 'Accumulate 300 total minutes' },
];

const fmtDate = (ts) => {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const GoalsAchievementsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab]       = useState('achievements');
  const [achievements, setAchievements] = useState([]);
  const [goals, setGoals]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [deletingId, setDeletingId]     = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal]           = useState({ title: '', target: '', type: 'sessions' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setLoading(false); return; }
    try {
      const [a, g] = await Promise.all([getUserAchievements(uid), getUserGoals(uid)]);
      setAchievements(a);
      setGoals(g);
    } catch {}
    finally { setLoading(false); }
  };

  const merged = ALL_ACHIEVEMENTS.map(a => {
    const earned = achievements.find(e => e.achievementId === a.id);
    return { ...a, earned: !!earned, awardedAt: earned?.awardedAt ?? null };
  });

  const unlockedCount = merged.filter(a => a.earned).length;

  const handleAddGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.target) {
      Alert.alert('Incomplete', 'Please enter a title and target number.');
      return;
    }
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    setSaving(true);
    try {
      await createGoal(uid, { title: newGoal.title.trim(), description: '', type: newGoal.type, targetValue: parseInt(newGoal.target), deadline: null });
      setNewGoal({ title: '', target: '', type: 'sessions' });
      setModalVisible(false);
      await loadData();
    } catch { Alert.alert('Error', 'Failed to create goal.'); }
    finally { setSaving(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Goal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeletingId(id);
        try { await deleteGoal(id); setGoals(prev => prev.filter(g => g.id !== id)); }
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
          <TouchableOpacity style={styles.backCircle} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={P.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerLabel}>MILESTONES</Text>
            <Text style={styles.headerTitle}>Goals & Badges</Text>
          </View>
          <View style={[styles.backCircle, { backgroundColor: P.amber + '20', borderColor: P.amber + '40' }]}>
            <Ionicons name="trophy-outline" size={20} color={P.amber} />
          </View>
        </View>

        {/* Stats Banner */}
        <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.statsBanner}>
          <View style={styles.bannerRing} />
          {[
            { value: unlockedCount,                               label: 'Unlocked' },
            { value: ALL_ACHIEVEMENTS.length - unlockedCount,    label: 'Locked' },
            { value: `${Math.round((unlockedCount / ALL_ACHIEVEMENTS.length) * 100)}%`, label: 'Progress' },
          ].map((s, i) => (
            <View key={i} style={[styles.bannerStat, i > 0 && styles.bannerDivider]}>
              <Text style={styles.bannerVal}>{s.value}</Text>
              <Text style={styles.bannerLabel}>{s.label}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: 'achievements', label: 'Achievements', icon: 'star-outline' },
            { key: 'goals',        label: 'Goals',         icon: 'flag-outline' },
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity key={tab.key} style={styles.tabWrap} onPress={() => setActiveTab(tab.key)}>
                {active ? (
                  <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tab}>
                    <Ionicons name={tab.icon} size={16} color={P.white} />
                    <Text style={styles.tabTextActive}>{tab.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.tab, styles.tabInactive]}>
                    <Ionicons name={tab.icon} size={16} color={P.muted} />
                    <Text style={styles.tabText}>{tab.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={P.teal} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Achievements */}
            {activeTab === 'achievements' && (
              <View>
                {unlockedCount === 0 && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyEmoji}>🏆</Text>
                    <Text style={styles.emptyTitle}>No badges yet!</Text>
                    <Text style={styles.emptyDesc}>Complete sessions to earn achievements.</Text>
                  </View>
                )}
                <View style={styles.achieveGrid}>
                  {merged.map(a => (
                    <View key={a.id} style={[styles.achieveCard, !a.earned && styles.achieveCardLocked]}>
                      <View style={[styles.achieveIconBox, a.earned && { backgroundColor: P.amber + '20' }]}>
                        <Text style={styles.achieveEmoji}>{a.icon}</Text>
                      </View>
                      <Text style={styles.achieveTitle}>{a.title}</Text>
                      <Text style={styles.achieveDesc}>{a.description}</Text>
                      {a.earned && a.awardedAt ? (
                        <View style={styles.earnedBadge}>
                          <Ionicons name="checkmark-circle" size={11} color={P.success} />
                          <Text style={styles.earnedText}>{fmtDate(a.awardedAt)}</Text>
                        </View>
                      ) : !a.earned ? (
                        <View style={styles.lockedBadge}>
                          <Ionicons name="lock-closed" size={11} color={P.dimmed} />
                          <Text style={styles.lockedText}>Locked</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Goals */}
            {activeTab === 'goals' && (
              <View>
                {goals.length === 0 && (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyEmoji}>🎯</Text>
                    <Text style={styles.emptyTitle}>No goals yet!</Text>
                    <Text style={styles.emptyDesc}>Tap "Add Goal" below to set your first goal.</Text>
                  </View>
                )}

                <View style={styles.goalList}>
                  {goals.map(goal => {
                    const pct = Math.min(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100, 100);
                    return (
                      <View key={goal.id} style={styles.goalCard}>
                        <View style={styles.goalTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.goalTitle}>{goal.title}</Text>
                            <Text style={styles.goalMeta}>{goal.type} · Target: {goal.targetValue}</Text>
                          </View>
                          {deletingId === goal.id ? (
                            <ActivityIndicator size="small" color={P.error} />
                          ) : (
                            <TouchableOpacity onPress={() => handleDelete(goal.id)} style={styles.deleteBtn}>
                              <Ionicons name="trash-outline" size={18} color={P.error} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Progress */}
                        <View style={styles.progressTrack}>
                          <LinearGradient
                            colors={goal.isCompleted ? [P.amber, '#F59E0B'] : [P.teal, P.tealDark]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${Math.max(pct, 2)}%` }]}
                          />
                        </View>
                        <View style={styles.progressRow}>
                          <Text style={styles.progressLabel}>{goal.currentValue || 0} / {goal.targetValue}</Text>
                          <Text style={[styles.progressPct, { color: goal.isCompleted ? P.amber : P.teal }]}>
                            {Math.round(pct)}%{goal.isCompleted ? ' ✅' : ''}
                          </Text>
                        </View>

                        {/* Milestones */}
                        <View style={styles.milestones}>
                          {[25, 50, 75, 100].map(m => (
                            <View key={m} style={styles.milestone}>
                              <View style={[styles.milestoneDot, pct >= m && { backgroundColor: P.teal, borderColor: P.teal }]} />
                              <Text style={styles.milestoneLabel}>{m}%</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Add Goal */}
                <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.88} style={styles.addBtnWrap}>
                  <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addBtn}>
                    <Ionicons name="add-circle-outline" size={22} color={P.white} />
                    <Text style={styles.addBtnText}>Add New Goal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Motivation card */}
        <View style={styles.motivCard}>
          <Text style={styles.motivEmoji}>💪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.motivTitle}>Keep Going!</Text>
            <Text style={styles.motivText}>
              {unlockedCount === 0
                ? 'Complete your first session to start earning badges!'
                : `You've earned ${unlockedCount} badge${unlockedCount > 1 ? 's' : ''}! Keep meditating for more.`}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={[P.navyCard, P.navyMid]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={P.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Goal Title</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Complete 10 sessions"
                placeholderTextColor={P.dimmed}
                value={newGoal.title}
                onChangeText={t => setNewGoal({ ...newGoal, title: t })}
              />
            </View>

            <Text style={styles.inputLabel}>Target Number</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10"
                placeholderTextColor={P.dimmed}
                value={newGoal.target}
                onChangeText={t => setNewGoal({ ...newGoal, target: t })}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.inputLabel}>Goal Type</Text>
            <View style={styles.typeRow}>
              {['sessions', 'minutes', 'streak'].map(type => {
                const active = newGoal.type === type;
                return (
                  <TouchableOpacity key={type} onPress={() => setNewGoal({ ...newGoal, type })} style={styles.typeWrap}>
                    {active ? (
                      <LinearGradient colors={[P.teal, P.tealDark]} style={styles.typeBtn}>
                        <Text style={styles.typeBtnTextActive}>{type}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.typeBtn, styles.typeBtnInactive]}>
                        <Text style={styles.typeBtnText}>{type}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity onPress={handleAddGoal} disabled={saving} activeOpacity={0.88} style={styles.createBtnWrap}>
              <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createBtn}>
                {saving ? <ActivityIndicator color={P.white} /> : <Text style={styles.createBtnText}>Create Goal</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glow:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.amber, opacity: 0.05 },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backCircle:  { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontSize: 10, color: P.amber, fontWeight: '700', letterSpacing: 2, textAlign: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: P.white, textAlign: 'center' },

  statsBanner:  { borderRadius: 22, paddingVertical: 20, paddingHorizontal: 10, flexDirection: 'row', marginBottom: 24, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  bannerRing:   { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  bannerStat:   { flex: 1, alignItems: 'center' },
  bannerDivider:{ borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  bannerVal:    { fontSize: 26, fontWeight: '800', color: P.white },
  bannerLabel:  { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },

  tabs:       { flexDirection: 'row', backgroundColor: P.navyCard, borderRadius: 18, padding: 5, marginBottom: 24, gap: 5, borderWidth: 1, borderColor: P.glassBorder },
  tabWrap:    { flex: 1 },
  tab:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 14, gap: 6 },
  tabInactive:{ },
  tabText:    { fontSize: 13, fontWeight: '600', color: P.muted },
  tabTextActive:{ fontSize: 13, fontWeight: '700', color: P.white },

  emptyBox:   { backgroundColor: P.navyCard, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: P.glassBorder, marginBottom: 20 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: P.white },
  emptyDesc:  { fontSize: 13, color: P.muted, textAlign: 'center' },

  achieveGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achieveCard:       { width: '48%', backgroundColor: P.navyCard, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  achieveCardLocked: { opacity: 0.45 },
  achieveIconBox:    { width: 52, height: 52, borderRadius: 16, backgroundColor: P.glass, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  achieveEmoji:      { fontSize: 26 },
  achieveTitle:      { fontSize: 13, fontWeight: '700', color: P.white, marginBottom: 4, textAlign: 'center' },
  achieveDesc:       { fontSize: 11, color: P.muted, textAlign: 'center', lineHeight: 16 },
  earnedBadge:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  earnedText:        { fontSize: 10, color: P.success, fontWeight: '600' },
  lockedBadge:       { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  lockedText:        { fontSize: 10, color: P.dimmed, fontWeight: '600' },

  goalList:      { gap: 10, marginBottom: 16 },
  goalCard:      { backgroundColor: P.navyCard, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: P.glassBorder },
  goalTop:       { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  goalTitle:     { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 3 },
  goalMeta:      { fontSize: 12, color: P.muted, textTransform: 'capitalize' },
  deleteBtn:     { width: 34, height: 34, borderRadius: 10, backgroundColor: P.error + '15', justifyContent: 'center', alignItems: 'center' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  progressFill:  { height: '100%', borderRadius: 6 },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  progressLabel: { fontSize: 11, color: P.muted, fontWeight: '600' },
  progressPct:   { fontSize: 11, fontWeight: '700' },
  milestones:    { flexDirection: 'row', justifyContent: 'space-between' },
  milestone:     { alignItems: 'center', gap: 3 },
  milestoneDot:  { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: P.dimmed, backgroundColor: 'transparent' },
  milestoneLabel:{ fontSize: 10, color: P.dimmed, fontWeight: '600' },

  addBtnWrap: { borderRadius: 18, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  addBtn:     { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  addBtnText: { fontSize: 16, fontWeight: '700', color: P.white },

  motivCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: P.navyCard, borderRadius: 18, padding: 18, marginTop: 24, borderWidth: 1, borderColor: P.glassBorder },
  motivEmoji: { fontSize: 30 },
  motivTitle: { fontSize: 14, fontWeight: '700', color: P.white, marginBottom: 4 },
  motivText:  { fontSize: 12, color: P.muted, lineHeight: 18 },

  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:       { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: P.dimmed, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: P.white },
  inputLabel:  { fontSize: 12, color: P.muted, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  inputBox:    { backgroundColor: P.glass, borderRadius: 14, borderWidth: 1, borderColor: P.glassBorder, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18 },
  input:       { fontSize: 15, color: P.white },
  typeRow:     { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeWrap:    { flex: 1 },
  typeBtn:     { paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  typeBtnInactive: { backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder },
  typeBtnText:      { fontSize: 13, color: P.muted, fontWeight: '600', textTransform: 'capitalize' },
  typeBtnTextActive:{ fontSize: 13, color: P.white, fontWeight: '700', textTransform: 'capitalize' },
  createBtnWrap: { borderRadius: 18, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  createBtn:     { height: 54, alignItems: 'center', justifyContent: 'center' },
  createBtnText: { fontSize: 16, fontWeight: '700', color: P.white },
});

export default GoalsAchievementsScreen;