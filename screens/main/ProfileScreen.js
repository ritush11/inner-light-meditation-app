import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';
import { getUserData, updateUserData } from '../../firebase/firebaseUtils';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyCard:    '#162035',
  navyLight:   '#1E3A5F',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  amber:       '#F59E0B',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  error:       '#F87171',
};

const MORE_FEATURES = [
  { screen: 'Journal',      icon: 'book-outline',        label: 'Wellness Journal',    color: P.teal },
  { screen: 'MoodTracking', icon: 'happy-outline',       label: 'Mood Tracking',       color: P.purpleSoft },
  { screen: 'Quiz',         icon: 'help-circle-outline', label: 'Mental Health Quiz',  color: P.amber },
  { screen: 'SleepStories', icon: 'moon-outline',        label: 'Sleep Stories',       color: '#60A5FA' },
  { screen: 'Goals',        icon: 'flag-outline',        label: 'Goals & Achievements',color: '#34D399' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [userName, setUserName]   = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userBio, setUserBio]     = useState('');
  const [userStats, setUserStats] = useState({ sessionsCompleted: 0, totalMinutes: 0, streak: 0 });
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled]   = useState(true);
  const [loading, setLoading]     = useState(true);

  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName]       = useState('');
  const [editBio, setEditBio]         = useState('');
  const [savingEdit, setSavingEdit]   = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUserName(u.displayName || 'User');
        setUserEmail(u.email || '');
        try {
          const d = await getUserData(u.uid);
          if (d) {
            setUserName(d.displayName || u.displayName || 'User');
            setUserBio(d.bio || '');
            setUserStats({ sessionsCompleted: d.sessionsCompleted || 0, totalMinutes: d.totalMinutes || 0, streak: d.streak || 0 });
            setNotifications(d.notificationsEnabled !== false);
            setSoundEnabled(d.soundEnabled !== false);
          }
        } catch {}
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleToggle = async (key, value, setter) => {
    setter(value);
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try { await updateUserData(uid, { [key]: value }); }
    catch { setter(!value); }
  };

  const handleSaveProfile = async () => {
    const handleSaveProfile = async () => {
  const uid = auth.currentUser?.uid;
  if (!uid || !editName.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
  setSavingEdit(true);
  try {
    // Update BOTH Firestore AND Firebase Auth profile
    await updateUserData(uid, { displayName: editName.trim(), bio: editBio.trim() });
    await updateProfile(auth.currentUser, { displayName: editName.trim() });
    
    setUserName(editName.trim());
    setUserBio(editBio.trim());
    setEditVisible(false);
  } catch { Alert.alert('Error', 'Failed to save. Try again.'); }
  finally { setSavingEdit(false); }
};
    const uid = auth.currentUser?.uid;
    if (!uid || !editName.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
    setSavingEdit(true);
    try {
      await updateUserData(uid, { displayName: editName.trim(), bio: editBio.trim() });
      setUserName(editName.trim());
      setUserBio(editBio.trim());
      setEditVisible(false);
    } catch { Alert.alert('Error', 'Failed to save. Try again.'); }
    finally { setSavingEdit(false); }
  };

  const handleLogout = () => {
    const doLogout = async () => { try { await signOut(auth); } catch (e) { Alert.alert('Error', e.message); } };
    if (Platform.OS === 'web') {
      if (window.confirm('Logout?')) doLogout();
    } else {
      Alert.alert('Logout', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', onPress: doLogout, style: 'destructive' }]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <LinearGradient colors={[P.navy, P.navyMid]} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color={P.teal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile Header ── */}
        <View style={styles.header}>
          <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
            {userBio ? <Text style={styles.bio} numberOfLines={2}>{userBio}</Text> : null}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setEditName(userName); setEditBio(userBio); setEditVisible(true); }}>
            <Ionicons name="pencil-outline" size={18} color={P.teal} />
          </TouchableOpacity>
        </View>

        {/* ── Stats ── */}
     

        {/* ── Settings ── */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.card}>
          {[
            { icon: 'notifications-outline', label: 'Notifications', desc: 'Meditation reminders', value: notifications, key: 'notificationsEnabled', setter: setNotifications, color: P.teal },
            { icon: 'volume-high-outline',   label: 'Sound',         desc: 'Audio during sessions', value: soundEnabled,  key: 'soundEnabled',         setter: setSoundEnabled,   color: P.purpleSoft },
          ].map((item, i) => (
            <View key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <View style={[styles.rowIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={v => handleToggle(item.key, v, item.setter)}
                trackColor={{ false: P.dimmed, true: P.teal + '80' }}
                thumbColor={item.value ? P.teal : P.muted}
              />
            </View>
          ))}
        </View>

        {/* ── More Features ── */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.card}>
          {MORE_FEATURES.map((item, i) => (
            <TouchableOpacity key={i} style={[styles.row, i > 0 && styles.rowBorder]} onPress={() => navigation.navigate(item.screen)}>
              <View style={[styles.rowIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.rowLabel, { flex: 1 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={P.dimmed} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Help ── */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          {[
            { icon: 'help-circle-outline', label: 'FAQ',     color: P.teal },
            { icon: 'document-text-outline', label: 'About', color: P.purpleSoft },
            { icon: 'shield-checkmark-outline', label: 'Privacy', color: P.amber },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.row, i > 0 && styles.rowBorder]}>
              <View style={[styles.rowIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.rowLabel, { flex: 1 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={P.dimmed} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.88}>
          <View style={styles.logoutInner}>
            <Ionicons name="log-out-outline" size={18} color={P.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.version}>Inner Light v1.0.0</Text>
      </ScrollView>

      {/* ── Edit Modal ── */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={[P.navyCard, P.navyMid]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={22} color={P.muted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Display Name</Text>
            <View style={styles.inputBox}>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={P.dimmed} maxLength={40} />
            </View>

            <Text style={styles.inputLabel}>Bio</Text>
            <View style={[styles.inputBox, { height: 80 }]}>
              <TextInput style={[styles.input, { textAlignVertical: 'top' }]} value={editBio} onChangeText={setEditBio} placeholder="Tell us about yourself..." placeholderTextColor={P.dimmed} multiline numberOfLines={3} maxLength={150} />
            </View>

            <TouchableOpacity onPress={handleSaveProfile} disabled={savingEdit} style={styles.saveWrap}>
              <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                {savingEdit ? <ActivityIndicator color={P.white} /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
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
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  glow:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: '#2DD4BF', opacity: 0.06 },

  // Header
  header:     { flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: P.navyCard, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: P.glassBorder },
  avatar:     { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 26, fontWeight: '800', color: P.white },
  headerInfo: { flex: 1 },
  name:       { fontSize: 18, fontWeight: '700', color: P.white, marginBottom: 2 },
  email:      { fontSize: 13, color: P.muted, marginBottom: 2 },
  bio:        { fontSize: 12, color: P.dimmed, lineHeight: 16 },
  editBtn:    { width: 36, height: 36, borderRadius: 10, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },

  // Stats
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard:  { flex: 1, backgroundColor: P.navyCard, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: P.glassBorder },
  statVal:   { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: P.muted, fontWeight: '600' },

  // Sections
  sectionTitle: { fontSize: 13, fontWeight: '700', color: P.muted, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  card:         { backgroundColor: P.navyCard, borderRadius: 18, marginBottom: 24, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  rowBorder:    { borderTopWidth: 1, borderTopColor: P.glassBorder },
  rowIcon:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  rowInfo:      { flex: 1 },
  rowLabel:     { fontSize: 14, fontWeight: '600', color: P.white },
  rowDesc:      { fontSize: 12, color: P.muted, marginTop: 1 },

  // Logout
  logoutBtn:   { backgroundColor: P.navyCard, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: P.error + '40', overflow: 'hidden' },
  logoutInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  logoutText:  { fontSize: 15, fontWeight: '700', color: P.error },
  version:     { textAlign: 'center', fontSize: 12, color: P.dimmed },

  // Modal
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal:       { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: P.dimmed, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle:  { fontSize: 18, fontWeight: '700', color: P.white },
  inputLabel:  { fontSize: 13, fontWeight: '600', color: P.muted, marginBottom: 8 },
  inputBox:    { backgroundColor: P.glass, borderRadius: 14, borderWidth: 1, borderColor: P.glassBorder, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 18 },
  input:       { fontSize: 15, color: P.white },
  saveWrap:    { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  saveBtn:     { height: 52, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: P.white },
});

export default ProfileScreen;