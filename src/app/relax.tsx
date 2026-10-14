import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type Mood = "Happy" | "Sad" | "Stress" | "Tired" | "Focus";

type Song = {
  id: string;
  title: string;
  artist: string;
  mood: Mood;
  emoji: string;
  color: string;
  search: string;
};

const FAVORITES_KEY = "vetrix_relax_favorites";

const moods: {
  name: Mood;
  emoji: string;
  subtitle: string;
  color: string;
}[] = [
  {
    name: "Happy",
    emoji: "😊",
    subtitle: "Feel the happiness",
    color: "#FFC857",
  },
  {
    name: "Sad",
    emoji: "💜",
    subtitle: "Songs for your feelings",
    color: "#A78BFA",
  },
  {
    name: "Stress",
    emoji: "🌿",
    subtitle: "Relax your mind",
    color: "#55D6BE",
  },
  {
    name: "Tired",
    emoji: "🌙",
    subtitle: "Slow down and rest",
    color: "#80A7FF",
  },
  {
    name: "Focus",
    emoji: "🎧",
    subtitle: "Concentrate and learn",
    color: "#FF91B8",
  },
];

const songs: Song[] = [
  {
    id: "happy-1",
    title: "Happy Vibes",
    artist: "Upbeat Playlist",
    mood: "Happy",
    emoji: "☀️",
    color: "#F6B94A",
    search: "happy feel good upbeat songs playlist",
  },
  {
    id: "happy-2",
    title: "Tamil Happy Hits",
    artist: "Tamil Playlist",
    mood: "Happy",
    emoji: "🎉",
    color: "#F08A5D",
    search: "Tamil happy hit songs playlist",
  },
  {
    id: "happy-3",
    title: "Feel Good Music",
    artist: "Feel Good Playlist",
    mood: "Happy",
    emoji: "🌈",
    color: "#E8A0BF",
    search: "feel good music playlist",
  },
  {
    id: "sad-1",
    title: "Emotional Melodies",
    artist: "Melody Playlist",
    mood: "Sad",
    emoji: "🌧️",
    color: "#8174C8",
    search: "Tamil emotional melody songs playlist",
  },
  {
    id: "sad-2",
    title: "Heart Touching Songs",
    artist: "Melody Collection",
    mood: "Sad",
    emoji: "💜",
    color: "#9C89D9",
    search: "heart touching sad melody songs playlist",
  },
  {
    id: "sad-3",
    title: "Soft Acoustic",
    artist: "Acoustic Playlist",
    mood: "Sad",
    emoji: "🌌",
    color: "#647ACB",
    search: "soft acoustic relaxing songs playlist",
  },
  {
    id: "stress-1",
    title: "Peaceful Nature",
    artist: "Nature Sounds",
    mood: "Stress",
    emoji: "🍃",
    color: "#45B69C",
    search: "peaceful nature sounds stress relief playlist",
  },
  {
    id: "stress-2",
    title: "Calm Instrumental",
    artist: "Instrumental Playlist",
    mood: "Stress",
    emoji: "🧘",
    color: "#65C9AE",
    search: "calm instrumental meditation music playlist",
  },
  {
    id: "stress-3",
    title: "Tamil Relaxing Melodies",
    artist: "Tamil Relaxing Music",
    mood: "Stress",
    emoji: "🌿",
    color: "#398D82",
    search: "Tamil relaxing melody songs playlist",
  },
  {
    id: "tired-1",
    title: "Sleepy Time",
    artist: "Sleep Playlist",
    mood: "Tired",
    emoji: "🌙",
    color: "#6379BD",
    search: "sleepy time relaxing music playlist",
  },
  {
    id: "tired-2",
    title: "Rain and Piano",
    artist: "Piano Playlist",
    mood: "Tired",
    emoji: "🌧️",
    color: "#7B91D3",
    search: "rain sounds soft piano relaxing playlist",
  },
  {
    id: "tired-3",
    title: "Deep Sleep Music",
    artist: "Sleep Music",
    mood: "Tired",
    emoji: "✨",
    color: "#505C9A",
    search: "deep sleep instrumental music playlist",
  },
  {
    id: "focus-1",
    title: "Deep Focus",
    artist: "Focus Playlist",
    mood: "Focus",
    emoji: "🎯",
    color: "#D778A1",
    search: "deep focus instrumental study playlist",
  },
  {
    id: "focus-2",
    title: "Lo-Fi Study Beats",
    artist: "Lo-Fi Playlist",
    mood: "Focus",
    emoji: "📚",
    color: "#B77ABF",
    search: "lofi study beats focus playlist",
  },
  {
    id: "focus-3",
    title: "Coding Music",
    artist: "Coding Playlist",
    mood: "Focus",
    emoji: "💻",
    color: "#8275C8",
    search: "coding concentration instrumental music playlist",
  },
];

