import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

type ProfileData = {
  name: string;
  email: string;
  bio: string;
  photo: string;
  role: string;
};

type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  date: string;
};

type SectionType =
  | "mistakes"
  | "projects"
  | "notes"
  | "goals"
  | "journal";

const COLORS = {
  background: "#080D1B",
  card: "#10192C",
  cardLight: "#15213A",
  border: "#24324C",
  primary: "#7C5CFC",
  cyan: "#39D5F6",
  text: "#F4F7FF",
  muted: "#9AA8C4",
  green: "#35D49A",
  orange: "#FFB454",
  red: "#FF6B81",
};

const STORAGE_KEYS = {
  profile: "vetrix_profile",
  mistakes: "vetrix_mistakes_improvements",
  projects: "vetrix_profile_projects",
  notes: "vetrix_profile_notes",
  goals: "vetrix_profile_goals",
  journal: "vetrix_growth_journal",
};

const DEFAULT_PROFILE: ProfileData = {
  name: "VETRIX Learner",
  email: "",
  bio: "Learning something new every day 🚀",
  photo: "",
  role: "Learner",
};

const EMPTY_ITEM: Item = {
  id: "",
  title: "",
  description: "",
  category: "General",
  status: "In Progress",
  priority: "Medium",
  date: new Date().toISOString().slice(0, 10),
};

const SECTION_INFO: Record<
  SectionType,
  { title: string; subtitle: string; icon: string }
