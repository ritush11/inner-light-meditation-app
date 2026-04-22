import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// ── Bot responses ─────────────────────────────────────────────
const BOT_RESPONSES = [
  {
    keywords: ['anxious', 'anxiety', 'panic', 'worried', 'worry', 'nervous'],
    reply: "I hear you — anxiety can feel overwhelming. Try this: breathe in slowly for 4 counts, hold for 4, breathe out for 4. Repeat 4 times. This activates your body's calm response. Would you like me to guide you through a breathing exercise?",
    suggestions: ['Guide me through breathing', 'I need someone to talk to', 'How do I calm down fast?'],
  },
  {
    keywords: ['sad', 'depressed', 'depression', 'hopeless', 'empty', 'numb', 'low'],
    reply: "I'm really sorry you're feeling this way. These feelings are valid, and you're not alone. It takes courage to reach out. Small steps help — try going outside for 5 minutes, drinking water, or calling someone you trust. If it feels too heavy, please consider calling TPO Nepal (free, confidential).",
    suggestions: ['Call TPO Nepal', 'What can I do right now?', 'I feel completely alone'],
  },
  {
    keywords: ['stress', 'stressed', 'overwhelmed', 'pressure', 'burnout', 'exhausted', 'tired'],
    reply: "Stress builds up when we carry too much. Right now, write down the 3 biggest things weighing on you. Then ask: which of these can I do something about today? Focus only on that one thing. Everything else can wait.",
    suggestions: ['I can\'t focus at all', 'My stress is work-related', 'Help me relax right now'],
  },
  {
    keywords: ['sleep', 'insomnia', 'can\'t sleep', 'awake', 'nightmares'],
    reply: "Poor sleep makes everything harder. Try this tonight: no screens 30 minutes before bed, keep your room cool and dark, and do a simple body scan — notice sensations from your feet up to your head. The Sleep Stories section in Inner Light can also help you drift off.",
    suggestions: ['Tell me more about sleep tips', 'I keep having nightmares', 'Nothing helps me sleep'],
  },
  {
    keywords: ['angry', 'anger', 'furious', 'rage', 'frustrated', 'irritable'],
    reply: "Anger is a natural emotion — it's telling you something important. Before reacting, try the 10-second rule: count to 10 and take slow breaths. Ask yourself: what is this anger actually about? Journaling your feelings in the Wellness Journal can also help process it.",
    suggestions: ['I feel out of control', 'Help me manage my anger', 'I keep snapping at people'],
  },
  {
    keywords: ['lonely', 'alone', 'isolated', 'no one', 'nobody', 'friends'],
    reply: "Loneliness is one of the hardest feelings. You reached out here — that already takes strength. Even small connections help: send one text to someone today, join a community group, or talk to a counsellor on one of the helplines above. You deserve connection.",
    suggestions: ['I have no one to talk to', 'How do I make friends?', 'I need a real person to talk to'],
  },
  {
    keywords: ['suicidal', 'suicide', 'end my life', 'want to die', 'kill myself', 'no point'],
    reply: "Please know you are not alone and this pain can get better. Right now, please reach out to TPO Nepal — they are free, confidential, and available 8am–8pm. If you are in immediate danger, call Nepal Emergency (100). Your life matters.",
    suggestions: ['Call TPO Nepal now', 'Call Nepal Emergency (100)', 'I need immediate help'],
    urgent: true,
  },
  {
    keywords: ['help', 'hi', 'hello', 'hey', 'start', 'talk', 'support'],
    reply: "Hello! I'm the Inner Light Support Assistant. I'm here to listen and guide you. I'm not a replacement for professional help, but I can offer a calm space, coping tips, and point you toward real support. What's on your mind today?",
    suggestions: ['I feel anxious', 'I\'m feeling very low', 'I can\'t sleep'],
  },
  {
    keywords: ['breathe', 'breathing', 'breath', 'calm', 'relax', 'meditation', 'meditate'],
    reply: "Great choice — breathing is the fastest way to calm your nervous system. Try box breathing: breathe IN for 4 counts, HOLD for 4, breathe OUT for 4, HOLD for 4. Repeat 4 rounds. You can also find guided breathing sessions in the Meditate tab of Inner Light.",
    suggestions: ['I feel calmer now', 'Take me to meditate', 'What else can help?'],
  },
  {
    keywords: ['thank', 'thanks', 'better', 'helped', 'good', 'okay', 'ok'],
    reply: "I'm really glad to hear that. Remember, your wellbeing is a daily practice — small steps add up. The Meditate tab has sessions for any mood, and you can track your progress in the Progress tab. Take care of yourself.",
    suggestions: ['One more thing', 'Tell me about meditation', 'Goodbye'],
  },
];

