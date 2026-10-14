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
import { Ionicons } from "@expo/vector-icons";

const BLUE = "#126EED";
const BG = "#050816";
const CARD = "#101A30";
const BORDER = "#253452";
const WHITE = "#F4F7FF";
const MUTED = "#9BAAC7";
const CYAN = "#37D9FF";

type Scenario = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  tag: string;
};

const scenarios: Scenario[] = [
  {
    id: "airport",
    title: "At the Airport",
    description:
      "Practise check-in, asking about your flight, and finding your boarding gate.",
    icon: "airplane-outline",
    color: "#37D9FF",
    tag: "TRAVEL",
  },
  {
    id: "restaurant",
    title: "At a Restaurant",
    description:
      "Order food, ask about the menu, and communicate confidently with staff.",
    icon: "restaurant-outline",
    color: "#FFB86B",
    tag: "DAILY LIFE",
  },
  {
    id: "hospital",
    title: "At the Hospital",
    description:
      "Explain your symptoms, describe how you feel, and ask for help.",
    icon: "medkit-outline",
    color: "#FF7D91",
    tag: "HEALTH",
  },
  {
    id: "shopping",
    title: "Shopping",
    description:
      "Ask about prices, sizes, availability, and payment methods.",
    icon: "bag-handle-outline",
    color: "#B69CFF",
    tag: "EVERYDAY",
  },
  {
    id: "hotel",
    title: "At a Hotel",
    description:
      "Practise booking a room, checking in, and requesting hotel services.",
    icon: "bed-outline",
    color: "#64E6B5",
    tag: "TRAVEL",
  },
];

export default function ConversationWorld() {
  const openScenario = (scenario: string) => {
    router.push({
      pathname: "/conversation-practice",
      params: { scenario },
    });
  };

  const openVoicePractice = () => {
    router.push({
      pathname: "/conversation-practice",
      params: { scenario: "voice" },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color={WHITE} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Conversation World</Text>
            <Text style={styles.headerSubtitle}>
              Practise real-life conversations
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles-outline" size={24} color={CYAN} />
          </View>
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />

          <View style={styles.heroIcon}>
            <Ionicons name="globe-outline" size={32} color={CYAN} />
          </View>

          <Text style={styles.heroEyebrow}>YOUR REAL-LIFE PRACTICE SPACE</Text>

          <Text style={styles.heroTitle}>
            Speak with{"\n"}
            <Text style={styles.heroHighlight}>confidence.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Explore everyday situations, practise conversations, and build
            confidence one step at a time.
          </Text>

          <View style={styles.heroFeatures}>
            <View style={styles.heroFeature}>
              <Ionicons name="checkmark-circle" size={17} color={CYAN} />
              <Text style={styles.heroFeatureText}>Real-life scenarios</Text>
            </View>

            <View style={styles.heroFeature}>
              <Ionicons name="checkmark-circle" size={17} color={CYAN} />
              <Text style={styles.heroFeatureText}>Practice at your pace</Text>
            </View>
          </View>
        </View>

        {/* Real-life scenarios */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Choose Your Situation</Text>
            <Text style={styles.sectionSubtitle}>
              Where would you like to practise today?
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>{scenarios.length}</Text>
          </View>
        </View>

        {scenarios.map((scenario) => (
          <TouchableOpacity
            key={scenario.id}
            style={styles.scenarioCard}
            activeOpacity={0.8}
            onPress={() => openScenario(scenario.id)}
          >
            <View
              style={[
                styles.scenarioIcon,
                { backgroundColor: `${scenario.color}18` },
              ]}
            >
              <Ionicons
                name={scenario.icon}
                size={27}
                color={scenario.color}
              />
            </View>

            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioTag}>{scenario.tag}</Text>
              <Text style={styles.scenarioTitle}>{scenario.title}</Text>
              <Text style={styles.scenarioDescription}>
                {scenario.description}
              </Text>

              <View style={styles.startRow}>
                <Text style={styles.startText}>Start practice</Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={CYAN}
                />
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={MUTED}
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}

        {/* Speak & Improve — separate feature */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Improve Your Speaking</Text>
            <Text style={styles.sectionSubtitle}>
              Take the next step in your practice
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.speakCard}
          activeOpacity={0.85}
          onPress={openVoicePractice}
        >
          <View style={styles.speakIcon}>
            <Ionicons name="mic-outline" size={29} color={CYAN} />
          </View>

          <View style={styles.speakInfo}>
            <Text style={styles.speakTitle}>Speak & Improve</Text>
            <Text style={styles.speakDescription}>
              Open speaking practice to work on your responses and build
              confidence.
            </Text>

            <View style={styles.speakAction}>
              <Text style={styles.speakActionText}>Start speaking practice</Text>
              <Ionicons name="arrow-forward" size={15} color={CYAN} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Encouragement */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={23} color="#FFCA78" />

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>A little tip</Text>
            <Text style={styles.tipText}>
              Don’t worry about making mistakes. Practise regularly, try new
              sentences, and improve at your own pace.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          VETRIX by Vetri Technology
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 19,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 4,
  },
  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#11243A",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#101C34",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#28466B",
    padding: 22,
    marginBottom: 29,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#126EED18",
    right: -55,
    top: -45,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#173454",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
  },
  heroEyebrow: {
    color: CYAN,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 10,
  },
  heroTitle: {
    color: WHITE,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
  },
  heroHighlight: {
    color: CYAN,
  },
  heroDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 13,
  },
  heroFeatures: {
    marginTop: 19,
    gap: 10,
  },
  heroFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroFeatureText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 2,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#132B49",
    borderWidth: 1,
    borderColor: "#28466B",
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    color: CYAN,
    fontSize: 13,
    fontWeight: "800",
  },
  scenarioCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 15,
    marginBottom: 12,
  },
  scenarioIcon: {
    width: 53,
    height: 53,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTag: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 5,
  },
  scenarioTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  scenarioDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
  },
  startRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  startText: {
    color: CYAN,
    fontSize: 12,
    fontWeight: "700",
  },
  chevron: {
    marginLeft: 5,
    marginTop: 3,
  },
  speakCard: {
    flexDirection: "row",
    backgroundColor: "#10243A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27506A",
    padding: 16,
    marginBottom: 20,
  },
  speakIcon: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: "#163A4D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  speakInfo: {
    flex: 1,
  },
  speakTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 7,
  },
  speakDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
  },
  speakAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  speakActionText: {
    color: CYAN,
    fontSize: 12,
    fontWeight: "700",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#211F29",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#48403A",
    padding: 16,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: "#FFCA78",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  tipText: {
    color: "#D4C8B9",
    fontSize: 12,
    lineHeight: 19,
  },
  footer: {
    color: "#657491",
    textAlign: "center",
    fontSize: 11,
    marginTop: 25,
  },
});
