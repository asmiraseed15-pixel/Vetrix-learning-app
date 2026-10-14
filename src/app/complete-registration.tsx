import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://127.0.0.1:8000";

export default function CompleteRegistrationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(
    typeof params.email === "string" ? params.email : ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      showMessage("Name Required", "Please enter your full name.");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showMessage("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      showMessage(
        "Weak Password",
        "Your password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        "Password Mismatch",
        "Password and confirm password must match."
      );
      return;
    }

    setLoading(true);

    try {
      // Verify that the email was verified in this app flow.
      const verifiedEmail = (
        await AsyncStorage.getItem("verified_email")
      )?.trim().toLowerCase();

      const emailVerified =
        (await AsyncStorage.getItem("email_verified")) === "true";

      if (!emailVerified || verifiedEmail !== cleanEmail) {
        throw new Error(
          "Please verify your email with OTP before registering."
        );
      }

      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
        }),
      });

      const responseText = await response.text();
      let data: any = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error("Invalid server response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            data?.error ||
            "Registration failed. Please try again."
        );
      }

      // The current backend registration endpoint returns user details,
      // but does not issue JWT tokens. Sign in using the registered account.
      const loginResponse = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const loginText = await loginResponse.text();
      let loginData: any = {};

      try {
        loginData = loginText ? JSON.parse(loginText) : {};
      } catch {
        throw new Error(
          "Account created, but the login response was invalid. Please sign in."
        );
      }

      if (!loginResponse.ok) {
        // Account creation succeeded; don't tell the user registration failed.
        await AsyncStorage.multiRemove([
          "verified_email",
          "email_verified",
        ]);

        showMessage(
          "Registration Successful",
          "Your account was created. Please log in using your email and password."
        );

        router.replace("/login");
        return;
      }

      const accessToken =
        loginData?.access ??
        loginData?.access_token ??
        loginData?.tokens?.access;

      const refreshToken =
        loginData?.refresh ??
        loginData?.refresh_token ??
        loginData?.tokens?.refresh;

      if (typeof accessToken !== "string" || !accessToken.trim()) {
        await AsyncStorage.multiRemove([
          "verified_email",
          "email_verified",
        ]);

        showMessage(
          "Registration Successful",
          "Your account was created. Please log in to continue."
        );

        router.replace("/login");
        return;
      }

      const storageItems: [string, string][] = [
        ["access", accessToken],
        ["access_token", accessToken],
        ["token", accessToken],
        ["user_email", cleanEmail],
        ["user", JSON.stringify(loginData?.user ?? data?.user ?? {})],
      ];

      if (typeof refreshToken === "string" && refreshToken.trim()) {
        storageItems.push(["refresh", refreshToken]);
        storageItems.push(["refresh_token", refreshToken]);
      }

      await AsyncStorage.multiSet(storageItems);

      await AsyncStorage.multiRemove([
        "verified_email",
        "email_verified",
      ]);

      showMessage(
        "Welcome to VETRIX!",
        "Your account has been created successfully."
      );

      router.replace("/home");
    } catch (error: any) {
      showMessage(
        "Registration Failed",
        error?.message ||
          "Unable to register. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080616" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>✦</Text>
            </View>

            <Text style={styles.brand}>VETRIX</Text>
            <Text style={styles.heading}>Create Your Account</Text>

            <Text style={styles.description}>
              Your email is verified. Complete your details to start learning
              with VETRIX.
            </Text>

            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>
                ✓ Email verification complete
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#77718F"
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
                maxLength={100}
              />

              <Text style={styles.label}>VERIFIED EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter verified email"
                placeholderTextColor="#77718F"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Text style={styles.label}>PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#77718F"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((value) => !value)}
                  disabled={loading}
                >
                  <Text style={styles.showText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>CONFIRM PASSWORD</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#77718F"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  disabled={loading}
                >
                  <Text style={styles.showText}>
                    {showConfirmPassword ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>
                    Create Account →
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.replace("/login")}
                disabled={loading}
              >
                <Text style={styles.loginText}>
                  Already have an account?{" "}
                  <Text style={styles.loginHighlight}>Log in</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>VETRIX by Vetri Technology</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080616",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },
  container: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 25,
    alignItems: "center",
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: "#19142F",
    borderWidth: 1,
    borderColor: "#7965F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logoIcon: {
    color: "#B6A8FF",
    fontSize: 34,
  },
  brand: {
    color: "#B6A8FF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 5,
    marginBottom: 12,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#B1AAC8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 330,
  },
  verifiedBadge: {
    backgroundColor: "#172A27",
    borderWidth: 1,
    borderColor: "#286A53",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 15,
  },
  verifiedText: {
    color: "#82E4B6",
    fontSize: 12,
    fontWeight: "700",
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#C8C0E2",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#332A50",
    backgroundColor: "#151127",
    paddingHorizontal: 15,
    color: "#FFFFFF",
    fontSize: 14,
  },
  passwordContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#332A50",
    backgroundColor: "#151127",
    paddingLeft: 15,
    paddingRight: 13,
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    color: "#FFFFFF",
    fontSize: 14,
    paddingVertical: 10,
  },
  showText: {
    color: "#B6A8FF",
    fontSize: 12,
    fontWeight: "800",
    paddingLeft: 10,
    paddingVertical: 10,
  },
  registerButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#7257E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.65,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  loginButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginText: {
    color: "#B1AAC8",
    fontSize: 13,
    textAlign: "center",
  },
  loginHighlight: {
    color: "#B6A8FF",
    fontWeight: "800",
  },
  footer: {
    color: "#77708F",
    fontSize: 12,
    marginTop: 28,
    textAlign: "center",
  },
});
