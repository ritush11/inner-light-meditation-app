import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../firebase/firebaseConfig';

const P = {
  teal:        '#2DD4BF',
  tealDark:    '#0F766E',
  tealDeep:    '#134E4A',
  navy:        '#0A1628',
  navyMid:     '#112240',
  navyLight:   '#1E3A5F',
  navyCard:    '#162035',
  purple:      '#7C3AED',
  purpleSoft:  '#A78BFA',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  dimmed:      '#475569',
  glass:       'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  error:       '#F87171',
  success:     '#34D399',
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState(null);

  // Forgot password modal
  const [resetModal, setResetModal]   = useState(false);
  const [resetEmail, setResetEmail]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]     = useState(false);

  const validate = () => {
    const e = {};
    if (!email)    e.email    = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
    else Alert.alert(title, msg);
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      // Check email verification
      if (!user.emailVerified) {
        await auth.signOut();
        if (Platform.OS === 'web') {
          window.alert('📧 Email Not Verified\n\nPlease verify your email before signing in.\nCheck your inbox for the verification link.');
        } else {
          Alert.alert(
            '📧 Email Not Verified',
            'Please verify your email before signing in.\n\nCheck your inbox for the verification link.',
            [
              { text: 'Resend Email', onPress: () => resendVerification(user) },
              { text: 'OK', style: 'cancel' },
            ]
          );
        }
        return;
      }
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      let msg = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found')     msg = 'No account found with this email.';
      if (err.code === 'auth/wrong-password')     msg = 'Incorrect password. Please try again.';
      if (err.code === 'auth/too-many-requests')  msg = 'Too many attempts. Please try again later.';
      if (err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      showAlert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (user) => {
    try {
      await user.sendEmailVerification();
      Alert.alert('✅ Email Sent', 'Verification email has been resent. Please check your inbox.');
    } catch {
      Alert.alert('Error', 'Could not resend email. Please try again later.');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      let msg = 'Failed to send reset email.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email address.';
      if (Platform.OS === 'web') window.alert(`Error\n\n${msg}`);
      else Alert.alert('Error', msg);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetModal = () => {
    setResetModal(false);
    setResetEmail('');
    setResetSent(false);
    setResetLoading(false);
  };

  const Field = ({ fieldKey, icon, placeholder, secure, keyboard }) => {
    const isFocused = focused === fieldKey;
    const hasError  = !!errors[fieldKey];
    return (
      <View style={styles.fieldWrap}>
        <View style={[styles.field, isFocused && styles.fieldFocus, hasError && styles.fieldError]}>
          <Ionicons name={icon} size={18} color={isFocused ? P.teal : P.muted} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.fieldInput}
            placeholder={placeholder}
            placeholderTextColor={P.dimmed}
            value={fieldKey === 'email' ? email : password}
            onChangeText={fieldKey === 'email' ? setEmail : setPassword}
            secureTextEntry={secure && !showPass}
            keyboardType={keyboard || 'default'}
            autoCapitalize="none"
            onFocus={() => setFocused(fieldKey)}
            onBlur={() => setFocused(null)}
          />
          {secure && (
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={P.muted} />
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.errText}>{errors[fieldKey]}</Text>}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <LinearGradient colors={[P.navy, P.navyMid, P.tealDeep]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTeal} />
      <View style={styles.glowPurple} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Brand */}
        <View style={styles.brand}>
          <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoRing}>
            <Ionicons name="leaf" size={26} color={P.white} />
          </LinearGradient>
          <Text style={styles.brandName}>Inner Light</Text>
          <Text style={styles.brandTag}>Your mindfulness sanctuary</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <LinearGradient colors={[P.teal, P.purple, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to continue your journey</Text>

            <View style={styles.fields}>
              <Field fieldKey="email"    icon="mail-outline"        placeholder="Email address" keyboard="email-address" />
              <Field fieldKey="password" icon="lock-closed-outline" placeholder="Password"       secure />
            </View>

            {/* Forgot password */}
            <TouchableOpacity style={styles.forgotRow} onPress={() => { setResetEmail(email); setResetModal(true); }}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.88} style={styles.btnWrap}>
              <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                {loading ? <ActivityIndicator color={P.white} /> : <Text style={styles.btnText}>Sign In</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats teaser */}
        <View style={styles.statsRow}>
          {[
            { value: '50K+', label: 'Active users' },
            { value: '200+', label: 'Sessions' },
            { value: '4.9★', label: 'Rating' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Inner Light?  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Forgot Password Modal ── */}
      <Modal visible={resetModal} transparent animationType="slide" onRequestClose={closeResetModal}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <LinearGradient colors={[P.navyCard, P.navyMid]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.modalHandle} />

            {resetSent ? (
              /* Success state */
              <View style={styles.resetSuccess}>
                <LinearGradient colors={[P.teal, P.tealDark]} style={styles.successIconBox}>
                  <Ionicons name="checkmark" size={32} color={P.white} />
                </LinearGradient>
                <Text style={styles.successTitle}>Email Sent!</Text>
                <Text style={styles.successText}>
                  A password reset link has been sent to:{'\n'}
                  <Text style={{ color: P.teal, fontWeight: '700' }}>{resetEmail}</Text>
                </Text>
                <Text style={styles.successNote}>
                  Check your inbox (and spam folder) and click the link to reset your password.
                </Text>
                <TouchableOpacity onPress={closeResetModal} style={styles.doneWrap}>
                  <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.doneBtn}>
                    <Text style={styles.doneBtnText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              /* Input state */
              <View>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Reset Password</Text>
                  <TouchableOpacity onPress={closeResetModal}>
                    <Ionicons name="close" size={22} color={P.muted} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <View style={[styles.field, { marginBottom: 20 }]}>
                  <Ionicons name="mail-outline" size={18} color={P.muted} style={{ marginRight: 12 }} />
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Email address"
                    placeholderTextColor={P.dimmed}
                    value={resetEmail}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading} activeOpacity={0.88} style={styles.btnWrap}>
                  <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    {resetLoading ? <ActivityIndicator color={P.white} /> : <Text style={styles.btnText}>Send Reset Link</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, justifyContent: 'center' },

  glowTeal:   { position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: P.teal,   opacity: 0.08 },
  glowPurple: { position: 'absolute', bottom: 40, left: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: P.purple, opacity: 0.07 },

  brand:     { alignItems: 'center', marginBottom: 40 },
  logoRing:  { width: 68, height: 68, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  brandName: { fontSize: 28, fontWeight: '800', color: P.white, letterSpacing: -0.5, marginBottom: 4 },
  brandTag:  { fontSize: 13, color: P.muted },

  card:        { borderRadius: 24, marginBottom: 32, padding: 1.5, shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 8 },
  cardBorder:  { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  cardInner:   { backgroundColor: P.navyLight, borderRadius: 23, padding: 28 },
  cardTitle:   { fontSize: 22, fontWeight: '700', color: P.white, marginBottom: 4 },
  cardSub:     { fontSize: 14, color: P.muted, marginBottom: 28 },

  fields:    { gap: 14, marginBottom: 4 },
  fieldWrap: { gap: 4 },
  field:     { flexDirection: 'row', alignItems: 'center', backgroundColor: P.glass, borderRadius: 14, borderWidth: 1, borderColor: P.glassBorder, paddingHorizontal: 16, height: 54 },
  fieldFocus:{ borderColor: P.teal, backgroundColor: 'rgba(45,212,191,0.06)' },
  fieldError:{ borderColor: P.error },
  fieldInput:{ flex: 1, fontSize: 15, color: P.white },
  errText:   { fontSize: 12, color: P.error, marginLeft: 4 },

  forgotRow:  { alignItems: 'flex-end', marginTop: 10, marginBottom: 24 },
  forgotText: { fontSize: 13, color: P.teal, fontWeight: '600' },

  btnWrap: { borderRadius: 16, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  btn:     { height: 54, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', color: P.white, letterSpacing: 0.3 },

  statsRow:  { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: P.glassBorder },
  statItem:  { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: P.teal },
  statLabel: { fontSize: 11, color: P.muted },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: P.muted },
  footerLink: { fontSize: 14, fontWeight: '700', color: P.teal },

  // Modal
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modal:      { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 44, overflow: 'hidden', borderWidth: 1, borderColor: P.glassBorder },
  modalHandle:{ width: 40, height: 4, borderRadius: 2, backgroundColor: P.dimmed, alignSelf: 'center', marginBottom: 24 },
  modalHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: P.white },
  modalDesc:  { fontSize: 14, color: P.muted, lineHeight: 21, marginBottom: 24 },

  // Reset success
  resetSuccess:   { alignItems: 'center', paddingVertical: 12 },
  successIconBox: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  successTitle:   { fontSize: 22, fontWeight: '800', color: P.white, marginBottom: 12 },
  successText:    { fontSize: 14, color: P.muted, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  successNote:    { fontSize: 12, color: P.dimmed, textAlign: 'center', lineHeight: 18, marginBottom: 28 },
  doneWrap:       { width: '100%', borderRadius: 16, overflow: 'hidden' },
  doneBtn:        { height: 52, alignItems: 'center', justifyContent: 'center' },
  doneBtnText:    { fontSize: 16, fontWeight: '700', color: P.white },
});

export default LoginScreen;