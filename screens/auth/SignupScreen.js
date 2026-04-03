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

// ── Password strength rules ───────────────────────────────────
const PASSWORD_RULES = [
  { id: 'length',   label: 'At least 8 characters',           test: (p) => p.length >= 8 },
  { id: 'upper',    label: 'One uppercase letter (A-Z)',       test: (p) => /[A-Z]/.test(p) },
  { id: 'lower',    label: 'One lowercase letter (a-z)',       test: (p) => /[a-z]/.test(p) },
  { id: 'number',   label: 'One number (0-9)',                 test: (p) => /[0-9]/.test(p) },
  { id: 'special',  label: 'One special character (!@#$...)',  test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getStrength = (password) => {
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  if (passed <= 1) return { label: 'Weak',   color: P.error,   width: '20%' };
  if (passed === 2) return { label: 'Fair',   color: P.warning, width: '40%' };
  if (passed === 3) return { label: 'Good',   color: P.warning, width: '60%' };
  if (passed === 4) return { label: 'Strong', color: P.teal,    width: '80%' };
  return { label: 'Very Strong', color: P.success, width: '100%' };
};

const SignupScreen = ({ navigation }) => {
  const [displayName, setDisplayName]         = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]                 = useState(false);
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [focused, setFocused]                 = useState(null);
  const [errors, setErrors]                   = useState({});
  const [showRules, setShowRules]             = useState(false);

  const strength = password.length > 0 ? getStrength(password) : null;
  const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));

  const validate = () => {
    const e = {};
    if (!displayName.trim())     e.displayName = 'Name is required';
    if (!email)                  e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address';
    if (!password)               e.password = 'Password is required';
    else if (!allRulesPassed)    e.password = 'Password does not meet requirements';
    if (!confirmPassword)        e.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showAlert = (title, msg, onOk) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${msg}`);
      onOk?.();
    } else {
      Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
    }
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
        uid:               user.uid,
        email,
        displayName:       displayName.trim(),
        photoURL:          null,
        bio:               '',
        createdAt:         new Date(),
        totalMinutes:      0,
        streak:            0,
        longestStreak:     0,
        sessionsCompleted: 0,
        lastSessionDate:   null,
        notificationsEnabled: true,
        reminderTime:      '08:00',
        emailVerified:     false,
      });

      showAlert(
        '📧 Verify Your Email',
        `A verification link has been sent to:\n${email}\n\nPlease check your inbox and verify your email before signing in.`,
        () => navigation.navigate('Login')
      );
    } catch (err) {
      console.error('Signup error:', err.code, err.message);
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (err.code === 'auth/invalid-email')        msg = 'Please enter a valid email address.';
      if (err.code === 'auth/weak-password')        msg = 'Password is too weak.';
      showAlert('Sign Up Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const valueMap  = { displayName, email, password, confirmPassword };
  const setterMap = { displayName: setDisplayName, email: setEmail, password: setPassword, confirmPassword: setConfirmPassword };

  const Field = ({ fieldKey, icon, placeholder, secure, keyboard, isConfirm }) => {
    const isFocused = focused === fieldKey;
    const hasError  = !!errors[fieldKey];
    const isVisible = isConfirm ? showConfirm : showPass;
    return (
      <View style={styles.fieldWrap}>
        <View style={[styles.field, isFocused && styles.fieldFocus, hasError && styles.fieldError]}>
          <Ionicons name={icon} size={18} color={isFocused ? P.teal : P.muted} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.fieldInput}
            placeholder={placeholder}
            placeholderTextColor={P.dimmed}
            value={valueMap[fieldKey]}
            onChangeText={t => {
              setterMap[fieldKey](t);
              if (errors[fieldKey]) setErrors(prev => ({ ...prev, [fieldKey]: '' }));
              if (fieldKey === 'password') setShowRules(true);
            }}
            secureTextEntry={!!secure && !isVisible}
            keyboardType={keyboard || 'default'}
            autoCapitalize={fieldKey === 'displayName' ? 'words' : 'none'}
            onFocus={() => setFocused(fieldKey)}
            onBlur={() => setFocused(null)}
          />
          {secure && (
            <TouchableOpacity onPress={() => isConfirm ? setShowConfirm(v => !v) : setShowPass(v => !v)}>
              <Ionicons name={isVisible ? 'eye-off-outline' : 'eye-outline'} size={18} color={P.muted} />
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.errText}>{errors[fieldKey]}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={[P.tealDeep, P.navyMid, P.navy]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowTeal} />
      <View style={styles.glowPurple} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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

          {/* Card */}
          <View style={styles.card}>
            <LinearGradient colors={[P.teal, P.purple, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardBorder} />
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>YOUR DETAILS</Text>

              <View style={styles.fields}>
                <Field fieldKey="displayName"    icon="person-outline"           placeholder="Full name" />
                <Field fieldKey="email"          icon="mail-outline"             placeholder="Email address" keyboard="email-address" />
                <Field fieldKey="password"       icon="lock-closed-outline"      placeholder="Create password" secure />
                <Field fieldKey="confirmPassword" icon="shield-checkmark-outline" placeholder="Confirm password" secure isConfirm />
              </View>

              {/* Password strength */}
              {password.length > 0 && strength && (
                <View style={styles.strengthBox}>
                  <View style={styles.strengthHeader}>
                    <Text style={styles.strengthLabel}>Password Strength</Text>
                    <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
                  </View>
                  <View style={styles.strengthTrack}>
                    <View style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]} />
                  </View>

                  {/* Rules checklist */}
                  <View style={styles.rulesList}>
                    {PASSWORD_RULES.map(rule => {
                      const passed = rule.test(password);
                      return (
                        <View key={rule.id} style={styles.ruleRow}>
                          <Ionicons
                            name={passed ? 'checkmark-circle' : 'ellipse-outline'}
                            size={14}
                            color={passed ? P.success : P.dimmed}
                          />
                          <Text style={[styles.ruleText, passed && { color: P.success }]}>
                            {rule.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Email verification note */}
              <View style={styles.verifyNote}>
                <Ionicons name="mail-outline" size={14} color={P.teal} />
                <Text style={styles.verifyNoteText}>
                  A verification email will be sent to your inbox after signup.
                </Text>
              </View>

              {/* Terms */}
              <Text style={styles.terms}>
                By signing up you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>

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
  logoRing:  { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 14, shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  title:     { fontSize: 24, fontWeight: '800', color: P.white, letterSpacing: -0.5, marginBottom: 4 },
  subtitle:  { fontSize: 14, color: P.muted },

  card:      { borderRadius: 24, marginBottom: 24, padding: 1.5, shadowColor: P.teal, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 8 },
  cardBorder:{ ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  cardInner: { backgroundColor: P.navyLight, borderRadius: 23, padding: 24 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: P.muted, letterSpacing: 1.5, marginBottom: 18 },

  fields:    { gap: 12, marginBottom: 16 },
  fieldWrap: { gap: 4 },
  field:     { flexDirection: 'row', alignItems: 'center', backgroundColor: P.glass, borderRadius: 14, borderWidth: 1, borderColor: P.glassBorder, paddingHorizontal: 16, height: 52 },
  fieldFocus:{ borderColor: P.teal, backgroundColor: 'rgba(45,212,191,0.06)' },
  fieldError:{ borderColor: P.error },
  fieldInput:{ flex: 1, fontSize: 15, color: P.white },
  errText:   { fontSize: 12, color: P.error, marginLeft: 4 },

  // Strength
  strengthBox:    { backgroundColor: 'rgba(45,212,191,0.06)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(45,212,191,0.15)' },
  strengthHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  strengthLabel:  { fontSize: 12, color: P.muted, fontWeight: '600' },
  strengthValue:  { fontSize: 12, fontWeight: '700' },
  strengthTrack:  { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  strengthFill:   { height: '100%', borderRadius: 4 },
  rulesList:      { gap: 6 },
  ruleRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ruleText:       { fontSize: 12, color: P.dimmed },

  verifyNote:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(45,212,191,0.08)', borderRadius: 10, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(45,212,191,0.2)' },
  verifyNoteText: { fontSize: 12, color: P.teal, flex: 1, lineHeight: 17 },

  terms:     { fontSize: 12, color: P.muted, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  termsLink: { color: P.teal, fontWeight: '600' },

  btnWrap:  { borderRadius: 16, overflow: 'hidden', shadowColor: P.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  btn:      { height: 54, alignItems: 'center', justifyContent: 'center' },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:  { fontSize: 16, fontWeight: '700', color: P.white, letterSpacing: 0.3 },

  featRow:   { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: P.glass, borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1, borderColor: P.glassBorder },
  featItem:  { alignItems: 'center', gap: 6 },
  featEmoji: { fontSize: 22 },
  featLabel: { fontSize: 11, color: P.muted, fontWeight: '600', textAlign: 'center' },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: P.muted },
  footerLink: { fontSize: 14, fontWeight: '700', color: P.teal },
});

export default SignupScreen;