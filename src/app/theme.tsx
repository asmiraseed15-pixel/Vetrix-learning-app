import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

import {
  useTheme,
  THEME_COLORS,
  WALLPAPER_COLORS,
  type WallpaperName,
  type ThemeMode,
} from "../context/ThemeContext";

const WALLPAPERS: {
  id: WallpaperName;
  name: string;
  description: string;
}[] = [
  { id: "midnight", name: "Midnight", description: "Deep space" },
  { id: "ocean", name: "Ocean", description: "Deep blue" },
  { id: "aurora", name: "Aurora", description: "Mystic purple" },
  { id: "sunset", name: "Sunset", description: "Warm evening" },
  { id: "forest", name: "Forest", description: "Nature green" },
  { id: "lavender", name: "Lavender", description: "Soft violet" },
];

export default function ThemeScreen() {
  const {
    mode,
    wallpaper,
    accentColor,
    backgroundColor,
    cardColor,
    textColor,
    mutedColor,
    borderColor,
    setMode,
    setWallpaper,
    setAccentColor,
  } = useTheme();

  const isDark = mode === "dark";

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor,
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 18,
        },
        backButton: {
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: cardColor,
          borderWidth: 1,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
        },
        backText: {
          color: textColor,
          fontSize: 28,
          lineHeight: 32,
        },
        headerTitle: {
          color: textColor,
          fontSize: 22,
          fontWeight: "800",
        },
        subtitle: {
          color: mutedColor,
          fontSize: 12,
          marginTop: 4,
        },
        section: {
          marginHorizontal: 16,
          marginBottom: 22,
        },
        sectionTitle: {
          color: textColor,
          fontSize: 18,
          fontWeight: "800",
          marginBottom: 6,
        },
        sectionSubtitle: {
          color: mutedColor,
          fontSize: 12,
          lineHeight: 19,
          marginBottom: 13,
        },
        card: {
          backgroundColor: cardColor,
          borderRadius: 19,
          padding: 15,
          borderWidth: 1,
          borderColor,
        },
        modeRow: {
          flexDirection: "row",
          gap: 12,
        },
        modeOption: {
          flex: 1,
          borderRadius: 15,
          paddingVertical: 16,
          paddingHorizontal: 6,
          alignItems: "center",
          borderWidth: 1.5,
        },
        modeIcon: {
          fontSize: 27,
          marginBottom: 8,
        },
        modeName: {
          fontSize: 13,
          fontWeight: "800",
          textAlign: "center",
        },
        modeDescription: {
          fontSize: 10,
          marginTop: 5,
          textAlign: "center",
        },
        selectedLabel: {
          fontSize: 9,
          fontWeight: "900",
          marginTop: 8,
        },
        wallpaperGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 10,
        },
        wallpaperItem: {
          width: "48%",
          borderRadius: 16,
          padding: 9,
          borderWidth: 1.5,
        },
        wallpaperPreview: {
          height: 78,
          borderRadius: 11,
          padding: 10,
          justifyContent: "flex-end",
          overflow: "hidden",
        },
        wallpaperLine: {
          height: 5,
          borderRadius: 5,
          width: "65%",
          marginBottom: 5,
          backgroundColor: "#FFFFFF",
        },
        wallpaperLineShort: {
          height: 4,
          borderRadius: 5,
          width: "40%",
          backgroundColor: "#FFFFFF",
          opacity: 0.6,
        },
        wallpaperName: {
          fontSize: 13,
          fontWeight: "800",
          marginTop: 10,
        },
        wallpaperDescription: {
          fontSize: 10,
          marginTop: 4,
        },
        colorGrid: {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 14,
        },
        colorItem: {
          width: 43,
          height: 43,
          borderRadius: 22,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 3,
        },
        colorCheck: {
          color: "#FFFFFF",
          fontSize: 19,
          fontWeight: "900",
        },
        previewCard: {
          backgroundColor: cardColor,
          borderWidth: 1,
          borderColor,
          borderRadius: 19,
          padding: 16,
        },
        previewTopRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 17,
        },
        previewTitle: {
          color: textColor,
          fontSize: 16,
          fontWeight: "800",
        },
        previewBadge: {
          paddingHorizontal: 9,
          paddingVertical: 6,
          borderRadius: 20,
        },
        previewBadgeText: {
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: "800",
        },
        progressTrack: {
          height: 8,
          borderRadius: 10,
          backgroundColor: borderColor,
          overflow: "hidden",
          marginTop: 12,
        },
        progressFill: {
          height: "100%",
          width: "72%",
          borderRadius: 10,
          backgroundColor: accentColor,
        },
        previewButton: {
          marginTop: 17,
          backgroundColor: accentColor,
          paddingVertical: 13,
          borderRadius: 12,
          alignItems: "center",
        },
        previewButtonText: {
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: "800",
        },
        previewNote: {
          color: mutedColor,
          fontSize: 11,
          marginTop: 12,
          lineHeight: 18,
        },
        footer: {
          paddingHorizontal: 16,
          paddingTop: 2,
          paddingBottom: 28,
        },
        footerButton: {
          backgroundColor: accentColor,
          paddingVertical: 15,
          borderRadius: 14,
          alignItems: "center",
        },
        footerButtonText: {
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: "800",
        },
      }),
    [
      backgroundColor,
      cardColor,
      textColor,
      mutedColor,
      borderColor,
      accentColor,
    ]
  );

  const goBackHome = () => {
    router.replace("/home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              goBackHome();
            }
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text style={styles.headerTitle}>Theme Studio 🎨</Text>
          <Text style={styles.subtitle}>Make VETRIX yours</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 5, paddingBottom: 12 }}
      >
        {/* APPEARANCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.sectionSubtitle}>
            Choose the appearance that feels comfortable for you.
          </Text>

          <View style={styles.card}>
            <View style={styles.modeRow}>
              {(
                [
                  {
                    id: "dark",
                    icon: "🌙",
                    name: "Dark Mode",
                    description: "Easy on the eyes",
                  },
                  {
                    id: "light",
                    icon: "☀️",
                    name: "Light Mode",
                    description: "Bright and clean",
                  },
                ] as const
              ).map((item) => {
                const selected = mode === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => setMode(item.id as ThemeMode)}
                    style={[
                      styles.modeOption,
                      {
                        backgroundColor: selected
                          ? `${accentColor}18`
                          : cardColor,
                        borderColor: selected
                          ? accentColor
                          : borderColor,
                      },
                    ]}
                  >
                    <Text style={styles.modeIcon}>{item.icon}</Text>
                    <Text style={[styles.modeName, { color: textColor }]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.modeDescription,
                        { color: mutedColor },
                      ]}
                    >
                      {item.description}
                    </Text>

                    {selected && (
                      <Text
                        style={[
                          styles.selectedLabel,
                          { color: accentColor },
                        ]}
                      >
                        ✓ SELECTED
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* WALLPAPERS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallpapers</Text>
          <Text style={styles.sectionSubtitle}>
            Select a background for Dark Mode. Light Mode uses a clean
            light background.
          </Text>

          <View style={styles.card}>
            <View style={styles.wallpaperGrid}>
              {WALLPAPERS.map((item) => {
                const selected = wallpaper === item.id;
                const previewColor = WALLPAPER_COLORS[item.id];

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setWallpaper(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item.name} wallpaper`}
                    accessibilityState={{ selected }}
                    style={[
                      styles.wallpaperItem,
                      {
                        backgroundColor: selected
                          ? `${accentColor}12`
                          : cardColor,
                        borderColor: selected
                          ? accentColor
                          : borderColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.wallpaperPreview,
                        
                      ]}
                    >
                      <View style={styles.wallpaperLine} />
                      <View style={styles.wallpaperLineShort} />

                      {selected && (
                        <View
                          style={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: accentColor,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#FFFFFF",
                              fontWeight: "900",
                            }}
                          >
                            ✓
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.wallpaperName,
                        { color: textColor },
                      ]}
                    >
                      {item.name}
                    </Text>

                    <Text
                      style={[
                        styles.wallpaperDescription,
                        { color: mutedColor },
                      ]}
                    >
                      {item.description}
                    </Text>

                    {selected && (
                      <Text
                        style={[
                          styles.selectedLabel,
                          { color: accentColor },
                        ]}
                      >
                        SELECTED
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* ACCENT COLOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accent Color</Text>
          <Text style={styles.sectionSubtitle}>
            Change the color used for buttons, highlights and progress.
          </Text>

          <View style={styles.card}>
            <View style={styles.colorGrid}>
              {Object.values(THEME_COLORS).map((color) => {
                const selected =
                  accentColor.toUpperCase() === color.toUpperCase();

                return (
                  <TouchableOpacity
                    key={color}
                    activeOpacity={0.75}
                    onPress={() => setAccentColor(color)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select accent color ${color}`}
                    accessibilityState={{ selected }}
                    style={[
                      styles.colorItem,
                      {
                        backgroundColor: color,
                        borderColor: selected
                          ? textColor
                          : "transparent",
                      },
                    ]}
                  >
                    {selected && (
                      <Text style={styles.colorCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              style={{
                color: mutedColor,
                fontSize: 12,
                marginTop: 15,
              }}
            >
              Selected color: {accentColor}
            </Text>
          </View>
        </View>

        {/* LIVE PREVIEW */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Preview</Text>
          <Text style={styles.sectionSubtitle}>
            Preview your theme before returning to Home.
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.previewTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle}>Today's Learning</Text>
                <Text
                  style={{
                    color: mutedColor,
                    fontSize: 11,
                    marginTop: 5,
                  }}
                >
                  Keep your streak alive!
                </Text>
              </View>

              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: accentColor },
                ]}
              >
                <Text style={styles.previewBadgeText}>7 DAY STREAK</Text>
              </View>
            </View>

            <Text
              style={{
                color: textColor,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Learning progress · 72%
            </Text>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goBackHome}
              style={styles.previewButton}
            >
              <Text style={styles.previewButtonText}>
                Continue Learning →
              </Text>
            </TouchableOpacity>

            <Text style={styles.previewNote}>
              Theme preferences are saved automatically and should remain
              selected when you reopen VETRIX.
            </Text>
          </View>
        </View>

        {/* DONE */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goBackHome}
            style={styles.footerButton}
          >
            <Text style={styles.footerButtonText}>
              ✓ Done · Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
