import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  type TextStyle,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "vetrix_learning_progress";

const LESSON_TITLES = [
  "First Words",
  "Everyday Vocabulary",
  "Build Your First Sentence",
  "Real-Life Conversations",
  "Speak With Confidence",
];

const XP_REWARDS = [20, 30, 40, 50, 70];

type Word = {
  english: string;
  translated: string;
  pronunciation: string;
};

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

type LanguagePack = {
  name: string;
  greeting: string;
  subtitle: string;
  start: string;
  check: string;
  next: string;
  finish: string;
  retry: string;
  back: string;
  correct: string;
  incorrect: string;
  completed: string;
  lesson: string;
  question: string;
  score: string;
  xpEarned: string;
  alreadyCompleted: string;
  continueLearning: string;
  learnTitle: string;
  quizTitle: string;
  words: Word[];
  sentences: Word[];
};

const PACKS: Record<string, LanguagePack> = {
  English: {
    name: "English",
    greeting: "Hello!",
    subtitle: "Learn useful English words and phrases.",
    start: "Start Quiz",
    check: "Check Answer",
    next: "Next Question",
    finish: "Complete Lesson",
    retry: "Try Again",
    back: "Back to Lessons",
    correct: "Excellent! Correct answer.",
    incorrect: "Not quite. Review the correct answer below.",
    completed: "Lesson Completed!",
    lesson: "Lesson",
    question: "Question",
    score: "Your Score",
    xpEarned: "XP Earned",
    alreadyCompleted: "You have already earned XP for this lesson.",
    continueLearning: "Continue Learning",
    learnTitle: "Learn These Words",
    quizTitle: "Test Your Knowledge",
    words: [
      { english: "Hello", translated: "Hello", pronunciation: "heh-loh" },
      { english: "Thank you", translated: "Thank you", pronunciation: "thank-yoo" },
      { english: "Please", translated: "Please", pronunciation: "pleez" },
      { english: "Water", translated: "Water", pronunciation: "waw-ter" },
      { english: "Food", translated: "Food", pronunciation: "food" },
      { english: "Friend", translated: "Friend", pronunciation: "frend" },
    ],
    sentences: [
      { english: "How are you?", translated: "How are you?", pronunciation: "how ar yoo" },
      { english: "I am fine.", translated: "I am fine.", pronunciation: "ai am fain" },
      { english: "My name is...", translated: "My name is...", pronunciation: "mai naym iz" },
    ],
  },

  Tamil: {
    name: "Tamil",
    greeting: "வணக்கம்!",
    subtitle: "பயனுள்ள தமிழ் வார்த்தைகளையும் வாக்கியங்களையும் கற்றுக்கொள்ளுங்கள்.",
    start: "வினாடி வினாவைத் தொடங்கு",
    check: "பதிலைச் சரிபார்",
    next: "அடுத்த கேள்வி",
    finish: "பாடத்தை முடி",
    retry: "மீண்டும் முயற்சி செய்",
    back: "பாடங்களுக்குத் திரும்பு",
    correct: "அருமை! சரியான பதில்.",
    incorrect: "மீண்டும் முயற்சி செய். சரியான பதிலைக் கீழே பார்.",
    completed: "பாடம் முடிந்தது!",
    lesson: "பாடம்",
    question: "கேள்வி",
    score: "உங்கள் மதிப்பெண்",
    xpEarned: "பெற்ற XP",
    alreadyCompleted: "இந்தப் பாடத்திற்கான XP ஏற்கனவே கிடைத்துவிட்டது.",
    continueLearning: "தொடர்ந்து கற்கவும்",
    learnTitle: "இந்த வார்த்தைகளைக் கற்றுக்கொள்",
    quizTitle: "உங்கள் அறிவைச் சோதிக்கவும்",
    words: [
      { english: "Hello", translated: "வணக்கம்", pronunciation: "Vanakkam" },
      { english: "Thank you", translated: "நன்றி", pronunciation: "Nandri" },
      { english: "Please", translated: "தயவுசெய்து", pronunciation: "Thayavuseithu" },
      { english: "Water", translated: "தண்ணீர்", pronunciation: "Thanneer" },
      { english: "Food", translated: "உணவு", pronunciation: "Unavu" },
      { english: "Friend", translated: "நண்பர்", pronunciation: "Nanbar" },
    ],
    sentences: [
      { english: "How are you?", translated: "நீங்கள் எப்படி இருக்கிறீர்கள்?", pronunciation: "Neengal eppadi irukkireergal?" },
      { english: "I am fine.", translated: "நான் நலமாக இருக்கிறேன்.", pronunciation: "Naan nalamaga irukkiren." },
      { english: "My name is...", translated: "என் பெயர்...", pronunciation: "En peyar..." },
    ],
  },

  Arabic: {
    name: "Arabic",
    greeting: "مرحباً!",
    subtitle: "تعلّم كلمات وعبارات عربية مفيدة.",
    start: "ابدأ الاختبار",
    check: "تحقق من الإجابة",
    next: "السؤال التالي",
    finish: "أكمل الدرس",
    retry: "حاول مرة أخرى",
    back: "العودة إلى الدروس",
    correct: "ممتاز! إجابة صحيحة.",
    incorrect: "ليس تماماً. راجع الإجابة الصحيحة أدناه.",
    completed: "اكتمل الدرس!",
    lesson: "الدرس",
    question: "السؤال",
    score: "نتيجتك",
    xpEarned: "نقاط XP المكتسبة",
    alreadyCompleted: "لقد حصلت على نقاط هذا الدرس من قبل.",
    continueLearning: "تابع التعلّم",
    learnTitle: "تعلّم هذه الكلمات",
    quizTitle: "اختبر معلوماتك",
    words: [
      { english: "Hello", translated: "مرحباً", pronunciation: "Marhaban" },
      { english: "Thank you", translated: "شكراً", pronunciation: "Shukran" },
      { english: "Please", translated: "من فضلك", pronunciation: "Min fadlik" },
      { english: "Water", translated: "ماء", pronunciation: "Maa" },
      { english: "Food", translated: "طعام", pronunciation: "Ta'am" },
      { english: "Friend", translated: "صديق", pronunciation: "Sadeeq" },
    ],
    sentences: [
      { english: "How are you?", translated: "كيف حالك؟", pronunciation: "Kayfa haluk?" },
      { english: "I am fine.", translated: "أنا بخير.", pronunciation: "Ana bikhayr." },
      { english: "My name is...", translated: "اسمي...", pronunciation: "Ismi..." },
    ],
  },

  Hindi: {
    name: "Hindi",
    greeting: "नमस्ते!",
    subtitle: "उपयोगी हिंदी शब्द और वाक्य सीखें।",
    start: "क्विज़ शुरू करें",
    check: "उत्तर जाँचें",
    next: "अगला प्रश्न",
    finish: "पाठ पूरा करें",
    retry: "फिर कोशिश करें",
    back: "पाठों पर वापस जाएँ",
    correct: "बहुत बढ़िया! सही उत्तर।",
    incorrect: "पूरी तरह सही नहीं। नीचे सही उत्तर देखें।",
    completed: "पाठ पूरा हुआ!",
    lesson: "पाठ",
    question: "प्रश्न",
    score: "आपका स्कोर",
    xpEarned: "प्राप्त XP",
    alreadyCompleted: "आप इस पाठ के XP पहले ही प्राप्त कर चुके हैं।",
    continueLearning: "सीखना जारी रखें",
    learnTitle: "ये शब्द सीखें",
    quizTitle: "अपना ज्ञान जाँचें",
    words: [
      { english: "Hello", translated: "नमस्ते", pronunciation: "Namaste" },
      { english: "Thank you", translated: "धन्यवाद", pronunciation: "Dhanyavaad" },
      { english: "Please", translated: "कृपया", pronunciation: "Kripaya" },
      { english: "Water", translated: "पानी", pronunciation: "Paani" },
      { english: "Food", translated: "खाना", pronunciation: "Khaana" },
      { english: "Friend", translated: "दोस्त", pronunciation: "Dost" },
    ],
    sentences: [
      { english: "How are you?", translated: "आप कैसे हैं?", pronunciation: "Aap kaise hain?" },
      { english: "I am fine.", translated: "मैं ठीक हूँ।", pronunciation: "Main theek hoon." },
      { english: "My name is...", translated: "मेरा नाम... है।", pronunciation: "Mera naam... hai." },
    ],
  },

  Malayalam: {
    name: "Malayalam",
    greeting: "നമസ്കാരം!",
    subtitle: "പ്രയോജനകരമായ മലയാളം വാക്കുകളും വാക്യങ്ങളും പഠിക്കൂ.",
    start: "ക്വിസ് ആരംഭിക്കുക",
    check: "ഉത്തരം പരിശോധിക്കുക",
    next: "അടുത്ത ചോദ്യം",
    finish: "പാഠം പൂർത്തിയാക്കുക",
    retry: "വീണ്ടും ശ്രമിക്കുക",
    back: "പാഠങ്ങളിലേക്ക് മടങ്ങുക",
    correct: "മികച്ചത്! ശരിയായ ഉത്തരം.",
    incorrect: "ശരിയല്ല. താഴെയുള്ള ശരിയായ ഉത്തരം പരിശോധിക്കുക.",
    completed: "പാഠം പൂർത്തിയായി!",
    lesson: "പാഠം",
    question: "ചോദ്യം",
    score: "നിങ്ങളുടെ സ്കോർ",
    xpEarned: "നേടിയ XP",
    alreadyCompleted: "ഈ പാഠത്തിനുള്ള XP നിങ്ങൾക്ക് നേരത്തെ ലഭിച്ചിട്ടുണ്ട്.",
    continueLearning: "പഠനം തുടരുക",
    learnTitle: "ഈ വാക്കുകൾ പഠിക്കൂ",
    quizTitle: "നിങ്ങളുടെ അറിവ് പരിശോധിക്കൂ",
    words: [
      { english: "Hello", translated: "നമസ്കാരം", pronunciation: "Namaskaaram" },
      { english: "Thank you", translated: "നന്ദി", pronunciation: "Nandi" },
      { english: "Please", translated: "ദയവായി", pronunciation: "Dayavaayi" },
      { english: "Water", translated: "വെള്ളം", pronunciation: "Vellam" },
      { english: "Food", translated: "ഭക്ഷണം", pronunciation: "Bhakshanam" },
      { english: "Friend", translated: "സുഹൃത്ത്", pronunciation: "Suhruth" },
    ],
    sentences: [
      { english: "How are you?", translated: "സുഖമാണോ?", pronunciation: "Sukhamaano?" },
      { english: "I am fine.", translated: "എനിക്ക് സുഖമാണ്.", pronunciation: "Enikku sukhamaanu." },
      { english: "My name is...", translated: "എന്റെ പേര്...", pronunciation: "Ente peru..." },
    ],
  },

  Telugu: {
    name: "Telugu",
    greeting: "నమస్కారం!",
    subtitle: "ఉపయోగకరమైన తెలుగు పదాలు మరియు వాక్యాలు నేర్చుకోండి.",
    start: "క్విజ్ ప్రారంభించండి",
    check: "సమాధానాన్ని తనిఖీ చేయండి",
    next: "తదుపరి ప్రశ్న",
    finish: "పాఠాన్ని పూర్తి చేయండి",
    retry: "మళ్లీ ప్రయత్నించండి",
    back: "పాఠాలకు తిరిగి వెళ్లండి",
    correct: "చాలా బాగుంది! సరైన సమాధానం.",
    incorrect: "సరైన సమాధానం కాదు. కింద చూడండి.",
    completed: "పాఠం పూర్తయింది!",
    lesson: "పాఠం",
    question: "ప్రశ్న",
    score: "మీ స్కోరు",
    xpEarned: "పొందిన XP",
    alreadyCompleted: "ఈ పాఠానికి XP ఇప్పటికే పొందారు.",
    continueLearning: "నేర్చుకోవడం కొనసాగించండి",
    learnTitle: "ఈ పదాలను నేర్చుకోండి",
    quizTitle: "మీ జ్ఞానాన్ని పరీక్షించండి",
    words: [
      { english: "Hello", translated: "నమస్కారం", pronunciation: "Namaskaaram" },
      { english: "Thank you", translated: "ధన్యవాదాలు", pronunciation: "Dhanyavaadaalu" },
      { english: "Please", translated: "దయచేసి", pronunciation: "Dayachesi" },
      { english: "Water", translated: "నీళ్లు", pronunciation: "Neellu" },
      { english: "Food", translated: "ఆహారం", pronunciation: "Aahaaram" },
      { english: "Friend", translated: "స్నేహితుడు", pronunciation: "Snehithudu" },
    ],
    sentences: [
      { english: "How are you?", translated: "మీరు ఎలా ఉన్నారు?", pronunciation: "Meeru ela unnaru?" },
      { english: "I am fine.", translated: "నేను బాగున్నాను.", pronunciation: "Nenu baagunnanu." },
      { english: "My name is...", translated: "నా పేరు...", pronunciation: "Naa peru..." },
    ],
  },

  Urdu: {
    name: "Urdu",
    greeting: "السلام علیکم!",
    subtitle: "مفید اردو الفاظ اور جملے سیکھیں۔",
    start: "کوئز شروع کریں",
    check: "جواب چیک کریں",
    next: "اگلا سوال",
    finish: "سبق مکمل کریں",
    retry: "دوبارہ کوشش کریں",
    back: "اسباق پر واپس جائیں",
    correct: "بہت خوب! درست جواب۔",
    incorrect: "درست نہیں۔ نیچے صحیح جواب دیکھیں۔",
    completed: "سبق مکمل ہو گیا!",
    lesson: "سبق",
    question: "سوال",
    score: "آپ کا اسکور",
    xpEarned: "حاصل کردہ XP",
    alreadyCompleted: "آپ اس سبق کے XP پہلے ہی حاصل کر چکے ہیں۔",
    continueLearning: "سیکھنا جاری رکھیں",
    learnTitle: "یہ الفاظ سیکھیں",
    quizTitle: "اپنا علم آزمائیں",
    words: [
      { english: "Hello", translated: "سلام", pronunciation: "Salaam" },
      { english: "Thank you", translated: "شکریہ", pronunciation: "Shukriya" },
      { english: "Please", translated: "براہ کرم", pronunciation: "Bara-e-karam" },
      { english: "Water", translated: "پانی", pronunciation: "Paani" },
      { english: "Food", translated: "کھانا", pronunciation: "Khaana" },
      { english: "Friend", translated: "دوست", pronunciation: "Dost" },
    ],
    sentences: [
      { english: "How are you?", translated: "آپ کیسے ہیں؟", pronunciation: "Aap kaise hain?" },
      { english: "I am fine.", translated: "میں ٹھیک ہوں۔", pronunciation: "Main theek hoon." },
      { english: "My name is...", translated: "میرا نام... ہے۔", pronunciation: "Mera naam... hai." },
    ],
  },
};

