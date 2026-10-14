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

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(
    typeof params.email === "string" ? params.email : ""
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const getAccessToken = (data: any): string | null => {
    const token =
      data?.access ??
      data?.access_token ??
      data?.accessToken ??
      data?.tokens?.access ??
      data?.token?.access ??
      (typeof data?.token === "string" ? data.token : null);

    return typeof token === "string" && token.trim()
      ? token.trim()
      : null;
  };

  const handleVerify = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      showMessage("Email Required", "Please enter your email address.");
      return;
    }

    if (!cleanOtp) {
      showMessage("OTP Required", "Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          otp: cleanOtp,
        }),
      });

      const responseText = await response.text();
      let data: any = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error("Server returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          data?.error ||
          data?.otp?.[0] ||
          data?.email?.[0] ||
          "OTP verification failed. Please check the OTP and try again.";

        throw new Error(
          typeof message === "string"
            ? message
            : "OTP verification failed. Please try again."
        );
      }

      const accessToken = getAccessToken(data);

      // NEW USER: OTP verified, continue registration.
      if (data?.email_verified === true && !accessToken) {
        await AsyncStorage.setItem("verified_email", cleanEmail);
        await AsyncStorage.setItem("email_verified", "true");

        router.replace({
          pathname: "/complete-registration",
          params: { email: cleanEmail },
        });
        return;
      }

      // EXISTING USER: OTP verified, go to Home.
      if (accessToken) {
        const storageItems: [string, string][] = [
          ["access", accessToken],
          ["access_token", accessToken],
          ["token", accessToken],
          ["user_email", cleanEmail],
        ];

        const refreshToken =
          data?.refresh ??
          data?.refresh_token ??
          data?.refreshToken ??
          data?.tokens?.refresh;

        if (typeof refreshToken === "string" && refreshToken.trim()) {
          storageItems.push(["refresh", refreshToken.trim()]);
          storageItems.push(["refresh_token", refreshToken.trim()]);
        }

        await AsyncStorage.multiSet(storageItems);

        if (data?.user) {
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        }

        router.replace("/home");
        return;
      }

      throw new Error(
        data?.message || "Unexpected OTP response. Please try again."
      );
    } catch (error: any) {
      showMessage(
        "Verification Failed",
        error?.message ||
          "Unable to verify OTP. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      showMessage("Email Required", "Please enter your email address.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/send-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const responseText = await response.text();
      let data: any = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            data?.error ||
            "Could not resend OTP. Please try again."
        );
      }

      setOtp("");
      showMessage(
        "OTP Sent",
        data?.message || "Please check your email for the new OTP."
      );
    } catch (error: any) {
      showMessage(
        "Resend Failed",
        error?.message || "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080B18" />

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
              <Text style={styles.logoIcon}>✉</Text>
            </View>

            <Text style={styles.brand}>VETRIX</Text>
            <Text style={styles.heading}>Verify Your Email</Text>

            <Text style={styles.description}>
              Enter the verification code sent to your email address.
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#777F98"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Text style={styles.label}>VERIFICATION CODE</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={(value) => setOtp(value.replace(/\s/g, ""))}
                placeholder="Enter OTP"
                placeholderTextColor="#777F98"
                keyboardType="number-pad"
                maxLength={8}
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  loading && styles.disabledButton,
                ]}
                onPress={handleVerify}
                disabled={loading || resending}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>
                    Verify & Continue →
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOtp}
                disabled={loading || resending}
                activeOpacity={0.7}
              >
                {resending ? (
                  <ActivityIndicator color="#8B7CFF" />
                ) : (
                  <Text style={styles.resendText}>
                    Didn't receive the code?{" "}
                    <Text style={styles.resendHighlight}>Resend OTP</Text>
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>
              VETRIX by Vetri Technology
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080B18",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 32,
  },
  container: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    paddingHorizontal: 25,
    alignItems: "center",
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#171B35",
    borderWidth: 1,
    borderColor: "#6659E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoIcon: {
    color: "#A99EFF",
    fontSize: 35,
  },
  brand: {
    color: "#A99EFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 5,
    marginBottom: 12,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    color: "#A4ABC1",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 320,
  },
  form: {
    width: "100%",
  },
  label: {
    color: "#B8BED2",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 9,
    marginTop: 15,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#292E49",
    backgroundColor: "#11152A",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },
  otpInput: {
    fontSize: 22,
    letterSpacing: 5,
    fontWeight: "700",
  },
  verifyButton: {
    height: 55,
    borderRadius: 14,
    backgroundColor: "#6757E8",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  disabledButton: {
    opacity: 0.65,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  resendButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  resendText: {
    color: "#A4ABC1",
    fontSize: 13,
    textAlign: "center",
  },
  resendHighlight: {
    color: "#A99EFF",
    fontWeight: "800",
  },
  footer: {
    color: "#68708A",
    fontSize: 12,
    marginTop: 38,
    textAlign: "center",
  },
});
