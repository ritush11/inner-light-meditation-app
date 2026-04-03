import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyCard:    '#162035',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  pink:        '#EC4899',
  amber:       '#F59E0B',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
  error:       '#F87171',
};

export const CRISIS_LINES = [
  { id: 1, name: 'TPO Nepal',                   role: 'Suicide Prevention Hotline',   number: '16600102005',    available: '8am – 8pm',  free: true,  color: P.pink,       icon: 'heart-outline'        },
  { id: 2, name: 'CMC Nepal',                   role: 'Mental Health Counselling',     number: '16600185080',    available: 'Office hrs', free: true,  color: P.teal,       icon: 'medical-outline'      },
  { id: 3, name: 'Mental Health Society Nepal', role: 'Psychosocial Support',          number: '+9779851223769', available: '24/7',       free: false, color: P.purpleSoft, icon: 'people-outline'       },
  { id: 4, name: 'Patan Hospital',              role: 'Psychiatric Emergency',         number: '9813476123',     available: '24/7',       free: false, color: P.amber,      icon: 'shield-outline'       },
  { id: 5, name: 'Nepal Emergency',             role: 'Emergency Services',            number: '100',            available: '24/7',       free: true,  color: P.error,      icon: 'alert-circle-outline' },
];

const WEBSITES = [
  { id: 6, name: 'KOSHISH Nepal',       role: 'Mental health & psychosocial support', url: 'https://www.koshishnepal.org',  color: P.purpleSoft, icon: 'heart-outline' },
  { id: 7, name: 'Nepal Mental Health', role: 'Free online counselling & resources',  url: 'https://nepalmentalhealth.com', color: P.teal,       icon: 'globe-outline' },
];