const INITIAL_MESSAGES = [
  {
    id: '0',
    role: 'bot',
    text: "Hello! I'm your Inner Light Support Assistant. I'm here to listen, offer coping tips, and guide you to the right support. What's on your mind today?",
    time: new Date(),
  },
];

const INITIAL_SUGGESTIONS = ['I feel anxious', 'I\'m feeling very low', 'I can\'t sleep', 'I feel stressed'];

const getBotReply = (input) => {
  const lower = input.toLowerCase();
  for (const item of BOT_RESPONSES) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item;
    }
  }
  return {
    reply: "I hear you. It can be hard to put feelings into words. Could you tell me a little more about what you're going through? I want to understand so I can help better.",
    suggestions: ['I feel anxious', 'I\'m very stressed', 'I need to talk to someone', 'I can\'t sleep'],
  };
};

const fmt = (date) => {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

// ── Chat Section Component ────────────────────────────────────
const ChatSection = ({ navigation }) => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [input, setInput] = useState('');
  const [botTyping, setBotTyping] = useState(false);
  const scrollRef = useRef(null);

  const sendMessage = (text) => {
    const msg = text.trim() || input.trim();
    if (!msg) return;
    setInput('');
    setSuggestions([]);

    // Add user message
    const userMsg = { id: Date.now().toString(), role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Bot is typing
    setBotTyping(true);
    setTimeout(() => {
      const response = getBotReply(msg);

      // If urgent — add call button message
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: response.reply,
        time: new Date(),
        urgent: response.urgent || false,
      };
      setMessages(prev => [...prev, botMsg]);
      setSuggestions(response.suggestions || []);
      setBotTyping(false);

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000 + Math.random() * 600);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={s.section}>
      <View style={s.chatHeader}>
        <View style={s.chatHeaderLeft}>
          <LinearGradient colors={[P.teal, P.purpleSoft]} style={s.botAvatar}>
            <Ionicons name="chatbubble-ellipses" size={16} color={P.white} />
          </LinearGradient>
          <View>
            <Text style={s.sectionTitle}>Wellness Assistant</Text>
            <View style={s.onlineDot}>
              <View style={s.onlineDotCircle} />
              <Text style={s.onlineText}>Always here for you</Text>
            </View>
          </View>
        </View>
        <View style={s.notRealBadge}>
          <Text style={s.notRealText}>AI Bot</Text>
        </View>
      </View>

      {/* Chat messages */}
      <View style={s.chatBox}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.chatScroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
              {msg.role === 'bot' && (
                <LinearGradient colors={[P.teal, P.purpleSoft]} style={s.msgAvatar}>
                  <Ionicons name="chatbubble-ellipses" size={10} color={P.white} />
                </LinearGradient>
              )}
              <View style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleBot]}>
                <Text style={[s.bubbleText, msg.role === 'user' && s.bubbleTextUser]}>{msg.text}</Text>
                {msg.urgent && (
                  <TouchableOpacity
                    style={s.urgentCallBtn}
                    onPress={() => Linking.openURL('tel:16600102005').catch(() => {})}
                  >
                    <Ionicons name="call" size={13} color={P.white} />
                    <Text style={s.urgentCallText}>Call TPO Nepal Now — Free</Text>
                  </TouchableOpacity>
                )}
                <Text style={[s.bubbleTime, msg.role === 'user' && { color: 'rgba(255,255,255,0.6)' }]}>{fmt(msg.time)}</Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {botTyping && (
            <View style={s.msgRow}>
              <LinearGradient colors={[P.teal, P.purpleSoft]} style={s.msgAvatar}>
                <Ionicons name="chatbubble-ellipses" size={10} color={P.white} />
              </LinearGradient>
              <View style={[s.bubble, s.bubbleBot, s.typingBubble]}>
                <View style={s.typingDots}>
                  <View style={[s.dot, s.dot1]} />
                  <View style={[s.dot, s.dot2]} />
                  <View style={[s.dot, s.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {suggestions.length > 0 && !botTyping && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.suggestionsRow}
            style={s.suggestionsWrap}
          >
            {suggestions.map((sg, i) => (
              <TouchableOpacity key={i} style={s.suggestion} onPress={() => sendMessage(sg)}>
                <Text style={s.suggestionText}>{sg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input row */}
        <View style={s.inputRow}>
          <TextInput
            style={s.chatInput}
            placeholder="Type how you're feeling..."
            placeholderTextColor={P.dimmed}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            style={[s.sendBtn, !input.trim() && { opacity: 0.4 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <LinearGradient colors={[P.teal, P.tealDark]} style={s.sendBtnInner}>
              <Ionicons name="send" size={16} color={P.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={s.disclaimerRow}>
        <Ionicons name="information-circle-outline" size={13} color={P.dimmed} />
        <Text style={s.disclaimerText}>
          This is an automated wellness assistant, not a licensed therapist. For crisis support, please call the helplines above.
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────
const CallSupportScreen = ({ navigation }) => {

  const goToDial = (line) => navigation.navigate('Dialing', { line });

  return (
    <SafeAreaView style={s.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={s.glowTeal} />
      <View style={s.glowPurple} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >

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

          {/* ── CHAT BOT SECTION ── */}
          <ChatSection navigation={navigation} />

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

          <View style={s.noteCard}>
            <Ionicons name="information-circle-outline" size={18} color={P.purpleSoft} />
            <Text style={s.noteText}>Reaching out is a sign of strength. You deserve to feel better.</Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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

  emergency:       { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 18, marginBottom: 20, overflow: 'hidden', shadowColor: P.pink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  emergencyGlow:   { position: 'absolute', top: -20, right: 50, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.1)' },
  emergencyIconBox:{ width: 46, height: 46, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  emergencyTitle:  { fontSize: 15, fontWeight: '700', color: P.white, marginBottom: 2 },
  emergencySub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  pill:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: P.navyCard, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center' },
  pillText: { fontSize: 10, color: P.muted, fontWeight: '600' },

  section:      { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: P.white, marginBottom: 4 },
  sectionSub:   { fontSize: 12, color: P.muted, marginBottom: 14 },

  // ── Chat ──
  chatHeader:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botAvatar:      { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  onlineDot:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDotCircle:{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  onlineText:     { fontSize: 11, color: P.muted },
  notRealBadge:   { backgroundColor: 'rgba(45,212,191,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(45,212,191,0.25)' },
  notRealText:    { fontSize: 10, color: P.teal, fontWeight: '700', letterSpacing: 0.5 },

  chatBox:    { backgroundColor: P.navyCard, borderRadius: 22, borderWidth: 1, borderColor: P.glassBorder, overflow: 'hidden', marginBottom: 8 },
  chatScroll: { padding: 14, paddingBottom: 4 },

  msgRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar:  { width: 26, height: 26, borderRadius: 9, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },

  bubble:         { maxWidth: '78%', borderRadius: 18, padding: 12 },
  bubbleBot:      { backgroundColor: 'rgba(255,255,255,0.06)', borderBottomLeftRadius: 4 },
  bubbleUser:     { backgroundColor: P.tealDark, borderBottomRightRadius: 4 },
  bubbleText:     { fontSize: 14, color: P.white, lineHeight: 20 },
  bubbleTextUser: { color: P.white },
  bubbleTime:     { fontSize: 10, color: P.dimmed, marginTop: 5, textAlign: 'right' },

  urgentCallBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: P.pink, borderRadius: 10, padding: 10, marginTop: 10 },
  urgentCallText: { fontSize: 13, fontWeight: '700', color: P.white },

  typingBubble: { paddingVertical: 14, paddingHorizontal: 16 },
  typingDots:   { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot:          { width: 7, height: 7, borderRadius: 4, backgroundColor: P.muted },
  dot1:         {},
  dot2:         { opacity: 0.7 },
  dot3:         { opacity: 0.4 },

  suggestionsWrap: { borderTopWidth: 1, borderTopColor: P.glassBorder },
  suggestionsRow:  { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  suggestion:      { backgroundColor: 'rgba(45,212,191,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' },
  suggestionText:  { fontSize: 12, color: P.teal, fontWeight: '600' },

  inputRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: P.glassBorder },
  chatInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: P.white, borderWidth: 1, borderColor: P.glassBorder },
  sendBtn:      { flexShrink: 0 },
  sendBtnInner: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },

  disclaimerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 28, paddingHorizontal: 2 },
  disclaimerText:{ flex: 1, fontSize: 11, color: P.dimmed, lineHeight: 16 },

  // ── Crisis lines ──
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

  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(124,62,237,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#7C3AED30' },
  noteText: { flex: 1, fontSize: 13, color: P.muted, lineHeight: 20, fontStyle: 'italic' },
});

export default CallSupportScreen;