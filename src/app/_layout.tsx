
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "@expo-google-fonts/inter";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";

import {
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";

import {
  ThemeProvider,
  useTheme,
} from "../context/ThemeContext";

function AppNavigation() {
  const { mode, backgroundColor } = useTheme();

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "none",
          contentStyle: {
            backgroundColor: backgroundColor || "#050816",
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#050816",
    alignItems: "center",
    justifyContent: "center",
  },
});
