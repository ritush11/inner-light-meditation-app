import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyCard:    '#162035',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
};

const DialingScreen = ({ navigation, route }) => {
  const { line } = route.params;

  const handleCall = () => {
    // Open real dialer
    Linking.openURL(`tel:${line.number}`).catch(() => {});
    // Navigate to active call screen
    navigation.replace('ActiveCall', { line });
  };

  return (
    <SafeAreaView style={s.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={[s.glow, { backgroundColor: line.color }]} />

      {/* Back */}
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <View style={s.backCircle}>
          <Ionicons name="chevron-back" size={22} color={P.white} />
        </View>
      </TouchableOpacity>

      <View style={s.content}>
        {/* Avatar */}
        <LinearGradient colors={[line.color, line.color + '80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.avatar}>
          <View style={s.avatarRing} />
          <Ionicons name={line.icon} size={56} color={P.white} />
        </LinearGradient>

        <Text style={s.name}>{line.name}</Text>
        <Text style={s.role}>{line.role}</Text>

        {/* Info rows */}
        <View style={s.infoCard}>
          {[
            { icon: 'call-outline',        label: 'Number',       value: line.number,                 valueColor: P.teal },
            { icon: 'time-outline',        label: 'Available',    value: line.available,              valueColor: P.white },
            { icon: 'wallet-outline',      label: 'Cost',         value: line.free ? 'Free' : 'Standard rates', valueColor: line.free ? '#34D399' : P.white },
            { icon: 'lock-closed-outline', label: 'Confidential', value: 'Yes — all calls are private', valueColor: P.white },
          ].map((row, i) => (
            <View key={i} style={[s.infoRow, i > 0 && s.infoBorder]}>
              <View style={[s.infoIcon, { backgroundColor: line.color + '20' }]}>
                <Ionicons name={row.icon} size={16} color={line.color} />
              </View>
              <Text style={s.infoLabel}>{row.label}</Text>
              <Text style={[s.infoValue, { color: row.valueColor }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        <Text style={s.hint}>
          Tapping "Call Now" will open your phone dialer and connect you to {line.name}.
        </Text>

        {/* Call Now button */}
        <TouchableOpacity onPress={handleCall} activeOpacity={0.88} style={s.callBtnWrap}>
          <LinearGradient
            colors={[line.color, line.color + 'BB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.callBtn}
          >
            <View style={s.callBtnIcon}>
              <Ionicons name="call" size={24} color={line.color} />
            </View>
            <Text style={s.callBtnText}>Call Now</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={s.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:     { flex: 1 },
  glow:     { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, opacity: 0.08 },
  backBtn:  { padding: 20 },
  backCircle:{ width: 42, height: 42, borderRadius: 13, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },
  content:  { flex: 1, paddingHorizontal: 28, alignItems: 'center', paddingTop: 8, paddingBottom: 40 },
  avatar:   { width: 130, height: 130, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 12 },
  avatarRing:{ position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  name:     { fontSize: 26, fontWeight: '800', color: P.white, marginBottom: 6, textAlign: 'center' },
  role:     { fontSize: 14, color: P.muted, marginBottom: 32, textAlign: 'center' },
  infoCard: { width: '100%', backgroundColor: P.navyCard, borderRadius: 22, marginBottom: 20, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  infoRow:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  infoBorder:{ borderTopWidth: 1, borderTopColor: P.glassBorder },
  infoIcon: { width: 36, height: 36, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  infoLabel:{ fontSize: 13, color: P.muted, fontWeight: '600', flex: 1 },
  infoValue:{ fontSize: 13, fontWeight: '700' },
  hint:     { fontSize: 12, color: P.dimmed, textAlign: 'center', lineHeight: 18, marginBottom: 32, paddingHorizontal: 10 },
  callBtnWrap:{ width: '100%', borderRadius: 22, overflow: 'hidden', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 18, elevation: 10 },
  callBtn:    { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  callBtnIcon:{ width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  callBtnText:{ fontSize: 20, fontWeight: '800', color: P.white, letterSpacing: 0.3 },
  cancelBtn:  { paddingVertical: 14 },
  cancelText: { fontSize: 15, color: P.muted, fontWeight: '600' },
});

export default DialingScreen;