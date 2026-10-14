import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Share,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const PROGRESS_KEY = "vetrix_learning_progress";

type ProgressData = {
  xp?: number;
  completedLessons?: number | string[];
  streak?: number;
  dayCount?: number;
  learningDays?: number;
  totalLessons?: number;
  lastLearningDate?: string;
  lastActiveDate?: string;
  activeDates?: string[];
};

type Mission = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  action: () => void;
};

type Feature = {
  emoji: string;
  title: string;
  description: string;
  color: string;
  action: () => void;
};

const getLocalDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPreviousDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
};

const getUniqueDates = (dates?: string[]) => {
  if (!Array.isArray(dates)) return [];

  return Array.from(
    new Set(
      dates
        .filter((date) => typeof date === "string")
        .map((date) => date.slice(0, 10))
        .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    )
  ).sort();
};

const getCurrentStreak = (activeDates: string[]) => {
  const dateSet = new Set(activeDates);
  const today = getLocalDateKey();
  const yesterday = getPreviousDateKey(today);

  let currentDate = dateSet.has(today)
    ? today
    : dateSet.has(yesterday)
      ? yesterday
      : "";

  if (!currentDate) return 0;

  let streak = 0;

  while (dateSet.has(currentDate)) {
    streak++;
    currentDate = getPreviousDateKey(currentDate);
  }

  return streak;
};

