import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS = {
  background: "#050816",
  surface: "#101A30",
  border: "#253452",
  primary: "#126EED",
  cyan: "#37D9FF",
  white: "#FFFFFF",
  muted: "#A5B4CC",
  green: "#35D49A",
  red: "#FF7777",
};

// Keep this URL consistent with your Django backend.
// Android emulator: http://10.0.2.2:8000
// Physical phone: use your computer's LAN IP, e.g. http://192.168.1.5:8000
// Web on the same computer: http://127.0.0.1:8000
const API_BASE_URL = "http://127.0.0.1:8000";
const INTERVIEW_ENDPOINT = "/api/learning/ai-interview/";

const CATEGORIES = [
  {
    name: "IT & Technology",
    emoji: "💻",
    roles: [
      "Python Developer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "React Native Developer",
      "Data Analyst",
      "AI/ML Engineer",
      "Cybersecurity Analyst",
      "Software Tester / QA",
      "DevOps Engineer",
      "UI/UX Designer",
      "Database Administrator",
      "Cloud Engineer",
      "IT Support Engineer",
    ],
  },
  {
    name: "Medical & Healthcare",
    emoji: "🏥",
    roles: [
      "Doctor",
      "Nurse",
      "Pharmacist",
      "Medical Coder",
      "Medical Assistant",
      "Lab Technician",
      "Physiotherapist",
      "Healthcare Administrator",
      "Radiology Technician",
      "Dentist",
      "Nutritionist",
    ],
  },
  {
    name: "Engineering & Construction",
    emoji: "🏗️",
    roles: [
      "Civil Engineer",
      "Mechanical Engineer",
      "Electrical Engineer",
      "Electronics Engineer",
      "Architect",
      "Site Engineer",
      "Quantity Surveyor",
      "Structural Engineer",
      "Construction Manager",
      "AutoCAD Designer",
    ],
  },
  {
    name: "Education",
    emoji: "📚",
    roles: [
      "School Teacher",
      "College Lecturer",
      "English Teacher",
      "Python Trainer",
      "Corporate Trainer",
      "Private Tutor",
      "Education Coordinator",
      "Special Education Teacher",
      "Teaching Assistant",
    ],
  },
  {
    name: "Business & Finance",
    emoji: "💼",
    roles: [
      "Accountant",
      "HR Executive",
      "Marketing Executive",
      "Sales Executive",
      "Banking Professional",
      "Finance Analyst",
      "Business Analyst",
      "Customer Support Executive",
      "Project Manager",
      "Business Development Executive",
      "Insurance Executive",
      "Data Entry Operator",
    ],
  },
  {
    name: "Other Professions",
    emoji: "🌍",
    roles: [
      "Chef",
      "Hotel Management Professional",
      "Lawyer",
      "Graphic Designer",
      "Journalist",
      "Logistics Professional",
      "Aviation Professional",
      "Government Job Candidate",
      "Police Officer Candidate",
      "Fashion Designer",
      "Photographer",
      "Electrician",
      "Entrepreneur",
      "Fresher / General Interview",
    ],
  },
];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Entry Level",
  "Experienced",
] as const;

type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

type ChatMessage = {
  id: string;
  sender: "AI" | "You";
  text: string;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Finds a token stored as a raw string or inside a JSON auth object.
 * The login screen and this screen must ultimately use the same token.
 */
function findTokenInObject(value: unknown, depth = 0): string | null {
  if (depth > 5 || value == null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // JSON objects may themselves be stored as strings.
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return findTokenInObject(JSON.parse(trimmed), depth + 1);
      } catch {
        return null;
      }
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTokenInObject(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    const object = value as Record<string, unknown>;

    // Prioritize common access-token property names.
    const preferredKeys = [
      "access",
      "access_token",
      "accessToken",
      "authToken",
      "token",
      "jwt",
    ];

    for (const key of preferredKeys) {
      const candidate = object[key];

      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim().replace(/^Bearer\s+/i, "");
      }
    }

    // Handle nested auth responses such as data.tokens.access.
    for (const key of [
      "tokens",
      "data",
      "auth",
      "user",
      "userData",
      "result",
    ]) {
      if (object[key] !== undefined) {
        const found = findTokenInObject(object[key], depth + 1);
        if (found) return found;
      }
    }
  }

  return null;
}

