import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const languageInfo: Record<
  string,
  { native: string; emoji: string; greeting: string }
> = {
  Tamil: {
    native: "தமிழ்",
    emoji: "🌺",
    greeting: "இன்றே உங்கள் கற்றலைத் தொடங்குங்கள்!",
  },
  English: {
    native: "English",
    emoji: "🌎",
    greeting: "Start learning something new today!",
  },
  Arabic: {
    native: "العربية",
    emoji: "🌙",
    greeting: "ابدأ رحلة التعلم اليوم!",
  },
  Hindi: {
    native: "हिन्दी",
    emoji: "🇮🇳",
    greeting: "आज कुछ नया सीखना शुरू करें!",
  },
  Malayalam: {
    native: "മലയാളം",
    emoji: "🌴",
    greeting: "ഇന്ന് പുതിയതായി പഠിക്കാൻ തുടങ്ങൂ!",
  },
  Telugu: {
    native: "తెలుగు",
    emoji: "🌼",
    greeting: "ఈరోజే కొత్తగా నేర్చుకోవడం ప్రారంభించండి!",
  },
  Urdu: {
    native: "اردو",
    emoji: "✨",
    greeting: "آج ہی سیکھنا شروع کریں!",
  },
};

export default function ExploreScreen() {
  const params = useLocalSearchParams<{
    language?: string | string[];
  }>();

  const rawLanguage = params.language;
  const language =
    (Array.isArray(rawLanguage) ? rawLanguage[0] : rawLanguage) ||
    "English";

  const selectedLanguage =
    languageInfo[language] ? language : "English";

  const info = languageInfo[selectedLanguage];

  const openLessons = () => {
    router.push({
      pathname: "/lessons",
      params: { language: selectedLanguage },
    });
  };

  const openDictionary = () => {
    router.push({
      pathname: "/dictionary",
      params: { language: selectedLanguage },
    });
  };

  const openLanguageSelection = () => {
    router.push("/languages");
  };

  const openProgress = () => {
    router.push("/progress");
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              VETR<Text style={styles.brandAccent}>I</Text>X
            </Text>
            <Text style={styles.brandSubtitle}>
              BY VETRI TECHNOLOGY
            </Text>
          </View>

          <TouchableOpacity
            style={styles.changeLanguageButton}
            onPress={openLanguageSelection}
            activeOpacity={0.8}
          >
            <Text style={styles.changeLanguageText}>
              🌐 Change
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTop}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.eyebrow}>YOUR LEARNING SPACE</Text>

              <Text style={styles.welcomeTitle}>
                Welcome to{"\n"}
                <Text style={styles.accentText}>VETRIX!</Text>
              </Text>
            </View>

            <Text style={styles.welcomeEmoji}>🚀</Text>
          </View>

          <Text style={styles.welcomeDescription}>
            {info.greeting}
          </Text>

          <View style={styles.selectedLanguageBox}>
            <Text style={styles.selectedLanguageEmoji}>
              {info.emoji}
            </Text>

            <View style={styles.selectedLanguageTextBox}>
              <Text style={styles.smallLabel}>
                YOUR LEARNING LANGUAGE
              </Text>

              <Text style={styles.selectedLanguageName}>
                {selectedLanguage} ({info.native})
              </Text>
            </View>

            <View style={styles.activeDot} />
          </View>
        </View>

        {/* Daily Goal */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Learning Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Small steps, big progress ✨
          </Text>
        </View>

        <View style={styles.goalCard}>
          <View style={styles.goalIcon}>
            <Text style={styles.goalEmoji}>🎯</Text>
          </View>

          <View style={styles.goalContent}>
            <Text style={styles.goalTitle}>Today's Goal</Text>
            <Text style={styles.goalDescription}>
              Complete a lesson and practise a new word.
            </Text>
          </View>
        </View>

        {/* Learning Activities */}
        <Text style={styles.sectionTitle}>
          What would you like to do?
        </Text>

        <View style={styles.activities}>
          <TouchableOpacity
            style={styles.activityCard}
            activeOpacity={0.82}
            onPress={openLessons}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: "#27245B" },
              ]}
            >
              <Text style={styles.activityEmoji}>📚</Text>
            </View>

            <Text style={styles.activityTitle}>Lessons</Text>
            <Text style={styles.activityDescription}>
              Learn step by step
            </Text>

            <View style={styles.activityAction}>
              <Text style={styles.activityActionText}>
                Start Learning →
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityCard}
            activeOpacity={0.82}
            onPress={openDictionary}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: "#163B43" },
              ]}
            >
              <Text style={styles.activityEmoji}>📖</Text>
            </View>

            <Text style={styles.activityTitle}>Dictionary</Text>
            <Text style={styles.activityDescription}>
              Discover new words
            </Text>

            <View style={styles.activityAction}>
              <Text style={styles.activityActionText}>
                Explore Words →
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityCard}
            activeOpacity={0.82}
            onPress={openProgress}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: "#49331F" },
              ]}
            >
              <Text style={styles.activityEmoji}>📈</Text>
            </View>

            <Text style={styles.activityTitle}>My Progress</Text>
            <Text style={styles.activityDescription}>
              Review your learning
            </Text>

            <View style={styles.activityAction}>
              <Text style={styles.activityActionText}>
                View Progress →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>💜</Text>

          <View style={styles.motivationTextContainer}>
            <Text style={styles.motivationTitle}>
              You can do this!
            </Text>
            <Text style={styles.motivationDescription}>
              Every word you learn brings you one step closer
              to your goal.
            </Text>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.navEmoji}>🏠</Text>
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={openLessons}
          >
            <Text style={styles.navEmoji}>📚</Text>
            <Text style={styles.navText}>Lessons</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={openDictionary}
          >
            <Text style={styles.navEmoji}>📖</Text>
            <Text style={styles.navText}>Dictionary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={openProgress}
          >
            <Text style={styles.navEmoji}>📈</Text>
            <Text style={styles.navText}>Progress</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          VETRIX • Learn. Practise. Grow.
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  brand: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 3,
  },

  brandAccent: {
    color: "#37D9FF",
  },

  brandSubtitle: {
    color: "#8190B5",
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 3,
  },

  changeLanguageButton: {
    backgroundColor: "#151E37",
    borderColor: "#303C5E",
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
  },

  changeLanguageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  welcomeCard: {
    backgroundColor: "#111A34",
    borderWidth: 1,
    borderColor: "#2C355A",
    borderRadius: 23,
    padding: 20,
    marginBottom: 28,
  },

  welcomeTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  welcomeTextContainer: {
    flex: 1,
  },

  eyebrow: {
    color: "#8D83FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 10,
  },

  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "900",
  },

  accentText: {
    color: "#8B7CFF",
  },

  welcomeEmoji: {
    fontSize: 54,
    marginLeft: 8,
  },

  welcomeDescription: {
    color: "#B0BDD9",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 17,
    marginBottom: 18,
  },

  selectedLanguageBox: {
    backgroundColor: "#1A2545",
    borderRadius: 15,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  selectedLanguageEmoji: {
    fontSize: 30,
  },

  selectedLanguageTextBox: {
    flex: 1,
  },

  smallLabel: {
    color: "#91A0C3",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },

  selectedLanguageName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },

  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#46E6A5",
  },

  sectionHeader: {
    marginBottom: 17,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 7,
  },

  sectionSubtitle: {
    color: "#8D9BBB",
    fontSize: 12,
    marginBottom: 18,
  },

  goalCard: {
    backgroundColor: "#101A31",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
    gap: 13,
  },

  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#27245B",
    alignItems: "center",
    justifyContent: "center",
  },

  goalEmoji: {
    fontSize: 25,
  },

  goalContent: {
    flex: 1,
  },

  goalTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },

  goalDescription: {
    color: "#9EACCC",
    fontSize: 12,
    lineHeight: 18,
  },

  activities: {
    gap: 13,
    marginTop: 5,
  },

  activityCard: {
    backgroundColor: "#101A31",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 19,
    padding: 17,
  },

  activityIcon: {
    width: 51,
    height: 51,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  activityEmoji: {
    fontSize: 27,
  },

  activityTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  activityDescription: {
    color: "#9EACCC",
    fontSize: 12,
    marginTop: 5,
  },

  activityAction: {
    alignSelf: "flex-start",
    marginTop: 15,
    backgroundColor: "#202B49",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  activityActionText: {
    color: "#BFB7FF",
    fontSize: 12,
    fontWeight: "800",
  },

  motivationCard: {
    backgroundColor: "#171832",
    borderWidth: 1,
    borderColor: "#37315D",
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },

  motivationEmoji: {
    fontSize: 29,
  },

  motivationTextContainer: {
    flex: 1,
  },

  motivationTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },

  motivationDescription: {
    color: "#A7B1D0",
    fontSize: 12,
    lineHeight: 19,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#101A31",
    borderWidth: 1,
    borderColor: "#263653",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 5,
    marginTop: 25,
  },

  navItem: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },

  navEmoji: {
    fontSize: 20,
  },

  navText: {
    color: "#B6C2E0",
    fontSize: 10,
    fontWeight: "600",
  },

  footer: {
    color: "#65718F",
    fontSize: 10,
    textAlign: "center",
    marginTop: 22,
    letterSpacing: 1,
  },
});