> = {
  mistakes: {
    title: "Mistakes & Improvements",
    subtitle: "Learn from mistakes and track your improvement.",
    icon: "🎯",
  },
  projects: {
    title: "My Projects",
    subtitle: "Keep your projects and ideas organised.",
    icon: "💻",
  },
  notes: {
    title: "My Notes",
    subtitle: "Save important learning notes.",
    icon: "📝",
  },
  goals: {
    title: "My Goals",
    subtitle: "Set goals and track your progress.",
    icon: "🏆",
  },
  journal: {
    title: "Growth Journal",
    subtitle: "Record your daily learning journey.",
    icon: "📔",
  },
};

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 760;

  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [items, setItems] = useState<Record<SectionType, Item[]>>({
    mistakes: [],
    projects: [],
    notes: [],
    goals: [],
    journal: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SectionType>("mistakes");
  const [editingItem, setEditingItem] = useState<Item>(EMPTY_ITEM);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [profileDraft, setProfileDraft] =
    useState<ProfileData>(DEFAULT_PROFILE);

  const [formError, setFormError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [
        savedProfile,
        savedMistakes,
        savedProjects,
        savedNotes,
        savedGoals,
        savedJournal,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.profile),
        AsyncStorage.getItem(STORAGE_KEYS.mistakes),
        AsyncStorage.getItem(STORAGE_KEYS.projects),
        AsyncStorage.getItem(STORAGE_KEYS.notes),
        AsyncStorage.getItem(STORAGE_KEYS.goals),
        AsyncStorage.getItem(STORAGE_KEYS.journal),
      ]);

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
      }

      setItems({
        mistakes: savedMistakes ? JSON.parse(savedMistakes) : [],
        projects: savedProjects ? JSON.parse(savedProjects) : [],
        notes: savedNotes ? JSON.parse(savedNotes) : [],
        goals: savedGoals ? JSON.parse(savedGoals) : [],
        journal: savedJournal ? JSON.parse(savedJournal) : [],
      });
    } catch (error) {
      console.error("Failed to load profile data:", error);
      Alert.alert("Error", "Could not load your saved profile data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const persistItems = async (
    section: SectionType,
    nextItems: Item[],
  ) => {
    const storageKey = STORAGE_KEYS[section];

    setItems((previous) => ({
      ...previous,
      [section]: nextItems,
    }));

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextItems));
    } catch (error) {
      console.error("Failed to save items:", error);
      Alert.alert("Error", "Could not save this information.");
    }
  };

  const openProfileEditor = () => {
    setProfileDraft({ ...profile });
    setProfileModal(true);
  };

  const saveProfile = async () => {
    if (!profileDraft.name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    setSaving(true);

    try {
      const nextProfile = {
        ...profileDraft,
        name: profileDraft.name.trim(),
        email: profileDraft.email.trim(),
        bio: profileDraft.bio.trim(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.profile,
        JSON.stringify(nextProfile),
      );

      setProfile(nextProfile);
      setProfileModal(false);
      Alert.alert("Success", "Your profile has been updated.");
    } catch (error) {
      console.error("Profile save failed:", error);
      Alert.alert("Error", "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Allow photo library access to select a profile picture.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfileDraft((previous) => ({
          ...previous,
          photo: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Photo picker failed:", error);
      Alert.alert("Error", "Unable to select a photo.");
    }
  };

  const openItemEditor = (
    section: SectionType,
    item?: Item,
  ) => {
    setActiveSection(section);
    setEditingItem(
      item
        ? { ...item }
        : {
            ...EMPTY_ITEM,
            id: "",
            date: new Date().toISOString().slice(0, 10),
          },
    );
    setFormError("");
    setItemModal(true);
  };

  const saveItem = async () => {
    if (!editingItem.title.trim()) {
      setFormError("Please enter a title.");
      return;
    }

    setSaving(true);

    try {
      const currentItems = items[activeSection];
      const itemToSave: Item = {
        ...editingItem,
        id: editingItem.id || `${Date.now()}`,
        title: editingItem.title.trim(),
        description: editingItem.description.trim(),
        category: editingItem.category.trim() || "General",
        date: editingItem.date || new Date().toISOString().slice(0, 10),
      };

      const exists = currentItems.some(
        (item) => item.id === itemToSave.id,
      );

      const nextItems = exists
        ? currentItems.map((item) =>
            item.id === itemToSave.id ? itemToSave : item,
          )
        : [itemToSave, ...currentItems];

      await AsyncStorage.setItem(
        STORAGE_KEYS[activeSection],
        JSON.stringify(nextItems),
      );

      setItems((previous) => ({
        ...previous,
        [activeSection]: nextItems,
      }));

      setItemModal(false);
      setEditingItem(EMPTY_ITEM);
      setFormError("");
    } catch (error) {
      console.error("Item save failed:", error);
      setFormError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = (section: SectionType, id: string) => {
    const performDelete = async () => {
      const nextItems = items[section].filter(
        (item) => item.id !== id,
      );

      await persistItems(section, nextItems);
    };

    if (Platform.OS === "web") {
      const confirmFn = (globalThis as any).confirm;
      if (typeof confirmFn === "function" &&
          confirmFn("Delete this item permanently?")) {
        void performDelete();
      }
      return;
    }

    Alert.alert("Delete item", "Are you sure you want to delete it?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void performDelete();
        },
      },
    ]);
  };

  const updateItemStatus = async (
    section: SectionType,
    item: Item,
    status: string,
  ) => {
    const nextItems = items[section].map((current) =>
      current.id === item.id ? { ...current, status } : current,
    );

    await persistItems(section, nextItems);
  };

  const logout = async () => {
    const performLogout = async () => {
      try {
        const authKeys = [
          "token",
          "access_token",
          "accessToken",
          "refresh_token",
          "refreshToken",
          "authToken",
          "userToken",
          "user",
          "auth_user",
        ];

        await AsyncStorage.multiRemove(authKeys);

        // Change this path if your login screen uses another route.
        router.replace("/auth" as never);
      } catch (error) {
        console.error("Logout failed:", error);
        Alert.alert("Logout failed", "Please try again.");
      }
    };

    if (Platform.OS === "web") {
      const confirmFn = (globalThis as any).confirm;
      const confirmed =
        typeof confirmFn === "function"
          ? confirmFn("Are you sure you want to log out?")
          : true;

      if (confirmed) {
        await performLogout();
      }
      return;
    }

    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          void performLogout();
        },
      },
    ]);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Change this fallback to your actual home route if needed.
      router.replace("/home" as never);
    }
  };

  const filteredItems = items[activeSection].filter((item) => {
    const matchesSearch =
      `${item.title} ${item.description} ${item.category}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allItems = Object.values(items).flat();
  const completedCount = allItems.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Fixed" ||
      item.status === "Lesson Learned",
  ).length;

  const inProgressCount = allItems.filter(
    (item) => item.status === "In Progress",
  ).length;

  const mistakesCount = items.mistakes.length;
  const projectsCount = items.projects.length;
  const goalsCount = items.goals.length;
  const notesCount = items.notes.length + items.journal.length;

  const openSection = (section: SectionType) => {
    setActiveSection(section);
    setSearch("");
    setStatusFilter("All");
    setFormError("");
  };

  const renderSection = (section: SectionType) => {
    const info = SECTION_INFO[section];
    const isMistakes = section === "mistakes";
    const isGoals = section === "goals";

    return (
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionIcon}>{info.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>{info.title}</Text>
              <Text style={styles.sectionSubtitle}>{info.subtitle}</Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => openItemEditor(section)}
          >
            <Text style={styles.primaryButtonText}>+ Add</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${info.title.toLowerCase()}...`}
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            "All",
            "To Fix",
            "In Progress",
            "Fixed",
            "Lesson Learned",
            "Completed",
            "Pending",
          ].map((status) => (
            <Pressable
              key={status}
              onPress={() => setStatusFilter(status)}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === status && styles.filterTextActive,
                ]}
              >
                {status}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Add your first item and keep growing with VETRIX.
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>
                    {item.category} · {item.date}
                  </Text>
                </View>

                <Pressable
                  onPress={() => openItemEditor(section, item)}
                  style={styles.smallAction}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>

                <Pressable
                  onPress={() => deleteItem(section, item.id)}
                  style={styles.smallAction}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>

              {item.description ? (
                <Text style={styles.itemDescription}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.itemBottomRow}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {item.priority} priority
                  </Text>
                </View>

                <View style={styles.statusControl}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.statusButtons}>
                    {(isMistakes
                      ? ["To Fix", "In Progress", "Fixed", "Lesson Learned"]
                      : isGoals
                        ? ["Pending", "In Progress", "Completed"]
                        : ["Pending", "In Progress", "Completed"]
                    ).map((status) => (
                      <Pressable
                        key={status}
                        onPress={() =>
                          void updateItemStatus(section, item, status)
                        }
                        style={[
                          styles.statusChip,
                          item.status === status &&
                            styles.statusChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            item.status === status &&
                              styles.statusChipTextSelected,
                          ]}
                        >
                          {status}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[
            styles.content,
            isWide && styles.wideContent,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.brandText}>VETRIX</Text>
              <Text style={styles.pageTitle}>My Profile</Text>
              <Text style={styles.pageSubtitle}>
                Your learning journey, all in one place.
              </Text>
            </View>

            <Pressable
              onPress={() => setAboutModal(true)}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>ⓘ About</Text>
            </Pressable>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileMain}>
              <Pressable
                onPress={openProfileEditor}
                style={styles.avatarContainer}
              >
                {profile.photo ? (
                  <Image
                    source={{ uri: profile.photo }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>
                      {profile.name.trim().charAt(0).toUpperCase() || "V"}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Text style={styles.cameraBadgeText}>✎</Text>
                </View>
              </Pressable>

              <View style={styles.profileTextContainer}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileRole}>{profile.role}</Text>
                <Text style={styles.profileEmail}>
                  {profile.email || "Add your email address"}
                </Text>
                <Text style={styles.profileBio}>
                  {profile.bio || "Add a short bio about yourself."}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.outlineButton}
              onPress={openProfileEditor}
            >
              <Text style={styles.outlineButtonText}>✎ Edit Profile</Text>
            </Pressable>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: "Projects", value: projectsCount, icon: "💻" },
              { label: "Mistakes", value: mistakesCount, icon: "🎯" },
              { label: "Goals", value: goalsCount, icon: "🏆" },
              { label: "Notes & Journal", value: notesCount, icon: "📝" },
            ].map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  isWide && styles.statCardWide,
                ]}
              >
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Your Growth Overview</Text>
            <Text style={styles.sectionSubtitle}>
              Track what you have completed across your saved items.
            </Text>

            <View style={styles.progressStatsRow}>
              <View>
                <Text style={styles.progressNumber}>{completedCount}</Text>
                <Text style={styles.progressLabel}>Completed / Fixed</Text>
              </View>
              <View>
                <Text style={styles.progressNumber}>{inProgressCount}</Text>
                <Text style={styles.progressLabel}>In progress</Text>
              </View>
              <View>
                <Text style={styles.progressNumber}>{allItems.length}</Text>
                <Text style={styles.progressLabel}>Total items</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      allItems.length
                        ? Math.min(
                            100,
                            Math.round(
                              (completedCount / allItems.length) * 100,
                            ),
                          )
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressFootnote}>
              {allItems.length
                ? `${Math.round((completedCount / allItems.length) * 100)}% completed`
                : "Add your first item to start tracking progress."}
            </Text>
          </View>

          <View style={styles.quickLinksCard}>
            <Text style={styles.sectionTitle}>My Learning Space</Text>
            <Text style={styles.sectionSubtitle}>
              Choose a section to view and manage your information.
            </Text>

            <View style={styles.quickLinksGrid}>
              {(
                Object.keys(SECTION_INFO) as SectionType[]
              ).map((section) => (
                <Pressable
                  key={section}
                  style={[
                    styles.quickLink,
                    activeSection === section && styles.quickLinkActive,
                  ]}
                  onPress={() => openSection(section)}
                >
                  <Text style={styles.quickLinkIcon}>
                    {SECTION_INFO[section].icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickLinkTitle}>
                      {SECTION_INFO[section].title}
                    </Text>
                    <Text style={styles.quickLinkCount}>
                      {items[section].length} saved
                    </Text>
                  </View>
                  <Text style={styles.quickLinkArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {renderSection(activeSection)}

          <View style={styles.bottomCard}>
            <Text style={styles.bottomTitle}>Keep Learning. Keep Growing.</Text>
            <Text style={styles.bottomSubtitle}>
              Small steps every day create big progress.
            </Text>

            <Pressable
              style={styles.logoutButton}
              onPress={() => void logout()}
            >
              <Text style={styles.logoutButtonText}>⇥ Log Out</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>
            VETRIX by Vetri Technology · Learn. Practice. Grow.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit Profile Modal */}
      <Modal
        visible={profileModal}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboard}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Pressable onPress={() => setProfileModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => void choosePhoto()} style={styles.photoPicker}>
                  {profileDraft.photo ? (
                    <Image
                      source={{ uri: profileDraft.photo }}
                      style={styles.modalAvatar}
                    />
                  ) : (
                    <View style={styles.modalAvatarPlaceholder}>
                      <Text style={styles.modalAvatarText}>
                        {profileDraft.name.charAt(0).toUpperCase() || "V"}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.photoPickerText}>
                    Change profile photo
                  </Text>
                </Pressable>

                <Text style={styles.inputLabel}>Full name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.muted}
                  value={profileDraft.name}
                  onChangeText={(name) =>
                    setProfileDraft((previous) => ({ ...previous, name }))
                  }
                />

                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.muted}
                  value={profileDraft.email}
                  onChangeText={(email) =>
                    setProfileDraft((previous) => ({ ...previous, email }))
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Role</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Learner / Developer / Student"
                  placeholderTextColor={COLORS.muted}
                  value={profileDraft.role}
                  onChangeText={(role) =>
                    setProfileDraft((previous) => ({ ...previous, role }))
                  }
                />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={COLORS.muted}
                  value={profileDraft.bio}
                  onChangeText={(bio) =>
                    setProfileDraft((previous) => ({ ...previous, bio }))
                  }
                  multiline
                  numberOfLines={4}
                />

                <Pressable
                  style={[styles.primaryButton, styles.modalSaveButton]}
                  onPress={() => void saveProfile()}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving ? "Saving..." : "Save Profile"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setProfileModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal
        visible={itemModal}
        transparent
        animationType="slide"
        onRequestClose={() => setItemModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboard}
          >
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>
                      {editingItem.id ? "Edit Item" : "Add New Item"}
                    </Text>
                    <Text style={styles.sectionSubtitle}>
                      {SECTION_INFO[activeSection].title}
                    </Text>
                  </View>
                  <Pressable onPress={() => setItemModal(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter a title"
                  placeholderTextColor={COLORS.muted}
                  value={editingItem.title}
                  onChangeText={(title) => {
                    setEditingItem((previous) => ({ ...previous, title }));
                    setFormError("");
                  }}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput]}
                  placeholder="Write some details..."
                  placeholderTextColor={COLORS.muted}
                  value={editingItem.description}
                  onChangeText={(description) =>
                    setEditingItem((previous) => ({
                      ...previous,
                      description,
                    }))
                  }
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="General, Python, UI Design..."
                  placeholderTextColor={COLORS.muted}
                  value={editingItem.category}
                  onChangeText={(category) =>
                    setEditingItem((previous) => ({
                      ...previous,
                      category,
                    }))
                  }
                />

                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.optionRow}>
                  {["Low", "Medium", "High"].map((priority) => (
                    <Pressable
                      key={priority}
                      onPress={() =>
                        setEditingItem((previous) => ({
                          ...previous,
                          priority,
                        }))
                      }
                      style={[
                        styles.optionChip,
                        editingItem.priority === priority &&
                          styles.optionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          editingItem.priority === priority &&
                            styles.optionChipTextActive,
                        ]}
                      >
                        {priority}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.optionRow}>
                  {(activeSection === "mistakes"
                    ? ["To Fix", "In Progress", "Fixed", "Lesson Learned"]
                    : activeSection === "goals"
                      ? ["Pending", "In Progress", "Completed"]
                      : ["Pending", "In Progress", "Completed"]
                  ).map((status) => (
                    <Pressable
                      key={status}
                      onPress={() =>
                        setEditingItem((previous) => ({
                          ...previous,
                          status,
                        }))
                      }
                      style={[
                        styles.optionChip,
                        editingItem.status === status &&
                          styles.optionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          editingItem.status === status &&
                            styles.optionChipTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="2026-10-11"
                  placeholderTextColor={COLORS.muted}
                  value={editingItem.date}
                  onChangeText={(date) =>
                    setEditingItem((previous) => ({ ...previous, date }))
                  }
                />

                {formError ? (
                  <Text style={styles.errorText}>{formError}</Text>
                ) : null}

                <Pressable
                  style={[styles.primaryButton, styles.modalSaveButton]}
                  onPress={() => void saveItem()}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving ? "Saving..." : "Save Item"}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setItemModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.aboutCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About VETRIX</Text>
              <Pressable onPress={() => setAboutModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.aboutLogo}>
              <Text style={styles.aboutLogoText}>V</Text>
            </View>

            <Text style={styles.aboutAppTitle}>VETRIX</Text>
            <Text style={styles.aboutVersion}>Learning & Growth Platform</Text>

            <Text style={styles.aboutDescription}>
              VETRIX helps learners organise their learning journey, track
              mistakes, improve their skills, save notes, manage projects,
              and work towards personal goals.
            </Text>

            <View style={styles.aboutFeature}>
              <Text style={styles.aboutFeatureText}>
                🎯 Track mistakes and improvements
              </Text>
              <Text style={styles.aboutFeatureText}>
                💻 Organise your projects and notes
              </Text>
              <Text style={styles.aboutFeatureText}>
                🏆 Manage goals and progress
              </Text>
              <Text style={styles.aboutFeatureText}>
                📔 Record your daily learning journey
              </Text>
            </View>

            <Text style={styles.aboutFooter}>
              VETRIX by Vetri Technology
            </Text>

            <Pressable
              style={[styles.primaryButton, styles.modalSaveButton]}
              onPress={() => setAboutModal(false)}
            >
              <Text style={styles.primaryButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: 12,
    fontSize: 14,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    padding: 18,
    paddingBottom: 36,
    gap: 18,
  },
  wideContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  brandText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 6,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 29,
    fontWeight: "900",
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
  },
  iconButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  iconButtonText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 20,
    gap: 20,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2B2452",
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarLetter: {
    color: COLORS.text,
    fontSize: 34,
    fontWeight: "900",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  cameraBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  profileTextContainer: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },
  profileRole: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "800",
  },
  profileEmail: {
    color: COLORS.muted,
    fontSize: 12,
  },
  profileBio: {
    color: "#D3DBEE",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "40%",
    minWidth: 125,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    gap: 7,
  },
  statCardWide: {
    width: "23%",
    flexBasis: "20%",
  },
  statIcon: {
    fontSize: 21,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  progressCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  progressStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 22,
    marginBottom: 16,
  },
  progressNumber: {
    color: COLORS.cyan,
    fontSize: 22,
    fontWeight: "900",
  },
  progressLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#26324A",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  progressFootnote: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 10,
  },
  quickLinksCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
  },
  quickLinksGrid: {
    marginTop: 14,
    gap: 9,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#0D1527",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 13,
  },
  quickLinkActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#1B1B3C",
  },
  quickLinkIcon: {
    fontSize: 22,
  },
  quickLinkTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },
  quickLinkCount: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  quickLinkArrow: {
    color: COLORS.cyan,
    fontSize: 24,
  },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionHeading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  sectionIcon: {
    fontSize: 25,
  },
  primaryButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  searchInput: {
    backgroundColor: "#0A1222",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#0B1425",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 15,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },
  itemCard: {
    backgroundColor: "#0B1425",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 14,
    gap: 12,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
  },
  itemMeta: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  smallAction: {
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  editText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "800",
  },
  deleteText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: "800",
  },
  itemDescription: {
    color: "#C3CEE2",
    fontSize: 12,
    lineHeight: 18,
  },
  itemBottomRow: {
    gap: 12,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#1B2440",
  },
  tagText: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "800",
  },
  statusControl: {
    gap: 8,
  },
  statusLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statusChip: {
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  statusChipSelected: {
    backgroundColor: "#28204D",
    borderColor: COLORS.primary,
  },
  statusChipText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  statusChipTextSelected: {
    color: "#FFFFFF",
  },
  bottomCard: {
    backgroundColor: "#171637",
    borderWidth: 1,
    borderColor: "#39316B",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  bottomTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  bottomSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: "#351B30",
    borderColor: "#74334D",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: "#FF8DA1",
    fontSize: 13,
    fontWeight: "900",
  },
  footerText: {
    color: "#65728D",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 5, 14, 0.86)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  modalKeyboard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "92%",
  },
  modalScroll: {
    width: "100%",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    padding: 20,
    gap: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
  },
  closeButton: {
    color: COLORS.muted,
    fontSize: 22,
    fontWeight: "800",
    padding: 4,
  },
  photoPicker: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  modalAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalAvatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2B2452",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalAvatarText: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: "900",
  },
  photoPickerText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 9,
  },
  inputLabel: {
    color: "#D9E2F5",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
  },
  formInput: {
    width: "100%",
    backgroundColor: "#0A1222",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 13,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#0A1222",
  },
  optionChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#28204D",
  },
  optionChipText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  optionChipTextActive: {
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: 4,
  },
  modalSaveButton: {
    alignSelf: "stretch",
    marginTop: 12,
    paddingVertical: 14,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  aboutCard: {
    width: "100%",
    maxWidth: 450,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 22,
  },
  aboutLogo: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  aboutLogoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
  },
  aboutAppTitle: {
    color: COLORS.text,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 14,
  },
  aboutVersion: {
    color: COLORS.cyan,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  aboutDescription: {
    color: "#C5D0E5",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 18,
  },
  aboutFeature: {
    gap: 12,
    marginTop: 22,
    padding: 15,
    backgroundColor: "#0B1425",
    borderRadius: 14,
  },
  aboutFeatureText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
  },
  aboutFooter: {
    color: COLORS.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: 18,
  },
});
