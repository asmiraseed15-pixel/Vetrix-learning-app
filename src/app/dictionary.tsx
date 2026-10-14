import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { router } from "expo-router";

const BLUE = "#126EED";
const BG = "#050816";
const CARD = "#101A30";
const BORDER = "#253452";
const MUTED = "#94A3B8";
const WHITE = "#F8FAFC";

const DICTIONARY_API = "https://freedictionaryapi.com/api/v1/entries/en/";
const TRANSLATION_API = "https://api.mymemory.translated.net/get";

type LanguageCode = "ta" | "hi" | "ar" | "ml" | "te" | "ur";

type Language = {
  code: LanguageCode;
  name: string;
  nativeName: string;
};

type WordData = {
  definition: string;
  example: string;
  translations: Partial<Record<LanguageCode, string>>;
};

type WordInfo = {
  word: string;
  phonetic: string;
  audio: string;
  definition: string;
  example: string;
};

const LANGUAGES: Language[] = [
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

const COMMON_WORDS: Record<string, WordData> = {
  hello: {
    definition: "A greeting used when meeting someone.",
    example: "Hello, how are you?",
    translations: {
      ta: "வணக்கம்",
      hi: "नमस्ते",
      ar: "مرحبا",
      ml: "നമസ്കാരം",
      te: "నమస్కారం",
      ur: "سلام",
    },
  },
  happy: {
    definition: "Feeling or showing pleasure and joy.",
    example: "I am happy today.",
    translations: {
      ta: "மகிழ்ச்சியாக",
      hi: "खुश",
      ar: "سعيد",
      ml: "സന്തോഷം",
      te: "సంతోషంగా",
      ur: "خوش",
    },
  },
  sad: {
    definition: "Feeling unhappy or showing sorrow.",
    example: "She felt sad after hearing the news.",
    translations: {
      ta: "சோகமாக",
      hi: "उदास",
      ar: "حزين",
      ml: "ദുഃഖം",
      te: "విచారంగా",
      ur: "اداس",
    },
  },
  outside: {
    definition: "In or to a place that is not inside a building.",
    example: "The children are playing outside.",
    translations: {
      ta: "வெளியே",
      hi: "बाहर",
      ar: "في الخارج",
      ml: "പുറത്ത്",
      te: "బయట",
      ur: "باہر",
    },
  },
  courage: {
    definition: "The ability to face fear or difficulty bravely.",
    example: "She showed courage during the challenge.",
    translations: {
      ta: "தைரியம்",
      hi: "साहस",
      ar: "شجاعة",
      ml: "ധൈര്യം",
      te: "ధైర్యం",
      ur: "ہمت",
    },
  },
  knowledge: {
    definition: "Information and understanding gained through learning.",
    example: "Reading increases our knowledge.",
    translations: {
      ta: "அறிவு",
      hi: "ज्ञान",
      ar: "معرفة",
      ml: "അറിവ്",
      te: "జ్ఞానం",
      ur: "علم",
    },
  },
  beautiful: {
    definition: "Pleasing to look at; attractive or lovely.",
    example: "The garden is beautiful.",
    translations: {
      ta: "அழகான",
      hi: "सुंदर",
      ar: "جميل",
      ml: "സുന്ദരം",
      te: "అందమైన",
      ur: "خوبصورت",
    },
  },
  life: {
    definition: "The condition of being alive or the experience of living.",
    example: "Life is full of opportunities.",
    translations: {
      ta: "வாழ்க்கை",
      hi: "जीवन",
      ar: "حياة",
      ml: "ജീവിതം",
      te: "జీవితం",
      ur: "زندگی",
    },
  },
  love: {
    definition: "A strong feeling of affection or deep attachment.",
    example: "I love my family.",
    translations: {
      ta: "அன்பு",
      hi: "प्यार",
      ar: "حب",
      ml: "സ്നേഹം",
      te: "ప్రేమ",
      ur: "محبت",
    },
  },
  book: {
    definition: "A set of written or printed pages bound together.",
    example: "I am reading a book.",
    translations: {
      ta: "புத்தகம்",
      hi: "किताब",
      ar: "كتاب",
      ml: "പുസ്തകം",
      te: "పుస్తకం",
      ur: "کتاب",
    },
  },
  water: {
    definition: "A clear liquid that people need to survive.",
    example: "Please drink some water.",
    translations: {
      ta: "தண்ணீர்",
      hi: "पानी",
      ar: "ماء",
      ml: "വെള്ളം",
      te: "నీరు",
      ur: "پانی",
    },
  },
  friend: {
    definition: "A person whom you know, like, and trust.",
    example: "My friend helped me.",
    translations: {
      ta: "நண்பர்",
      hi: "दोस्त",
      ar: "صديق",
      ml: "സുഹൃത്ത്",
      te: "స్నేహితుడు",
      ur: "دوست",
    },
  },
  school: {
    definition: "A place where students go to learn.",
    example: "I go to school every day.",
    translations: {
      ta: "பள்ளி",
      hi: "विद्यालय",
      ar: "مدرسة",
      ml: "സ്കൂൾ",
      te: "పాఠశాల",
      ur: "اسکول",
    },
  },
  learn: {
    definition: "To gain knowledge or a skill through study or practice.",
    example: "I want to learn Python.",
    translations: {
      ta: "கற்றுக்கொள்",
      hi: "सीखना",
      ar: "يتعلم",
      ml: "പഠിക്കുക",
      te: "నేర్చుకోవడం",
      ur: "سیکھنا",
    },
  },
  success: {
    definition: "The achievement of a desired aim or result.",
    example: "Hard work can lead to success.",
    translations: {
      ta: "வெற்றி",
      hi: "सफलता",
      ar: "نجاح",
      ml: "വിജയം",
      te: "విజయం",
      ur: "کامیابی",
    },
  },
  strong: {
    definition: "Having great physical power or mental strength.",
    example: "She is a strong person.",
    translations: {
      ta: "வலிமையான",
      hi: "मजबूत",
      ar: "قوي",
      ml: "ശക്തമായ",
      te: "బలమైన",
      ur: "مضبوط",
    },
  },
  dream: {
    definition: "Thoughts during sleep or a hope for the future.",
    example: "My dream is to become a developer.",
    translations: {
      ta: "கனவு",
      hi: "सपना",
      ar: "حلم",
      ml: "സ്വപ്നം",
      te: "కల",
      ur: "خواب",
    },
  },
  family: {
    definition: "A group of people related to one another.",
    example: "I spend time with my family.",
    translations: {
      ta: "குடும்பம்",
      hi: "परिवार",
      ar: "عائلة",
      ml: "കുടുംബം",
      te: "కుటుంబం",
      ur: "خاندان",
    },
  },
  kind: {
    definition: "Friendly, caring, and helpful towards other people.",
    example: "Be kind to everyone.",
    translations: {
      ta: "அன்பான",
      hi: "दयालु",
      ar: "لطيف",
      ml: "ദയയുള്ള",
      te: "దయగల",
      ur: "مہربان",
    },
  },
  peace: {
    definition: "A state of calm and freedom from conflict.",
    example: "Everyone hopes for peace.",
    translations: {
      ta: "அமைதி",
      hi: "शांति",
      ar: "سلام",
      ml: "സമാധാനം",
      te: "శాంతి",
      ur: "امن",
    },
  },
  time: {
    definition: "The continued progress of existence in which events happen.",
    example: "Time is valuable.",
    translations: {
      ta: "நேரம்",
      hi: "समय",
      ar: "وقت",
      ml: "സമയം",
      te: "సమయం",
      ur: "وقت",
    },
  },
};

const EXAMPLE_WORDS = [
  "Hello",
  "Happy",
  "Sad",
  "Outside",
  "Courage",
  "Knowledge",
  "Beautiful",
];

function normalizeWord(value: string) {
  return value.trim().toLowerCase();
}

async function fetchWithTimeout(
  url: string,
  timeoutMs = 20000
): Promise<Response> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        "The request timed out. Please try again or check your internet connection."
      );
    }

    throw new Error(
      "Cannot connect to the service. Check your internet connection and try again."
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getEnglishMeaning(word: string): Promise<WordInfo> {
  const normalized = normalizeWord(word);
  const local = COMMON_WORDS[normalized];

  if (local) {
    return {
      word: normalized,
      phonetic: "",
      audio: "",
      definition: local.definition,
      example: local.example,
    };
  }

  const url = `${DICTIONARY_API}${encodeURIComponent(normalized)}`;
  const response = await fetchWithTimeout(url, 20000);

  if (response.status === 404) {
    throw new Error(
      "Word not found. Check the spelling or try another English word."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Dictionary service error (${response.status}). Please try again later.`
    );
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error("The dictionary returned invalid data.");
  }

  const entries = Array.isArray(data?.entries) ? data.entries : [];

  if (entries.length === 0) {
    throw new Error(
      "No definition found. Please check the spelling and try again."
    );
  }

  let definition = "";
  let example = "";
  let audio = "";
  const pronunciations: string[] = [];

  for (const entry of entries) {
    for (const pronunciation of entry.pronunciations || []) {
      const pronunciationText = pronunciation?.text || "";

      if (
        pronunciationText &&
        !pronunciations.includes(pronunciationText)
      ) {
        pronunciations.push(pronunciationText);
      }

      if (!audio && pronunciation?.audio) {
        audio = pronunciation.audio;
      }
    }

    for (const sense of entry.senses || []) {
      if (!definition && sense?.definition) {
        definition = sense.definition;
      }

      const examples = Array.isArray(sense?.examples)
        ? sense.examples
        : [];

      for (const item of examples) {
        if (!example && typeof item === "string") {
          example = item;
        } else if (
          !example &&
          typeof item === "object" &&
          item?.text
        ) {
          example = item.text;
        }
      }
    }

    if (definition && example && audio) {
      break;
    }
  }

  if (!definition) {
    throw new Error(
      "A definition is not available for this word right now."
    );
  }

  return {
    word: data.word || normalized,
    phonetic: pronunciations.join(", "),
    audio,
    definition,
    example,
  };
}

async function translateMeaning(
  word: string,
  languageCode: LanguageCode,
  definition: string
): Promise<string> {
  const normalized = normalizeWord(word);
  const local = COMMON_WORDS[normalized];

  if (local?.translations[languageCode]) {
    return local.translations[languageCode]!;
  }

  const params = new URLSearchParams({
    q: definition,
    langpair: `en|${languageCode}`,
  });

  const url = `${TRANSLATION_API}?${params.toString()}`;
  const response = await fetchWithTimeout(url, 20000);

  if (!response.ok) {
    throw new Error(
      `Translation service error (${response.status}).`
    );
  }

  let data: any;

  try {
    data = await response.json();
  } catch {
    throw new Error("The translation service returned invalid data.");
  }

  const translated = data?.responseData?.translatedText;

  if (!translated || Number(data?.responseStatus) !== 200) {
    throw new Error(
      "Translation is not available right now. Please try again."
    );
  }

  return String(translated)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export default function DictionaryScreen() {
  const [searchText, setSearchText] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>("ta");
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [translatedMeaning, setTranslatedMeaning] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [error, setError] = useState("");
  const [translationError, setTranslationError] = useState("");

  const selectedLanguageInfo = LANGUAGES.find(
    (language) => language.code === selectedLanguage
  )!;

  const searchWord = async (input?: string) => {
    const word = normalizeWord(input ?? searchText);

    if (!word) {
      Alert.alert("Enter a word", "Please type an English word.");
      return;
    }

    if (/\s/.test(word)) {
      Alert.alert(
        "One word at a time",
        "Please search for one English word at a time."
      );
      return;
    }

    setSearchText(word);
    setLoading(true);
    setError("");
    setTranslationError("");
    setWordInfo(null);
    setTranslatedMeaning("");

    try {
      const info = await getEnglishMeaning(word);

      setWordInfo(info);
      setHistory((previous) =>
        [info.word, ...previous.filter((item) => item !== info.word)].slice(
          0,
          10
        )
      );

      setTranslationLoading(true);

      try {
        const translation = await translateMeaning(
          info.word,
          selectedLanguage,
          info.definition
        );

        setTranslatedMeaning(translation);
      } catch (err: any) {
        console.log("Translation error:", err);
        setTranslationError(
          err?.message || "Translation is temporarily unavailable."
        );
      } finally {
        setTranslationLoading(false);
      }
    } catch (err: any) {
      console.log("Dictionary search error:", err);
      setError(
        err?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (languageCode: LanguageCode) => {
    setSelectedLanguage(languageCode);
    setTranslatedMeaning("");
    setTranslationError("");

    if (!wordInfo) return;

    const local = COMMON_WORDS[normalizeWord(wordInfo.word)];

    if (local?.translations[languageCode]) {
      setTranslatedMeaning(local.translations[languageCode]!);
      return;
    }

    setTranslationLoading(true);

    try {
      const translation = await translateMeaning(
        wordInfo.word,
        languageCode,
        wordInfo.definition
      );

      setTranslatedMeaning(translation);
    } catch (err: any) {
      setTranslationError(
        err?.message || "Translation is temporarily unavailable."
      );
    } finally {
      setTranslationLoading(false);
    }
  };

  const playPronunciation = async () => {
    if (!wordInfo?.audio) {
      Alert.alert(
        "Audio unavailable",
        "Pronunciation audio is not available for this word."
      );
      return;
    }

    try {
      await Linking.openURL(wordInfo.audio);
    } catch {
      Alert.alert(
        "Audio error",
        "Could not open pronunciation audio."
      );
    }
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={goBack}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>‹  Back</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>V</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.brand}>VETRIX</Text>
            <Text style={styles.subtitle}>SMART DICTIONARY</Text>
          </View>

          <View style={styles.languageBadge}>
            <Text style={styles.languageBadgeText}>
              {selectedLanguageInfo.nativeName}
            </Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>LEARN SOMETHING NEW</Text>
          <Text style={styles.heroTitle}>
            Discover the{"\n"}
            <Text style={styles.highlight}>meaning of words.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Search an English word and understand its meaning in your language.
          </Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.inputLabel}>ENGLISH WORD</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter a word..."
              placeholderTextColor="#718096"
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={() => searchWord()}
            />

            <TouchableOpacity
              style={[
                styles.searchButton,
                loading && styles.disabledButton,
              ]}
              onPress={() => searchWord()}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={styles.searchButtonText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.searchHint}>
            Try: hello, happy, courage, outside
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your language</Text>
          <Text style={styles.sectionDescription}>
            Select the language you want to understand.
          </Text>

          <View style={styles.languageGrid}>
            {LANGUAGES.map((language) => {
              const active = selectedLanguage === language.code;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    active && styles.languageItemActive,
                  ]}
                  onPress={() => changeLanguage(language.code)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.languageNative,
                      active && styles.languageNativeActive,
                    ]}
                  >
                    {language.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.languageName,
                      active && styles.languageNameActive,
                    ]}
                  >
                    {language.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!!error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Dictionary unavailable</Text>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => searchWord()}
              disabled={loading}
            >
              <Text style={styles.tryAgainText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {wordInfo && (
          <View style={styles.resultSection}>
            <View style={styles.resultHeader}>
              <Text style={styles.sectionTitle}>Word result</Text>
              <View style={styles.foundBadge}>
                <Text style={styles.foundBadgeText}>FOUND</Text>
              </View>
            </View>

            <View style={styles.wordCard}>
              <View style={styles.wordTopRow}>
                <View style={styles.wordTextArea}>
                  <Text style={styles.wordTitle}>{wordInfo.word}</Text>

                  {!!wordInfo.phonetic && (
                    <Text style={styles.phonetic}>
                      {wordInfo.phonetic}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={playPronunciation}
                >
                  <Text style={styles.audioIcon}>🔊</Text>
                  <Text style={styles.audioLabel}>Listen</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />
              <Text style={styles.cardLabel}>ENGLISH MEANING</Text>
              <Text style={styles.definition}>{wordInfo.definition}</Text>

              {!!wordInfo.example && (
                <View style={styles.exampleBox}>
                  <Text style={styles.cardLabel}>EXAMPLE SENTENCE</Text>
                  <Text style={styles.exampleText}>
                    “{wordInfo.example}”
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.translationCard}>
              <View style={styles.translationHeader}>
                <View>
                  <Text style={styles.cardLabel}>MEANING IN</Text>
                  <Text style={styles.translationTitle}>
                    {selectedLanguageInfo.name}
                  </Text>
                </View>

                <Text style={styles.translationNative}>
                  {selectedLanguageInfo.nativeName}
                </Text>
              </View>

              <View style={styles.translationDivider} />

              {translationLoading ? (
                <View style={styles.translationLoading}>
                  <ActivityIndicator color={BLUE} />
                  <Text style={styles.loadingText}>Finding meaning...</Text>
                </View>
              ) : translationError ? (
                <Text style={styles.translationErrorText}>
                  {translationError}
                </Text>
              ) : (
                <Text style={styles.translatedMeaning}>
                  {translatedMeaning}
                </Text>
              )}

              <Text style={styles.translationNote}>
                Online translations may not always be exact. Please verify
                important meanings with a reliable language source.
              </Text>

              <TouchableOpacity
                style={styles.retryTranslationButton}
                onPress={() => changeLanguage(selectedLanguage)}
                disabled={translationLoading}
              >
                <Text style={styles.retryTranslationText}>
                  ↻ Translate again
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discover new words</Text>
          <Text style={styles.sectionDescription}>
            Tap a word to explore its meaning.
          </Text>

          <View style={styles.wordChips}>
            {EXAMPLE_WORDS.map((word) => (
              <TouchableOpacity
                key={word}
                style={styles.wordChip}
                onPress={() => searchWord(word)}
                disabled={loading}
              >
                <Text style={styles.wordChipText}>{word}</Text>
                <Text style={styles.chipArrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent searches</Text>

            {history.length > 0 && (
              <TouchableOpacity onPress={() => setHistory([])}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryIcon}>◷</Text>
              <Text style={styles.emptyHistoryText}>
                Your searched words will appear here.
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.map((word) => (
                <TouchableOpacity
                  key={word}
                  style={styles.historyItem}
                  onPress={() => searchWord(word)}
                  disabled={loading}
                >
                  <View style={styles.historyWordIcon}>
                    <Text style={styles.historyWordIconText}>Aa</Text>
                  </View>
                  <Text style={styles.historyWord}>{word}</Text>
                  <Text style={styles.historyArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerBrand}>VETRIX by Vetri Technology</Text>
          <Text style={styles.footerText}>
            Learn daily. Grow continuously.
          </Text>
        </View>
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
    paddingTop: 14,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
  },
  backButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: WHITE,
    fontSize: 25,
    fontWeight: "900",
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  brand: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
  subtitle: {
    color: "#65B8FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 3,
  },
  languageBadge: {
    backgroundColor: "#142644",
    borderWidth: 1,
    borderColor: "#2B4D7A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  languageBadgeText: {
    color: "#9BC9FF",
    fontSize: 14,
    fontWeight: "700",
  },

  hero: {
    marginBottom: 24,
  },
  heroEyebrow: {
    color: "#69B8FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroTitle: {
    color: WHITE,
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "900",
  },
  highlight: {
    color: "#64B5FF",
  },
  heroDescription: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },

  searchCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    padding: 17,
    marginBottom: 30,
  },
  inputLabel: {
    color: "#9BB0CC",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 11,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 49,
    backgroundColor: "#080F20",
    borderWidth: 1,
    borderColor: "#2B3C5A",
    borderRadius: 12,
    paddingHorizontal: 13,
    color: WHITE,
    fontSize: 14,
  },
  searchButton: {
    height: 49,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 83,
  },
  disabledButton: {
    opacity: 0.65,
  },
  searchButtonText: {
    color: WHITE,
    fontWeight: "800",
    fontSize: 13,
  },
  searchHint: {
    color: "#718096",
    fontSize: 11,
    marginTop: 11,
  },

  section: {
    marginBottom: 29,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionDescription: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 15,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  languageItem: {
    width: "31%",
    minHeight: 75,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  languageItemActive: {
    backgroundColor: "#102D57",
    borderColor: "#3C91FF",
  },
  languageNative: {
    color: "#CBD5E1",
    fontSize: 18,
    fontWeight: "700",
  },
  languageNativeActive: {
    color: "#80C1FF",
  },
  languageName: {
    color: MUTED,
    fontSize: 11,
    marginTop: 5,
  },
  languageNameActive: {
    color: WHITE,
    fontWeight: "800",
  },

  errorCard: {
    backgroundColor: "#301923",
    borderColor: "#743348",
    borderWidth: 1,
    borderRadius: 16,
    padding: 17,
    marginBottom: 25,
  },
  errorTitle: {
    color: "#FFB4C4",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    color: "#F2C7D1",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  tryAgainButton: {
    alignSelf: "flex-start",
    marginTop: 13,
    backgroundColor: "#542538",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },
  tryAgainText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: "700",
  },

  resultSection: {
    marginBottom: 30,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  foundBadge: {
    backgroundColor: "#123B32",
    borderColor: "#206B55",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  foundBadgeText: {
    color: "#6EE7B7",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  wordCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    padding: 18,
    marginBottom: 13,
  },
  wordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  wordTextArea: {
    flex: 1,
  },
  wordTitle: {
    color: WHITE,
    fontSize: 28,
    fontWeight: "900",
  },
  phonetic: {
    color: "#91A8C8",
    fontSize: 13,
    marginTop: 5,
  },
  audioButton: {
    backgroundColor: "#172B49",
    borderWidth: 1,
    borderColor: "#2B4D7A",
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  audioIcon: {
    fontSize: 20,
  },
  audioLabel: {
    color: "#A9CFFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 17,
  },
  cardLabel: {
    color: "#7FA9DE",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 9,
  },
  definition: {
    color: "#E2E8F0",
    fontSize: 14,
    lineHeight: 23,
  },
  exampleBox: {
    backgroundColor: "#0A1325",
    borderRadius: 12,
    padding: 13,
    marginTop: 18,
  },
  exampleText: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 21,
    fontStyle: "italic",
  },

  translationCard: {
    backgroundColor: "#0D203B",
    borderWidth: 1,
    borderColor: "#2C5485",
    borderRadius: 20,
    padding: 18,
  },
  translationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  translationTitle: {
    color: WHITE,
    fontSize: 21,
    fontWeight: "900",
  },
  translationNative: {
    color: "#83BEFF",
    fontSize: 21,
    fontWeight: "800",
  },
  translationDivider: {
    height: 1,
    backgroundColor: "#2B4669",
    marginVertical: 17,
  },
  translationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 15,
  },
  loadingText: {
    color: "#B8CBE3",
    fontSize: 13,
  },
  translatedMeaning: {
    color: WHITE,
    fontSize: 20,
    lineHeight: 32,
    fontWeight: "600",
  },
  translationErrorText: {
    color: "#FFD0A6",
    fontSize: 14,
    lineHeight: 22,
  },
  translationNote: {
    color: "#93AFCF",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 16,
  },
  retryTranslationButton: {
    alignSelf: "flex-start",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#416A9C",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  retryTranslationText: {
    color: "#B8D9FF",
    fontSize: 12,
    fontWeight: "700",
  },

  wordChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  wordChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  wordChipText: {
    color: "#DCE8F8",
    fontSize: 12,
    fontWeight: "700",
  },
  chipArrow: {
    color: "#69B8FF",
    fontSize: 13,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  clearText: {
    color: "#69B8FF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyHistory: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  emptyHistoryIcon: {
    color: "#75B9FF",
    fontSize: 28,
    marginBottom: 7,
  },
  emptyHistoryText: {
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
  },
  historyList: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 15,
    overflow: "hidden",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1D2A42",
  },
  historyWordIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#172D4D",
    alignItems: "center",
    justifyContent: "center",
  },
  historyWordIconText: {
    color: "#88C3FF",
    fontSize: 12,
    fontWeight: "900",
  },
  historyWord: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    marginLeft: 12,
  },
  historyArrow: {
    color: "#7DADE4",
    fontSize: 20,
  },

  footer: {
    alignItems: "center",
    paddingTop: 7,
    paddingBottom: 15,
  },
  footerLine: {
    height: 1,
    width: 60,
    backgroundColor: "#315783",
    marginBottom: 18,
  },
  footerBrand: {
    color: "#BBD9FF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  footerText: {
    color: "#718096",
    fontSize: 11,
    marginTop: 7,
  },
});