function normalizeLanguage(value: unknown): string {
  const input = String(value ?? "English").trim().toLowerCase();

  const aliases: Record<string, string> = {
    english: "English",
    tamil: "Tamil",
    தமிழ்: "Tamil",
    arabic: "Arabic",
    العربية: "Arabic",
    hindi: "Hindi",
    हिंदी: "Hindi",
    malayalam: "Malayalam",
    മലയാളം: "Malayalam",
    telugu: "Telugu",
    తెలుగు: "Telugu",
    urdu: "Urdu",
    اردو: "Urdu",
  };

  return aliases[input] ?? "English";
}

function buildQuestions(
  pack: LanguagePack,
  lessonIndex: number
): Question[] {
  const words = pack.words;
  const questions: Question[] = [];

  if (lessonIndex === 0 || lessonIndex === 1) {
    const indices = lessonIndex === 0 ? [0, 1, 2] : [3, 4, 5];

    indices.forEach((wordIndex) => {
      const word = words[wordIndex];
      const wrongWords = words
        .filter((_, index) => index !== wordIndex)
        .slice(0, 2);

      const options = [
        word.translated,
        ...wrongWords.map((item) => item.translated),
      ];

      const shuffled = options
        .map((option) => ({ option, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((item) => item.option);

      questions.push({
        prompt: `What is "${word.english}" in ${pack.name}?`,
        options: shuffled,
        answer: shuffled.indexOf(word.translated),
        explanation: `${word.english} = ${word.translated} (${word.pronunciation})`,
      });
    });
  } else if (lessonIndex === 2) {
    pack.sentences.forEach((sentence) => {
      const options = [
        sentence.translated,
        ...pack.sentences
          .filter((item) => item !== sentence)
          .map((item) => item.translated),
      ];

      const shuffled = options
        .map((option) => ({ option, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((item) => item.option);

      questions.push({
        prompt: `Choose the ${pack.name} translation for "${sentence.english}"`,
        options: shuffled,
        answer: shuffled.indexOf(sentence.translated),
        explanation: `${sentence.english} = ${sentence.translated} (${sentence.pronunciation})`,
      });
    });
  } else {
    const indices = lessonIndex === 3 ? [0, 1, 2] : [0, 3, 5];

    indices.forEach((wordIndex) => {
      const word = words[wordIndex];
      const wrongWords = words
        .filter((_, index) => index !== wordIndex)
        .slice(0, 2);

      const options = [
        word.translated,
        ...wrongWords.map((item) => item.translated),
      ];

      const shuffled = options
        .map((option) => ({ option, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map((item) => item.option);

      questions.push({
        prompt:
          lessonIndex === 3
            ? `In this situation, which ${pack.name} word would you use for "${word.english}"?`
            : `Final review: What does "${word.english}" mean in ${pack.name}?`,
        options: shuffled,
        answer: shuffled.indexOf(word.translated),
        explanation: `${word.english} = ${word.translated} (${word.pronunciation})`,
      });
    });
  }

  return questions;
}

type ProgressData = {
  xp: number;
  completedLessons: string[];
  streak: number;
};

function getLocalDate(date = new Date()): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function LessonDetailScreen() {
  const params = useLocalSearchParams<{
    language?: string;
    title?: string;
    lessonIndex?: string;
    level?: string;
  }>();

  const language = normalizeLanguage(params.language);
  const pack = PACKS[language];

  const parsedIndex = Number(params.lessonIndex ?? 0);
  const lessonIndex = Number.isFinite(parsedIndex)
    ? Math.max(0, Math.min(4, parsedIndex))
    : 0;

  const title =
    String(params.title ?? "").trim() || LESSON_TITLES[lessonIndex];

  const lessonId = `${language}:${lessonIndex}`;
  const reward = XP_REWARDS[lessonIndex];
  const isRTL = language === "Arabic" || language === "Urdu";

  const questions = useMemo(
    () => buildQuestions(pack, lessonIndex),
    [language, lessonIndex]
  );

  const [quizStarted, setQuizStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finished, setFinished] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState<ProgressData>({
    xp: 0,
    completedLessons: [],
    streak: 0,
  });

  // Prevent duplicate save attempts during the same screen session.
  const savingRef = useRef(false);
  const completionAttemptedRef = useRef(false);

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    let mounted = true;

    async function loadProgress() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : {};

        const safeProgress: ProgressData = {
          xp: Math.max(0, Number(parsed.xp) || 0),
          completedLessons: Array.isArray(parsed.completedLessons)
            ? parsed.completedLessons.filter(
                (item: unknown): item is string =>
                  typeof item === "string"
              )
            : [],
          streak: Math.max(0, Number(parsed.streak) || 0),
        };

        if (mounted) {
          setProgress(safeProgress);
          setAlreadyCompleted(
            safeProgress.completedLessons.includes(lessonId)
          );
        }
      } catch (error) {
        console.warn("Could not load VETRIX progress:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      mounted = false;
    };
  }, [lessonId]);

  const handleCheckAnswer = () => {
    if (selectedAnswer === null || answerChecked || !currentQuestion) return;

    setAnswerChecked(true);

    if (selectedAnswer === currentQuestion.answer) {
      setCorrectAnswers((previous) => previous + 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((previous) => previous + 1);
      setSelectedAnswer(null);
      setAnswerChecked(false);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerChecked(false);
    setCorrectAnswers(0);
    setFinished(false);
    setQuizStarted(true);
    setEarnedXP(0);
    completionAttemptedRef.current = false;
  };

  const saveCompletion = async () => {
    if (savingRef.current || completionAttemptedRef.current) return;

    savingRef.current = true;
    setSaving(true);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};

      const existingCompleted: string[] = Array.isArray(
        parsed.completedLessons
      )
        ? parsed.completedLessons.filter(
            (item: unknown): item is string =>
              typeof item === "string"
          )
        : [];

      const alreadySaved = existingCompleted.includes(lessonId);

      const nextCompleted = alreadySaved
        ? existingCompleted
        : [...existingCompleted, lessonId];

      // XP is awarded only once for this lesson.
      const previousXP = Math.max(0, Number(parsed.xp) || 0);
      const nextXP = previousXP + (alreadySaved ? 0 : reward);

      const now = new Date();
      const today = getLocalDate(now);

      const oldDates: string[] = Array.isArray(parsed.activeDates)
        ? parsed.activeDates.filter(
            (date: unknown): date is string =>
              typeof date === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(date)
          )
        : [];

      // Unique calendar dates prevent duplicate day counting.
      const activeDates = Array.from(
        new Set([...oldDates, today])
      ).sort();

      const yesterdayDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );

      const yesterday = getLocalDate(yesterdayDate);

      const previousDate =
        typeof parsed.lastLearningDate === "string"
          ? parsed.lastLearningDate
          : typeof parsed.lastActiveDate === "string"
          ? parsed.lastActiveDate
          : "";

      const previousStreak = Math.max(0, Number(parsed.streak) || 0);

      let nextStreak: number;

      if (previousDate === today) {
        // Learning more lessons today does not add another streak day.
        nextStreak = Math.max(1, previousStreak);
      } else if (previousDate === yesterday) {
        nextStreak = previousStreak + 1;
      } else {
        nextStreak = 1;
      }

      const storedDayCount = Number(
        parsed.dayCount ?? parsed.learningDays
      );

      const previousDayCount = Math.max(
        0,
        Number.isFinite(storedDayCount) ? storedDayCount : 0
      );

      const isNewLearningDay = previousDate !== today;

      const nextDayCount = isNewLearningDay
        ? previousDayCount + 1
        : Math.max(1, previousDayCount);

      // Keep historical progress instead of reducing it.
      const correctedDayCount = Math.max(
        nextDayCount,
        activeDates.length
      );

      const nextProgress = {
        ...parsed,
        xp: nextXP,
        completedLessons: nextCompleted,
        streak: nextStreak,
        activeDates,
        lastLearningDate: today,
        lastActiveDate: today,
        dayCount: correctedDayCount,
        learningDays: correctedDayCount,
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextProgress)
      );

      completionAttemptedRef.current = true;

      setProgress({
        xp: nextXP,
        completedLessons: nextCompleted,
        streak: nextStreak,
      });

      setAlreadyCompleted(alreadySaved);
      setEarnedXP(alreadySaved ? 0 : reward);
    } catch (error) {
      console.error("Could not save VETRIX progress:", error);

      Alert.alert(
        "Save failed",
        "Your progress could not be saved. Please try again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  useEffect(() => {
    if (
      finished &&
      !loading &&
      !alreadyCompleted &&
      !completionAttemptedRef.current
    ) {
      saveCompletion();
    }
    // saveCompletion uses refs to prevent duplicate saves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, loading, alreadyCompleted]);

  const handleBackToLessons = () => {
    router.replace({
      pathname: "/lessons",
      params: { language },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B7CFF" />
          <Text style={styles.loadingText}>Loading your lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToLessons}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarLabel}>{pack.name}</Text>
            <Text style={styles.topBarSubLabel}>
              {pack.lesson} {lessonIndex + 1} of 5
            </Text>
          </View>

          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>⚡ {progress.xp} XP</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>
              {["👋", "📚", "💬", "🌍", "🚀"][lessonIndex]}
            </Text>
          </View>

          <Text style={styles.heroEyebrow}>
            {pack.lesson.toUpperCase()} {lessonIndex + 1}
          </Text>

          <Text
            style={[styles.heroTitle, isRTL && styles.rtlText]}
            {...(isRTL ? { writingDirection: "rtl" as const } : {})}
          >
            {title}
          </Text>

          <Text
            style={[styles.heroDescription, isRTL && styles.rtlText]}
            {...(isRTL ? { writingDirection: "rtl" as const } : {})}
          >
            {pack.subtitle}
          </Text>

          <View style={styles.rewardRow}>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>⚡ +{reward} XP</Text>
            </View>
            <Text style={styles.rewardHint}>
              Complete the lesson to earn XP
            </Text>
          </View>
        </View>

        {!quizStarted && !finished && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{pack.learnTitle}</Text>
              <Text style={styles.sectionSubtitle}>
                Read each word and practise saying it aloud.
              </Text>
            </View>

            {lessonIndex === 2 ? (
              pack.sentences.map((item, index) => (
                <View key={`${item.english}-${index}`} style={styles.wordCard}>
                  <View style={styles.wordNumber}>
                    <Text style={styles.wordNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.wordContent}>
                    <Text style={styles.englishWord}>{item.english}</Text>
                    <Text
                      style={[styles.translatedWord, isRTL && styles.rtlText]}
                      {...(isRTL ? { writingDirection: "rtl" as const } : {})}
                    >
                      {item.translated}
                    </Text>
                    <Text style={styles.pronunciation}>
                      {item.pronunciation}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              pack.words
                .slice(lessonIndex === 1 ? 3 : 0, lessonIndex === 1 ? 6 : 3)
                .map((item, index) => (
                  <View
                    key={`${item.english}-${index}`}
                    style={styles.wordCard}
                  >
                    <View style={styles.wordNumber}>
                      <Text style={styles.wordNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.wordContent}>
                      <Text style={styles.englishWord}>{item.english}</Text>
                      <Text
                        style={[styles.translatedWord, isRTL && styles.rtlText]}
                        {...(isRTL ? { writingDirection: "rtl" as const } : {})}
                      >
                        {item.translated}
                      </Text>
                      <Text style={styles.pronunciation}>
                        {item.pronunciation}
                      </Text>
                    </View>
                  </View>
                ))
            )}

            <View style={styles.tipCard}>
              <Text style={styles.tipEmoji}>💡</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Learning tip</Text>
                <Text style={styles.tipText}>
                  Read the word, say it aloud, and think of a situation where
                  you could use it.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setQuizStarted(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{pack.start} →</Text>
            </TouchableOpacity>
          </>
        )}

        {quizStarted && !finished && currentQuestion && (
          <View style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <Text style={styles.quizLabel}>{pack.quizTitle}</Text>
              <Text style={styles.questionCount}>
                {questionIndex + 1}/{questions.length}
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.questionLabel}>
              {pack.question} {questionIndex + 1}
            </Text>

            <Text
              style={[styles.questionText, isRTL && styles.rtlText]}
              {...(isRTL ? { writingDirection: "rtl" as const } : {})}
            >
              {currentQuestion.prompt}
            </Text>

            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.answer;

              let optionStyle = styles.optionButton;
let optionTextStyle: TextStyle = styles.optionText;

if (answerChecked && isCorrect) {
  optionStyle = styles.optionCorrect;
  optionTextStyle = styles.optionTextCorrect;
} else if (answerChecked && isSelected && !isCorrect) {
  optionStyle = styles.optionIncorrect;
  optionTextStyle = styles.optionTextIncorrect;
} else if (isSelected) {
  optionStyle = styles.optionSelected;
  optionTextStyle = styles.optionTextSelected;
}
              return (
                <TouchableOpacity
                  key={`${option}-${index}`}
                  style={optionStyle}
                  onPress={() => {
                    if (!answerChecked) setSelectedAnswer(index);
                  }}
                  activeOpacity={0.8}
                  disabled={answerChecked}
                >
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>

                  <Text
                    style={[optionTextStyle, isRTL && styles.rtlText]}
                    {...(isRTL ? { writingDirection: "rtl" as const } : {})}
                  >
                    {option}
                  </Text>

                  {answerChecked && isCorrect && (
                    <Text style={styles.optionIcon}>✓</Text>
                  )}
                  {answerChecked && isSelected && !isCorrect && (
                    <Text style={styles.optionIcon}>✕</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {answerChecked && (
              <View
                style={[
                  styles.feedbackCard,
                  selectedAnswer === currentQuestion.answer
                    ? styles.feedbackCorrect
                    : styles.feedbackIncorrect,
                ]}
              >
                <Text style={styles.feedbackTitle}>
                  {selectedAnswer === currentQuestion.answer
                    ? pack.correct
                    : pack.incorrect}
                </Text>
                <Text
                  style={[styles.feedbackText, isRTL && styles.rtlText]}
                  {...(isRTL ? { writingDirection: "rtl" as const } : {})}
                >
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}

            {!answerChecked ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  selectedAnswer === null && styles.disabledButton,
                ]}
                onPress={handleCheckAnswer}
                disabled={selectedAnswer === null}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>{pack.check}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNextQuestion}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryButtonText}>
                  {questionIndex === questions.length - 1
                    ? pack.finish
                    : pack.next}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {finished && (
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Text style={styles.completionEmoji}>🎉</Text>
            </View>

            <Text
              style={[styles.completionTitle, isRTL && styles.rtlText]}
              {...(isRTL ? { writingDirection: "rtl" as const } : {})}
            >
              {pack.completed}
            </Text>

            <Text style={styles.completionDescription}>{title}</Text>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>{pack.score}</Text>
              <Text style={styles.scoreValue}>
                {correctAnswers}/{questions.length}
              </Text>
              <View style={styles.scoreTrack}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${(correctAnswers / questions.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.completionStats}>
              <View style={styles.completionStat}>
                <Text style={styles.statEmoji}>⚡</Text>
                <Text style={styles.statValue}>
                  {saving ? "..." : `+${earnedXP}`}
                </Text>
                <Text style={styles.statLabel}>{pack.xpEarned}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.completionStat}>
                <Text style={styles.statEmoji}>📚</Text>
                <Text style={styles.statValue}>
                  {progress.completedLessons.length}/5
                </Text>
                <Text style={styles.statLabel}>Lessons done</Text>
              </View>
            </View>

            {saving && (
              <ActivityIndicator
                color="#8B7CFF"
                style={styles.savingIndicator}
              />
            )}

            {!saving && alreadyCompleted && (
              <Text style={styles.alreadyCompletedText}>
                {pack.alreadyCompleted}
              </Text>
            )}

            {!saving && (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleBackToLessons}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>
                    {pack.continueLearning} →
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleRetry}
                  activeOpacity={0.85}
                >
                  <Text style={styles.secondaryButtonText}>
                    ↻ {pack.retry}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <Text style={styles.footerText}>
          VETRIX · Learn something new every day ✨
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080B16",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 36,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#080B16",
  },
  loadingText: {
    color: "#A7ADC4",
    fontSize: 14,
    marginTop: 14,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#151A2B",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#252B42",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 34,
    marginTop: -3,
  },
  topBarCenter: {
    flex: 1,
  },
  topBarLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  topBarSubLabel: {
    color: "#929AB5",
    fontSize: 11,
    marginTop: 3,
  },
  xpPill: {
    backgroundColor: "#211C3D",
    borderWidth: 1,
    borderColor: "#49406E",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
  },
  xpPillText: {
    color: "#D9D0FF",
    fontWeight: "800",
    fontSize: 12,
  },
  heroCard: {
    backgroundColor: "#12182A",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#292E49",
    marginBottom: 28,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: "#282343",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroEmoji: {
    fontSize: 29,
  },
  heroEyebrow: {
    color: "#A69AFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 9,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 10,
  },
  heroDescription: {
    color: "#A5ACC3",
    fontSize: 13,
    lineHeight: 21,
  },
  rewardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  rewardBadge: {
    backgroundColor: "#263421",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rewardText: {
    color: "#B8F29C",
    fontSize: 12,
    fontWeight: "900",
  },
  rewardHint: {
    color: "#929AB5",
    fontSize: 10,
    flexShrink: 1,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: "#929AB5",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  wordCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "#111728",
    borderWidth: 1,
    borderColor: "#242B40",
    borderRadius: 17,
    padding: 15,
    marginBottom: 11,
  },
  wordNumber: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#25213F",
    alignItems: "center",
    justifyContent: "center",
  },
  wordNumberText: {
    color: "#C7BDFF",
    fontSize: 13,
    fontWeight: "900",
  },
  wordContent: {
    flex: 1,
  },
  englishWord: {
    color: "#A5ACC3",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  translatedWord: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 4,
  },
  pronunciation: {
    color: "#A69AFF",
    fontSize: 11,
    fontStyle: "italic",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#172332",
    borderWidth: 1,
    borderColor: "#2A4052",
    padding: 15,
    borderRadius: 17,
    marginTop: 7,
    marginBottom: 20,
  },
  tipEmoji: {
    fontSize: 23,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: "#C4E8FF",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 5,
  },
  tipText: {
    color: "#A5B8C8",
    fontSize: 12,
    lineHeight: 19,
  },
  primaryButton: {
    backgroundColor: "#8B7CFF",
    borderRadius: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 5,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.45,
  },
  quizCard: {
    backgroundColor: "#111728",
    borderWidth: 1,
    borderColor: "#282E46",
    borderRadius: 23,
    padding: 19,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  quizLabel: {
    color: "#A69AFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  questionCount: {
    color: "#A8AEC4",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#292F45",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B7CFF",
    borderRadius: 20,
  },
  questionLabel: {
    color: "#8D95B0",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 9,
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 20,
    lineHeight: 29,
    fontWeight: "800",
    marginBottom: 21,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171E31",
    borderWidth: 1,
    borderColor: "#2A314A",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 11,
    gap: 11,
    minHeight: 55,
  },
  optionSelected: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292442",
    borderWidth: 1,
    borderColor: "#8B7CFF",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 11,
    gap: 11,
    minHeight: 55,
  },
  optionCorrect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#173329",
    borderWidth: 1,
    borderColor: "#45C990",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 11,
    gap: 11,
    minHeight: 55,
  },
  optionIncorrect: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A202B",
    borderWidth: 1,
    borderColor: "#F16D82",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 11,
    gap: 11,
    minHeight: 55,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#292F45",
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: {
    color: "#C5CBE0",
    fontSize: 11,
    fontWeight: "900",
  },
  optionText: {
    flex: 1,
    color: "#D9DDED",
    fontSize: 14,
    fontWeight: "600",
  },
  optionTextSelected: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  optionTextCorrect: {
    flex: 1,
    color: "#B9F5D6",
    fontSize: 14,
    fontWeight: "800",
  },
  optionTextIncorrect: {
    flex: 1,
    color: "#FFC0CB",
    fontSize: 14,
    fontWeight: "800",
  },
  optionIcon: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },
  feedbackCard: {
    borderRadius: 14,
    padding: 14,
    marginTop: 5,
    marginBottom: 14,
  },
  feedbackCorrect: {
    backgroundColor: "#173329",
    borderWidth: 1,
    borderColor: "#315F4B",
  },
  feedbackIncorrect: {
    backgroundColor: "#35212C",
    borderWidth: 1,
    borderColor: "#6B3546",
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
    marginBottom: 6,
  },
  feedbackText: {
    color: "#D5D9E8",
    fontSize: 12,
    lineHeight: 19,
  },
  completionCard: {
    backgroundColor: "#111728",
    borderWidth: 1,
    borderColor: "#292F47",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
  },
  completionIcon: {
    width: 83,
    height: 83,
    borderRadius: 28,
    backgroundColor: "#282343",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },
  completionEmoji: {
    fontSize: 42,
  },
  completionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  completionDescription: {
    color: "#A5ACC3",
    fontSize: 13,
    marginTop: 7,
    marginBottom: 22,
    textAlign: "center",
  },
  scoreCard: {
    width: "100%",
    backgroundColor: "#171E31",
    borderRadius: 17,
    padding: 17,
    alignItems: "center",
    marginBottom: 14,
  },
  scoreLabel: {
    color: "#A4ABC1",
    fontSize: 12,
    fontWeight: "700",
  },
  scoreValue: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginVertical: 7,
  },
  scoreTrack: {
    width: "100%",
    height: 7,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#30364C",
    marginTop: 4,
  },
  scoreFill: {
    height: "100%",
    backgroundColor: "#45C990",
    borderRadius: 20,
  },
  completionStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    backgroundColor: "#171E31",
    borderRadius: 17,
    paddingVertical: 18,
    marginBottom: 15,
  },
  completionStat: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  statEmoji: {
    fontSize: 21,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#929AB5",
    fontSize: 10,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 45,
    backgroundColor: "#30364C",
  },
  savingIndicator: {
    marginVertical: 12,
  },
  alreadyCompletedText: {
    color: "#E7D79B",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#1B2237",
    borderWidth: 1,
    borderColor: "#333B56",
    borderRadius: 15,
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 12,
    width: "100%",
  },
  secondaryButtonText: {
    color: "#D9DDED",
    fontSize: 13,
    fontWeight: "800",
  },
  rtlText: {
    textAlign: "right",
    writingDirection: "rtl",
  },
  footerText: {
    color: "#59617B",
    fontSize: 10,
    textAlign: "center",
    marginTop: 25,
  },
});
