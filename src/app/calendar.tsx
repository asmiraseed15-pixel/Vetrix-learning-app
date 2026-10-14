import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";

const COLORS = {
  background: "#050816",
  surface: "#101A30",
  surface2: "#14213B",
  border: "#253452",
  blue: "#126EED",
  cyan: "#37D9FF",
  white: "#FFFFFF",
  muted: "#98A9C8",
  green: "#35D49A",
  orange: "#FFB454",
  red: "#FF647C",
};

const STORAGE_KEY = "vetrix_calendar_sessions_v1";
const SETTINGS_KEY = "vetrix_calendar_reminder_settings_v1";

type Session = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  createdAt: number;
  reminderSentAt?: number;
};

type ReminderMode = "until_done" | "limited" | "reschedule";

type ReminderSettings = {
  mode: ReminderMode;
  intervalMinutes: number;
};

const QUOTES = [
  "Small progress every day adds up to big results.",
  "Your future is created by what you learn today.",
  "Consistency is more powerful than motivation.",
  "One focused session can change your entire day.",
  "You do not have to be perfect. Just keep learning.",
  "Every expert was once a beginner.",
  "Your effort today is your confidence tomorrow.",
];

const pad = (value: number) => String(value).padStart(2, "0");

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const todayKey = () => dateKey(new Date());

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (value: string) => {
  if (!value || !value.includes(":")) return value;
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${pad(m)} ${suffix}`;
};

const getSessionStatus = (session: Session) => {
  if (session.completed) return "Completed";

  const today = todayKey();

  if (session.date < today) return "Pending";

  if (session.date > today) return "Upcoming";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const endMinutes = timeToMinutes(session.endTime);

  if (currentMinutes > endMinutes) return "Pending";
  if (currentMinutes >= timeToMinutes(session.startTime)) return "In progress";

  return "Upcoming";
};

const getSessionDateTime = (session: Session) => {
  const date = parseDate(session.date);
  const [hours, minutes] = session.endTime.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

export default function CalendarScreen() {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [sessionTitle, setSessionTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [showAddForm, setShowAddForm] = useState(false);

  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    mode: "until_done",
    intervalMinutes: 5,
  });

  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [clockNow, setClockNow] = useState(Date.now());

  const loadData = useCallback(async () => {
    try {
      const [storedSessions, storedSettings] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);

      if (storedSessions) {
        const parsed = JSON.parse(storedSessions);
        if (Array.isArray(parsed)) setSessions(parsed);
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setReminderSettings({
          mode: parsedSettings.mode || "until_done",
          intervalMinutes: [1, 5, 10].includes(
            Number(parsedSettings.intervalMinutes)
          )
            ? Number(parsedSettings.intervalMinutes)
            : 5,
        });
      }
    } catch (error) {
      console.warn("Could not load calendar data:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)).catch(
      (error) => console.warn("Could not save sessions:", error)
    );
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(reminderSettings)
    ).catch((error) => console.warn("Could not save reminder settings:", error));
  }, [reminderSettings, loaded]);

  // Refresh status when the screen is open.
  useEffect(() => {
    const interval = setInterval(() => setClockNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const monthTitle = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number; date: string } | null> = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = dateKey(new Date(year, month, day));
      cells.push({ day, date });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    return cells;
  }, [currentMonth]);

  const selectedSessions = useMemo(
    () =>
      sessions
        .filter((session) => session.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [sessions, selectedDate, clockNow]
  );

  const completedCount = sessions.filter((item) => item.completed).length;
  const pendingCount = sessions.filter(
    (item) => getSessionStatus(item) === "Pending"
  ).length;

  const learningDays = Array.from(
    new Set(sessions.map((session) => session.date))
  ).sort();

  const streak = useMemo(() => {
    const activeDays = new Set(learningDays);
    let count = 0;
    const day = new Date();

    if (!activeDays.has(dateKey(day))) {
      day.setDate(day.getDate() - 1);
    }

    while (activeDays.has(dateKey(day))) {
      count++;
      day.setDate(day.getDate() - 1);
    }

    return count;
  }, [learningDays, clockNow]);

  const quote = QUOTES[
    Math.abs(
      parseDate(selectedDate).getDate() +
        parseDate(selectedDate).getMonth()
    ) % QUOTES.length
  ];

  const changeMonth = (amount: number) => {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + amount,
          1
        )
    );
  };

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void
  ) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: onConfirm },
      ]);
    }
  };

  const addSession = () => {
    const cleanTitle = sessionTitle.trim();

    if (!cleanTitle) {
      showMessage("Session name required", "Please enter a learning session name.");
      return;
    }

    const validTime = (value: string) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

    if (!validTime(startTime) || !validTime(endTime)) {
      showMessage(
        "Invalid time",
        "Use 24-hour time format, for example 09:00 or 14:30."
      );
      return;
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      showMessage(
        "Check your time",
        "End time must be later than start time on the same day."
      );
      return;
    }

    const newSession: Session = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: cleanTitle,
      date: selectedDate,
      startTime,
      endTime,
      completed: false,
      createdAt: Date.now(),
    };

    setSessions((previous) => [...previous, newSession]);
    setSessionTitle("");
    setShowAddForm(false);
    showMessage("Session added", "Your learning session has been saved.");
  };

  const toggleCompleted = (session: Session) => {
    const willComplete = !session.completed;

    setSessions((previous) =>
      previous.map((item) =>
        item.id === session.id
          ? {
              ...item,
              completed: willComplete,
              reminderSentAt: undefined,
            }
          : item
      )
    );

    if (willComplete) {
      showMessage("Great work! 🎉", "Your learning session is completed.");
    }
  };

  const deleteSession = (session: Session) => {
    confirmAction(
      "Delete session?",
      `Are you sure you want to delete "${session.title}"?`,
      () =>
        setSessions((previous) =>
          previous.filter((item) => item.id !== session.id)
        )
    );
  };

  const rescheduleSession = (session: Session) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    const newDateKey = dateKey(nextDate);

    confirmAction(
      "Reschedule session?",
      `Move "${session.title}" to tomorrow (${newDateKey})?`,
      () => {
        setSessions((previous) =>
          previous.map((item) =>
            item.id === session.id
              ? {
                  ...item,
                  date: newDateKey,
                  completed: false,
                  reminderSentAt: undefined,
                }
              : item
          )
        );

        setSelectedDate(newDateKey);
        setCurrentMonth(
          new Date(nextDate.getFullYear(), nextDate.getMonth(), 1)
        );
        showMessage(
          "Session rescheduled",
          "Your session has been moved to tomorrow. You can change its date by selecting another day and adding a new session."
        );
      }
    );
  };

  const handlePendingAction = (session: Session) => {
    if (session.completed) return;

    const status = getSessionStatus(session);

    if (status !== "Pending") {
      showMessage(
        "Session reminder",
        `Your session is ${status.toLowerCase()}. Complete it after your learning activity.`
      );
      return;
    }

    if (Platform.OS === "web") {
      const shouldReschedule = window.confirm(
        `"${session.title}" is still pending.\n\nPress OK to reschedule it to tomorrow. Press Cancel to keep it pending.`
      );

      if (shouldReschedule) rescheduleSession(session);
    } else {
      Alert.alert(
        "Session still pending",
        `"${session.title}" has passed its end time. What would you like to do?`,
        [
          { text: "Keep pending", style: "cancel" },
          {
            text: "Complete now",
            onPress: () => toggleCompleted(session),
          },
          {
            text: "Reschedule",
            onPress: () => rescheduleSession(session),
          },
        ]
      );
    }
  };

  const getReminderDescription = () => {
    if (reminderSettings.mode === "until_done") {
      return `Reminder interval: every ${reminderSettings.intervalMinutes} minute(s) until you mark the task complete.`;
    }

    if (reminderSettings.mode === "limited") {
      return `Reminder interval: every ${reminderSettings.intervalMinutes} minute(s). Reminder plan ends 30 minutes after the session end time.`;
    }

    return "When the end time passes, the session shows as Pending so you can complete or reschedule it.";
  };

  const statusColor = (status: string) => {
    if (status === "Completed") return COLORS.green;
    if (status === "Pending") return COLORS.red;
    if (status === "In progress") return COLORS.cyan;
    return COLORS.orange;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>YOUR LEARNING JOURNEY</Text>
            <Text style={styles.pageTitle}>Calendar</Text>
            <Text style={styles.subtitle}>
              Plan today. Learn consistently. Grow every day.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => {
              const today = todayKey();
              setSelectedDate(today);
              setCurrentMonth(new Date());
            }}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.streakCard]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📚</Text>
            <Text style={styles.statNumber}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{completedCount}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>YOUR SCHEDULE</Text>
              <Text style={styles.monthTitle}>{monthTitle}</Text>
            </View>

            <View style={styles.monthControls}>
              <TouchableOpacity
                accessibilityLabel="Previous month"
                style={styles.arrowButton}
                onPress={() => changeMonth(-1)}
              >
                <Text style={styles.arrowText}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityLabel="Next month"
                style={styles.arrowButton}
                onPress={() => changeMonth(1)}
              >
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {monthDays.map((item, index) => {
              if (!item) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const isSelected = item.date === selectedDate;
              const isToday = item.date === todayKey();
              const hasSession = sessions.some(
                (session) => session.date === item.date
              );

              return (
                <TouchableOpacity
                  key={item.date}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    isToday && !isSelected && styles.todayCell,
                  ]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDayNumber,
                      isToday && !isSelected && styles.todayNumber,
                    ]}
                  >
                    {item.day}
                  </Text>

                  {hasSession && (
                    <View
                      style={[
                        styles.eventDot,
                        isSelected && styles.selectedEventDot,
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Learning session</Text>
            </View>
            <Text style={styles.legendText}>
              {sessions.filter((s) => s.date === selectedDate).length} scheduled
            </Text>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteMark}>
            <Text style={styles.quoteMarkText}>“</Text>
          </View>
          <View style={styles.quoteContent}>
            <Text style={styles.quoteLabel}>DAILY MOTIVATION</Text>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>
        </View>

        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Learning sessions</Text>
            <Text style={styles.sessionDate}>
              {parseDate(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm((previous) => !previous)}
          >
            <Text style={styles.addButtonText}>
              {showAddForm ? "Cancel" : "+ Add"}
            </Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Create a learning session</Text>

            <Text style={styles.inputLabel}>Session name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Python practice"
              placeholderTextColor={COLORS.muted}
              value={sessionTitle}
              onChangeText={setSessionTitle}
              maxLength={80}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.inputLabel}>Start time (24h)</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>

              <View style={styles.timeField}>
                <Text style={styles.inputLabel}>End time (24h)</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="09:30"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={addSession}>
              <Text style={styles.saveButtonText}>Save session</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              Select the date on the calendar before adding a session.
            </Text>
          </View>
        )}

        {selectedSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>🗓️</Text>
            </View>
            <Text style={styles.emptyTitle}>Nothing planned yet</Text>
            <Text style={styles.emptyText}>
              Make this day count. Add a learning session to get started.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={styles.emptyButtonText}>+ Plan a session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          selectedSessions.map((session) => {
            const status = getSessionStatus(session);

            return (
              <View key={session.id} style={styles.sessionCard}>
                <View
                  style={[
                    styles.sessionAccent,
                    { backgroundColor: statusColor(status) },
                  ]}
                />

                <View style={styles.sessionBody}>
                  <View style={styles.sessionTopRow}>
                    <Text style={styles.sessionTitle} numberOfLines={2}>
                      {session.title}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          borderColor: statusColor(status) + "70",
                          backgroundColor: statusColor(status) + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusColor(status) },
                        ]}
                      >
                        {status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sessionTime}>
                    ◷ {formatTime(session.startTime)} –{" "}
                    {formatTime(session.endTime)}
                  </Text>

                  {status === "Pending" && !session.completed && (
                    <Text style={styles.pendingHint}>
                      This session's end time has passed. Complete it or
                      reschedule it.
                    </Text>
                  )}

                  <View style={styles.sessionActions}>
                    <TouchableOpacity
                      style={[
                        styles.completeButton,
                        session.completed && styles.completedButton,
                      ]}
                      onPress={() => toggleCompleted(session)}
                    >
                      <Text
                        style={[
                          styles.completeButtonText,
                          session.completed && styles.completedButtonText,
                        ]}
                      >
                        {session.completed ? "✓ Completed" : "✓ Mark done"}
                      </Text>
                    </TouchableOpacity>

                    {!session.completed && status === "Pending" && (
                      <TouchableOpacity
                        style={styles.rescheduleButton}
                        onPress={() => handlePendingAction(session)}
                      >
                        <Text style={styles.rescheduleText}>Reschedule</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteSession(session)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        <View style={styles.reminderCard}>
          <View style={styles.reminderIcon}>
            <Text style={styles.reminderEmoji}>🔔</Text>
          </View>

          <View style={styles.reminderContent}>
            <Text style={styles.reminderTitle}>Smart task reminders</Text>
            <Text style={styles.reminderDescription}>
              {getReminderDescription()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowReminderSettings((previous) => !previous)}
          >
            <Text style={styles.settingsButtonText}>
              {showReminderSettings ? "Close" : "Set"}
            </Text>
          </TouchableOpacity>
        </View>

        {showReminderSettings && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Reminder preferences</Text>
            <Text style={styles.inputLabel}>Reminder behaviour</Text>

            {(
              [
                {
                  value: "until_done",
                  title: "Until completed",
                  description: "Keep reminding until you mark the session done.",
                },
                {
                  value: "limited",
                  title: "Limited reminders",
                  description: "Reminder plan ends 30 minutes after end time.",
                },
                {
                  value: "reschedule",
                  title: "Pending + reschedule",
                  description: "After end time, show pending and let me reschedule.",
                },
              ] as {
                value: ReminderMode;
                title: string;
                description: string;
              }[]
            ).map((option) => {
              const active = reminderSettings.mode === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modeOption,
                    active && styles.modeOptionActive,
                  ]}
                  onPress={() =>
                    setReminderSettings((previous) => ({
                      ...previous,
                      mode: option.value,
                    }))
                  }
                >
                  <View
                    style={[
                      styles.radioOuter,
                      active && styles.radioOuterActive,
                    ]}
                  >
                    {active && <View style={styles.radioInner} />}
                  </View>

                  <View style={styles.modeTextContent}>
                    <Text style={styles.modeTitle}>{option.title}</Text>
                    <Text style={styles.modeDescription}>
                      {option.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {reminderSettings.mode !== "reschedule" && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 18 }]}>
                  Reminder interval
                </Text>

                <View style={styles.intervalRow}>
                  {[1, 5, 10].map((minutes) => {
                    const active =
                      reminderSettings.intervalMinutes === minutes;

                    return (
                      <TouchableOpacity
                        key={minutes}
                        style={[
                          styles.intervalButton,
                          active && styles.intervalButtonActive,
                        ]}
                        onPress={() =>
                          setReminderSettings((previous) => ({
                            ...previous,
                            intervalMinutes: minutes,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.intervalButtonText,
                            active && styles.intervalButtonTextActive,
                          ]}
                        >
                          {minutes} min
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                Important: These preferences are saved, and overdue sessions
                appear as Pending when you open the app. Actual recurring
                notifications are not scheduled by this file yet. That needs
                Expo Notifications setup and permission.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Your learning, your progress.</Text>
          <Text style={styles.footerText}>
            {pendingCount > 0
              ? `You have ${pendingCount} pending session(s). Take one small step and get back on track.`
              : "Stay consistent. Every session is a step toward your goal."}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/home");
          }}
        >
          <Text style={styles.backButtonText}>← Back to learning</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "android" ? 14 : 8,
    paddingBottom: 38,
    maxWidth: 850,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 7,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  todayButton: {
    borderWidth: 1,
    borderColor: COLORS.blue,
    backgroundColor: "#126EED20",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  todayButtonText: {
    color: COLORS.cyan,
    fontWeight: "800",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakCard: {
    borderColor: "#FFB45455",
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 8,
  },
  statNumber: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900",
  },
  statLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionEyebrow: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 4,
  },
  monthTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  monthControls: {
    flexDirection: "row",
    gap: 8,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: COLORS.white,
    fontSize: 28,
    lineHeight: 31,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    paddingVertical: 7,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1.4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 0,
  },
  selectedDayCell: {
    backgroundColor: COLORS.blue,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
  },
  dayNumber: {
    color: "#D8E2F5",
    fontSize: 13,
    fontWeight: "600",
  },
  selectedDayNumber: {
    color: COLORS.white,
    fontWeight: "900",
  },
  todayNumber: {
    color: COLORS.cyan,
    fontWeight: "900",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    marginTop: 4,
  },
  selectedEventDot: {
    backgroundColor: COLORS.white,
  },
  calendarLegend: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 13,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  quoteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11233A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#37D9FF35",
    padding: 16,
    marginBottom: 25,
    gap: 12,
  },
  quoteMark: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#37D9FF18",
    alignItems: "center",
    justifyContent: "center",
  },
  quoteMarkText: {
    color: COLORS.cyan,
    fontSize: 35,
    fontWeight: "900",
    lineHeight: 43,
  },
  quoteContent: {
    flex: 1,
  },
  quoteLabel: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  quoteText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
  },
  sessionDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
  },
  formTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 17,
  },
  inputLabel: {
    color: "#D5E0F4",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#081225",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 13,
    marginBottom: 15,
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
  },
  timeField: {
    flex: 1,
    minWidth: 0,
  },
  saveButton: {
    backgroundColor: COLORS.blue,
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 1,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    fontSize: 13,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 11,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 25,
    alignItems: "center",
    marginBottom: 17,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyEmoji: {
    fontSize: 27,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 17,
  },
  emptyButton: {
    borderRadius: 12,
    backgroundColor: "#126EED20",
    borderWidth: 1,
    borderColor: COLORS.blue,
    paddingHorizontal: 17,
    paddingVertical: 11,
  },
  emptyButtonText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "800",
  },
  sessionCard: {
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  sessionAccent: {
    width: 4,
  },
  sessionBody: {
    flex: 1,
    padding: 15,
  },
  sessionTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 9,
  },
  sessionTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    flex: 1,
    lineHeight: 20,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  sessionTime: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 9,
  },
  pendingHint: {
    color: COLORS.red,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  sessionActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  completeButton: {
    backgroundColor: "#35D49A18",
    borderWidth: 1,
    borderColor: "#35D49A60",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  completedButton: {
    backgroundColor: "#35D49A",
  },
  completeButtonText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "800",
  },
  completedButtonText: {
    color: "#061A17",
  },
  rescheduleButton: {
    backgroundColor: "#FFB45416",
    borderWidth: 1,
    borderColor: "#FFB45465",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  rescheduleText: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "800",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#FF647C12",
  },
  deleteText: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 15,
    marginTop: 10,
    gap: 11,
  },
  reminderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#126EED25",
    alignItems: "center",
    justifyContent: "center",
  },
  reminderEmoji: {
    fontSize: 21,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  reminderDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },
  settingsButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#126EED20",
    borderWidth: 1,
    borderColor: COLORS.blue,
  },
  settingsButtonText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "800",
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 9,
    backgroundColor: "#081225",
  },
  modeOptionActive: {
    borderColor: COLORS.blue,
    backgroundColor: "#126EED18",
  },
  radioOuter: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterActive: {
    borderColor: COLORS.cyan,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
  },
  modeTextContent: {
    flex: 1,
  },
  modeTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  modeDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  intervalRow: {
    flexDirection: "row",
    gap: 9,
  },
  intervalButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#081225",
  },
  intervalButtonActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  intervalButtonText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },
  intervalButtonTextActive: {
    color: COLORS.white,
  },
  noticeBox: {
    backgroundColor: "#FFB45412",
    borderWidth: 1,
    borderColor: "#FFB45440",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  noticeText: {
    color: "#FFD49B",
    fontSize: 10,
    lineHeight: 16,
  },
  footerCard: {
    marginTop: 17,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#10223B",
    borderWidth: 1,
    borderColor: "#37D9FF25",
  },
  footerTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 7,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  backButtonText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "800",
  },
});
