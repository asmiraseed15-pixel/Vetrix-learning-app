import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "vetrix_learning_progress";

const COLORS = {
  background: "#080B16",
  card: "#12182A",
  cardLight: "#171E31",
  border: "#292F47",
  purple: "#8B7CFF",
  purpleLight: "#C7BDFF",
  white: "#FFFFFF",
  muted: "#929AB5",
  green: "#45C990",
};

const LANGUAGES = [
  { name: "English", native: "English", emoji: "🇬🇧" },
  { name: "Tamil", native: "தமிழ்", emoji: "🇮🇳" },
  { name: "Arabic", native: "العربية", emoji: "🌙" },
  { name: "Hindi", native: "हिन्दी", emoji: "🇮🇳" },
  { name: "Malayalam", native: "മലയാളം", emoji: "🌴" },
  { name: "Telugu", native: "తెలుగు", emoji: "🌼" },
  { name: "Urdu", native: "اردو", emoji: "🌙" },
];

const LESSONS = [
  {
    id: 0,
    title: "First Words",
    subtitle: "Start with simple words and greetings",
    emoji: "👋",
    xp: 20,
    duration: "3 min",
    color: "#292343",
  },
  {
    id: 1,
    title: "Everyday Vocabulary",
    subtitle: "Learn words you use every day",
    emoji: "📚",
    xp: 30,
    duration: "4 min",
    color: "#203448",
  },
  {
    id: 2,
    title: "Build Your First Sentence",
    subtitle: "Turn words into useful sentences",
    emoji: "💬",
    xp: 40,
    duration: "5 min",
    color: "#293C32",
  },
  {
    id: 3,
    title: "Real-Life Conversations",
    subtitle: "Practise everyday conversations",
    emoji: "🌍",
    xp: 50,
    duration: "6 min",
    color: "#453022",
  },
  {
    id: 4,
    title: "Speak With Confidence",
    subtitle: "Review your skills and improve",
    emoji: "🚀",
    xp: 70,
    duration: "7 min",
    color: "#3D2941",
  },
];

type ProgressData = {
  xp: number;
  completedLessons: string[];
  streak: number;
};

function normalizeLanguage(value: unknown): string {
  const input = String(value ?? "English").trim().toLowerCase();

  const aliases: Record<string, string> = {
    english: "English",
    tamil: "Tamil",
    "தமிழ்": "Tamil",
    arabic: "Arabic",
    "العربية": "Arabic",
    hindi: "Hindi",
    "हिन्दी": "Hindi",
    "हिंदी": "Hindi",
    malayalam: "Malayalam",
    "മലയാളം": "Malayalam",
    telugu: "Telugu",
    "తెలుగు": "Telugu",
    urdu: "Urdu",
    "اردو": "Urdu",
  };

  return aliases[input] ?? "English";
}