const CallSupportScreen = ({ navigation }) => {

  const goToDial = (line) => navigation.navigate('Dialing', { line });

  return (
    <SafeAreaView style={s.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={s.glowTeal} />
      <View style={s.glowPurple} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerLabel}>MENTAL WELLNESS</Text>
          <Text style={s.headerTitle}>Support Lines</Text>
          <Text style={s.headerSub}>Real help from real people — anytime</Text>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity onPress={() => goToDial(CRISIS_LINES[0])} activeOpacity={0.88} style={s.emergency}>
          <LinearGradient colors={[P.pink, '#BE185D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
          <View style={s.emergencyGlow} />
          <View style={s.emergencyIconBox}>
            <Ionicons name="alert-circle" size={26} color={P.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.emergencyTitle}>Need Immediate Help?</Text>
            <Text style={s.emergencySub}>Tap to call TPO Nepal — it's free</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Pills */}
        <View style={s.pillsRow}>
          {[
            { icon: 'lock-closed-outline', label: 'Confidential', color: P.teal },
            { icon: 'call-outline',        label: 'Free to call',  color: P.purpleSoft },
            { icon: 'heart-outline',       label: 'Non-judgement', color: P.pink },
          ].map((f, i) => (
            <View key={i} style={s.pill}>
              <Ionicons name={f.icon} size={15} color={f.color} />
              <Text style={s.pillText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Crisis Lines */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Crisis Support Lines</Text>
          <Text style={s.sectionSub}>Tap any line to call</Text>
          {CRISIS_LINES.map(line => (
            <TouchableOpacity key={line.id} style={s.lineCard} onPress={() => goToDial(line)} activeOpacity={0.88}>
              <View style={[s.lineAccent, { backgroundColor: line.color }]} />
              <View style={[s.lineIconBox, { backgroundColor: line.color + '18' }]}>
                <Ionicons name={line.icon} size={22} color={line.color} />
              </View>
              <View style={s.lineInfo}>
                <View style={s.lineTopRow}>
                  <Text style={s.lineName}>{line.name}</Text>
                  {line.free && <View style={s.freeBadge}><Text style={s.freeBadgeText}>FREE</Text></View>}
                </View>
                <Text style={s.lineRole}>{line.role}</Text>
                <View style={s.lineMeta}>
                  <Ionicons name="time-outline" size={11} color={P.dimmed} />
                  <Text style={s.lineMetaText}>{line.available}</Text>
                  <View style={s.lineDot} />
                  <Text style={s.lineNum}>{line.number}</Text>
                </View>
              </View>
              <View style={[s.callBtn, { backgroundColor: line.color }]}>
                <Ionicons name="call" size={16} color={P.white} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Websites */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Online Resources</Text>
          <Text style={s.sectionSub}>Tap to open in browser</Text>
          {WEBSITES.map(site => (
            <TouchableOpacity key={site.id} style={s.lineCard} onPress={() => Linking.openURL(site.url).catch(() => {})} activeOpacity={0.88}>
              <View style={[s.lineAccent, { backgroundColor: site.color }]} />
              <View style={[s.lineIconBox, { backgroundColor: site.color + '18' }]}>
                <Ionicons name={site.icon} size={22} color={site.color} />
              </View>
              <View style={s.lineInfo}>
                <Text style={s.lineName}>{site.name}</Text>
                <Text style={s.lineRole}>{site.role}</Text>
                <Text style={[s.lineNum, { marginTop: 4 }]}>{site.url}</Text>
              </View>
              <View style={[s.callBtn, { backgroundColor: site.color }]}>
                <Ionicons name="open-outline" size={16} color={P.white} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* How it works */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>How It Works</Text>
          <View style={s.stepsCard}>
            {[
              { icon: 'hand-left-outline',  title: 'Choose a line',  desc: 'Pick the helpline that fits your need', color: P.teal },
              { icon: 'call-outline',       title: 'Tap Call',       desc: 'Review details and confirm',            color: P.purpleSoft },
              { icon: 'chatbubble-outline', title: 'Talk freely',    desc: 'Everything you say stays private',      color: P.pink },
              { icon: 'heart-outline',      title: 'Get support',    desc: 'Receive guidance and next steps',       color: P.amber },
            ].map((step, i) => (
              <View key={i} style={[s.stepRow, i > 0 && s.stepBorder]}>
                <LinearGradient colors={[step.color + '30', step.color + '10']} style={s.stepIconBox}>
                  <Ionicons name={step.icon} size={20} color={step.color} />
                </LinearGradient>
                <View style={s.stepText}>
                  <Text style={s.stepTitle}>{step.title}</Text>
                  <Text style={s.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.noteCard}>
          <Ionicons name="information-circle-outline" size={18} color={P.purpleSoft} />
          <Text style={s.noteText}>Reaching out is a sign of strength. You deserve to feel better. 💙</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 48 },
  glowTeal:   { position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: P.teal,   opacity: 0.06 },
  glowPurple: { position: 'absolute', bottom: 80, left: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: P.purple, opacity: 0.06 },
  header:       { marginBottom: 22 },
  headerLabel:  { fontSize: 11, color: P.teal, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle:  { fontSize: 28, fontWeight: '800', color: P.white, letterSpacing: -0.5, marginBottom: 4 },
  headerSub:    { fontSize: 13, color: P.muted },
  emergency:      { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, marginBottom: 20, overflow: 'hidden', shadowColor: P.pink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  emergencyGlow:  { position: 'absolute', top: -20, right: 50, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  emergencyIconBox:{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  emergencyTitle: { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 2 },
  emergencySub:   { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  pill:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P.navyCard, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center' },
  pillText: { fontSize: 10, color: P.muted, fontWeight: '600' },
  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 4 },
  sectionSub:   { fontSize: 12, color: P.muted, marginBottom: 14 },
  lineCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: P.navyCard, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden' },
  lineAccent:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  lineIconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginRight: 12 },
  lineInfo:    { flex: 1 },
  lineTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  lineName:    { fontSize: 14, fontWeight: '700', color: P.white },
  freeBadge:   { backgroundColor: 'rgba(52,211,153,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  freeBadgeText:{ fontSize: 9, color: '#34D399', fontWeight: '800', letterSpacing: 0.5 },
  lineRole:    { fontSize: 12, color: P.muted, marginBottom: 6 },
  lineMeta:    { flexDirection: 'row', alignItems: 'center', gap: 5 },
  lineMetaText:{ fontSize: 11, color: P.dimmed },
  lineDot:     { width: 3, height: 3, borderRadius: 2, backgroundColor: P.dimmed },
  lineNum:     { fontSize: 11, color: P.teal, fontWeight: '700' },
  callBtn:     { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  stepsCard:   { backgroundColor: P.navyCard, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  stepRow:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  stepBorder:  { borderTopWidth: 1, borderTopColor: P.glassBorder },
  stepIconBox: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  stepText:    { flex: 1 },
  stepTitle:   { fontSize: 14, fontWeight: '700', color: P.white, marginBottom: 2 },
  stepDesc:    { fontSize: 12, color: P.muted, lineHeight: 17 },
  noteCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(124,62,237,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#7C3AED30' },
  noteText:    { flex: 1, fontSize: 13, color: P.muted, lineHeight: 20, fontStyle: 'italic' },
});

export default CallSupportScreen;