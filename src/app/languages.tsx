import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

type Language = {
  name: string;
  native: string;
  emoji: string;
  description: string;
};

const languages: Language[] = [
  {
    name: "Tamil",
    native: "தமிழ்",
    emoji: "🌺",
    description: "Learn through Tamil",
  },
  {
    name: "English",
    native: "English",
    emoji: "🌎",
    description: "Learn English for everyday life",
  },
  {
    name: "Arabic",
    native: "العربية",
    emoji: "🌙",
    description: "تعلم اللغة العربية",
  },
  {
    name: "Hindi",
    native: "हिन्दी",
    emoji: "🇮🇳",
    description: "हिंदी सीखना शुरू करें",
  },
  {
    name: "Malayalam",
    native: "മലയാളം",
    emoji: "🌴",
    description: "മലയാളത്തിൽ പഠിക്കാം",
  },
  {
    name: "Telugu",
    native: "తెలుగు",
    emoji: "🌼",
    description: "తెలుగులో నేర్చుకోండి",
  },
  {
    name: "Urdu",
    native: "اردو",
    emoji: "✨",
    description: "اردو سیکھنا شروع کریں",
  },
];

export default function LanguagesScreen() {
  const [selectedLanguage, setSelectedLanguage] =
    useState<string>("English");

  const handleContinue = () => {
    router.push({
      pathname: "/explore",
      params: {
        language: selectedLanguage,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#050816"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            VETR<Text style={styles.logoAccent}>I</Text>X
          </Text>

          <Text style={styles.tagline}>
            BY VETRI TECHNOLOGY
          </Text>
        </View>

        {/* Introduction */}
        <View style={styles.intro}>
          <View style={styles.globeContainer}>
            <Text style={styles.globeEmoji}>🌍</Text>
          </View>

          <Text style={styles.title}>
            Choose Your{"\n"}
            <Text style={styles.titleAccent}>
              Learning Language
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Every new language opens a new world.
            {"\n"}
            Choose your language and start learning!
          </Text>
        </View>

        {/* Language List */}
        <View style={styles.languageList}>
          {languages.map((language) => {
            const isSelected =
              selectedLanguage === language.name;

            return (
              <TouchableOpacity
                key={language.name}
                activeOpacity={0.82}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: isSelected,
                }}
                style={[
                  styles.languageCard,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() =>
                  setSelectedLanguage(language.name)
                }
              >
                <View style={styles.languageInfo}>
                  <View
                    style={[
                      styles.languageEmojiBox,
                      isSelected &&
                        styles.selectedEmojiBox,
                    ]}
                  >
                    <Text style={styles.languageEmoji}>
                      {language.emoji}
                    </Text>
                  </View>

                  <View style={styles.languageTextContainer}>
                    <Text style={styles.languageName}>
                      {language.name}
                    </Text>

                    <Text
                      style={[
                        styles.nativeName,
                        (language.name === "Arabic" ||
                          language.name === "Urdu") &&
                          styles.rtlNativeName,
                      ]}
                    >
                      {language.native}
                    </Text>

                    <Text style={styles.languageDescription}>
                      {language.description}
                    </Text>
                  </View>
                </View>

                {/* Radio Button */}
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.selectedRadio,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Language */}
        <View style={styles.footer}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>
              YOUR SELECTED LANGUAGE
            </Text>

            <Text style={styles.selectedText}>
              {languages.find(
                (language) =>
                  language.name === selectedLanguage
              )?.emoji}{" "}
              {selectedLanguage}
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.85}
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel={`Continue learning in ${selectedLanguage}`}
          >
            <Text style={styles.continueText}>
              Continue Learning
            </Text>

            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            Learn at your own pace. Grow every day. ✨
          </Text>

          <Text style={styles.footerBrand}>
            VETRIX • YOUR LEARNING JOURNEY
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050816",
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 35,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  backText: {
    color: "#B8C5E0",
    fontSize: 15,
    fontWeight: "600",
  },

  header: {
    alignItems: "center",
    marginTop: 8,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 3,
  },

  logoAccent: {
    color: "#37D9FF",
  },

  tagline: {
    color: "#8190B5",
    fontSize: 9,
    letterSpacing: 3,
    marginTop: 4,
  },

  intro: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 25,
  },

  globeContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#111D38",
    borderWidth: 1,
    borderColor: "#29365A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  globeEmoji: {
    fontSize: 40,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 37,
  },

  titleAccent: {
    color: "#8B7CFF",
  },

  subtitle: {
    color: "#A4B0CD",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 23,
    marginTop: 12,
  },

  languageList: {
    gap: 12,
  },

  languageCard: {
    minHeight: 82,
    backgroundColor: "#101A31",
    borderWidth: 1,
    borderColor: "#24304D",
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedCard: {
    backgroundColor: "#171D40",
    borderColor: "#8B7CFF",
    borderWidth: 2,
  },

  languageInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 10,
  },

  languageEmojiBox: {
    width: 46,
    height: 46,
    backgroundColor: "#202B49",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  selectedEmojiBox: {
    backgroundColor: "#302A60",
  },

  languageEmoji: {
    fontSize: 24,
  },

  languageTextContainer: {
    flex: 1,
  },

  languageName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  nativeName: {
    color: "#B9C5E5",
    fontSize: 14,
    marginTop: 3,
  },

  rtlNativeName: {
    textAlign: "left",
  },

  languageDescription: {
    color: "#8190B5",
    fontSize: 11,
    marginTop: 4,
  },

  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#65718F",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedRadio: {
    borderColor: "#8B7CFF",
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#8B7CFF",
  },

  footer: {
    marginTop: 25,
    alignItems: "center",
  },

  selectedInfo: {
    width: "100%",
    backgroundColor: "#101A31",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#24304D",
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 15,
  },

  selectedLabel: {
    color: "#8190B5",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  selectedText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 6,
  },

  continueButton: {
    width: "100%",
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#6957F5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  continueText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  footerNote: {
    color: "#A4B0CD",
    fontSize: 12,
    marginTop: 16,
    textAlign: "center",
  },

  footerBrand: {
    color: "#65718F",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 12,
  },
});