async function getAccessToken(): Promise<string | null> {
  try {
    const keys = await AsyncStorage.getAllKeys();

    // Check common standalone token keys first.
    const priorityKeys = [
      "access",
      "access_token",
      "accessToken",
      "token",
      "authToken",
      "jwt",
      "userToken",
      "user_token",
      "auth_token",
      "loginToken",
      "login_token",
      "authData",
      "auth",
      "user",
      "userData",
    ];

    const orderedKeys = [
      ...priorityKeys.filter((key) => keys.includes(key)),
      ...keys.filter((key) => !priorityKeys.includes(key)),
    ];

    for (const key of orderedKeys) {
      const storedValue = await AsyncStorage.getItem(key);
      if (!storedValue) continue;

      // Parse structured storage values.
      try {
        const parsed: unknown = JSON.parse(storedValue);
        const found = findTokenInObject(parsed);

        if (found) return found;
      } catch {
        // Raw strings are handled below.
      }

      // Accept a raw token only when its key identifies it as a token.
      const isTokenKey = /token|jwt|^access$/i.test(key);
      const rawValue = storedValue.trim().replace(/^Bearer\s+/i, "");

      if (
        isTokenKey &&
        rawValue.length > 0 &&
        !rawValue.startsWith("{") &&
        !rawValue.startsWith("[")
      ) {
        return rawValue;
      }
    }

    return null;
  } catch (error) {
    console.error("Unable to read authentication storage:", error);
    throw new Error("Unable to read saved login data. Please restart the app.");
  }
}

