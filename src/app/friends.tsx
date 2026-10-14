import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Web / same-computer backend.
// Android Emulator: http://10.0.2.2:8000
// Physical Android phone: use your computer's LAN IPv4 address.
const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:8000"
    : "http://127.0.0.1:8000";

type Tab = "Discover" | "Friends" | "Requests" | "Groups";

type Friend = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  vetrixId: string;
  requestId?: string;
  friendStatus?: string;
};

const groups = [
  {
    id: "1",
    emoji: "🌍",
    title: "Language Learners",
    subtitle: "Daily language practice",
    color: "#173B5C",
  },
  {
    id: "2",
    emoji: "💻",
    title: "Coding Community",
    subtitle: "Learn coding together",
    color: "#30265D",
  },
  {
    id: "3",
    emoji: "🏆",
    title: "Daily Quiz Challenge",
    subtitle: "Practise and improve",
    color: "#49311F",
  },
];

function extractList(data: any, keys: string[] = []): any[] {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getPersonName(person: any): string {
  return (
    person?.name ||
    person?.full_name ||
    person?.username ||
    person?.email ||
    "VETRIX Learner"
  );
}

function mapUser(item: any): Friend {
  const person =
    item?.sender || item?.from_user || item?.user || item;

  return {
    id: String(
      person?.id ?? person?.user_id ?? item?.user_id ?? ""
    ),
    name: getPersonName(person),
    username: person?.username
      ? `@${person.username}`
      : "VETRIX learner",
    avatar: "👤",
    vetrixId: String(person?.vetrix_id || ""),
    friendStatus: String(
      item?.friend_status || item?.status || ""
    ),
  };
}

function mapRequest(item: any): Friend {
  const person =
    item?.sender || item?.from_user || item?.user || item;

  return {
    ...mapUser(item),
    requestId: String(item?.request_id ?? item?.id ?? ""),
    name: getPersonName(person),
  };
}

async function getAccessToken(): Promise<string | null> {
  for (const key of ["access", "access_token", "token"]) {
    const stored = await AsyncStorage.getItem(key);

    if (!stored) continue;

    try {
      const parsed = JSON.parse(stored);

      if (typeof parsed === "string" && parsed.trim()) {
        return parsed;
      }

      if (parsed?.access) return String(parsed.access);
      if (parsed?.access_token) return String(parsed.access_token);
      if (parsed?.token) return String(parsed.token);
    } catch {
      return stored.trim();
    }
  }

  return null;
}

async function apiRequest(
  path: string,
  method = "GET",
  body?: Record<string, unknown>
): Promise<any> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Login token not found. Please log in again.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      `Cannot connect to the server. Check that your backend is running and API_URL is correct: ${API_URL}`
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "Login session expired or access denied. Please log in again."
      );
    }

    throw new Error(
      data?.error ||
        data?.detail ||
        data?.message ||
        `Server error: ${response.status}`
    );
  }

  return data;
}

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Discover");
  const [search, setSearch] = useState("");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Friend[]>([]);
  const [discover, setDiscover] = useState<Friend[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [actionId, setActionId] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const refreshLock = useRef(false);
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  const busy = refreshing || searchLoading;

  const notify = useCallback((message: string) => {
    if (Platform.OS === "web") {
      setNotice(message);
    } else {
      Alert.alert("VETRIX", message);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    const data = await apiRequest("/api/auth/friends/");
    const items = extractList(data, ["friends"]);
    setFriends(items.map(mapUser));
  }, []);

  const loadRequests = useCallback(async () => {
    const data = await apiRequest("/api/auth/friends/requests/");
    const items = extractList(data, ["requests", "friend_requests"]);
    setRequests(items.map(mapRequest));
  }, []);

  const refreshData = useCallback(
    async (showSuccess = false) => {
      if (refreshLock.current) return;

      refreshLock.current = true;
      setRefreshing(true);
      setErrorMessage("");
      setNotice("");

      try {
        const results = await Promise.allSettled([
          loadFriends(),
          loadRequests(),
        ]);

        const failed = results.find(
          (result) => result.status === "rejected"
        );

        if (failed?.status === "rejected") {
          throw failed.reason;
        }

        setSearchRefreshKey((previous) => previous + 1);

        if (showSuccess) {
          setNotice("Friends and requests are up to date.");
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to refresh. Please try again."
        );
      } finally {
        setRefreshing(false);
        refreshLock.current = false;
      }
    },
    [loadFriends, loadRequests]
  );

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  // Search registered users by name or VETRIX ID.
  useEffect(() => {
    let cancelled = false;
    const query = search.trim();

    if (activeTab !== "Discover" || query.length < 2) {
      setDiscover([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (cancelled) return;

      setSearchLoading(true);
      setErrorMessage("");

      try {
        const data = await apiRequest(
          `/api/auth/users/search/?q=${encodeURIComponent(query)}`
        );

        if (cancelled) return;

        const items = extractList(data, ["users"]);
        setDiscover(items.map(mapUser));
      } catch (error) {
        if (!cancelled) {
          setDiscover([]);
          setErrorMessage(
            error instanceof Error ? error.message : "Search failed."
          );
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, activeTab, searchRefreshKey]);

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return friends;

    return friends.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.username.toLowerCase().includes(query) ||
        person.vetrixId.toLowerCase().includes(query)
    );
  }, [friends, search]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return requests;

    return requests.filter(
      (person) =>
        person.name.toLowerCase().includes(query) ||
        person.username.toLowerCase().includes(query) ||
        person.vetrixId.toLowerCase().includes(query)
    );
  }, [requests, search]);

  const sendRequest = async (person: Friend) => {
    if (!person.id || actionId || busy) return;

    setActionId(person.id);
    setErrorMessage("");
    setNotice("");

    try {
      const result = await apiRequest(
        "/api/auth/friends/requests/send/",
        "POST",
        { user_id: Number(person.id) }
      );

      const message =
        result?.message || `Friend request sent to ${person.name}.`;

      // Update the status using the backend response.
      const newStatus =
        result?.friend
          ? "friends"
          : result?.message?.toLowerCase().includes("already friends")
            ? "friends"
            : "request_sent";

      setDiscover((previous) =>
        previous.map((item) =>
          item.id === person.id
            ? { ...item, friendStatus: newStatus }
            : item
        )
      );

      notify(message);
      await refreshData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to send request."
      );
    } finally {
      setActionId("");
    }
  };

  const respondToRequest = async (
    person: Friend,
    action: "accept" | "reject"
  ) => {
    if (!person.requestId || actionId || busy) {
      if (!person.requestId) {
        setErrorMessage("Request ID missing. Please refresh the screen.");
      }
      return;
    }

    setActionId(person.requestId);
    setErrorMessage("");
    setNotice("");

    try {
      await apiRequest(
        `/api/auth/friends/requests/${encodeURIComponent(
          person.requestId
        )}/respond/`,
        "POST",
        { action }
      );

      notify(
        action === "accept"
          ? `You and ${person.name} are now friends!`
          : `Request from ${person.name} rejected.`
      );

      await refreshData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update request."
      );
    } finally {
      setActionId("");
    }
  };

  const renderPerson = (
    person: Friend,
    mode: "discover" | "friend" | "request"
  ) => {
    const status = (person.friendStatus || "").toLowerCase();

    const alreadySent = [
      "pending",
      "sent",
      "requested",
      "request_sent",
      "friends",
    ].includes(status);

    return (
      <View
        style={styles.personCard}
        key={`${mode}-${person.id}-${person.requestId || ""}`}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{person.avatar}</Text>
        </View>

        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>

          <Text style={styles.username}>{person.username}</Text>

          {person.vetrixId ? (
            <Text style={styles.vetrixId}>
              ID: {person.vetrixId}
            </Text>
          ) : null}

          <Text style={styles.personStats}>
            {mode === "friend"
              ? "Connected VETRIX learner"
              : mode === "request"
                ? "Friend request received"
                : status === "request_received"
                  ? "This learner sent you a request"
                  : status === "friends"
                    ? "Already connected"
                    : "VETRIX community member"}
          </Text>
        </View>

        {mode === "discover" && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              alreadySent && styles.sentButton,
            ]}
            disabled={alreadySent || busy || Boolean(actionId)}
            onPress={() => void sendRequest(person)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${person.name} as a friend`}
          >
            {actionId === person.id ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.actionButtonText}>
                {status === "friends"
                  ? "Friends ✓"
                  : status === "request_received"
                    ? "Requested"
                    : alreadySent
                      ? "Sent ✓"
                      : "+ Add"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {mode === "friend" && (
          <View style={styles.chatButton}>
            <Text style={styles.chatButtonText}>Friends ✓</Text>
          </View>
        )}

        {mode === "request" && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              disabled={Boolean(actionId) || busy}
              onPress={() => void respondToRequest(person, "accept")}
              accessibilityRole="button"
              accessibilityLabel={`Accept request from ${person.name}`}
            >
              {actionId === person.requestId ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>✓</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.declineButton}
              disabled={Boolean(actionId) || busy}
              onPress={() => void respondToRequest(person, "reject")}
              accessibilityRole="button"
              accessibilityLabel={`Reject request from ${person.name}`}
            >
              <Text style={styles.declineText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#080F20" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshData(true)}
            tintColor="#5EA5FF"
            colors={["#5EA5FF"]}
            progressBackgroundColor="#111C31"
          />
        }
      >
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
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>YOUR LEARNING COMMUNITY</Text>
            <Text style={styles.title}>Friends & Connect</Text>
            <Text style={styles.subtitle}>
              Learn together. Grow together. 🚀
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.refreshButton,
              refreshing && styles.refreshButtonBusy,
            ]}
            onPress={() => void refreshData(true)}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Refresh friends and requests"
            accessibilityState={{
              disabled: refreshing,
              busy: refreshing,
            }}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#8EC1FF" />
            ) : (
              <Text style={styles.refreshText}>↻</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statNumber}>{friends.length}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📩</Text>
            <Text style={styles.statNumber}>{requests.length}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statNumber}>{joinedGroups.length}</Text>
            <Text style={styles.statLabel}>My Groups*</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={
              activeTab === "Discover"
                ? "Search by name or VETRIX ID..."
                : "Search name or VETRIX ID..."
            }
            placeholderTextColor="#7D8AA5"
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {(["Discover", "Friends", "Requests", "Groups"] as const).map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => {
                  setActiveTab(tab);
                  setSearch("");
                  setErrorMessage("");
                  setNotice("");
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: activeTab === tab }}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                  {tab === "Requests" && requests.length > 0
                    ? ` (${requests.length})`
                    : ""}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {notice ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>{notice}</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>

            <TouchableOpacity
              onPress={() => void refreshData(true)}
              disabled={refreshing}
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>
                {refreshing ? "Refreshing..." : "Retry ↻"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === "Discover" && (
          <View>
            <Text style={styles.sectionTitle}>Discover learners</Text>
            <Text style={styles.sectionHint}>
              Search registered VETRIX users by name or unique ID.
            </Text>

            {searchLoading && discover.length === 0 ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#5EA5FF"
              />
            ) : search.trim().length < 2 ? (
              <Text style={styles.emptyText}>
                Enter a name or VETRIX ID, for example VTX000002.
              </Text>
            ) : discover.length > 0 ? (
              discover.map((person) =>
                renderPerson(person, "discover")
              )
            ) : !errorMessage ? (
              <Text style={styles.emptyText}>
                No users found. Check the name or VETRIX ID and try again.
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setActiveTab("Groups");
                setSearch("");
              }}
            >
              <Text style={styles.secondaryButtonText}>
                Explore Study Groups →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === "Friends" && (
          <View>
            <Text style={styles.sectionTitle}>My Friends 👋</Text>

            {refreshing && friends.length === 0 ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#5EA5FF"
              />
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((person) =>
                renderPerson(person, "friend")
              )
            ) : (
              <Text style={styles.emptyText}>
                No friends found yet. Discover learners and send a request.
              </Text>
            )}
          </View>
        )}

        {activeTab === "Requests" && (
          <View>
            <Text style={styles.sectionTitle}>Friend Requests 💌</Text>

            {refreshing && requests.length === 0 ? (
              <ActivityIndicator
                style={styles.loader}
                size="large"
                color="#5EA5FF"
              />
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((person) =>
                renderPerson(person, "request")
              )
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>✨</Text>
                <Text style={styles.emptyTitle}>
                  You're all caught up!
                </Text>
                <Text style={styles.emptyText}>
                  New friend requests will appear here.
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "Groups" && (
          <View>
            <Text style={styles.sectionTitle}>Study Groups 🌟</Text>
            <Text style={styles.sectionHint}>
              Demo groups. Membership is not saved to the backend yet.
            </Text>

            {groups.map((group) => {
              const joined = joinedGroups.includes(group.id);

              return (
                <View
                  key={group.id}
                  style={[
                    styles.groupCard,
                    { backgroundColor: group.color },
                  ]}
                >
                  <View style={styles.groupEmojiBox}>
                    <Text style={styles.groupEmoji}>{group.emoji}</Text>
                  </View>

                  <View style={styles.groupInfo}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <Text style={styles.groupSubtitle}>
                      {group.subtitle}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      joined && styles.joinedButton,
                    ]}
                    onPress={() => {
                      setJoinedGroups((previous) =>
                        previous.includes(group.id)
                          ? previous.filter((id) => id !== group.id)
                          : [...previous, group.id]
                      );

                      notify(
                        "Demo only: group membership is not saved to the backend yet."
                      );
                    }}
                  >
                    <Text
                      style={[
                        styles.joinButtonText,
                        joined && styles.joinedButtonText,
                      ]}
                    >
                      {joined ? "Joined ✓" : "Join +"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.challengeCard}>
              <Text style={styles.challengeEmoji}>🏆</Text>
              <Text style={styles.challengeTitle}>
                Ready for a challenge?
              </Text>
              <Text style={styles.challengeText}>
                Connect with learners and practise regularly. Shared group
                challenges need a backend feature.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            VETRIX · Learn. Connect. Achieve.
          </Text>
          <Text style={styles.footerNote}>
            *Groups are currently a local demo.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#080F20",
  },
  container: {
    flex: 1,
    backgroundColor: "#080F20",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#151F35",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#273550",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 35,
    marginTop: -3,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: "#5EA5FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#9AA8C1",
    fontSize: 12,
    marginTop: 7,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: "#151F35",
    borderWidth: 1,
    borderColor: "#273550",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  refreshButtonBusy: {
    opacity: 0.7,
    borderColor: "#5EA5FF",
  },
  refreshText: {
    color: "#8EC1FF",
    fontSize: 25,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    backgroundColor: "#111C31",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22304B",
  },
  statEmoji: {
    fontSize: 19,
    marginBottom: 7,
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },
  statLabel: {
    color: "#91A0BA",
    fontSize: 11,
    marginTop: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111C31",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#293854",
    paddingHorizontal: 14,
    height: 51,
    marginBottom: 20,
  },
  searchIcon: {
    color: "#91A9CF",
    fontSize: 25,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
  },
  clearText: {
    color: "#AAB7CE",
    padding: 5,
  },
  tabs: {
    gap: 9,
    paddingBottom: 22,
  },
  tab: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: "#111C31",
    borderWidth: 1,
    borderColor: "#26344D",
  },
  activeTab: {
    backgroundColor: "#246BFD",
    borderColor: "#246BFD",
  },
  tabText: {
    color: "#A9B6CC",
    fontSize: 12,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionHint: {
    color: "#8796B0",
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  personCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111C31",
    borderRadius: 17,
    padding: 12,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "#22304B",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#202D48",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 25,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  username: {
    color: "#91A1BD",
    fontSize: 11,
    marginTop: 3,
  },
  vetrixId: {
    color: "#8EC1FF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },
  personStats: {
    color: "#69A8FF",
    fontSize: 10,
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: "#246BFD",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginLeft: 5,
    minWidth: 56,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  sentButton: {
    backgroundColor: "#25344D",
  },
  chatButton: {
    backgroundColor: "#1B3456",
    borderWidth: 1,
    borderColor: "#3166A8",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
  },
  chatButtonText: {
    color: "#8EC1FF",
    fontSize: 10,
    fontWeight: "800",
  },
  requestActions: {
    flexDirection: "row",
    gap: 7,
  },
  acceptButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#246BFD",
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#302235",
    alignItems: "center",
    justifyContent: "center",
  },
  declineText: {
    color: "#FF91A4",
    fontWeight: "800",
  },
  emptyText: {
    color: "#94A3BB",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    paddingVertical: 22,
  },
  loader: {
    paddingVertical: 25,
  },
  emptyCard: {
    backgroundColor: "#111C31",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
  },
  emptyEmoji: {
    fontSize: 31,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },
  secondaryButton: {
    backgroundColor: "#142642",
    borderWidth: 1,
    borderColor: "#2D4F7E",
    padding: 15,
    alignItems: "center",
    borderRadius: 14,
    marginTop: 9,
  },
  secondaryButtonText: {
    color: "#85B9FF",
    fontSize: 12,
    fontWeight: "700",
  },
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  groupEmojiBox: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#FFFFFF18",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  groupEmoji: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  groupSubtitle: {
    color: "#D1D9EA",
    fontSize: 10,
    marginTop: 6,
  },
  joinButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginLeft: 6,
  },
  joinButtonText: {
    color: "#18345A",
    fontSize: 10,
    fontWeight: "800",
  },
  joinedButton: {
    backgroundColor: "#234F48",
    borderWidth: 1,
    borderColor: "#3A9D80",
  },
  joinedButtonText: {
    color: "#9AF0D1",
  },
  challengeCard: {
    backgroundColor: "#111C31",
    borderWidth: 1,
    borderColor: "#35456A",
    padding: 19,
    borderRadius: 18,
    marginTop: 8,
  },
  challengeEmoji: {
    fontSize: 27,
    marginBottom: 10,
  },
  challengeTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  challengeText: {
    color: "#9CAAC2",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: "#123B34",
    borderWidth: 1,
    borderColor: "#286B5D",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  infoText: {
    color: "#9AF0D1",
    fontSize: 12,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: "#351D2A",
    borderWidth: 1,
    borderColor: "#74354A",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    color: "#FF9AAA",
    fontSize: 12,
    lineHeight: 18,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  footer: {
    alignItems: "center",
    paddingTop: 27,
  },
  footerText: {
    color: "#63738F",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  footerNote: {
    color: "#53627D",
    fontSize: 9,
    marginTop: 5,
  },
});