export default function RelaxScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood>("Stress");
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingSong, setOpeningSong] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);

        if (mounted && stored) {
          const parsed: unknown = JSON.parse(stored);

          if (
            Array.isArray(parsed) &&
            parsed.every((item) => typeof item === "string")
          ) {
            setFavorites(parsed);
          }
        }
      } catch (error) {
        console.log("Unable to load favorites:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, []);

  const saveFavorites = useCallback(async (updated: string[]) => {
    setFavorites(updated);

    try {
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log("Unable to save favorites:", error);
      Alert.alert(
        "Save failed",
        "Favorites save panna mudiyala. Please try again."
      );
    }
  }, []);

  const visibleSongs = useMemo(() => {
    if (showFavorites) {
      return songs.filter((song) => favorites.includes(song.id));
    }

    return songs.filter((song) => song.mood === selectedMood);
  }, [selectedMood, showFavorites, favorites]);

  const toggleFavorite = useCallback(
    (songId: string) => {
      const updated = favorites.includes(songId)
        ? favorites.filter((id) => id !== songId)
        : [...favorites, songId];

      void saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  const openSpotify = useCallback(async (search: string) => {
    const url = `https://open.spotify.com/search/${encodeURIComponent(search)}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.log("Spotify could not be opened:", error);
      Alert.alert(
        "Unable to open Spotify",
        "Internet connection check pannunga. Spotify app or browser-la try pannunga."
      );
    }
  }, []);

  const handleSongPress = useCallback(
    async (song: Song) => {
      setOpeningSong(song.id);

      try {
        await openSpotify(song.search);
      } finally {
        setOpeningSong(null);
      }
    },
    [openSpotify]
  );

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home");
    }
  }, []);

  const activeMood = moods.find((mood) => mood.name === selectedMood);

  return (
    <LinearGradient
      colors={["#100C24", "#17112F", "#0C1024"]}
      style={styles.screen}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#100C24" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.eyebrow}>VETRIX WELLNESS</Text>
              <Text style={styles.heading}>Relax Zone</Text>
              <Text style={styles.subheading}>
                Take a breath. Find your rhythm.
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Text style={styles.headerEmoji}>🎧</Text>
            </View>
          </View>

          {/* Featured Card */}
          <LinearGradient
            colors={["#7056D9", "#4935A8", "#30256D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featureCard}
          >
            <View style={styles.featureCircleOne} />
            <View style={styles.featureCircleTwo} />

            <View style={styles.featureTop}>
              <View style={styles.liveDot} />
              <Text style={styles.featureLabel}>YOUR MOMENT</Text>
            </View>

            <Text style={styles.featureTitle}>
              Music for your mood
            </Text>

            <Text style={styles.featureDescription}>
              Choose how you feel. Discover music that fits your moment.
            </Text>

            <TouchableOpacity
              style={styles.featureButton}
              activeOpacity={0.85}
              onPress={() => {
                setShowFavorites(false);
                void openSpotify(
                  activeMood?.name === "Focus"
                    ? "focus study music playlist"
                    : `${selectedMood.toLowerCase()} mood music playlist`
                );
              }}
            >
              <Ionicons
                name="musical-notes"
                size={18}
                color="#34236E"
              />
              <Text style={styles.featureButtonText}>
                Explore on Spotify
              </Text>
              <Ionicons
                name="arrow-forward"
                size={17}
                color="#34236E"
              />
            </TouchableOpacity>
          </LinearGradient>

          {/* Mood Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                How are you feeling?
              </Text>
              <Text style={styles.sectionSubtitle}>
                Pick your current mood
              </Text>
            </View>

            <View style={styles.moodCount}>
              <Text style={styles.moodCountText}>05 moods</Text>
            </View>
          </View>

          <View style={styles.moodGrid}>
            {moods.map((mood) => {
              const selected = selectedMood === mood.name;

              return (
                <TouchableOpacity
                  key={mood.name}
                  activeOpacity={0.8}
                  style={[
                    styles.moodCard,
                    selected && styles.moodCardSelected,
                    selected && {
                      borderColor: mood.color,
                    },
                  ]}
                  onPress={() => {
                    setSelectedMood(mood.name);
                    setShowFavorites(false);
                  }}
                >
                  <View
                    style={[
                      styles.moodEmojiContainer,
                      { backgroundColor: `${mood.color}20` },
                    ]}
                  >
                    <Text style={styles.moodEmoji}>
                      {mood.emoji}
                    </Text>
                  </View>

                  <Text style={styles.moodName}>
                    {mood.name}
                  </Text>

                  <Text
                    style={styles.moodSubtitle}
                    numberOfLines={1}
                  >
                    {mood.subtitle}
                  </Text>

                  {selected && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: mood.color },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#17112F"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Songs Section */}
          <View style={styles.songsHeader}>
            <View style={styles.songsHeadingContainer}>
              <Text style={styles.sectionTitle}>
                {showFavorites
                  ? "Your Favorites"
                  : `${activeMood?.emoji ?? "🎵"} ${selectedMood} Mix`}
              </Text>

              <Text style={styles.sectionSubtitle}>
                {showFavorites
                  ? "Your saved music searches"
                  : "Handpicked searches for your mood"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.favoriteFilter,
                showFavorites && styles.favoriteFilterActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setShowFavorites((current) => !current)}
            >
              <Ionicons
                name={showFavorites ? "heart" : "heart-outline"}
                size={17}
                color={showFavorites ? "#FF83B0" : "#C4B9E8"}
              />
              <Text
                style={[
                  styles.favoriteFilterText,
                  showFavorites && styles.favoriteFilterTextActive,
                ]}
              >
                Saved
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#A995FF" />
              <Text style={styles.loadingText}>
                Loading your favorites...
              </Text>
            </View>
          ) : visibleSongs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💜</Text>
              <Text style={styles.emptyTitle}>
                No favorites yet
              </Text>
              <Text style={styles.emptyDescription}>
                Song card-la heart icon tap pannunga. Ungal favorites
                inga save aagum.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowFavorites(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>
                  Explore songs
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.songList}>
              {visibleSongs.map((song, index) => {
                const isFavorite = favorites.includes(song.id);
                const isOpening = openingSong === song.id;

                return (
                  <View key={song.id} style={styles.songCard}>
                    <View
                      style={[
                        styles.songArtwork,
                        { backgroundColor: song.color },
                      ]}
                    >
                      <Text style={styles.songEmoji}>
                        {song.emoji}
                      </Text>
                      <View style={styles.artworkNumber}>
                        <Text style={styles.artworkNumberText}>
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.songInfo}>
                      <Text
                        style={styles.songTitle}
                        numberOfLines={1}
                      >
                        {song.title}
                      </Text>

                      <Text
                        style={styles.songArtist}
                        numberOfLines={1}
                      >
                        {song.artist}
                      </Text>

                      <View style={styles.spotifyTag}>
                        <Ionicons
                          name="musical-note"
                          size={11}
                          color="#7CE4A5"
                        />
                        <Text style={styles.spotifyTagText}>
                          Spotify search
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.songAction}
                      activeOpacity={0.7}
                      onPress={() => toggleFavorite(song.id)}
                      accessibilityLabel={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={isFavorite ? "#FF83B0" : "#A69ACD"}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playButton}
                      activeOpacity={0.8}
                      onPress={() => void handleSongPress(song)}
                      accessibilityLabel={`Search ${song.title} on Spotify`}
                      disabled={isOpening}
                    >
                      {isOpening ? (
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />
                      ) : (
                        <Ionicons
                          name="play"
                          size={19}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}

          {/* Spotify Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#B5A5FF"
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>
                Listen with Spotify Free
              </Text>
              <Text style={styles.infoDescription}>
                Song tap pannina Spotify search open aagum. Free account
                use pannalaam; available playback options Spotify app,
                region and account settings-ai poruthadhu.
              </Text>
            </View>
          </View>

          {/* Wellness Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerEmoji}>🌱</Text>
            <Text style={styles.footerTitle}>
              A little break goes a long way
            </Text>
            <Text style={styles.footerDescription}>
              Breathe slowly. Relax your shoulders. Give yourself a
              peaceful moment.
            </Text>
          </View>

          <Text style={styles.bottomText}>
            VETRIX · YOUR WELLNESS SPACE
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#100C24",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#28244A",
    borderWidth: 1,
    borderColor: "#514477",
    marginBottom: 22,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  eyebrow: {
    color: "#A995FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 8,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subheading: {
    color: "#A9A0C7",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 20,
  },
  headerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#2C2451",
    borderWidth: 1,
    borderColor: "#59478C",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  headerEmoji: {
    fontSize: 27,
  },
  featureCard: {
    borderRadius: 25,
    padding: 22,
    overflow: "hidden",
    marginBottom: 30,
    minHeight: 218,
  },
  featureCircleOne: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -65,
    right: -30,
  },
  featureCircleTwo: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -60,
    right: 70,
  },
  featureTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#83F0BD",
    marginRight: 8,
  },
  featureLabel: {
    color: "#D4CBFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  featureTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 8,
  },
  featureDescription: {
    color: "#E1DAFF",
    fontSize: 12,
    lineHeight: 19,
    maxWidth: 285,
    marginBottom: 19,
  },
  featureButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 9,
  },
  featureButtonText: {
    color: "#34236E",
    fontSize: 12,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: "#9288B3",
    fontSize: 11,
    marginTop: 5,
    lineHeight: 17,
  },
  moodCount: {
    backgroundColor: "#292342",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  moodCountText: {
    color: "#BFB1F4",
    fontSize: 10,
    fontWeight: "700",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  moodCard: {
    width: "31.4%",
    minHeight: 118,
    backgroundColor: "#1C1833",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#302849",
    paddingHorizontal: 9,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  moodCardSelected: {
    backgroundColor: "#292141",
    borderWidth: 1.5,
  },
  moodEmojiContainer: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  moodEmoji: {
    fontSize: 21,
  },
  moodName: {
    color: "#F5F1FF",
    fontSize: 12,
    fontWeight: "800",
  },
  moodSubtitle: {
    color: "#9188AC",
    fontSize: 9,
    marginTop: 5,
    maxWidth: "100%",
  },
  selectedIndicator: {
    position: "absolute",
    right: 7,
    top: 7,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  songsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  songsHeadingContainer: {
    flex: 1,
  },
  favoriteFilter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#44365F",
    backgroundColor: "#201A38",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
  },
  favoriteFilterActive: {
    backgroundColor: "#38213D",
    borderColor: "#8D4775",
  },
  favoriteFilterText: {
    color: "#C4B9E8",
    fontSize: 11,
    fontWeight: "700",
  },
  favoriteFilterTextActive: {
    color: "#FF9CC1",
  },
  songList: {
    gap: 11,
  },
  songCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    padding: 11,
    backgroundColor: "#1B1730",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#302744",
  },
  songArtwork: {
    width: 61,
    height: 65,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  songEmoji: {
    fontSize: 27,
  },
  artworkNumber: {
    position: "absolute",
    bottom: 4,
    right: 6,
  },
  artworkNumberText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 8,
    fontWeight: "800",
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 4,
    justifyContent: "center",
  },
  songTitle: {
    color: "#F8F5FF",
    fontSize: 12,
    fontWeight: "800",
  },
  songArtist: {
    color: "#A49ABF",
    fontSize: 10,
    marginTop: 5,
  },
  spotifyTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 7,
  },
  spotifyTagText: {
    color: "#7CE4A5",
    fontSize: 9,
    fontWeight: "700",
  },
  songAction: {
    width: 34,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#765CE0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  loadingContainer: {
    minHeight: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#B7ACD6",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: "#1C1833",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#302849",
  },
  emptyEmoji: {
    fontSize: 35,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyDescription: {
    color: "#A49ABF",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: "#7056D9",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 17,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#211B3A",
    borderWidth: 1,
    borderColor: "#3B305B",
    borderRadius: 18,
    padding: 15,
    marginTop: 20,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#332852",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: "#F2ECFF",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  infoDescription: {
    color: "#A9A0C7",
    fontSize: 11,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 28,
    marginTop: 10,
  },
  footerEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },
  footerTitle: {
    color: "#EDE7FF",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  footerDescription: {
    color: "#958BAF",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
  bottomText: {
    color: "#645B83",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 2,
  },
});