export default function AIInterviewScreen() {
  const [selectedCategory, setSelectedCategory] =
    useState("IT & Technology");
  const [selectedRole, setSelectedRole] =
    useState("Python Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("Fresher");

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [professionSearch, setProfessionSearch] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  const currentCategory = CATEGORIES.find(
    (category) => category.name === selectedCategory
  );

  const filteredRoles =
    currentCategory?.roles.filter((role) =>
      role.toLowerCase().includes(professionSearch.trim().toLowerCase())
    ) ?? [];

  const activeRole = customRole.trim() || selectedRole;

  async function requestAI(
    role: string,
    level: ExperienceLevel,
    latestAnswer: string,
    conversationMessages: ChatMessage[]
  ) {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error(
          "Login token not found. Please log in again. Check the AsyncStorage key used by your login screen."
        );
      }

      const history = conversationMessages.map((message) =>
        message.sender === "AI"
          ? `Interviewer: ${message.text}`
          : `Candidate: ${message.text}`
      );

      let response: Response;

      try {
        response = await fetch(
          `${API_BASE_URL}${INTERVIEW_ENDPOINT}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              role,
              experience_level: level,
              answer: latestAnswer,
              history,
            }),
          }
        );
      } catch {
        throw new Error(
          "Cannot connect to Django. Check the backend server and API_BASE_URL. On a physical phone, use your computer's LAN IP."
        );
      }

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid backend response. Check that the Django API is running and returns JSON."
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Login expired or token rejected (401). Log in again and check that the backend expects a Bearer access token."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "Permission denied (403). Check the Django API permissions."
          );
        }

        throw new Error(
          data?.details ||
            data?.error ||
            data?.detail ||
            `Interview request failed (${response.status}).`
        );
      }

      if (typeof data?.message !== "string" || !data.message.trim()) {
        throw new Error(
          "The AI did not return a message. Check the response format of your Django API."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: createMessageId(),
          sender: "AI",
          text: data.message.trim(),
        },
      ]);

      setQuestionCount((previous) => previous + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function startInterview() {
    if (loading) return;

    if (!activeRole.trim()) {
      setErrorMessage("Please select or enter a profession.");
      return;
    }

    setMessages([]);
    setQuestionCount(0);
    setAnswer("");
    setFinished(false);
    setStarted(true);
    setErrorMessage("");

    await requestAI(activeRole, experienceLevel, "", []);
  }

  async function submitAnswer() {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setErrorMessage("Please type your answer first.");
      return;
    }

    if (loading || finished) return;

    const updatedMessages: ChatMessage[] = [
      ...messages,
      {
        id: createMessageId(),
        sender: "You",
        text: trimmedAnswer,
      },
    ];

    setMessages(updatedMessages);
    setAnswer("");
    setErrorMessage("");

    await requestAI(
      activeRole,
      experienceLevel,
      trimmedAnswer,
      updatedMessages
    );
  }

  function retryLastRequest() {
    if (loading || finished) return;

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.sender === "You");

    setErrorMessage("");

    if (lastUserMessage) {
      const previousMessages = messages.filter(
        (message) => message.id !== lastUserMessage.id
      );

      void requestAI(
        activeRole,
        experienceLevel,
        lastUserMessage.text,
        previousMessages
      );
    } else {
      void requestAI(activeRole, experienceLevel, "", []);
    }
  }

  function endInterview() {
    if (loading) return;

    setFinished(true);
    setErrorMessage("");
  }

  function restartInterview() {
    setStarted(false);
    setFinished(false);
    setMessages([]);
    setAnswer("");
    setQuestionCount(0);
    setErrorMessage("");
    setProfessionSearch("");
    setCustomRole("");
  }

  function chooseCategory(categoryName: string) {
    const category = CATEGORIES.find(
      (item) => item.name === categoryName
    );

    if (!category) return;

    setSelectedCategory(categoryName);
    setSelectedRole(category.roles[0]);
    setCustomRole("");
    setProfessionSearch("");
    setCategoryOpen(false);
    setErrorMessage("");
  }

  function chooseRole(role: string) {
    setSelectedRole(role);
    setCustomRole("");
    setErrorMessage("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>AI Interview</Text>
            <Text style={styles.headerSubtitle}>
              VETRIX Career Practice
            </Text>
          </View>

          <Text style={styles.headerEmoji}>🎯</Text>
        </View>

        {!started ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.setupContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroCard}>
              <Text style={styles.heroEmoji}>🤖</Text>
              <Text style={styles.heroTitle}>
                Your Personal AI Interviewer
              </Text>
              <Text style={styles.heroDescription}>
                Practise for your dream career. Answer AI questions,
                improve your communication, and build confidence.
              </Text>
              <View style={styles.featureRow}>
                <Text style={styles.featureText}>✨ Smart questions</Text>
                <Text style={styles.featureText}>💬 Feedback</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              1. Choose a career category
            </Text>

            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setCategoryOpen((open) => !open)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>
                {currentCategory?.emoji} {selectedCategory}
              </Text>
              <Text style={styles.dropdownArrow}>
                {categoryOpen ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>

            {categoryOpen && (
              <View style={styles.dropdownList}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={styles.dropdownOption}
                    onPress={() => chooseCategory(category.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {category.emoji} {category.name}
                    </Text>
                    <Text style={styles.dropdownCheck}>
                      {selectedCategory === category.name ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.sectionTitle}>
              2. Search and select your profession
            </Text>

            <TextInput
              style={styles.customInput}
              value={professionSearch}
              onChangeText={setProfessionSearch}
              placeholder="🔍 Search profession..."
              placeholderTextColor={COLORS.muted}
              autoCorrect={false}
              returnKeyType="search"
            />

            <View style={styles.selectedProfessionBox}>
              <Text style={styles.selectedProfessionLabel}>
                SELECTED PROFESSION
              </Text>
              <Text style={styles.selectedProfessionValue}>
                {activeRole}
              </Text>
            </View>

            <View style={styles.roleList}>
              {filteredRoles.map((role) => {
                const selected =
                  selectedRole === role && !customRole.trim();

                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      selected && styles.roleOptionSelected,
                    ]}
                    onPress={() => chooseRole(role)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.roleText,
                        selected && styles.selectedText,
                      ]}
                    >
                      {role}
                    </Text>
                    <Text style={styles.radioText}>
                      {selected ? "●" : "○"}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {filteredRoles.length === 0 && (
                <View style={styles.emptySearch}>
                  <Text style={styles.emptySearchTitle}>
                    No matching profession
                  </Text>
                  <Text style={styles.helperText}>
                    Enter any profession in the custom profession field.
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>
              3. Or enter another profession
            </Text>

            <TextInput
              style={styles.customInput}
              value={customRole}
              onChangeText={(value) => {
                setCustomRole(value);
                setErrorMessage("");
              }}
              placeholder="e.g. Pilot, Dentist, Fashion Designer..."
              placeholderTextColor={COLORS.muted}
              maxLength={100}
              returnKeyType="done"
            />

            <Text style={styles.helperText}>
              Your custom profession takes priority over the selected role.
            </Text>

            <Text style={styles.sectionTitle}>
              4. Select experience level
            </Text>

            <View style={styles.levelRow}>
              {EXPERIENCE_LEVELS.map((level) => {
                const selected = experienceLevel === level;

                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelButton,
                      selected && styles.levelButtonSelected,
                    ]}
                    onPress={() => setExperienceLevel(level)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        selected && styles.selectedText,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!!errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.disabledButton,
              ]}
              onPress={startInterview}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Start AI Interview →
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.bottomNote}>
              Every answer is a chance to learn and improve.
            </Text>
          </ScrollView>
        ) : (
          <View style={styles.chatContainer}>
            <View style={styles.interviewInfo}>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoRole}>{activeRole}</Text>
                <Text style={styles.infoLevel}>
                  {experienceLevel} · {questionCount} AI response
                  {questionCount === 1 ? "" : "s"}
                </Text>
              </View>

              {!finished && (
                <TouchableOpacity
                  style={styles.endButton}
                  onPress={endInterview}
                  disabled={loading}
                >
                  <Text style={styles.endButtonText}>Finish</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 0 && loading && (
                <View style={styles.loadingCard}>
                  <ActivityIndicator
                    size="large"
                    color={COLORS.cyan}
                  />
                  <Text style={styles.loadingText}>
                    Your AI interviewer is preparing your first question...
                  </Text>
                </View>
              )}

              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    message.sender === "You" && styles.messageRowUser,
                  ]}
                >
                  {message.sender === "AI" && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>AI</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      message.sender === "AI"
                        ? styles.aiBubble
                        : styles.userBubble,
                    ]}
                  >
                    <Text style={styles.messageSender}>
                      {message.sender === "AI"
                        ? "VETRIX Interviewer"
                        : "Your Answer"}
                    </Text>
                    <Text style={styles.messageText}>
                      {message.text}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && messages.length > 0 && (
                <View style={styles.thinkingRow}>
                  <ActivityIndicator color={COLORS.cyan} />
                  <Text style={styles.thinkingText}>AI is thinking...</Text>
                </View>
              )}

              {!!errorMessage && (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={retryLastRequest}
                    disabled={loading}
                  >
                    <Text style={styles.retryText}>Retry request</Text>
                  </TouchableOpacity>
                </View>
              )}

              {finished && (
                <View style={styles.finishedCard}>
                  <Text style={styles.finishedEmoji}>🎉</Text>
                  <Text style={styles.finishedTitle}>
                    Practice session completed!
                  </Text>
                  <Text style={styles.finishedText}>
                    You practised an interview for {activeRole}.
                    Review your conversation and try again to improve.
                  </Text>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={restartInterview}
                  >
                    <Text style={styles.primaryButtonText}>
                      Try Another Profession
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {!finished && (
              <View style={styles.answerArea}>
                <TextInput
                  style={styles.answerInput}
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="Type your interview answer..."
                  placeholderTextColor={COLORS.muted}
                  multiline
                  maxLength={4000}
                  editable={!loading}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={submitAnswer}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.sendButtonText}>Send ↑</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 35,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  headerEmoji: { fontSize: 27 },
  setupContent: {
    padding: 18,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
    alignItems: "center",
  },
  heroEmoji: { fontSize: 44, marginBottom: 10 },
  heroTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },
  heroDescription: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  featureRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 14,
  },
  featureText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 7,
  },
  dropdownButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  dropdownArrow: {
    color: COLORS.cyan,
    fontSize: 15,
    marginLeft: 8,
  },
  dropdownList: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
  },
  dropdownOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownOptionText: {
    color: COLORS.white,
    fontSize: 13,
    flex: 1,
  },
  dropdownCheck: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
  },
  customInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 15,
    color: COLORS.white,
    fontSize: 14,
    marginBottom: 10,
  },
  selectedProfessionBox: {
    backgroundColor: "#102A43",
    borderWidth: 1,
    borderColor: "#24506C",
    borderRadius: 13,
    padding: 13,
    marginBottom: 12,
  },
  selectedProfessionLabel: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 5,
  },
  selectedProfessionValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  roleList: { gap: 9, marginBottom: 22 },
  roleOption: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  roleOptionSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: "#102A43",
  },
  roleText: {
    color: COLORS.white,
    fontSize: 14,
    flex: 1,
  },
  radioText: {
    color: COLORS.cyan,
    fontSize: 19,
    marginLeft: 10,
  },
  emptySearch: {
    backgroundColor: COLORS.surface,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
  },
  emptySearchTitle: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 5,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 18,
  },
  levelRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  levelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  levelButtonSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: "#102A43",
  },
  levelText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  selectedText: { color: COLORS.cyan },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
  },
  bottomNote: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 12,
    marginTop: 15,
    lineHeight: 18,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    lineHeight: 19,
    marginVertical: 8,
  },
  chatContainer: { flex: 1 },
  interviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoTextContainer: { flex: 1 },
  infoRole: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  infoLevel: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  endButton: {
    borderColor: COLORS.red,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 13,
    marginLeft: 12,
  },
  endButtonText: {
    color: COLORS.red,
    fontWeight: "700",
  },
  messagesScroll: { flex: 1 },
  messagesContent: {
    padding: 15,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  messageRowUser: { justifyContent: "flex-end" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  messageBubble: {
    maxWidth: "84%",
    padding: 14,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  messageSender: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
  },
  messageText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 22,
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  thinkingText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginTop: 20,
  },
  loadingText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 15,
    lineHeight: 21,
  },
  answerArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 9,
  },
  answerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    color: COLORS.white,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontSize: 14,
  },
  sendButton: {
    minWidth: 74,
    height: 48,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sendButtonText: {
    color: COLORS.white,
    fontWeight: "800",
  },
  disabledButton: { opacity: 0.6 },
  finishedCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.green,
    borderRadius: 18,
    padding: 20,
    marginTop: 20,
  },
  finishedEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  finishedTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  finishedText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  errorCard: {
    backgroundColor: "#281722",
    borderRadius: 13,
    padding: 12,
    marginTop: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: COLORS.red,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    marginTop: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "700",
  },
});
