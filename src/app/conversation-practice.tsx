import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const BLUE = "#126EED";
const BG = "#050816";
const CARD = "#101A30";
const BORDER = "#253452";
const WHITE = "#F4F7FF";
const MUTED = "#9BAAC7";
const CYAN = "#37D9FF";
const GREEN = "#64E6B5";
const ORANGE = "#FFB86B";

type Question = {
  prompt: string;
  hint: string;
  sample: string;
  keywords: string[];
};

type ScenarioContent = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  welcome: string;
  questions: Question[];
};

const scenarioContent: Record<string, ScenarioContent> = {
  airport: {
    title: "At the Airport",
    subtitle: "Travel conversation practice",
    icon: "airplane-outline",
    color: CYAN,
    welcome:
      "Welcome to the airport! Let's practise a check-in conversation.",
    questions: [
      {
        prompt: "Hello! May I see your passport and ticket, please?",
        hint: "Greet the staff and say that you are showing your documents.",
        sample:
          "Good morning. Certainly, here are my passport and ticket.",
        keywords: ["passport", "ticket", "here", "certainly"],
      },
      {
        prompt: "Where are you travelling today?",
        hint: "Tell the staff your destination.",
        sample: "I am travelling to Chennai today.",
        keywords: ["travelling", "to", "today"],
      },
      {
        prompt: "Would you prefer a window seat or an aisle seat?",
        hint: "Choose the seat you prefer.",
        sample: "I would prefer a window seat, please.",
        keywords: ["window", "seat", "please"],
      },
      {
        prompt: "Do you have any bags to check in?",
        hint: "Explain whether you have luggage.",
        sample: "Yes, I have one bag to check in.",
        keywords: ["bag", "check", "in"],
      },
    ],
  },

  restaurant: {
    title: "At a Restaurant",
    subtitle: "Food and dining practice",
    icon: "restaurant-outline",
    color: ORANGE,
    welcome:
      "Welcome to the restaurant! Let's practise ordering a meal.",
    questions: [
      {
        prompt: "Hello! What would you like to order?",
        hint: "Order a food item politely.",
        sample: "I would like a vegetable sandwich, please.",
        keywords: ["would", "like", "please"],
      },
      {
        prompt: "What would you like to drink?",
        hint: "Choose a drink.",
        sample: "I would like a glass of water, please.",
        keywords: ["water", "drink", "please"],
      },
      {
        prompt: "Would you like anything else?",
        hint: "Ask for another item or politely say no.",
        sample: "No, thank you. That will be all.",
        keywords: ["no", "thank", "you"],
      },
      {
        prompt: "How would you like to pay?",
        hint: "Tell the server your preferred payment method.",
        sample: "I would like to pay by card, please.",
        keywords: ["pay", "card", "please"],
      },
    ],
  },

  hospital: {
    title: "At the Hospital",
    subtitle: "Healthcare conversation practice",
    icon: "medkit-outline",
    color: "#FF7D91",
    welcome:
      "You are speaking to a receptionist at a hospital. Let's practise communicating clearly.",
    questions: [
      {
        prompt: "Hello. How can I help you today?",
        hint: "Explain why you have come to the hospital.",
        sample:
          "Hello. I would like to see a doctor because I am not feeling well.",
        keywords: ["doctor", "feeling", "well"],
      },
      {
        prompt: "Can you describe how you are feeling?",
        hint: "Describe your symptoms in your own words.",
        sample: "I have had a headache since this morning.",
        keywords: ["have", "headache", "morning"],
      },
      {
        prompt: "Have you booked an appointment?",
        hint: "Say whether you have an appointment.",
        sample:
          "Yes, I have an appointment at ten o'clock.",
        keywords: ["appointment"],
      },
      {
        prompt: "Would you like help finding the consultation room?",
        hint: "Respond politely to the offer.",
        sample: "Yes, please. Could you show me the way?",
        keywords: ["yes", "please", "show", "way"],
      },
    ],
  },

  shopping: {
    title: "Shopping",
    subtitle: "Everyday shopping practice",
    icon: "bag-handle-outline",
    color: "#B69CFF",
    welcome:
      "Welcome to the shop! Let's practise asking about products and prices.",
    questions: [
      {
        prompt: "Hello! Can I help you find anything?",
        hint: "Tell the shop assistant what you need.",
        sample: "Yes, I am looking for a blue shirt.",
        keywords: ["looking", "shirt"],
      },
      {
        prompt: "What size would you like?",
        hint: "Tell them your preferred size.",
        sample: "I would like a medium size, please.",
        keywords: ["size", "medium", "please"],
      },
      {
        prompt: "Would you like to know the price?",
        hint: "Ask how much the item costs.",
        sample: "Yes, how much does it cost?",
        keywords: ["how", "much", "cost"],
      },
      {
        prompt: "Would you like to pay by cash or card?",
        hint: "Choose your payment method.",
        sample: "I would like to pay by card.",
        keywords: ["pay", "card"],
      },
    ],
  },

  hotel: {
    title: "At a Hotel",
    subtitle: "Hotel and travel practice",
    icon: "bed-outline",
    color: GREEN,
    welcome:
      "Welcome to the hotel! Let's practise checking in at the reception.",
    questions: [
      {
        prompt: "Good evening! Do you have a reservation?",
        hint: "Tell the receptionist whether you booked a room.",
        sample: "Yes, I have a reservation under my name.",
        keywords: ["reservation", "name"],
      },
      {
        prompt: "How many nights will you be staying?",
        hint: "Tell them how long you plan to stay.",
        sample: "I will be staying for two nights.",
        keywords: ["staying", "two", "nights"],
      },
      {
        prompt: "May I have your identification, please?",
        hint: "Respond politely to the request.",
        sample: "Of course. Here is my identification.",
        keywords: ["here", "identification"],
      },
      {
        prompt: "Would you like help with your luggage?",
        hint: "Accept or decline politely.",
        sample: "Yes, please. Thank you for your help.",
        keywords: ["yes", "please", "thank"],
      },
    ],
  },

  voice: {
    title: "Speak & Improve",
    subtitle: "Speaking confidence practice",
    icon: "mic-outline",
    color: CYAN,
    welcome:
      "Let's practise speaking! Answer each question in your own words. You can type or use voice input if your browser supports it.",
    questions: [
      {
        prompt: "Hello! Could you introduce yourself?",
        hint: "Share your name and one or two things about yourself.",
        sample:
          "Hello! I would like to introduce myself. I enjoy learning new skills and meeting new people.",
        keywords: ["hello", "myself", "enjoy", "learning"],
      },
      {
        prompt: "What do you enjoy doing in your free time?",
        hint: "Talk about your hobbies or interests.",
        sample:
          "In my free time, I enjoy reading, listening to music, and learning new things.",
        keywords: ["free time", "enjoy", "reading", "learning"],
      },
      {
        prompt: "What is one skill you would like to improve?",
        hint: "Name a skill and explain why you want to improve it.",
        sample:
          "I would like to improve my communication skills because they help me express my ideas clearly.",
        keywords: ["improve", "skills", "because"],
      },
      {
        prompt: "Describe one goal you want to achieve.",
        hint: "Talk about a goal and one step you can take to reach it.",
        sample:
          "My goal is to develop my skills. I will practise regularly and learn something new every day.",
        keywords: ["goal", "practise", "learn"],
      },
    ],
  },
};