export default function LessonsScreen() {
  const params = useLocalSearchParams<{
    language?: string;
  }>();

  const [language, setLanguage] = useState(
    normalizeLanguage(params.language)
  );

  const [progress, setProgress] = useState<ProgressData>({
    xp: 0,
    completedLessons: [],
    streak: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        setProgress({
          xp: Number(parsed.xp) || 0,
          completedLessons: Array.isArray(parsed.completedLessons)
            ? parsed.completedLessons
            : [],
          streak: Number(parsed.streak) || 0,
        });
      } else {
        setProgress({
          xp: 0,
          completedLessons: [],
          streak: 0,
        });
      }
    } catch (error) {
      console.warn("Unable to load lesson progress:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLanguage(normalizeLanguage(params.language));
  }, [params.language]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProgress();
  };

  const completedCount = LESSONS.filter((lesson) =>
    progress.completedLessons.includes(`${language}:${lesson.id}`)
  ).length;

  const totalLessons = LESSONS.length;
  const completionPercentage = Math.round(
    (completedCount / totalLessons) * 100
  );

  const selectedLanguage = LANGUAGES.find(
    (item) => item.name === language
  );

  const isRTL = language === "Arabic" || language === "Urdu";

  const openLesson = (lesson: (typeof LESSONS)[number]) => {
    router.push({
      pathname: "/lesson-detail",
      params: {
        language,
        title: lesson.title,
        lessonIndex: String(lesson.id),
      },
    });
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading your lessons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.purple}
            colors={[COLORS.purple]}
          />
        }
      >
        {/* Top navigation */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.topTitleContainer}>
            <Text style={styles.topTitle}>Learning Path</Text>
            <Text style={styles.topSubtitle}>Your next step starts here</Text>
          </View>

          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>⚡ {progress.xp}</Text>
          </View>
        </View>

        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTopRow}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeEyebrow}>YOUR LEARNING JOURNEY</Text>
              <Text style={styles.welcomeTitle}>Keep growing! ✨</Text>
              <Text style={styles.welcomeDescription}>
                Small lessons. Real progress. One day at a time.
              </Text>
            </View>

            <View style={styles.welcomeEmojiBox}>
              <Text style={styles.welcomeEmoji}>🎯</Text>
            </View>
          </View>

          <View style={styles.progressInfoRow}>
            <Text style={styles.progressInfoLabel}>Overall progress</Text>
            <Text style={styles.progressPercentage}>
              {completionPercentage}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {completedCount} of {totalLessons} lessons completed
            </Text>
            <Text style={styles.progressFooterText}>
              {totalLessons - completedCount} remaining
            </Text>
          </View>
        </View>

        {/* Language selector */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Choose your language</Text>
            <Text style={styles.sectionSubtitle}>
              Learn in the language you love
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.languageList}
        >
          {LANGUAGES.map((item) => {
            const selected = language === item.name;

            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.languageCard,
                  selected && styles.languageCardSelected,
                ]}
                onPress={() => setLanguage(item.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.languageEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selected && styles.languageNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[
                    styles.languageNative,
                    selected && styles.languageNativeSelected,
                  ]}
                >
                  {item.native}
                </Text>

                {selected && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected language heading */}
        <View style={styles.selectedLanguageBanner}>
          <View style={styles.selectedLanguageIcon}>
            <Text style={styles.selectedLanguageEmoji}>
              {selectedLanguage?.emoji ?? "🌍"}
            </Text>
          </View>

          <View style={styles.selectedLanguageInfo}>
            <Text style={styles.selectedLanguageLabel}>CURRENT COURSE</Text>
            <Text
              style={[
                styles.selectedLanguageTitle,
                isRTL && styles.rtlText,
              ]}
            >
              {selectedLanguage?.native ?? language}
            </Text>
            <Text style={styles.selectedLanguageDescription}>
              {language} · 5 lessons · All levels
            </Text>
          </View>

          <View style={styles.courseCountBadge}>
            <Text style={styles.courseCountText}>
              {completedCount}/{totalLessons}
            </Text>
          </View>
        </View>

        {/* Lessons list */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your lessons</Text>
            <Text style={styles.sectionSubtitle}>
              Complete lessons to earn XP and build your skills.
            </Text>
          </View>
        </View>

        {LESSONS.map((lesson, index) => {
          const lessonKey = `${language}:${lesson.id}`;
          const isCompleted =
            progress.completedLessons.includes(lessonKey);

          const isLocked =
            index > 0 &&
            !progress.completedLessons.includes(
              `${language}:${index - 1}`
            );

          return (
            <TouchableOpacity
              key={lesson.id}
              style={[
                styles.lessonCard,
                isCompleted && styles.lessonCardCompleted,
              ]}
              onPress={() => openLesson(lesson)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.lessonIconBox,
                  { backgroundColor: lesson.color },
                ]}
              >
                <Text style={styles.lessonEmoji}>{lesson.emoji}</Text>
              </View>

              <View style={styles.lessonContent}>
                <View style={styles.lessonTitleRow}>
                  <Text style={styles.lessonNumber}>
                    LESSON {String(index + 1).padStart(2, "0")}
                  </Text>

                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>
                        ✓ Completed
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.lessonTitle}>{lesson.title}</Text>

                <Text style={styles.lessonSubtitle}>
                  {lesson.subtitle}
                </Text>

                <View style={styles.lessonMetaRow}>
                  <Text style={styles.lessonMeta}>◷ {lesson.duration}</Text>
                  <Text style={styles.lessonXP}>⚡ +{lesson.xp} XP</Text>
                </View>

                {isCompleted && (
                  <View style={styles.lessonProgressTrack}>
                    <View style={styles.lessonProgressFill} />
                  </View>
                )}

                {isLocked && !isCompleted && (
                  <Text style={styles.lessonUnlockHint}>
                    You can practise this lesson anytime
                  </Text>
                )}
              </View>

              <View style={styles.lessonAction}>
                {isCompleted ? (
                  <View style={styles.completedIcon}>
                    <Text style={styles.completedIconText}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.playButton}>
                    <Text style={styles.playButtonText}>›</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Motivational card */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🌟</Text>
          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>You're making progress!</Text>
            <Text style={styles.motivationText}>
              Every new word brings you closer to speaking with confidence.
              Keep practising at your own pace.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>VETRIX</Text>
          <Text style={styles.footerText}>
            Learn something new every day ✨
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 35,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 13,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 35,
    marginTop: -3,
  },
  topTitleContainer: {
    flex: 1,
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
  },
  topSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  xpBadge: {
    backgroundColor: "#27213F",
    borderWidth: 1,
    borderColor: "#49406E",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
  },
  xpBadgeText: {
    color: COLORS.purpleLight,
    fontSize: 12,
    fontWeight: "900",
  },
  welcomeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 28,
  },
  welcomeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeEyebrow: {
    color: COLORS.purpleLight,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 9,
  },
  welcomeTitle: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
    marginBottom: 8,
  },
  welcomeDescription: {
    color: "#A5ACC3",
    fontSize: 12,
    lineHeight: 19,
  },
  welcomeEmojiBox: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: "#282343",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeEmoji: {
    fontSize: 32,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 10,
  },
  progressInfoLabel: {
    color: "#CFD4E5",
    fontSize: 12,
    fontWeight: "700",
  },
  progressPercentage: {
    color: COLORS.purpleLight,
    fontSize: 13,
    fontWeight: "900",
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#2A3046",
    borderRadius: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.purple,
    borderRadius: 20,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
  },
  progressFooterText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  languageList: {
    paddingBottom: 8,
    gap: 10,
    paddingRight: 5,
  },
  languageCard: {
    width: 108,
    minHeight: 120,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  languageCardSelected: {
    backgroundColor: "#211D3A",
    borderColor: COLORS.purple,
    borderWidth: 1.5,
  },
  languageEmoji: {
    fontSize: 24,
    marginBottom: 9,
  },
  languageName: {
    color: "#C0C6D9",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  languageNameSelected: {
    color: COLORS.white,
  },
  languageNative: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },
  languageNativeSelected: {
    color: COLORS.purpleLight,
  },
  selectedIndicator: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicatorText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "900",
  },
  selectedLanguageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#15182B",
    borderWidth: 1,
    borderColor: "#353052",
    borderRadius: 19,
    padding: 14,
    marginTop: 13,
    marginBottom: 27,
  },
  selectedLanguageIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: "#292343",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedLanguageEmoji: {
    fontSize: 24,
  },
  selectedLanguageInfo: {
    flex: 1,
  },
  selectedLanguageLabel: {
    color: COLORS.purpleLight,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  selectedLanguageTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },
  selectedLanguageDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  courseCountBadge: {
    backgroundColor: "#27213F",
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  courseCountText: {
    color: COLORS.purpleLight,
    fontSize: 11,
    fontWeight: "900",
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  lessonCardCompleted: {
    borderColor: "#315F4B",
  },
  lessonIconBox: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonEmoji: {
    fontSize: 24,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
    marginBottom: 6,
  },
  lessonNumber: {
    color: COLORS.purpleLight,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  completedBadge: {
    backgroundColor: "#1C392F",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  completedBadgeText: {
    color: "#9BE7C1",
    fontSize: 8,
    fontWeight: "800",
  },
  lessonTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
  },
  lessonSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  lessonMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 13,
    marginTop: 10,
  },
  lessonMeta: {
    color: "#A5ACC3",
    fontSize: 10,
  },
  lessonXP: {
    color: "#D3C9FF",
    fontSize: 10,
    fontWeight: "800",
  },
  lessonProgressTrack: {
    height: 4,
    backgroundColor: "#293A33",
    borderRadius: 20,
    marginTop: 10,
    overflow: "hidden",
  },
  lessonProgressFill: {
    height: "100%",
    width: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 20,
  },
  lessonUnlockHint: {
    color: "#8E97B2",
    fontSize: 9,
    marginTop: 8,
  },
  lessonAction: {
    paddingTop: 4,
  },
  playButton: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#282343",
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    color: COLORS.purpleLight,
    fontSize: 25,
    lineHeight: 28,
    marginTop: -2,
  },
  completedIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#1C392F",
    alignItems: "center",
    justifyContent: "center",
  },
  completedIconText: {
    color: "#9BE7C1",
    fontSize: 16,
    fontWeight: "900",
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    backgroundColor: "#192333",
    borderWidth: 1,
    borderColor: "#304153",
    borderRadius: 19,
    padding: 17,
    marginTop: 8,
  },
  motivationEmoji: {
    fontSize: 27,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    color: "#DCE8FF",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  motivationText: {
    color: "#A6B5C9",
    fontSize: 11,
    lineHeight: 19,
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
  footerBrand: {
    color: "#7C72B9",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 3,
  },
  footerText: {
    color: "#59617B",
    fontSize: 10,
    marginTop: 7,
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
});
