import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert("Missing details", "Email and password enter pannunga.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.detail ||
          data.message ||
          data.error ||
          "Login failed. Email and password check pannunga.";

        Alert.alert("Login failed", String(message));
        return;
      }

      const accessToken =
        data.access || data.access_token || data.tokens?.access;
      const refreshToken =
        data.refresh || data.refresh_token || data.tokens?.refresh;

      if (!accessToken) {
        console.log("Login response:", data);
        Alert.alert(
          "Login response issue",
          "Backend login response-la access token kidaikkala. Backend response check pannanum."
        );
        return;
      }

      await AsyncStorage.setItem("access_token", accessToken);

      if (refreshToken) {
        await AsyncStorage.setItem("refresh_token", refreshToken);
      }

      const userData = data.user || data.data?.user;

      if (userData) {
        await AsyncStorage.setItem("user", JSON.stringify(userData));
      }

      router.replace("/home");
    } catch (error) {
      console.error("Login error:", error);

      Alert.alert(
        "Connection error",
        "Backend server running-ah irukka check pannunga."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>V</Text>
          </View>

          <Text style={styles.brand}>VETRIX</Text>
          <Text style={styles.subtitle}>Your learning journey starts here.</Text>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back!</Text>
            <Text style={styles.description}>
              Login to continue learning.
            </Text>

            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#85859A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#85859A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Text style={styles.showText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>New to VETRIX? </Text>
              <TouchableOpacity
                onPress={() => router.replace("/verify-email")}
                disabled={loading}
              >
                <Text style={styles.registerLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>VETRIX by Vetri Technology</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090817",
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "#AAA8C3",
    marginTop: 8,
    marginBottom: 32,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#151329",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#30294B",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  description: {
    fontSize: 14,
    color: "#AAA8C3",
    marginTop: 8,
    marginBottom: 26,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EAE8F8",
    marginBottom: 9,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#39334F",
    backgroundColor: "#0E0C1D",
    borderRadius: 12,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },
  passwordContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#39334F",
    backgroundColor: "#0E0C1D",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    color: "#FFFFFF",
    fontSize: 15,
  },
  showText: {
    color: "#B69CFF",
    fontWeight: "700",
    paddingLeft: 10,
  },
  loginButton: {
    height: 54,
    backgroundColor: "#7C3AED",
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 24,
  },
  registerText: {
    color: "#AAA8C3",
    fontSize: 14,
  },
  registerLink: {
    color: "#B69CFF",
    fontWeight: "700",
    fontSize: 14,
  },
  footer: {
    color: "#77748F",
    fontSize: 12,
    marginTop: 28,
  },
});