import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type QuizQuestion = {
  id: number;
  category: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const COLORS = {
  background: "#070B18",
  card: "#10182B",
  cardLight: "#17223A",
  primary: "#4D8DFF",
  cyan: "#39D9FF",
  text: "#F4F7FF",
  muted: "#9BAAC5",
  green: "#32D6A0",
  red: "#FF6B81",
  border: "#263653",
};

const CATEGORIES = [
  "All",
  "Real-Life Situations",
  "Choose the Best Reply",
  "Chat & Messaging",
  "Job & Interview",
  "Speed Challenge",
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "Real-Life Situations",
    question: "You are at a café. How do you order a coffee politely?",
    options: [
      "Give coffee now!",
      "Could I have a coffee, please?",
      "Coffee you give?",
      "I coffee want.",
    ],
    answer: 1,
    explanation:
      '"Could I have a coffee, please?" is a polite and natural way to order.',
  },
  {
    id: 2,
    category: "Real-Life Situations",
    question: "You need help finding a hospital. What should you ask?",
    options: [
      "Where is the nearest hospital?",
      "Hospital you are?",
      "Give me hospital.",
      "Why hospital here?",
    ],
    answer: 0,
    explanation:
      '"Where is the nearest hospital?" is a clear way to ask for directions.',
  },
  {
    id: 3,
    category: "Choose the Best Reply",
    question: 'Someone says, "Thank you!" What is the best reply?',
    options: [
      "Never mind you.",
      "What thank you?",
      "You're welcome!",
      "Thank you no.",
    ],
    answer: 2,
    explanation: '"You’re welcome!" is a friendly and common response.',
  },
  {
    id: 4,
    category: "Choose the Best Reply",
    question: 'Someone asks, "How are you?" What can you say?',
    options: [
      "I am fine, thank you. How about you?",
      "How are you me?",
      "Fine you go.",
      "I how fine.",
    ],
    answer: 0,
    explanation:
      "You can answer politely and ask the same question back.",
  },
  {
    id: 5,
    category: "Chat & Messaging",
    question: "Which message is best when you will arrive late?",
    options: [
      "Wait there.",
      "I am late. Don't ask.",
      "Where are you?",
      "Sorry, I'm running late. I'll be there soon.",
    ],
    answer: 3,
    explanation:
      "A good message explains the delay and politely updates the other person.",
  },
  {
    id: 6,
    category: "Chat & Messaging",
    question: "How should you ask a friend to send a document?",
    options: [
      "Send document immediately!",
      "Could you please send me the document?",
      "Document you send?",
      "You must document.",
    ],
    answer: 1,
    explanation:
      "Using 'Could you please...' makes a request polite.",
  },
  {
    id: 7,
    category: "Job & Interview",
    question: "An interviewer says, 'Tell me about yourself.' What should you do?",
    options: [
      "Stay silent.",
      "Talk about unrelated topics.",
      "Briefly explain your background, skills, and goals.",
      "Ask them to answer first.",
    ],
    answer: 2,
    explanation:
      "Give a short introduction covering your background, relevant skills, and career goals.",
  },
  {
    id: 8,
    category: "Job & Interview",
    question: "What is a professional way to begin an interview?",
    options: [
      "Hi, what's your problem?",
      "Good morning. Thank you for this opportunity.",
      "Let's finish quickly.",
      "You know me, right?",
    ],
    answer: 1,
    explanation:
      "A polite greeting and a thank-you create a professional first impression.",
  },
  {
    id: 9,
    category: "Real-Life Situations",
    question: "At a shop, you want to know the price. What do you ask?",
    options: [
      "How much does this cost?",
      "How many money this?",
      "This money how?",
      "Cost tell fast.",
    ],
    answer: 0,
    explanation:
      '"How much does this cost?" is a natural way to ask about a price.',
  },
  {
    id: 10,
    category: "Choose the Best Reply",
    question: 'Someone says, "I am sorry." What is a suitable reply?',
    options: [
      "Sorry you are.",
      "I am not listening.",
      "That's okay.",
      "You sorry me.",
    ],
    answer: 2,
    explanation: '"That’s okay" is a common response when accepting an apology.',
  },
  {
    id: 11,
    category: "Real-Life Situations",
    question: "At the airport, how do you ask where your gate is?",
    options: [
      "Gate you where?",
      "Could you tell me where Gate 5 is?",
      "Give Gate 5.",
      "I gate go?",
    ],
    answer: 1,
    explanation:
      "Use 'Could you tell me...' to ask for information politely.",
  },
  {
    id: 12,
    category: "Job & Interview",
    question: "What should you say if you don't understand an interview question?",
    options: [
      "Your question is bad.",
      "I don't care.",
      "Ask someone else.",
      "Could you please clarify the question?",
    ],
    answer: 3,
    explanation:
      "Politely asking for clarification shows that you want to understand correctly.",
  },
];

