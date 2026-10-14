import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

// Django backend URL
// Browser: 127.0.0.1
// Android emulator: change to http://10.0.2.2:8000
const API_URL = "http://10.53.11.125:8000";
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (loading) return;

    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/send-otp/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(
          "Send OTP API error:",
          response.status,
          data
        );

        setError(
          data.error ||
            data.message ||
            data.detail ||
            "Unable to send OTP. Please try again."
        );

        return;
      }

      // Navigate to OTP verification after OTP is sent successfully.
      router.push({
        pathname: "/verify-email",
        params: {
          email: trimmedEmail,
        },
      });
    } catch (err) {
      console.error("Send OTP error:", err);

      setError(
        "Cannot connect to server. Check your backend URL and connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.logo}>VETRIX</Text>

          <Text style={styles.brandSubtitle}>
            BY VETRI TECHNOLOGY
          </Text>

          <Text style={styles.title}>
            Welcome to VETRIX
          </Text>

          <Text style={styles.subtitle}>
            Your learning journey starts here.
            {"\n"}
            Enter your email to receive a verification code.
          </Text>

          <Text style={styles.label}>Email address</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#737D95"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading}
            returnKeyType="go"
            onSubmitEditing={handleContinue}
            accessibilityLabel="Email address"
          />

          {error ? (
            <Text
              accessibilityRole="alert"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Secure email verification · Learn without limits
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  content: {
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  logo: {
    fontSize: 38,
    fontWeight: "800",
    color: "#37D9FF",
    letterSpacing: 6,
    textAlign: "center",
  },

  brandSubtitle: {
    color: "#8B5CF6",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 48,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#AAB2C5",
    textAlign: "center",
    marginBottom: 36,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E2E8F0",
    marginBottom: 10,
  },

  input: {
    height: 58,
    borderWidth: 1,
    borderColor: "#29334D",
    borderRadius: 16,
    backgroundColor: "#0D1324",
    color: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 16,
  },

  error: {
    color: "#FF6B6B",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },

  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: "#126EED",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    color: "#737D95",
    fontSize: 12,
    textAlign: "center",
    marginTop: 28,
    lineHeight: 19,
  },
});