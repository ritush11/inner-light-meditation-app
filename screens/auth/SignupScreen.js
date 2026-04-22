import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';

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
  warning:     '#F59E0B',
};

const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',          test: (p) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter (A-Z)',      test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter (a-z)',      test: (p) => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number (0-9)',                test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getStrength = (p) => {
  const passed = PASSWORD_RULES.filter(r => r.test(p)).length;
  if (passed <= 1) return { label: 'Weak',        color: P.error,   width: '20%' };
  if (passed === 2) return { label: 'Fair',        color: P.warning, width: '40%' };
  if (passed === 3) return { label: 'Good',        color: P.warning, width: '60%' };
  if (passed === 4) return { label: 'Strong',      color: P.teal,    width: '80%' };
  return              { label: 'Very Strong', color: P.success, width: '100%' };
};

const SignupScreen = ({ navigation }) => {
  const [displayName, setDisplayName]         = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Per-field errors
  const [nameError, setNameError]       = useState('');
  const [emailError, setEmailError]     = useState('');
  const [passError, setPassError]       = useState('');
  const [confirmError, setConfirmError] = useState('');

  // Focus state per field
  const [nameFocused, setNameFocused]         = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passFocused, setPassFocused]         = useState(false);
  const [confirmFocused, setConfirmFocused]   = useState(false);

  const strength         = password.length > 0 ? getStrength(password) : null;
  const allRulesPassed   = PASSWORD_RULES.every(r => r.test(password));

  const showAlert = (title, msg, onOk) => {
    if (Platform.OS === 'web') { window.alert(`${title}\n\n${msg}`); onOk?.(); }
    else Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
  };

  const validate = () => {
    let valid = true;
    if (!displayName.trim())      { setNameError('Name is required'); valid = false; } else setNameError('');
    if (!email)                   { setEmailError('Email is required'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Invalid email address'); valid = false; }
    else setEmailError('');
    if (!password)                { setPassError('Password is required'); valid = false; }
    else if (!allRulesPassed)     { setPassError('Password does not meet all requirements'); valid = false; }
    else setPassError('');
    if (!confirmPassword)         { setConfirmError('Please confirm your password'); valid = false; }
    else if (password !== confirmPassword) { setConfirmError('Passwords do not match'); valid = false; }
    else setConfirmError('');
    return valid;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      await updateProfile(user, { displayName: displayName.trim() });
      await sendEmailVerification(user);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, email, displayName: displayName.trim(),
        photoURL: null, bio: '', createdAt: new Date(),
        totalMinutes: 0, streak: 0, longestStreak: 0,
        sessionsCompleted: 0, lastSessionDate: null,
        notificationsEnabled: true, reminderTime: '08:00', emailVerified: false,
      });
      showAlert(
        '📧 Verify Your Email',
        `A verification link has been sent to:\n${email}\n\nPlease verify before signing in.`,
        () => navigation.navigate('Login')
      );
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (err.code === 'auth/invalid-email')        msg = 'Please enter a valid email address.';
      if (err.code === 'auth/weak-password')        msg = 'Password is too weak.';
      showAlert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.tealDeep, P.navyMid, P.navy]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTeal} />
      <View style={styles.glowPurple} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        >
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={22} color={P.white} />
            </View>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={[P.teal, P.purpleSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoRing}>
              <Ionicons name="sparkles" size={24} color={P.white} />
            </LinearGradient>
            <Text style={styles.title}>Begin your journey</Text>
            <Text style={styles.subtitle}>Create your Inner Light account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>YOUR DETAILS</Text>

            {/* Display Name */}
            <View style={styles.fieldWrap}>
              <View style={[styles.field, nameFocused && styles.fieldFocus, nameError && styles.fieldError]}>
                <Ionicons name="person-outline" size={18} color={nameFocused ? P.teal : P.muted} style={styles.icon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Full name"
                  placeholderTextColor={P.dimmed}
                  value={displayName}
                  onChangeText={(t) => { setDisplayName(t); setNameError(''); }}
                  autoCapitalize="words"
                  autoCorrect={false}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  returnKeyType="next"
                />
              </View>
              {nameError ? <Text style={styles.errText}>{nameError}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <View style={[styles.field, emailFocused && styles.fieldFocus, emailError && styles.fieldError]}>
                <Ionicons name="mail-outline" size={18} color={emailFocused ? P.teal : P.muted} style={styles.icon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Email address"
                  placeholderTextColor={P.dimmed}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  returnKeyType="next"
                />
              </View>
              {emailError ? <Text style={styles.errText}>{emailError}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <View style={[styles.field, passFocused && styles.fieldFocus, passError && styles.fieldError]}>
                <Ionicons name="lock-closed-outline" size={18} color={passFocused ? P.teal : P.muted} style={styles.icon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Create password"
                  placeholderTextColor={P.dimmed}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPassError(''); }}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  returnKeyType="next"
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={P.muted} />
                </TouchableOpacity>
              </View>
              {passError ? <Text style={styles.errText}>{passError}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrap}>
              <View style={[styles.field, confirmFocused && styles.fieldFocus, confirmError && styles.fieldError]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={confirmFocused ? P.teal : P.muted} style={styles.icon} />
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Confirm password"
                  placeholderTextColor={P.dimmed}
                  value={confirmPassword}
                  onChangeText={(t) => { setConfirmPassword(t); setConfirmError(''); }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={P.muted} />
                </TouchableOpacity>
              </View>
              {confirmError ? <Text style={styles.errText}>{confirmError}</Text> : null}
            </View>

            {/* Password strength */}
            {password.length > 0 && strength && (
              <View style={styles.strengthBox}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabel}>Password Strength</Text>
                  <Text style={[styles.strengthVal, { color: strength.color }]}>{strength.label}</Text>
                </View>
                <View style={styles.strengthTrack}>
                  <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                </View>
                <View style={styles.rules}>
                  {PASSWORD_RULES.map(rule => {
                    const passed = rule.test(password);
                    return (
                      <View key={rule.id} style={styles.ruleRow}>
                        <Ionicons name={passed ? 'checkmark-circle' : 'ellipse-outline'} size={13} color={passed ? P.success : P.dimmed} />
                        <Text style={[styles.ruleText, passed && { color: P.success }]}>{rule.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Verify note */}
            <View style={styles.verifyNote}>
              <Ionicons name="mail-outline" size={14} color={P.teal} />
              <Text style={styles.verifyNoteText}>A verification email will be sent after signup.</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.88} style={styles.btnWrap}>
              <LinearGradient colors={[P.teal, P.tealDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                {loading ? <ActivityIndicator color={P.white} /> : (
                  <View style={styles.btnInner}>
                    <Text style={styles.btnText}>Create Account</Text>
                    <Ionicons name="arrow-forward" size={18} color={P.white} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.featRow}>
            {[
              { icon: '🧘', label: 'Guided meditations' },
              { icon: '🌙', label: 'Sleep stories' },
              { icon: '📈', label: 'Progress tracking' },
            ].map((f, i) => (
              <View key={i} style={styles.featItem}>
                <Text style={styles.featEmoji}>{f.icon}</Text>
                <Text style={styles.featLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?  </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },

  glowTeal:   { position: 'absolute', top: -60, left: -60, width: 240, height: 240, borderRadius: 120, backgroundColor: P.teal,   opacity: 0.07 },
  glowPurple: { position: 'absolute', bottom: 80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: P.purple, opacity: 0.07 },

  backBtn:    { marginBottom: 24 },
  backCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: P.glass, borderWidth: 1, borderColor: P.glassBorder, justifyContent: 'center', alignItems: 'center' },

  header:    { alignItems: 'center', marginBottom: 28 },
  logoRing:  { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  title:     { fontSize: 24, fontWeight: '800', color: P.white, letterSpacing: -0.5, marginBottom: 4 },
  subtitle:  { fontSize: 14, color: P.muted },

  card:      { backgroundColor: P.navyLight, borderRadius: 24, padding: 22, marginBottom: 24, borderWidth: 1, borderColor: P.glassBorder },
  cardLabel: { fontSize: 11, fontWeight: '700', color: P.muted, letterSpacing: 1.5, marginBottom: 18 },

  fieldWrap:  { marginBottom: 12 },
  field:      { flexDirection: 'row', alignItems: 'center', backgroundColor: P.glass, borderRadius: 14, borderWidth: 1, borderColor: P.glassBorder, paddingHorizontal: 16, height: 52 },
  fieldFocus: { borderColor: P.teal, backgroundColor: 'rgba(45,212,191,0.06)' },
  fieldError: { borderColor: P.error },
  icon:       { marginRight: 12 },
  fieldInput: { flex: 1, fontSize: 15, color: P.white },
  errText:    { fontSize: 12, color: P.error, marginTop: 3, marginLeft: 4 },

  strengthBox:    { backgroundColor: 'rgba(45,212,191,0.06)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(45,212,191,0.15)', marginTop: 2 },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  strengthLabel:  { fontSize: 12, color: P.muted, fontWeight: '600' },
  strengthVal:    { fontSize: 12, fontWeight: '700' },
  strengthTrack:  { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  strengthFill:   { height: '100%', borderRadius: 4 },
  rules:          { gap: 5 },
  ruleRow:        { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ruleText:       { fontSize: 12, color: P.dimmed },

  verifyNote:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 10, padding: 10, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' },
  verifyNoteText: { fontSize: 12, color: P.teal, flex: 1 },

  btnWrap:  { borderRadius: 16, overflow: 'hidden' },
  btn:      { height: 52, alignItems: 'center', justifyContent: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:  { fontSize: 16, fontWeight: '700', color: P.white },

  featRow:   { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: P.glass, borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: P.glassBorder },
  featItem:  { alignItems: 'center', gap: 6 },
  featEmoji: { fontSize: 22 },
  featLabel: { fontSize: 11, color: P.muted, fontWeight: '600', textAlign: 'center' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: P.muted },
  footerLink: { fontSize: 14, fontWeight: '700', color: P.teal },
});

export default SignupScreen;