type ReviewItem = {
  question: QuizQuestion;
  selected: number;
  correct: boolean;
};

const PROGRESS_KEY = "vetrix_learning_progress";

export default function LearnQuizScreen() {
  const [category, setCategory] = useState("All");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [totalXP, setTotalXP] = useState(0);

  const currentQuestion = questions[questionIndex];
  const isSpeedChallenge = category === "Speed Challenge";

  useEffect(() => {
    AsyncStorage.getItem(PROGRESS_KEY)
      .then((value) => {
        if (value) {
          const data = JSON.parse(value);
          setTotalXP(Number(data.xp) || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!started || finished || !isSpeedChallenge || answered) return;

    if (secondsLeft <= 0) {
      handleAnswer(-1);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    started,
    finished,
    isSpeedChallenge,
    answered,
    secondsLeft,
  ]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (started && !finished) {
          Alert.alert(
            "Leave Quiz?",
            "Your current quiz progress may not be saved.",
            [
              { text: "Stay", style: "cancel" },
              {
                text: "Leave",
                style: "destructive",
                onPress: () => router.back(),
              },
            ]
          );
          return true;
        }
        return false;
      }
    );

    return () => subscription.remove();
  }, [started, finished]);

  const startQuiz = (selectedCategory: string) => {
    let selectedQuestions =
      selectedCategory === "All"
        ? [...QUESTIONS]
        : selectedCategory === "Speed Challenge"
        ? [...QUESTIONS]
        : QUESTIONS.filter((item) => item.category === selectedCategory);

    if (selectedQuestions.length === 0) {
      Alert.alert("No questions", "Please choose another category.");
      return;
    }

    selectedQuestions.sort(() => Math.random() - 0.5);

    setCategory(selectedCategory);
    setQuestions(selectedQuestions);
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setEarnedXP(0);
    setReview([]);
    setFinished(false);
    setSaved(false);
    setSecondsLeft(15);
    setStarted(true);
  };

  const handleAnswer = (optionIndex: number) => {
    if (answered || !currentQuestion) return;

    const isCorrect = optionIndex === currentQuestion.answer;

    setSelectedOption(optionIndex);
    setAnswered(true);

    if (isCorrect) {
      setScore((previous) => previous + 1);
      setEarnedXP((previous) => previous + 10);
    }

    setReview((previous) => [
      ...previous,
      {
        question: currentQuestion,
        selected: optionIndex,
        correct: isCorrect,
      },
    ]);
  };

  const saveResults = async (finalScore: number, finalXP: number) => {
    if (saved) return;

    setSaved(true);

    try {
      const existing = await AsyncStorage.getItem(PROGRESS_KEY);
      const data = existing ? JSON.parse(existing) : {};

      const updated = {
        ...data,
        xp: (Number(data.xp) || 0) + finalXP,
        quizAttempts: (Number(data.quizAttempts) || 0) + 1,
        lastQuizScore: finalScore,
        lastQuizTotal: questions.length,
        lastQuizAccuracy:
          questions.length > 0
            ? Math.round((finalScore / questions.length) * 100)
            : 0,
      };

      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      setTotalXP(updated.xp);
    } catch (error) {
      console.warn("Unable to save quiz progress:", error);
    }
  };

  const nextQuestion = async () => {
    if (!answered) {
      Alert.alert("Choose an answer", "Select an option before continuing.");
      return;
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setSelectedOption(null);
      setAnswered(false);
      setSecondsLeft(15);
      return;
    }

    const finalScore = review.filter((item) => item.correct).length;
    const finalXP = finalScore * 10;

    setScore(finalScore);
    setEarnedXP(finalXP);
    setFinished(true);

    await saveResults(finalScore, finalXP);
  };

  const restartQuiz = () => {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setEarnedXP(0);
    setReview([]);
    setSaved(false);
  };

  const accuracy =
    questions.length > 0
      ? Math.round((score / questions.length) * 100)
      : 0;

  const getOptionStyle = (index: number) => {
    if (!answered) {
      return index === selectedOption
        ? styles.selectedOption
        : styles.option;
    }

    if (index === currentQuestion?.answer) {
      return styles.correctOption;
    }

    if (index === selectedOption) {
      return styles.wrongOption;
    }

    return styles.option;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (started && !finished) {
              Alert.alert(
                "Leave Quiz?",
                "Do you want to leave this quiz?",
                [
                  { text: "Stay", style: "cancel" },
                  {
                    text: "Leave",
                    onPress: () => router.back(),
                  },
                ]
              );
            } else {
              router.back();
            }
          }}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Learn & Quiz</Text>
          <Text style={styles.headerSubtitle}>Learn something every day</Text>
        </View>

        <View style={styles.xpPill}>
          <Text style={styles.xpText}>⚡ {totalXP}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!started && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroEmoji}>🧠</Text>
              </View>
              <Text style={styles.heroTitle}>Ready to challenge yourself?</Text>
              <Text style={styles.heroDescription}>
                Practice real-life conversations, improve your communication,
                and earn XP with every correct answer.
              </Text>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.statNumber}>{QUESTIONS.length}</Text>
                  <Text style={styles.statLabel}>Questions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.statNumber}>+10</Text>
                  <Text style={styles.statLabel}>XP / correct</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Modes</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Choose your challenge</Text>
            <Text style={styles.sectionSubtitle}>
              Pick a topic and start learning.
            </Text>

            {CATEGORIES.slice(1).map((item, index) => {
              const icons = ["🌍", "💬", "📱", "💼", "⚡"];
              const descriptions = [
                "Café, shopping, airport and more",
                "Find the most natural response",
                "Practice polite everyday messages",
                "Build confidence for interviews",
                "Answer within 15 seconds",
              ];

              return (
                <TouchableOpacity
                  key={item}
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => startQuiz(item)}
                >
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>{icons[index]}</Text>
                  </View>

                  <View style={styles.categoryTextWrap}>
                    <Text style={styles.categoryTitle}>{item}</Text>
                    <Text style={styles.categoryDescription}>
                      {descriptions[index]}
                    </Text>
                  </View>

                  <Text style={styles.categoryArrow}>›</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.allQuestionsButton}
              onPress={() => startQuiz("All")}
              activeOpacity={0.8}
            >
              <Text style={styles.allQuestionsText}>Start All Questions</Text>
              <Text style={styles.allQuestionsArrow}>→</Text>
            </TouchableOpacity>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Learning tip</Text>
              <Text style={styles.tipDescription}>
                Read the explanation after every answer. Understanding why an
                answer is correct helps you remember it longer.
              </Text>
            </View>
          </>
        )}

        {started && !finished && currentQuestion && (
          <>
            <View style={styles.quizTopRow}>
              <Text style={styles.questionCount}>
                QUESTION {questionIndex + 1} OF {questions.length}
              </Text>
              {isSpeedChallenge && (
                <View
                  style={[
                    styles.timerPill,
                    secondsLeft <= 5 && styles.timerPillWarning,
                  ]}
                >
                  <Text style={styles.timerText}>⏱ {secondsLeft}s</Text>
                </View>
              )}
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((questionIndex + 1) / questions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>

            <View style={styles.questionCard}>
              <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
              <Text style={styles.chooseHint}>Choose the best answer</Text>
            </View>

            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={`${currentQuestion.id}-${index}`}
                style={getOptionStyle(index)}
                activeOpacity={0.8}
                disabled={answered}
                onPress={() => handleAnswer(index)}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>

                <Text style={styles.optionText}>{option}</Text>

                {answered && index === currentQuestion.answer && (
                  <Text style={styles.optionStatus}>✓</Text>
                )}

                {answered &&
                  index === selectedOption &&
                  index !== currentQuestion.answer && (
                    <Text style={styles.optionStatus}>✕</Text>
                  )}
              </TouchableOpacity>
            ))}

            {answered && (
              <View
                style={[
                  styles.explanationCard,
                  selectedOption === currentQuestion.answer
                    ? styles.explanationCorrect
                    : styles.explanationWrong,
                ]}
              >
                <Text style={styles.explanationTitle}>
                  {selectedOption === currentQuestion.answer
                    ? "✓ Correct! +10 XP"
                    : selectedOption === -1
                    ? "⏰ Time's up!"
                    : "✕ Not quite"}
                </Text>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !answered && styles.disabledButton,
              ]}
              disabled={!answered}
              onPress={nextQuestion}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>
                {questionIndex === questions.length - 1
                  ? "See Results"
                  : "Next Question →"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.progressNote}>
              Correct answers earn 10 XP. Keep going!
            </Text>
          </>
        )}

        {started && finished && (
          <>
            <View style={styles.resultCard}>
              <Text style={styles.resultEmoji}>
                {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "🎉" : "💪"}
              </Text>
              <Text style={styles.resultTitle}>
                {accuracy >= 80
                  ? "Excellent Work!"
                  : accuracy >= 50
                  ? "Good Progress!"
                  : "Keep Practicing!"}
              </Text>
              <Text style={styles.resultSubtitle}>
                Every attempt makes you better.
              </Text>

              <View style={styles.scoreCircle}>
                <Text style={styles.scorePercentage}>{accuracy}%</Text>
                <Text style={styles.scoreCaption}>ACCURACY</Text>
              </View>

              <View style={styles.resultStats}>
                <View style={styles.resultStatBox}>
                  <Text style={styles.resultStatNumber}>
                    {score}/{questions.length}
                  </Text>
                  <Text style={styles.resultStatLabel}>Correct</Text>
                </View>
                <View style={styles.resultStatBox}>
                  <Text style={styles.resultStatNumber}>+{earnedXP}</Text>
                  <Text style={styles.resultStatLabel}>XP Earned</Text>
                </View>
                <View style={styles.resultStatBox}>
                  <Text style={styles.resultStatNumber}>
                    {review.filter((item) => !item.correct).length}
                  </Text>
                  <Text style={styles.resultStatLabel}>To Review</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Answer review</Text>
            <Text style={styles.sectionSubtitle}>
              Learn from every question.
            </Text>

            {review.map((item, index) => (
              <View key={`${item.question.id}-${index}`} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewNumber}>
                    Question {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.reviewStatus,
                      {
                        color: item.correct ? COLORS.green : COLORS.red,
                      },
                    ]}
                  >
                    {item.correct ? "✓ Correct" : "✕ Incorrect"}
                  </Text>
                </View>

                <Text style={styles.reviewQuestion}>
                  {item.question.question}
                </Text>

                <Text style={styles.reviewAnswerLabel}>Correct answer</Text>
                <Text style={styles.reviewCorrectAnswer}>
                  {item.question.options[item.question.answer]}
                </Text>

                {!item.correct && item.selected >= 0 && (
                  <>
                    <Text style={styles.reviewAnswerLabel}>Your answer</Text>
                    <Text style={styles.reviewWrongAnswer}>
                      {item.question.options[item.selected]}
                    </Text>
                  </>
                )}

                {item.selected === -1 && (
                  <Text style={styles.reviewWrongAnswer}>
                    No answer — time expired.
                  </Text>
                )}

                <Text style={styles.reviewExplanation}>
                  {item.question.explanation}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={restartQuiz}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Try Another Challenge ↻</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backText: {
    color: COLORS.text,
    fontSize: 32,
    lineHeight: 36,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  xpPill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#252441",
    borderWidth: 1,
    borderColor: "#514B86",
  },
  xpText: {
    color: "#FFD76A",
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 36,
  },
  heroCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25284B",
    marginBottom: 15,
  },
  heroEmoji: {
    fontSize: 29,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 29,
    fontWeight: "900",
  },
  heroDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 9,
  },
  heroStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    color: COLORS.cyan,
    fontSize: 19,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 5,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 19,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryEmoji: {
    fontSize: 23,
  },
  categoryTextWrap: {
    flex: 1,
    marginLeft: 13,
    marginRight: 5,
  },
  categoryTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  categoryDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  categoryArrow: {
    color: COLORS.cyan,
    fontSize: 28,
  },
  allQuestionsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  allQuestionsText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  allQuestionsArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  tipCard: {
    backgroundColor: "#101F31",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#25405B",
    padding: 15,
    marginTop: 18,
  },
  tipTitle: {
    color: COLORS.cyan,
    fontWeight: "800",
    fontSize: 13,
  },
  tipDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  quizTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  questionCount: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  timerPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#192943",
  },
  timerPillWarning: {
    backgroundColor: "#512332",
  },
  timerText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.cyan,
    borderRadius: 5,
  },
  questionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 17,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    color: COLORS.cyan,
    backgroundColor: "#152B45",
    borderRadius: 9,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 17,
  },
  questionText: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 29,
    fontWeight: "900",
  },
  chooseHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 13,
    marginBottom: 11,
    minHeight: 58,
  },
  selectedOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#192F54",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 13,
    marginBottom: 11,
    minHeight: 58,
  },
  correctOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10352F",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.green,
    padding: 13,
    marginBottom: 11,
    minHeight: 58,
  },
  wrongOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A202C",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.red,
    padding: 13,
    marginBottom: 11,
    minHeight: 58,
  },
  optionLetter: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#202D45",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  optionLetterText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 12,
  },
  optionText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  optionStatus: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 8,
  },
  explanationCard: {
    borderRadius: 16,
    padding: 15,
    marginTop: 4,
    marginBottom: 17,
    borderWidth: 1,
  },
  explanationCorrect: {
    backgroundColor: "#102F2A",
    borderColor: "#286A5B",
  },
  explanationWrong: {
    backgroundColor: "#321D29",
    borderColor: "#754052",
  },
  explanationTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14,
  },
  explanationText: {
    color: "#CFD8E9",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: "#293750",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  progressNote: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 11,
    marginTop: 14,
  },
  resultCard: {
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25,
    padding: 22,
    marginBottom: 28,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  resultSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 7,
    textAlign: "center",
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 7,
    borderColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    backgroundColor: "#12223B",
  },
  scorePercentage: {
    color: COLORS.text,
    fontSize: 35,
    fontWeight: "900",
  },
  scoreCaption: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 3,
  },
  resultStats: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  resultStatBox: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  resultStatNumber: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: "900",
  },
  resultStatLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  reviewCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  reviewNumber: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  reviewStatus: {
    fontSize: 11,
    fontWeight: "900",
  },
  reviewQuestion: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "800",
    marginBottom: 13,
  },
  reviewAnswerLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 7,
    marginBottom: 4,
  },
  reviewCorrectAnswer: {
    color: COLORS.green,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "700",
  },
  reviewWrongAnswer: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 19,
  },
  reviewExplanation: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  secondaryButton: {
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
});