export default function HomeScreen() {
  const {
    mode,
    backgroundColor,
    cardColor,
    textColor,
    mutedColor,
    borderColor,
    accentColor,
  } = useTheme();

  const isDark = mode === "dark";

  const colors = {
    background: backgroundColor,
    card: cardColor,
    text: textColor,
    muted: mutedColor,
    border: borderColor,
    accent: accentColor,
    secondaryCard: isDark ? "#101C36" : "#EAF2FF",
    secondaryText: isDark ? "#B0BED6" : "#475569",
    iconBackground: isDark ? "#192B48" : "#DBEAFE",
    navBackground: isDark ? "#0B1223" : "#FFFFFF",
    subtleCard: isDark ? "#101629" : "#F1F5F9",
    cyan: isDark ? "#37D9FF" : "#087EA4",
  };

  const [progress, setProgress] = useState<ProgressData>({
    xp: 0,
    completedLessons: 0,
    streak: 0,
    dayCount: 0,
    learningDays: 0,
    activeDates: [],
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadProgress = useCallback(async () => {
    try {
      const storedProgress = await AsyncStorage.getItem(PROGRESS_KEY);

      if (!storedProgress) {
        setProgress({
          xp: 0,
          completedLessons: 0,
          streak: 0,
          dayCount: 0,
          learningDays: 0,
          activeDates: [],
        });
        return;
      }

      const parsed: ProgressData = JSON.parse(storedProgress);
      const activeDates = getUniqueDates(parsed.activeDates);

      const completedLessonsCount = Array.isArray(
        parsed.completedLessons
      )
        ? new Set(parsed.completedLessons).size
        : Math.max(0, Number(parsed.completedLessons ?? 0));

      const lastLearningDate =
        parsed.lastLearningDate ?? parsed.lastActiveDate;

      if (
        activeDates.length === 0 &&
        lastLearningDate &&
        /^\d{4}-\d{2}-\d{2}$/.test(lastLearningDate)
      ) {
        activeDates.push(lastLearningDate);
      }

      const savedDayCount = Math.max(
        0,
        Number(parsed.dayCount ?? parsed.learningDays ?? 0)
      );

      const dayCount = Math.max(activeDates.length, savedDayCount);

      setProgress({
        ...parsed,
        xp: Math.max(0, Number(parsed.xp ?? 0)),
        completedLessons: completedLessonsCount,
        streak: getCurrentStreak(activeDates),
        dayCount,
        learningDays: dayCount,
        totalLessons: Math.max(0, Number(parsed.totalLessons ?? 0)),
        activeDates,
      });
    } catch (error) {
      console.error("Unable to load learning progress:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadProgress();
    } finally {
      setRefreshing(false);
    }
  };

  // SHARE LEARNING PROGRESS
  const handleShareProgress = async () => {
    try {
      const today = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const report = [
        "🌟 My VETRIX Learning Progress",
        `📅 Report date: ${today}`,
        "",
        `⚡ Total XP: ${progress.xp ?? 0}`,
        `📚 Lessons completed: ${progress.completedLessons ?? 0}`,
        `🔥 Current streak: ${progress.streak ?? 0} days`,
        `📆 Learning days: ${progress.dayCount ?? 0}`,
        "",
        "Keep learning, keep growing! 🚀",
        "VETRIX by Vetri Technology",
      ].join("\n");

      await Share.share({
        title: "My VETRIX Learning Progress",
        message: report,
      });
    } catch (error) {
      console.error("Unable to share progress:", error);
      Alert.alert("Sharing failed", "Please try again.");
    }
  };

  // Navigation
  const openHome = () => router.replace("/home");
  const openLanguages = () => router.push("/languages");
  const openLessons = () => router.push("/lessons");
  const openExplore = () => router.push("/explore");
  const openRelax = () => router.push("/relax");
  const openProgress = () => router.push("/progress");
  const openDictionary = () => router.push("/dictionary");
  const openGames = () => router.push("/games");
  const openSkillHub = () => router.push("/skill-hub");
  const openConversationWorld = () => router.push("/conversation-world");
  const openAIInterview = () => router.push("/ai-interview");
  const openProfile = () => router.push("/profile");
  const openCalendar = () => router.push("/calendar");
  const openQuiz = () => router.push("/learn-quiz");
  const openFriends = () => router.push("/friends");

  // Theme Studio navigation
  const openTheme = () => router.push("/theme");

  const missions: Mission[] = [
    {
      id: "1",
      emoji: "📚",
      title: "Complete a lesson",
      description: "Learn something new today",
      action: openLessons,
    },
    {
      id: "2",
      emoji: "🎮",
      title: "Play a mini game",
      description: "Learn while having fun",
      action: openGames,
    },
    {
      id: "3",
      emoji: "💬",
      title: "Practice a conversation",
      description: "Improve your communication",
      action: openConversationWorld,
    },
  ];

  const features: Feature[] = [
    {
      emoji: "🌍",
      title: "Languages",
      description: "Learn languages your way",
      color: "#153A55",
      action: openLanguages,
    },
    {
      emoji: "📖",
      title: "Dictionary",
      description: "Discover words and meanings",
      color: "#352654",
      action: openDictionary,
    },
    {
      emoji: "🧠",
      title: "Learn & Quiz",
      description: "Explore topics and test knowledge",
      color: "#173C39",
      action: openQuiz,
    },
    {
      emoji: "🎮",
      title: "Mini Games",
      description: "Puzzles, memory and challenges",
      color: "#47311D",
      action: openGames,
    },
    {
      emoji: "🚀",
      title: "Skill Discovery",
      description: "Explore careers and new skills",
      color: "#342750",
      action: openSkillHub,
    },
    {
      emoji: "🗣️",
      title: "Conversation World",
      description: "Practice real-life conversations",
      color: "#173A4C",
      action: openConversationWorld,
    },
    {
      emoji: "👥",
      title: "Friends & Connect",
      description: "Find friends and learn together",
      color: "#203B63",
      action: openFriends,
    },
    {
      emoji: "🧭",
      title: "Explore VETRIX",
      description: "Discover more learning activities",
      color: "#26364C",
      action: openExplore,
    },
    {
      emoji: "🎧",
      title: "Relax Zone",
      description: "Take a break and refresh your mind",
      color: "#26364C",
      action: openRelax,
    },
  ];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 18,
      paddingBottom: 28,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      paddingBottom: 22,
    },
    brand: {
      color: colors.text,
      fontSize: 27,
      fontWeight: "900",
      letterSpacing: 1.5,
    },
    brandAccent: {
      color: colors.cyan,
    },
    brandSubtitle: {
      color: colors.muted,
      fontSize: 9,
      letterSpacing: 2,
      marginTop: 3,
      fontWeight: "700",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    profileButton: {
      height: 44,
      width: 44,
      borderRadius: 15,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      backgroundColor: colors.secondaryCard,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 22,
      marginBottom: 30,
      overflow: "hidden",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.iconBackground,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 20,
      marginBottom: 20,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 5,
      backgroundColor: colors.cyan,
      marginRight: 7,
    },
    heroBadgeText: {
      color: colors.cyan,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 1,
    },
    heroTitle: {
      color: colors.text,
      fontSize: 31,
      fontWeight: "900",
      lineHeight: 39,
      letterSpacing: -0.6,
    },
    heroHighlight: {
      color: colors.cyan,
    },
    heroDescription: {
      color: colors.secondaryText,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 13,
      maxWidth: 300,
    },
    primaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 13,
      paddingVertical: 14,
      paddingHorizontal: 17,
      marginTop: 22,
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 13,
    },
    buttonArrow: {
      color: "#FFFFFF",
      fontSize: 18,
      marginLeft: 15,
    },
    heroDecoration: {
      position: "absolute",
      right: 20,
      bottom: 30,
    },
    heroDecorationEmoji: {
      fontSize: 34,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
      marginTop: 4,
    },
    sectionEyebrow: {
      color: colors.cyan,
      fontSize: 9,
      letterSpacing: 1.4,
      fontWeight: "800",
      marginBottom: 5,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "800",
    },
    viewAll: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 28,
    },
    statCard: {
      width: "48.2%",
      backgroundColor: colors.card,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 15,
      marginBottom: 10,
    },
    statIconBox: {
      width: 37,
      height: 37,
      borderRadius: 12,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    statEmoji: {
      fontSize: 19,
    },
    statValue: {
      color: colors.text,
      fontSize: 25,
      fontWeight: "900",
    },
    statLabel: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 5,
    },
    continueCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 29,
    },
    continueIcon: {
      width: 53,
      height: 53,
      borderRadius: 16,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 13,
    },
    continueTextContainer: {
      flex: 1,
    },
    continueTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    continueDescription: {
      color: colors.muted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 5,
    },
    continueLink: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 9,
    },
    todayBadge: {
      backgroundColor: colors.iconBackground,
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    todayBadgeText: {
      color: colors.accent,
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },
    missionCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 13,
      marginBottom: 10,
    },
    missionEmojiBox: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    missionTextContainer: {
      flex: 1,
    },
    missionTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    missionDescription: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 5,
    },
    missionArrow: {
      color: colors.accent,
      fontSize: 21,
      paddingHorizontal: 5,
    },
    interviewBanner: {
      backgroundColor: isDark ? "#17152E" : "#F3EEFF",
      borderRadius: 21,
      borderWidth: 1,
      borderColor: isDark ? "#45346B" : "#D8C8FF",
      padding: 19,
      marginBottom: 30,
    },
    interviewBannerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 15,
    },
    interviewIconBox: {
      width: 51,
      height: 51,
      borderRadius: 16,
      backgroundColor: isDark ? "#30244B" : "#E3D7FF",
      alignItems: "center",
      justifyContent: "center",
    },
    interviewTitle: {
      color: isDark ? "#FFFFFF" : "#271A46",
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 28,
    },
    interviewDescription: {
      color: isDark ? "#B7B1D0" : "#5E5478",
      fontSize: 12,
      lineHeight: 20,
      marginTop: 9,
    },
    aiBadge: {
      borderWidth: 1,
      borderColor: isDark ? "#6E55A1" : "#B7A0EB",
      backgroundColor: isDark ? "#29203F" : "#E8DEFF",
      borderRadius: 9,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    aiBadgeText: {
      color: isDark ? "#D0B6FF" : "#6741A5",
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 1,
    },
    interviewAction: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: "#6841C7",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      marginTop: 17,
    },
    interviewActionText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "800",
    },
    interviewActionArrow: {
      color: "#FFFFFF",
      fontSize: 17,
      marginLeft: 13,
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 26,
    },
    featureCard: {
      width: "48.2%",
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 12,
      minHeight: 184,
    },
    featureIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 13,
    },
    featureEmoji: {
      fontSize: 23,
    },
    featureTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 7,
    },
    featureDescription: {
      color: colors.muted,
      fontSize: 11,
      lineHeight: 17,
      flex: 1,
    },
    featureLink: {
      color: colors.accent,
      fontSize: 11,
      fontWeight: "800",
      marginTop: 13,
    },
    progressCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#102A36" : "#E8F8FC",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? "#235064" : "#B8E5F0",
      padding: 16,
      marginBottom: 25,
    },
    progressIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: colors.iconBackground,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    progressTextContainer: {
      flex: 1,
    },
    progressTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "800",
    },
    progressDescription: {
      color: colors.muted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 6,
    },
    progressArrow: {
      color: colors.cyan,
      fontSize: 21,
      marginLeft: 7,
    },
    quoteCard: {
      backgroundColor: colors.subtleCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: 20,
      marginBottom: 28,
    },
    quoteMark: {
      color: colors.cyan,
      fontSize: 40,
      fontWeight: "900",
      lineHeight: 42,
    },
    quoteText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 23,
      fontWeight: "600",
    },
    quoteFooter: {
      color: colors.muted,
      fontSize: 9,
      letterSpacing: 1.5,
      fontWeight: "800",
      marginTop: 14,
    },
    footer: {
      alignItems: "center",
      paddingTop: 5,
      paddingBottom: 20,
    },
    footerBrand: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      letterSpacing: 3,
    },
    footerText: {
      color: colors.muted,
      fontSize: 11,
      marginTop: 7,
    },
    footerCopyright: {
      color: colors.muted,
      fontSize: 10,
      marginTop: 8,
    },
    bottomNav: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: colors.navBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 10,
      paddingBottom: 8,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 3,
    },
    navEmoji: {
      fontSize: 19,
      marginBottom: 4,
    },
    navLabel: {
      color: colors.muted,
      fontSize: 9,
      fontWeight: "700",
    },
    navLabelActive: {
      color: colors.accent,
    },
  });

  const renderSectionHeader = (
    eyebrow: string,
    title: string,
    action?: () => void,
    actionLabel?: string
  ) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {action && actionLabel ? (
        <TouchableOpacity onPress={action}>
          <Text style={styles.viewAll}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.cyan}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              VETRIX<Text style={styles.brandAccent}>.</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              LEARN • PLAY • GROW
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={openTheme}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open Theme Studio"
            >
              <Text style={{ fontSize: 22 }}>🎨</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={openProfile}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Open Profile"
            >
              <Text style={{ fontSize: 22 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.heroBadgeText}>
              YOUR PERSONAL LEARNING SPACE
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Learn something{"\n"}
            <Text style={styles.heroHighlight}>
              amazing today.
            </Text>
          </Text>

          <Text style={styles.heroDescription}>
            Discover skills, practise real-life situations and
            make every day a step forward.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={openLanguages}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Start Learning</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.heroDecoration}>
            <Text style={styles.heroDecorationEmoji}>✨</Text>
          </View>
        </View>

        {/* LEARNING OVERVIEW */}
        {renderSectionHeader(
          "YOUR JOURNEY",
          "Learning Overview",
          openProgress,
          "View all →"
        )}

        <View style={styles.statsGrid}>
          {[
            { emoji: "⚡", value: progress.xp ?? 0, label: "Total XP" },
            { emoji: "🔥", value: progress.streak ?? 0, label: "Day Streak" },
            { emoji: "📅", value: progress.dayCount ?? 0, label: "Day Count" },
            {
              emoji: "🎯",
              value: progress.completedLessons ?? 0,
              label: "Lessons Done",
            },
          ].map((item) => (
            <View style={styles.statCard} key={item.label}>
              <View style={styles.statIconBox}>
                <Text style={styles.statEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* SHARE LEARNING PROGRESS — ADDED FEATURE ONLY */}
        <TouchableOpacity
          onPress={handleShareProgress}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.accent,
            borderRadius: 14,
            padding: 16,
            marginBottom: 28,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
          accessibilityRole="button"
          accessibilityLabel="Share my VETRIX learning progress"
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 20,
              marginRight: 10,
            }}
          >
            ↗
          </Text>

          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            Share My Learning Progress
          </Text>
        </TouchableOpacity>

        {/* CONTINUE LEARNING */}
        {renderSectionHeader("KEEP MOVING", "Continue Learning")}

        <TouchableOpacity
          style={styles.continueCard}
          onPress={openLessons}
          activeOpacity={0.85}
        >
          <View style={styles.continueIcon}>
            <Text style={{ fontSize: 27 }}>📘</Text>
          </View>

          <View style={styles.continueTextContainer}>
            <Text style={styles.continueTitle}>
              Your next learning session
            </Text>
            <Text style={styles.continueDescription}>
              Pick a topic and continue building your knowledge.
            </Text>
            <Text style={styles.continueLink}>Continue learning →</Text>
          </View>
        </TouchableOpacity>

        {/* DAILY MISSIONS */}
        {renderSectionHeader(
          "SMALL STEPS, BIG RESULTS",
          "Daily Missions"
        )}

        <View
          style={[
            styles.todayBadge,
            { alignSelf: "flex-start", marginBottom: 12 },
          ]}
        >
          <Text style={styles.todayBadgeText}>TODAY</Text>
        </View>

        {missions.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={styles.missionCard}
            onPress={mission.action}
            activeOpacity={0.8}
          >
            <View style={styles.missionEmojiBox}>
              <Text style={{ fontSize: 22 }}>{mission.emoji}</Text>
            </View>

            <View style={styles.missionTextContainer}>
              <Text style={styles.missionTitle}>{mission.title}</Text>
              <Text style={styles.missionDescription}>
                {mission.description}
              </Text>
            </View>

            <Text style={styles.missionArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* AI INTERVIEW */}
        {renderSectionHeader("CAREER PRACTICE", "AI Interview Room")}

        <TouchableOpacity
          style={styles.interviewBanner}
          onPress={openAIInterview}
          activeOpacity={0.85}
        >
          <View style={styles.interviewBannerTop}>
            <View style={styles.interviewIconBox}>
              <Text style={{ fontSize: 27 }}>🎤</Text>
            </View>

            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI POWERED</Text>
            </View>
          </View>

          <Text style={styles.interviewTitle}>
            Get ready for your next interview.
          </Text>

          <Text style={styles.interviewDescription}>
            Practise questions for IT, healthcare, engineering,
            education, business and other careers.
          </Text>

          <TouchableOpacity
            style={styles.interviewAction}
            onPress={openAIInterview}
            activeOpacity={0.8}
          >
            <Text style={styles.interviewActionText}>
              Enter Interview Room
            </Text>
            <Text style={styles.interviewActionArrow}>→</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* EXPLORE FEATURES */}
        {renderSectionHeader(
          "ONE APP, MANY POSSIBILITIES",
          "Explore VETRIX"
        )}

        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.title}
              style={styles.featureCard}
              onPress={feature.action}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: feature.color },
                ]}
              >
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
              </View>

              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>
                {feature.description}
              </Text>
              <Text style={styles.featureLink}>Explore →</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PROGRESS CARD */}
        <TouchableOpacity
          style={styles.progressCard}
          onPress={openProgress}
          activeOpacity={0.85}
        >
          <View style={styles.progressIcon}>
            <Text style={{ fontSize: 24 }}>🏆</Text>
          </View>

          <View style={styles.progressTextContainer}>
            <Text style={styles.progressTitle}>
              Your progress matters
            </Text>
            <Text style={styles.progressDescription}>
              Review your learning journey and celebrate the skills
              you have developed.
            </Text>
          </View>

          <Text style={styles.progressArrow}>→</Text>
        </TouchableOpacity>

        {/* MOTIVATION */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>
            Every expert was once a beginner. Keep learning,
            keep practising, and keep growing.
          </Text>
          <Text style={styles.quoteFooter}>
            YOUR VETRIX JOURNEY ✨
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>VETRIX</Text>
          <Text style={styles.footerText}>
            Learn something new. Every single day.
          </Text>
          <Text style={styles.footerCopyright}>
            VETRIX by Vetri Technology
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {[
          { emoji: "🏠", label: "Home", action: openHome, active: true },
          { emoji: "🎧", label: "Relax", action: openRelax, active: false },
          { emoji: "📅", label: "Calendar", action: openCalendar, active: false },
          { emoji: "📊", label: "Progress", action: openProgress, active: false },
          { emoji: "👤", label: "Profile", action: openProfile, active: false },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={item.action}
            activeOpacity={0.8}
          >
            <Text style={styles.navEmoji}>{item.emoji}</Text>
            <Text
              style={[
                styles.navLabel,
                item.active && styles.navLabelActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
