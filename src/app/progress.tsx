import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, router } from "expo-router";

const STORAGE_KEY = "vetrix_learning_progress";

type ProgressData = {
  xp: number;
  completedLessons: string[];
  streak: number;
  quizAttempts: number;
  lastQuizScore: number;
  lastQuizTotal: number;
  lastQuizAccuracy: number;
};

const EMPTY_PROGRESS: ProgressData = {
  xp: 0,
  completedLessons: [],
  streak: 0,
  quizAttempts: 0,
  lastQuizScore: 0,
  lastQuizTotal: 0,
  lastQuizAccuracy: 0,
};

const LANGUAGES = [
  { name: "English", emoji: "🇬🇧" },
  { name: "Tamil", emoji: "🇮🇳" },
  { name: "Arabic", emoji: "🌙" },
  { name: "Hindi", emoji: "🇮🇳" },
  { name: "Malayalam", emoji: "🌴" },
  { name: "Telugu", emoji: "✨" },
  { name: "Urdu", emoji: "🌸" },
];

export default function ProgressScreen() {
  const [progress, setProgress] =
    useState<ProgressData>(EMPTY_PROGRESS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | "info"
  >("success");

  // Load latest progress saved on this device.
  const loadProgress = useCallback(async () => {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);

    if (!storedData) {
      setProgress(EMPTY_PROGRESS);
      return false;
    }

    const parsed = JSON.parse(storedData);

    const updatedProgress: ProgressData = {
      xp: Number(parsed.xp) || 0,
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons
        : [],
      streak: Number(parsed.streak) || 0,
      quizAttempts: Number(parsed.quizAttempts) || 0,
      lastQuizScore: Number(parsed.lastQuizScore) || 0,
      lastQuizTotal: Number(parsed.lastQuizTotal) || 0,
      lastQuizAccuracy: Number(parsed.lastQuizAccuracy) || 0,
    };

    setProgress(updatedProgress);
    return true;
  }, []);

  // Automatically load when the Progress screen opens.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);

        try {
          const storedData =
            await AsyncStorage.getItem(STORAGE_KEY);

          if (!active) return;

          if (!storedData) {
            setProgress(EMPTY_PROGRESS);
          } else {
            const parsed = JSON.parse(storedData);

            setProgress({
              xp: Number(parsed.xp) || 0,
              completedLessons: Array.isArray(
                parsed.completedLessons
              )
                ? parsed.completedLessons
                : [],
              streak: Number(parsed.streak) || 0,
              quizAttempts: Number(parsed.quizAttempts) || 0,
              lastQuizScore:
                Number(parsed.lastQuizScore) || 0,
              lastQuizTotal:
                Number(parsed.lastQuizTotal) || 0,
              lastQuizAccuracy:
                Number(parsed.lastQuizAccuracy) || 0,
            });
          }

          setMessage("");
        } catch (error) {
          console.error("Progress loading error:", error);

          if (active) {
            setMessage("Unable to load progress. Please refresh.");
            setMessageType("error");
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      void load();

      return () => {
        active = false;
      };
    }, [])
  );

  // Refresh button.
  const onRefresh = useCallback(async () => {
    if (refreshing) return;

    console.log("Refresh button clicked!");
    setRefreshing(true);
    setMessage("");

    try {
      const success = await loadProgress();

      if (success) {
        setMessage("✓ Progress Updated Successfully!");
        setMessageType("success");
        console.log("Progress refreshed successfully.");
      } else {
        setMessage(
          "No saved progress found. Complete a lesson or quiz first."
        );
        setMessageType("info");
      }
    } catch (error) {
      console.error("Refresh progress error:", error);
      setMessage("Refresh failed. Please try again.");
      setMessageType("error");
    } finally {
      setRefreshing(false);
    }
  }, [loadProgress, refreshing]);

  const completedCount = progress.completedLessons.length;
  const totalLessons = LANGUAGES.length * 5;

  const completionPercentage =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round((completedCount / totalLessons) * 100)
        )
      : 0;

  const getLanguageProgress = (languageName: string) => {
    return progress.completedLessons.filter((lesson) =>
      String(lesson)
        .toLowerCase()
        .includes(languageName.toLowerCase())
    ).length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#4F8CFF" />
        <Text style={styles.loadingText}>
          Loading your progress...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4F8CFF"
            colors={["#4F8CFF"]}
            progressBackgroundColor="#17233D"
          />
        }
      >
        {/* Back button and header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/home");
              }
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.backButtonText}>‹</Text>
            <Text style={styles.backLabel}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerSubtitle}>
            YOUR LEARNING JOURNEY
          </Text>

          <Text style={styles.headerTitle}>
            My Progress 📊
          </Text>

          <Text style={styles.headerDescription}>
            Every small step takes you forward.
          </Text>
        </View>

        {/* Refresh button */}
        <TouchableOpacity
          style={[
            styles.refreshButton,
            refreshing && styles.refreshButtonDisabled,
          ]}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Refresh Progress"
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}

          <Text style={styles.refreshButtonText}>
            {refreshing ? "Refreshing..." : "Refresh Progress"}
          </Text>
        </TouchableOpacity>

        {/* Visible refresh message */}
        {message !== "" && (
          <View
            style={[
              styles.messageBox,
              messageType === "success" && styles.successMessage,
              messageType === "error" && styles.errorMessage,
              messageType === "info" && styles.infoMessage,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        {/* Overall progress */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>
            Overall Learning Progress
          </Text>

          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.bigNumber}>
                {completionPercentage}%
              </Text>
              <Text style={styles.mutedText}>
                Overall completion
              </Text>
            </View>

            <View style={styles.overviewEmojiContainer}>
              <Text style={styles.overviewEmoji}>🎯</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${completionPercentage}%` },
              ]}
            />
          </View>

          <Text style={styles.smallDescription}>
            {completedCount} completed lessons recorded
          </Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statNumber}>
              {progress.xp}
            </Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>
              {completedCount}
            </Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>
              {progress.streak}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📝</Text>
            <Text style={styles.statNumber}>
              {progress.quizAttempts}
            </Text>
            <Text style={styles.statLabel}>Quiz Attempts</Text>
          </View>
        </View>

        {/* Latest quiz result */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Latest Quiz Result 🏆
          </Text>

          <View style={styles.quizCard}>
            <View style={styles.quizRow}>
              <View style={styles.quizInfo}>
                <Text style={styles.quizLabel}>Last Score</Text>
                <Text style={styles.quizValue}>
                  {progress.lastQuizScore} / {progress.lastQuizTotal}
                </Text>
              </View>

              <View style={styles.quizInfo}>
                <Text style={styles.quizLabel}>Accuracy</Text>
                <Text style={styles.accuracyValue}>
                  {progress.lastQuizAccuracy}%
                </Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      Math.max(0, progress.lastQuizAccuracy)
                    )}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.smallDescription}>
              Complete more quizzes to improve your score.
            </Text>
          </View>
        </View>

        {/* Language progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Language Progress 🌍
          </Text>

          {LANGUAGES.map((language) => {
            const lessons = getLanguageProgress(language.name);
            const percentage = Math.min(
              100,
              Math.round((lessons / 5) * 100)
            );

            return (
              <View
                key={language.name}
                style={styles.languageCard}
              >
                <View style={styles.languageTopRow}>
                  <View style={styles.languageNameRow}>
                    <Text style={styles.languageEmoji}>
                      {language.emoji}
                    </Text>

                    <View>
                      <Text style={styles.languageName}>
                        {language.name}
                      </Text>

                      <Text style={styles.languageSubtitle}>
                        {lessons} lesson
                        {lessons === 1 ? "" : "s"} recorded
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.languagePercentage}>
                    {percentage}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationEmoji}>🚀</Text>
          <Text style={styles.motivationTitle}>Keep Going!</Text>
          <Text style={styles.motivationText}>
            Consistency is the key to success. Learn something
            new today and keep building your skills.
          </Text>
        </View>

        <Text style={styles.footerText}>
          VETRIX by Vetri Technology
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080F20",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#080F20",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#A8B4CC",
    marginTop: 14,
    fontSize: 14,
  },

  header: {
    marginBottom: 18,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#172747",
    borderWidth: 1,
    borderColor: "#294675",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 20,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 30,
    marginRight: 5,
  },

  backLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  headerSubtitle: {
    color: "#70A5FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 7,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  headerDescription: {
    color: "#A8B4CC",
    fontSize: 13,
    marginTop: 7,
  },

  refreshButton: {
    minHeight: 48,
    backgroundColor: "#246BFD",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 14,
    paddingHorizontal: 16,
    elevation: 3,
  },

  refreshButtonDisabled: {
    opacity: 0.7,
  },

  refreshIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 27,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  messageBox: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },

  successMessage: {
    backgroundColor: "#10372D",
    borderColor: "#237B5B",
  },

  errorMessage: {
    backgroundColor: "#401F2A",
    borderColor: "#9F3B51",
  },

  infoMessage: {
    backgroundColor: "#172747",
    borderColor: "#35568B",
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },

  overviewCard: {
    backgroundColor: "#121E35",
    borderWidth: 1,
    borderColor: "#243653",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 17,
  },

  overviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  bigNumber: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "800",
  },

  mutedText: {
    color: "#9BAAC4",
    fontSize: 12,
    marginTop: 4,
  },

  overviewEmojiContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#20345B",
    justifyContent: "center",
    alignItems: "center",
  },

  overviewEmoji: {
    fontSize: 30,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#26344D",
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#4F8CFF",
    borderRadius: 20,
  },

  smallDescription: {
    color: "#9BAAC4",
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 25,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#121E35",
    borderWidth: 1,
    borderColor: "#243653",
    borderRadius: 17,
    paddingVertical: 17,
    paddingHorizontal: 14,
  },

  statEmoji: {
    fontSize: 23,
    marginBottom: 9,
  },

  statNumber: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  statLabel: {
    color: "#A8B4CC",
    fontSize: 12,
    marginTop: 5,
  },

  section: {
    marginBottom: 25,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },

  quizCard: {
    backgroundColor: "#121E35",
    borderWidth: 1,
    borderColor: "#243653",
    borderRadius: 18,
    padding: 17,
  },

  quizRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  quizInfo: {
    flex: 1,
  },

  quizLabel: {
    color: "#9BAAC4",
    fontSize: 12,
    marginBottom: 7,
  },

  quizValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },

  accuracyValue: {
    color: "#64DCA5",
    fontSize: 24,
    fontWeight: "800",
  },

  languageCard: {
    backgroundColor: "#121E35",
    borderWidth: 1,
    borderColor: "#243653",
    borderRadius: 16,
    padding: 15,
    marginBottom: 11,
  },

  languageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  languageNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  languageEmoji: {
    fontSize: 26,
  },

  languageName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  languageSubtitle: {
    color: "#9BAAC4",
    fontSize: 11,
    marginTop: 4,
  },

  languagePercentage: {
    color: "#70A5FF",
    fontSize: 14,
    fontWeight: "800",
  },

  motivationCard: {
    backgroundColor: "#172747",
    borderWidth: 1,
    borderColor: "#294675",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 22,
  },

  motivationEmoji: {
    fontSize: 32,
    marginBottom: 9,
  },

  motivationTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
  },

  motivationText: {
    color: "#B7C5DF",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  footerText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 10,
  },
});
