import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { auth } from "../firebase/firebaseConfig";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // Auto detect logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribe;
  }, []);

  // Signup
  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account created");
    } catch (error) {
      console.log("Signup error:", error.message);
    }
  };

  // Login
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in");
    } catch (error) {
      console.log("Login error:", error.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    console.log("Logged out");
  };

  return (
    <View style={{ marginTop: 80, padding: 20 }}>
      {user ? (
        <>
          <Text style={{ fontSize: 20, marginBottom: 20 }}>
            Welcome {user.email}
          </Text>

          <Button title="Logout" onPress={handleLogout} />
        </>
      ) : (
        <>
          <Text style={{ fontSize: 22, marginBottom: 20 }}>
            Inner Light Authentication
          </Text>

          <TextInput
            placeholder="Enter Email"
            value={email}
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 15,
              borderRadius: 5,
            }}
          />

          <TextInput
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              borderWidth: 1,
              padding: 10,
              marginBottom: 20,
              borderRadius: 5,
            }}
          />

          <Button title="Create Account" onPress={handleSignup} />
          <View style={{ marginTop: 10 }}>
            <Button title="Login" onPress={handleLogin} />
          </View>
        </>
      )}
    </View>
  );
}