function getFeedback(answer: string, question: Question) {
  const cleaned = answer.trim();

  if (!cleaned) {
    return {
      title: "Give it a try",
      message:
        "Type your answer in the box first. You can use the sample response if you need help.",
      score: 0,
      suggestion: question.sample,
    };
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  const lower = cleaned.toLowerCase();
  const matched = question.keywords.filter((keyword) =>
    lower.includes(keyword.toLowerCase())
  );

  let score = 45;

  if (words.length >= 5) score += 15;
  if (words.length >= 9) score += 10;
  if (/[.!?]$/.test(cleaned)) score += 5;
  if (matched.length > 0) {
    score += Math.round((matched.length / question.keywords.length) * 25);
  }

  score = Math.min(score, 100);

  let title = "Good effort!";
  let message =
    "You answered the question. Try adding a little more detail to make your response clearer.";

  if (words.length < 4) {
    title = "Try a longer answer";
    message =
      "Good start! Try answering with a complete sentence and adding a little more detail.";
  } else if (score >= 80) {
    title = "Great response!";
    message =
      "Your response includes useful details. Keep practising to build your confidence.";
  } else if (score >= 60) {
    title = "Nice work!";
    message =
      "Your answer is a good start. You can improve it by making the sentence more specific and polite.";
  }

  return {
    title,
    message,
    score,
    suggestion: question.sample,
  };
}

export default function ConversationPractice() {
  const params = useLocalSearchParams<{ scenario?: string | string[] }>();

  const scenarioParam = Array.isArray(params.scenario)
    ? params.scenario[0]
    : params.scenario;

  const scenarioKey = scenarioParam || "voice";

  const scenario = useMemo(
    () => scenarioContent[scenarioKey] || scenarioContent.voice,
    [scenarioKey]
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [isListening, setIsListening] = useState(false);

  const currentQuestion = scenario.questions[questionIndex];

  const feedback = useMemo(
    () => getFeedback(answer, currentQuestion),
    [answer, currentQuestion]
  );

  useEffect(() => {
    return () => {
      if (
        Platform.OS === "web" &&
        typeof window !== "undefined"
      ) {
        const speechWindow = window as any;
        if (speechWindow.__vetrixRecognition) {
          try {
            speechWindow.__vetrixRecognition.stop();
          } catch {
            // Recognition may already have stopped.
          }
          speechWindow.__vetrixRecognition = null;
        }
      }
    };
  }, []);

  const startVoiceInput = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setVoiceStatus(
        "Voice input in this version works in supported web browsers. You can type your answer instead."
      );
      return;
    }

    const speechWindow = window as any;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus(
        "Voice input is not supported in this browser. Please type your answer."
      );
      return;
    }

    if (isListening) {
      try {
        speechWindow.__vetrixRecognition?.stop();
      } catch {
        // Ignore stop errors.
      }
      setIsListening(false);
      setVoiceStatus("Voice input stopped.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus("Listening... Please speak clearly.");
      };

      recognition.onresult = (event: any) => {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setAnswer((previous) => {
          const existing = previous.trim();
          return existing ? `${existing} ${transcript}` : transcript;
        });
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceStatus(
          event?.error === "not-allowed"
            ? "Microphone permission was denied. Allow microphone access in your browser settings."
            : "Voice input could not start. You can type your answer instead."
        );
      };

      recognition.onend = () => {
        setIsListening(false);
        speechWindow.__vetrixRecognition = null;
      };

      speechWindow.__vetrixRecognition = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceStatus(
        "Could not start voice input. Please check microphone permission or type your answer."
      );
    }
  };

  const submitAnswer = () => {
    if (!answer.trim()) {
      setShowFeedback(true);
      return;
    }

    setAnswers((previous) => {
      const updated = [...previous];
      updated[questionIndex] = answer.trim();
      return updated;
    });

    setShowFeedback(true);
  };

  const goToNextQuestion = () => {
    if (questionIndex < scenario.questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setAnswer("");
      setShowFeedback(false);
      setVoiceStatus("");
      setIsListening(false);
    } else {
      setCompleted(true);
    }
  };

  const restartPractice = () => {
    setQuestionIndex(0);
    setAnswer("");
    setShowFeedback(false);
    setCompleted(false);
    setAnswers([]);
    setVoiceStatus("");
    setIsListening(false);
  };

  const progress = completed
    ? 100
    : ((questionIndex + (showFeedback ? 1 : 0)) /
        scenario.questions.length) *
      100;

  const answeredCount = answers.filter(
    (item) => item && item.trim().length > 0
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
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

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{scenario.title}</Text>
              <Text style={styles.headerSubtitle}>{scenario.subtitle}</Text>
            </View>

            <View
              style={[
                styles.headerScenarioIcon,
                { backgroundColor: `${scenario.color}18` },
              ]}
            >
              <Ionicons
                name={scenario.icon}
                size={23}
                color={scenario.color}
              />
            </View>
          </View>

          {!completed ? (
            <>
              {/* Progress */}
              <View style={styles.progressCard}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>YOUR PRACTICE</Text>
                  <Text style={styles.progressCount}>
                    {questionIndex + 1} of {scenario.questions.length}
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Welcome */}
              {questionIndex === 0 && !showFeedback && (
                <View style={styles.welcomeCard}>
                  <View style={styles.welcomeIcon}>
                    <Ionicons
                      name="sparkles-outline"
                      size={23}
                      color={CYAN}
                    />
                  </View>
                  <View style={styles.welcomeContent}>
                    <Text style={styles.welcomeTitle}>Let's begin!</Text>
                    <Text style={styles.welcomeText}>
                      {scenario.welcome}
                    </Text>
                  </View>
                </View>
              )}

              {/* Conversation partner */}
              <View style={styles.questionCard}>
                <View style={styles.speakerRow}>
                  <View style={styles.speakerAvatar}>
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={24}
                      color={CYAN}
                    />
                  </View>

                  <View>
                    <Text style={styles.speakerName}>
                      Conversation Partner
                    </Text>
                    <Text style={styles.speakerStatus}>
                      Your turn to respond
                    </Text>
                  </View>
                </View>

                <Text style={styles.questionText}>
                  {currentQuestion.prompt}
                </Text>

                <View style={styles.hintBox}>
                  <Ionicons
                    name="bulb-outline"
                    size={18}
                    color={ORANGE}
                  />
                  <Text style={styles.hintText}>
                    {currentQuestion.hint}
                  </Text>
                </View>
              </View>

              {/* Answer input */}
              <View style={styles.answerCard}>
                <View style={styles.answerHeader}>
                  <Text style={styles.answerTitle}>Your Response</Text>
                  <Text style={styles.optionalLabel}>YOUR WORDS</Text>
                </View>

                <TextInput
                  style={styles.answerInput}
                  value={answer}
                  onChangeText={(value) => {
                    setAnswer(value);
                    if (showFeedback) {
                      setShowFeedback(false);
                    }
                  }}
                  placeholder="Type your answer here..."
                  placeholderTextColor="#657491"
                  multiline
                  textAlignVertical="top"
                  editable={!completed}
                  accessibilityLabel="Your conversation response"
                />

                <View style={styles.inputActions}>
                  <Text style={styles.wordCount}>
                    {answer.trim()
                      ? answer.trim().split(/\s+/).length
                      : 0}{" "}
                    words
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.micButton,
                      isListening && styles.micButtonActive,
                    ]}
                    onPress={startVoiceInput}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isListening ? "stop-circle-outline" : "mic-outline"}
                      size={18}
                      color={isListening ? "#FF7D91" : CYAN}
                    />
                    <Text
                      style={[
                        styles.micButtonText,
                        isListening && { color: "#FF7D91" },
                      ]}
                    >
                      {isListening ? "Stop listening" : "Use microphone"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {!!voiceStatus && (
                  <Text style={styles.voiceStatus}>{voiceStatus}</Text>
                )}

                <TouchableOpacity
                  style={styles.sampleButton}
                  onPress={() => {
                    setAnswer(currentQuestion.sample);
                    setShowFeedback(false);
                  }}
                >
                  <Ionicons
                    name="bulb-outline"
                    size={17}
                    color={CYAN}
                  />
                  <Text style={styles.sampleButtonText}>
                    Use sample response
                  </Text>
                </TouchableOpacity>

                {!showFeedback ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={submitAnswer}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryButtonText}>
                      Check My Response
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={WHITE}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.feedbackContainer}>
                    <View style={styles.feedbackHeading}>
                      <Ionicons
                        name={
                          feedback.score >= 75
                            ? "checkmark-circle"
                            : "school-outline"
                        }
                        size={24}
                        color={
                          feedback.score >= 75 ? GREEN : ORANGE
                        }
                      />
                      <Text style={styles.feedbackTitle}>
                        {feedback.title}
                      </Text>
                    </View>

                    {answer.trim().length > 0 && (
                      <>
                        <View style={styles.scoreRow}>
                          <Text style={styles.scoreLabel}>
                            Practice score
                          </Text>
                          <Text style={styles.scoreValue}>
                            {feedback.score}/100
                          </Text>
                        </View>

                        <View style={styles.scoreTrack}>
                          <View
                            style={[
                              styles.scoreFill,
                              {
                                width: `${feedback.score}%`,
                                backgroundColor:
                                  feedback.score >= 75 ? GREEN : ORANGE,
                              },
                            ]}
                          />
                        </View>
                      </>
                    )}

                    <Text style={styles.feedbackMessage}>
                      {feedback.message}
                    </Text>

                    <View style={styles.suggestionBox}>
                      <Text style={styles.suggestionLabel}>
                        SUGGESTED RESPONSE
                      </Text>
                      <Text style={styles.suggestionText}>
                        {feedback.suggestion}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={goToNextQuestion}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryButtonText}>
                        {questionIndex === scenario.questions.length - 1
                          ? "Finish Practice"
                          : "Next Question"}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color={WHITE}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          ) : (
            /* Completion screen */
            <View style={styles.completionCard}>
              <View style={styles.completionIcon}>
                <Ionicons
                  name="trophy-outline"
                  size={43}
                  color="#FFCA78"
                />
              </View>

              <Text style={styles.completionEyebrow}>
                PRACTICE COMPLETED
              </Text>

              <Text style={styles.completionTitle}>
                Great job!
              </Text>

              <Text style={styles.completionDescription}>
                You finished this conversation practice. Keep practising
                regularly to improve your communication skills.
              </Text>

              <View style={styles.resultStats}>
                <View style={styles.resultStat}>
                  <Text style={styles.resultNumber}>
                    {scenario.questions.length}
                  </Text>
                  <Text style={styles.resultLabel}>Questions</Text>
                </View>

                <View style={styles.resultDivider} />

                <View style={styles.resultStat}>
                  <Text style={styles.resultNumber}>
                    {answeredCount}
                  </Text>
                  <Text style={styles.resultLabel}>Answered</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={restartPractice}
                activeOpacity={0.85}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={WHITE}
                />
                <Text style={styles.primaryButtonText}>
                  Practise Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.replace("/conversation-world")}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryButtonText}>
                  Explore Other Scenarios
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.replace("/home")}
              >
                <Ionicons name="home-outline" size={17} color={MUTED} />
                <Text style={styles.homeButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footer}>
            VETRIX by Vetri Technology
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    marginBottom: 23,
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },
  headerScenarioIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 17,
    padding: 15,
    marginBottom: 17,
  },
  progressLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11,
  },
  progressLabel: {
    color: MUTED,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  progressCount: {
    color: CYAN,
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#26334B",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: BLUE,
  },
  welcomeCard: {
    flexDirection: "row",
    backgroundColor: "#10243A",
    borderWidth: 1,
    borderColor: "#27506A",
    borderRadius: 17,
    padding: 15,
    marginBottom: 17,
    gap: 12,
  },
  welcomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#17374C",
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    color: WHITE,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 5,
  },
  welcomeText: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
  },
  questionCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
    marginBottom: 16,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },
  speakerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#173454",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  speakerName: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
  },
  speakerStatus: {
    color: MUTED,
    fontSize: 11,
    marginTop: 4,
  },
  questionText: {
    color: WHITE,
    fontSize: 19,
    lineHeight: 28,
    fontWeight: "800",
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#252331",
    borderRadius: 13,
    padding: 12,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    color: "#D6CDCA",
    fontSize: 12,
    lineHeight: 19,
  },
  answerCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 17,
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  answerTitle: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "800",
  },
  optionalLabel: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  answerInput: {
    minHeight: 125,
    backgroundColor: "#091225",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    color: WHITE,
    fontSize: 14,
    lineHeight: 22,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 11,
  },
  wordCount: {
    color: MUTED,
    fontSize: 11,
  },
  micButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#142943",
    borderWidth: 1,
    borderColor: "#28466B",
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  micButtonActive: {
    backgroundColor: "#351B2B",
    borderColor: "#704052",
  },
  micButtonText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: "700",
  },
  voiceStatus: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  sampleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 12,
  },
  sampleButtonText: {
    color: CYAN,
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 49,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 7,
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: "800",
  },
  feedbackContainer: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 9,
    paddingTop: 17,
  },
  feedbackHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 13,
  },
  feedbackTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "800",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scoreLabel: {
    color: MUTED,
    fontSize: 11,
  },
  scoreValue: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
  },
  scoreTrack: {
    height: 6,
    backgroundColor: "#26334B",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 13,
  },
  scoreFill: {
    height: "100%",
    borderRadius: 4,
  },
  feedbackMessage: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 20,
  },
  suggestionBox: {
    backgroundColor: "#0B2030",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#21465A",
    padding: 13,
    marginTop: 14,
    marginBottom: 10,
  },
  suggestionLabel: {
    color: CYAN,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  suggestionText: {
    color: WHITE,
    fontSize: 13,
    lineHeight: 21,
  },
  completionCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 23,
    alignItems: "center",
    marginTop: 15,
  },
  completionIcon: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#332B25",
    borderWidth: 1,
    borderColor: "#64503A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  completionEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  completionTitle: {
    color: WHITE,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 10,
  },
  completionDescription: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  resultStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A1427",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: "100%",
    marginTop: 22,
    marginBottom: 17,
  },
  resultStat: {
    flex: 1,
    alignItems: "center",
  },
  resultNumber: {
    color: CYAN,
    fontSize: 24,
    fontWeight: "900",
  },
  resultLabel: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
  },
  resultDivider: {
    width: 1,
    height: 37,
    backgroundColor: BORDER,
  },
  secondaryButton: {
    minHeight: 47,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#17243A",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 11,
    width: "100%",
  },
  secondaryButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "700",
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 6,
  },
  homeButtonText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    color: "#657491",
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },
});
