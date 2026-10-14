import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

type GameName =
  | "puzzle"
  | "detective"
  | "memory"
  | "tictactoe"
  | "ludo"
  | null;

type MysteryClue = {
  id: string;
  title: string;
  emoji: string;
  description: string;
};

type Suspect = {
  id: string;
  name: string;
  emoji: string;
  role: string;
  statement: string;
};

type MysteryCase = {
  id: number;
  title: string;
  subtitle: string;
  story: string;
  location: string;
  difficulty: string;
  reward: number;
  clues: MysteryClue[];
  suspects: Suspect[];
  culprit: string;
  explanation: string;
  hint: string;
};

const BLUE = "#126EED";

const MYSTERY_CASES: MysteryCase[] = [
  {
    id: 1,
    title: "The Missing Laptop",
    subtitle: "Case #001 • Office Mystery",
    story:
      "A company laptop disappeared from the manager's office last night. The office was locked when the staff arrived this morning. Three employees were in the building after closing time. Find the clues and identify the culprit!",
    location: "🏢 Company Office",
    difficulty: "EASY",
    reward: 100,
    clues: [
      {
        id: "office-log",
        title: "Security Log",
        emoji: "📋",
        description:
          "The security log shows that Arjun entered the manager's office at 8:10 PM. He was the last employee recorded entering the room.",
      },
      {
        id: "footprints",
        title: "Muddy Footprints",
        emoji: "👣",
        description:
          "Muddy footprints lead from the garden entrance to the office. Arjun's shoes have the same unusual zigzag pattern as the prints.",
      },
      {
        id: "black-bag",
        title: "Witness Report",
        emoji: "👜",
        description:
          "The security guard remembers seeing Arjun leave with a large black bag. Arjun had arrived without a bag earlier that day.",
      },
    ],
    suspects: [
      {
        id: "arjun",
        name: "Arjun",
        emoji: "👨‍💻",
        role: "IT Assistant",
        statement:
          "I only went to check the office computer. I left with my work bag.",
      },
      {
        id: "maya",
        name: "Maya",
        emoji: "👩‍🎨",
        role: "UI Designer",
        statement:
          "I left at 6 PM. I never went near the manager's office.",
      },
      {
        id: "ravi",
        name: "Ravi",
        emoji: "👨‍💼",
        role: "Manager",
        statement:
          "I locked my office before leaving. I did not take the laptop.",
      },
    ],
    culprit: "arjun",
    explanation:
      "Arjun was recorded entering the office, his shoes matched the footprints, and the guard saw him leave with a suspicious bag. The clues point to Arjun!",
    hint:
      "Check who entered the office last, then compare the footprints and the witness report.",
  },
  {
    id: 2,
    title: "The Stolen Diamond",
    subtitle: "Case #002 • Museum Mystery",
    story:
      "A priceless diamond vanished from a museum display during the evening exhibition. The display alarm did not activate. Three staff members had access to the gallery. Can you discover who took the diamond?",
    location: "🏛️ City Museum",
    difficulty: "MEDIUM",
    reward: 150,
    clues: [
      {
        id: "alarm",
        title: "Alarm Record",
        emoji: "🚨",
        description:
          "The display alarm was disarmed using an authorised staff card at 7:42 PM. Only gallery staff had access to those cards.",
      },
      {
        id: "blue-thread",
        title: "Blue Fabric Thread",
        emoji: "🧵",
        description:
          "A blue thread was found caught on the display case. It looks like the fabric used in the museum's blue staff uniforms.",
      },
      {
        id: "torn-sleeve",
        title: "Torn Sleeve",
        emoji: "👔",
        description:
          "Nina's blue uniform has a freshly torn sleeve. She says she has no idea how it was damaged, but the loose threads look similar to the one on the display.",
      },
    ],
    suspects: [
      {
        id: "nina",
        name: "Nina",
        emoji: "👩‍🔬",
        role: "Gallery Assistant",
        statement:
          "I was near the diamond display, but I never touched it.",
      },
      {
        id: "omar",
        name: "Omar",
        emoji: "👨‍✈️",
        role: "Security Guard",
        statement:
          "I was watching the main entrance during the exhibition.",
      },
      {
        id: "leo",
        name: "Leo",
        emoji: "🧑‍💼",
        role: "Event Manager",
        statement:
          "I was helping visitors in the other gallery at that time.",
      },
    ],
    culprit: "nina",
    explanation:
      "The alarm was disarmed with staff access, and Nina's torn uniform matches the thread found on the display. The combined evidence points to Nina.",
    hint:
      "Look for the suspect who had authorised access and whose clothing matches the evidence.",
  },
  {
    id: 3,
    title: "The Missing Recipe",
    subtitle: "Case #003 • Bakery Mystery",
    story:
      "A famous bakery's secret cake recipe disappeared just before a big competition. The recipe was stored in a locked kitchen drawer. Three people were working at the bakery that evening. Investigate before the competition begins!",
    location: "🧁 Sweet Corner Bakery",
    difficulty: "HARD",
    reward: 200,
    clues: [
      {
        id: "drawer",
        title: "Locked Drawer",
        emoji: "🔐",
        description:
          "The drawer was not forced open. Someone used the kitchen key. Only the owner and the evening assistant had keys that night.",
      },
      {
        id: "flour",
        title: "Floury Footprints",
        emoji: "👣",
        description:
          "Floury footprints lead from the kitchen to the delivery area. Kavin said he never entered the kitchen after closing, but his shoes are covered in fresh flour.",
      },
      {
        id: "delivery",
        title: "Delivery Bag",
        emoji: "🛍️",
        description:
          "A folded paper was found inside Kavin's delivery bag. Its torn edge matches the corner of the missing recipe sheet.",
      },
    ],
    suspects: [
      {
        id: "kavin",
        name: "Kavin",
        emoji: "👨‍🍳",
        role: "Evening Assistant",
        statement:
          "I never entered the kitchen after closing. I only prepared the delivery bags.",
      },
      {
        id: "sara",
        name: "Sara",
        emoji: "👩‍🍳",
        role: "Head Baker",
        statement:
          "I put the recipe away before I left. I did not take it.",
      },
      {
        id: "daniel",
        name: "Daniel",
        emoji: "🧑‍💼",
        role: "Delivery Manager",
        statement:
          "I checked the delivery orders, but I did not enter the kitchen.",
      },
    ],
    culprit: "kavin",
    explanation:
      "Kavin denied entering the kitchen, but the footprints contradict his statement. The torn recipe paper was also found in his delivery bag. The evidence points to Kavin!",
    hint:
      "Compare what the suspects said with the footprints and the torn paper.",
  },
];

const makePuzzle = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  let inversions = 0;
  const list = numbers.filter((n) => n !== 0);

  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (list[i] > list[j]) inversions++;
    }
  }

  if (inversions % 2 !== 0) {
    const a = numbers.indexOf(1);
    const b = numbers.indexOf(2);
    [numbers[a], numbers[b]] = [numbers[b], numbers[a]];
  }

  if (
    numbers.every((n, i) => n === (i === 8 ? 0 : i + 1))
  ) {
    [numbers[0], numbers[1]] = [numbers[1], numbers[0]];
  }

  return numbers;
};

const makeCards = () => {
  const emojis = ["🐱", "🍎", "🚀", "🌈", "🐼", "⚽"];

  return [...emojis, ...emojis]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({
      id: `${emoji}-${index}`,
      emoji,
      matched: false,
    }));
};

export default function GamesScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  const [activeGame, setActiveGame] = useState<GameName>(null);

  // MINI PUZZLE
  const [puzzle, setPuzzle] = useState<number[]>(makePuzzle());
  const [moves, setMoves] = useState(0);
  const [puzzleWon, setPuzzleWon] = useState(false);

  // MYSTERY DETECTIVE
  const [caseIndex, setCaseIndex] = useState(0);
  const [revealedClues, setRevealedClues] = useState<string[]>([]);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(
    null
  );
  const [mysterySolved, setMysterySolved] = useState(false);
  const [mysteryFeedback, setMysteryFeedback] = useState("");
  const [mysteryHintUsed, setMysteryHintUsed] = useState(false);
  const [mysteryWrongGuesses, setMysteryWrongGuesses] = useState(0);
  const [mysteryScore, setMysteryScore] = useState(0);
  const [caseSeconds, setCaseSeconds] = useState(0);
  const [completedCases, setCompletedCases] = useState<number[]>([]);

  const currentCase = MYSTERY_CASES[caseIndex];

  useEffect(() => {
    if (activeGame !== "detective" || mysterySolved) return;

    const interval = setInterval(() => {
      setCaseSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeGame, mysterySolved, caseIndex]);

  // MEMORY MATCH
  const [cards, setCards] = useState(makeCards());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryLocked, setMemoryLocked] = useState(false);

  // TIC TAC TOE
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [player, setPlayer] = useState("X");

  // MINI LUDO
  const [positions, setPositions] = useState([0, 0]);
  const [ludoPlayer, setLudoPlayer] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [ludoWinner, setLudoWinner] = useState<number | null>(null);

  // NAVIGATION
  const openGame = (game: GameName) => {
    setActiveGame(game);
  };

  const goBackToGames = () => {
    setActiveGame(null);
  };

  // PUZZLE FUNCTIONS
  const resetPuzzle = () => {
    setPuzzle(makePuzzle());
    setMoves(0);
    setPuzzleWon(false);
  };

  const moveTile = (index: number) => {
    if (puzzleWon) return;

    const emptyIndex = puzzle.indexOf(0);
    const sameRow =
      Math.floor(index / 3) === Math.floor(emptyIndex / 3);
    const sameColumn = index % 3 === emptyIndex % 3;

    const adjacent =
      (sameRow && Math.abs(index - emptyIndex) === 1) ||
      (sameColumn && Math.abs(index - emptyIndex) === 3);

    if (!adjacent) return;

    const next = [...puzzle];

    [next[index], next[emptyIndex]] = [
      next[emptyIndex],
      next[index],
    ];

    setPuzzle(next);
    setMoves((m) => m + 1);

    if (next.every((n, i) => n === (i === 8 ? 0 : i + 1))) {
      setPuzzleWon(true);
    }
  };

  // MYSTERY DETECTIVE FUNCTIONS
  const resetCurrentCase = () => {
    setRevealedClues([]);
    setSelectedSuspect(null);
    setMysterySolved(false);
    setMysteryFeedback("");
    setMysteryHintUsed(false);
    setMysteryWrongGuesses(0);
    setCaseSeconds(0);
  };

  const openMysteryCase = (index: number) => {
    setCaseIndex(index);
    setRevealedClues([]);
    setSelectedSuspect(null);
    setMysterySolved(false);
    setMysteryFeedback("");
    setMysteryHintUsed(false);
    setMysteryWrongGuesses(0);
    setCaseSeconds(0);
  };

  const revealClue = (clueId: string) => {
    if (mysterySolved) return;

    setRevealedClues((old) =>
      old.includes(clueId) ? old : [...old, clueId]
    );
  };

  const useMysteryHint = () => {
    if (mysterySolved || mysteryHintUsed) return;

    setMysteryHintUsed(true);
    setMysteryFeedback(`💡 Detective Hint: ${currentCase.hint}`);
  };

  const accuseSuspect = (suspectId: string) => {
    if (mysterySolved) return;

    setSelectedSuspect(suspectId);

    if (suspectId === currentCase.culprit) {
      const points = Math.max(
        25,
        currentCase.reward -
          (mysteryHintUsed ? 25 : 0) -
          mysteryWrongGuesses * 15 -
          Math.floor(caseSeconds / 30) * 5
      );

      setMysterySolved(true);
      setMysteryFeedback(
        `🎉 Case solved! You earned ${points} XP. ${currentCase.explanation}`
      );
      setMysteryScore((score) => score + points);
      setCompletedCases((old) =>
        old.includes(currentCase.id)
          ? old
          : [...old, currentCase.id]
      );
    } else {
      setMysteryWrongGuesses((count) => count + 1);
      setMysteryFeedback(
        "❌ This evidence doesn't fully match this suspect. Recheck the clues and try again!"
      );
    }
  };

  const goToNextCase = () => {
    const nextIndex = (caseIndex + 1) % MYSTERY_CASES.length;
    openMysteryCase(nextIndex);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // MEMORY FUNCTIONS
  const resetMemory = () => {
    setCards(makeCards());
    setSelectedCards([]);
    setMemoryMoves(0);
    setMemoryLocked(false);
  };

  const chooseCard = (index: number) => {
    if (
      memoryLocked ||
      cards[index].matched ||
      selectedCards.includes(index) ||
      selectedCards.length >= 2
    ) {
      return;
    }

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMemoryMoves((m) => m + 1);

      const [first, second] = nextSelected;

      if (cards[first].emoji === cards[second].emoji) {
        setCards((old) =>
          old.map((card, i) =>
            i === first || i === second
              ? { ...card, matched: true }
              : card
          )
        );

        setSelectedCards([]);
      } else {
        setMemoryLocked(true);

        setTimeout(() => {
          setSelectedCards([]);
          setMemoryLocked(false);
        }, 700);
      }
    }
  };

  // TIC TAC TOE FUNCTIONS
  const resetTicTacToe = () => {
    setBoard(Array(9).fill(""));
    setPlayer("X");
  };

  const getTicTacToeWinner = (squares: string[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    return null;
  };

  const ticWinner = getTicTacToeWinner(board);
  const ticDraw = !ticWinner && board.every(Boolean);

  const playTicTacToe = (index: number) => {
    if (board[index] || ticWinner || ticDraw) return;

    const next = [...board];
    next[index] = player;

    setBoard(next);
    setPlayer(player === "X" ? "O" : "X");
  };

  // LUDO FUNCTIONS
  const resetLudo = () => {
    setPositions([0, 0]);
    setLudoPlayer(0);
    setDice(null);
    setLudoWinner(null);
  };

  const rollDice = () => {
    if (ludoWinner !== null) return;

    const rolled = Math.floor(Math.random() * 6) + 1;
    setDice(rolled);

    const next = [...positions];
    next[ludoPlayer] = Math.min(20, next[ludoPlayer] + rolled);

    setPositions(next);

    if (next[ludoPlayer] >= 20) {
      setLudoWinner(ludoPlayer);
    } else {
      setLudoPlayer(ludoPlayer === 0 ? 1 : 0);
    }
  };

  const renderHeader = (title: string, subtitle: string) => (
    <View style={styles.gameHeader}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={goBackToGames}
      >
        <Text style={styles.backText}>‹  Games</Text>
      </TouchableOpacity>

      <Text style={styles.gameTitle}>{title}</Text>
      <Text style={styles.gameSubtitle}>{subtitle}</Text>
    </View>
  );

  // -----------------------------------------
  // MINI PUZZLE
  // -----------------------------------------
  if (activeGame === "puzzle") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <StatusBar barStyle="dark-content" />
        {renderHeader("Mini Puzzle 🧩", "Arrange numbers from 1 to 8")}

        <View style={styles.gameCard}>
          <Text style={styles.counter}>Moves: {moves}</Text>

          <View
            style={[
              styles.puzzleGrid,
              compact && styles.puzzleGridCompact,
            ]}
          >
            {puzzle.map((number, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.puzzleTile,
                  number === 0 && styles.emptyTile,
                ]}
                onPress={() => moveTile(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.puzzleNumber}>
                  {number === 0 ? "" : number}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {puzzleWon && (
            <Text style={styles.successText}>
              🎉 Super! Puzzle solved!
            </Text>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={resetPuzzle}
          >
            <Text style={styles.primaryButtonText}>↻ Restart Puzzle</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Empty space pakkathula irukkura number tile-ah tap pannu.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // -----------------------------------------
  // MYSTERY DETECTIVE
  // -----------------------------------------
  if (activeGame === "detective") {
    const allCluesFound =
      revealedClues.length === currentCase.clues.length;

    const nextCaseIndex = (caseIndex + 1) % MYSTERY_CASES.length;
    const hasMoreUnsolvedCases = completedCases.length < MYSTERY_CASES.length;

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <StatusBar barStyle="light-content" />

        <View style={styles.detectivePage}>
          {renderHeader("Mystery Detective 🔍", "Think like a detective. Solve the case.")}

          <View style={styles.detectiveScoreBar}>
            <View style={styles.detectiveScoreItem}>
              <Text style={styles.detectiveScoreEmoji}>🏆</Text>
              <View>
                <Text style={styles.detectiveSmallLabel}>TOTAL XP</Text>
                <Text style={styles.detectiveScoreValue}>
                  {mysteryScore}
                </Text>
              </View>
            </View>

            <View style={styles.detectiveScoreItem}>
              <Text style={styles.detectiveScoreEmoji}>📁</Text>
              <View>
                <Text style={styles.detectiveSmallLabel}>CASES</Text>
                <Text style={styles.detectiveScoreValue}>
                  {completedCases.length}/{MYSTERY_CASES.length}
                </Text>
              </View>
            </View>

            <View style={styles.detectiveScoreItem}>
              <Text style={styles.detectiveScoreEmoji}>⏱️</Text>
              <View>
                <Text style={styles.detectiveSmallLabel}>TIME</Text>
                <Text style={styles.detectiveScoreValue}>
                  {formatTime(caseSeconds)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.caseHero}>
            <View style={styles.caseTopRow}>
              <Text style={styles.caseBadge}>🔎 INVESTIGATION</Text>
              <Text style={styles.caseDifficulty}>
                {currentCase.difficulty}
              </Text>
            </View>

            <Text style={styles.caseNumber}>
              {currentCase.subtitle}
            </Text>

            <Text style={styles.caseTitle}>
              {currentCase.title}
            </Text>

            <Text style={styles.caseLocation}>
              {currentCase.location}
            </Text>

            <Text style={styles.caseStory}>
              {currentCase.story}
            </Text>

            <View style={styles.caseReward}>
              <Text style={styles.caseRewardText}>
                🏆 Solve this case • Earn up to {currentCase.reward} XP
              </Text>
            </View>
          </View>

          <View style={styles.caseProgressCard}>
            <View style={styles.caseProgressHeader}>
              <Text style={styles.caseSectionTitle}>
                Your Investigation
              </Text>
              <Text style={styles.caseProgressCount}>
                {revealedClues.length}/{currentCase.clues.length} clues
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (revealedClues.length / currentCase.clues.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.caseHelper}>
              Tap each evidence card to investigate. Read all the details
              before accusing anyone.
            </Text>
          </View>

          <Text style={styles.detectiveSectionHeading}>
            🔍 Evidence & Clues
          </Text>

          {currentCase.clues.map((clue, index) => {
            const isRevealed = revealedClues.includes(clue.id);

            return (
              <TouchableOpacity
                key={clue.id}
                style={[
                  styles.clueCard,
                  isRevealed && styles.clueCardRevealed,
                ]}
                onPress={() => revealClue(clue.id)}
                activeOpacity={0.85}
                disabled={mysterySolved}
              >
                <View style={styles.clueIconBox}>
                  <Text style={styles.clueEmoji}>
                    {isRevealed ? clue.emoji : "🔒"}
                  </Text>
                </View>

                <View style={styles.clueTextBox}>
                  <Text style={styles.clueNumber}>
                    EVIDENCE {String(index + 1).padStart(2, "0")}
                  </Text>

                  <Text style={styles.clueTitle}>
                    {isRevealed ? clue.title : "Unknown Evidence"}
                  </Text>

                  <Text style={styles.clueDescription}>
                    {isRevealed
                      ? clue.description
                      : "Tap to inspect this evidence and reveal what the detective discovered."}
                  </Text>

                  <Text style={styles.clueAction}>
                    {isRevealed ? "✓ INVESTIGATED" : "TAP TO INVESTIGATE  →"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {!mysteryHintUsed && !mysterySolved && (
            <TouchableOpacity
              style={styles.hintButton}
              onPress={useMysteryHint}
            >
              <Text style={styles.hintButtonText}>
                💡 Need a hint?
              </Text>
            </TouchableOpacity>
          )}

          {mysteryHintUsed && (
            <View style={styles.hintCard}>
              <Text style={styles.hintCardTitle}>💡 DETECTIVE TIP</Text>
              <Text style={styles.hintCardText}>
                {currentCase.hint}
              </Text>
            </View>
          )}

          <View style={styles.suspectSectionHeader}>
            <Text style={styles.detectiveSectionHeading}>
              👥 Suspect Room
            </Text>
            {!allCluesFound && (
              <Text style={styles.lockedLabel}>
                {currentCase.clues.length - revealedClues.length} clues left
              </Text>
            )}
          </View>

          {!allCluesFound && !mysterySolved && (
            <View style={styles.lockedMessage}>
              <Text style={styles.lockedEmoji}>🗂️</Text>
              <Text style={styles.lockedTitle}>
                Investigate before accusing
              </Text>
              <Text style={styles.lockedDescription}>
                Reveal all {currentCase.clues.length} clues to unlock the
                suspect statements and make your final accusation.
              </Text>
            </View>
          )}

          {allCluesFound &&
            currentCase.suspects.map((suspect) => {
              const isSelected = selectedSuspect === suspect.id;

              return (
                <View key={suspect.id} style={styles.suspectCard}>
                  <View style={styles.suspectTop}>
                    <View style={styles.suspectAvatar}>
                      <Text style={styles.suspectEmoji}>
                        {suspect.emoji}
                      </Text>
                    </View>

                    <View style={styles.suspectInfo}>
                      <Text style={styles.suspectName}>
                        {suspect.name}
                      </Text>
                      <Text style={styles.suspectRole}>
                        {suspect.role}
                      </Text>
                    </View>

                    <Text style={styles.suspectSearchIcon}>🕵️</Text>
                  </View>

                  <View style={styles.statementBox}>
                    <Text style={styles.statementLabel}>
                      WITNESS STATEMENT
                    </Text>
                    <Text style={styles.statementText}>
                      “{suspect.statement}”
                    </Text>
                  </View>

                  {!mysterySolved && (
                    <TouchableOpacity
                      style={[
                        styles.accuseButton,
                        isSelected && styles.accuseButtonSelected,
                      ]}
                      onPress={() => accuseSuspect(suspect.id)}
                    >
                      <Text
                        style={[
                          styles.accuseButtonText,
                          isSelected && styles.accuseButtonTextSelected,
                        ]}
                      >
                        {isSelected
                          ? "Selected suspect"
                          : `Accuse ${suspect.name} →`}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {mysterySolved && suspect.id === currentCase.culprit && (
                    <View style={styles.correctSuspectBadge}>
                      <Text style={styles.correctSuspectText}>
                        ✓ CULPRIT IDENTIFIED
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

          {!!mysteryFeedback && (
            <View
              style={[
                styles.feedbackCard,
                mysterySolved
                  ? styles.feedbackSuccess
                  : mysteryFeedback.startsWith("💡")
                  ? styles.feedbackHint
                  : styles.feedbackError,
              ]}
            >
              <Text style={styles.feedbackTitle}>
                {mysterySolved
                  ? "CASE CLOSED"
                  : mysteryFeedback.startsWith("💡")
                  ? "A CLUE FOR YOU"
                  : "INVESTIGATION UPDATE"}
              </Text>

              <Text style={styles.feedbackText}>
                {mysteryFeedback}
              </Text>
            </View>
          )}

          {mysterySolved && (
            <View style={styles.caseCompleteCard}>
              <Text style={styles.caseCompleteEmoji}>🏆</Text>
              <Text style={styles.caseCompleteTitle}>
                Mystery Solved!
              </Text>
              <Text style={styles.caseCompleteSubtitle}>
                Excellent detective work. You've uncovered the truth!
              </Text>

              {hasMoreUnsolvedCases ? (
                <TouchableOpacity
                  style={styles.nextCaseButton}
                  onPress={() => {
                    let target = -1;

                    for (let i = 0; i < MYSTERY_CASES.length; i++) {
                      const candidate = (caseIndex + 1 + i) % MYSTERY_CASES.length;
                      if (!completedCases.includes(MYSTERY_CASES[candidate].id)) {
                        target = candidate;
                        break;
                      }
                    }

                    if (target !== -1) {
                      openMysteryCase(target);
                    }
                  }}
                >
                  <Text style={styles.nextCaseButtonText}>
                    Next Mystery  →
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.allCasesComplete}>
                  <Text style={styles.allCasesCompleteText}>
                    🎉 All cases solved! You're a Master Detective!
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.replayCaseButton}
                onPress={() => openMysteryCase(caseIndex)}
              >
                <Text style={styles.replayCaseButtonText}>
                  ↻ Replay This Case
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.caseSelectorHeading}>
            📁 Case Files
          </Text>

          {MYSTERY_CASES.map((mystery, index) => {
            const completed = completedCases.includes(mystery.id);
            const selected = index === caseIndex;

            return (
              <TouchableOpacity
                key={mystery.id}
                style={[
                  styles.caseFileRow,
                  selected && styles.caseFileRowSelected,
                ]}
                onPress={() => openMysteryCase(index)}
                activeOpacity={0.8}
              >
                <View style={styles.caseFileIcon}>
                  <Text style={styles.caseFileEmoji}>
                    {completed ? "✅" : "📂"}
                  </Text>
                </View>

                <View style={styles.caseFileInfo}>
                  <Text style={styles.caseFileNumber}>
                    CASE #{String(mystery.id).padStart(3, "0")}
                  </Text>
                  <Text style={styles.caseFileName}>
                    {mystery.title}
                  </Text>
                  <Text style={styles.caseFileDifficulty}>
                    {mystery.difficulty} • {mystery.reward} XP
                  </Text>
                </View>

                <Text style={styles.caseFileArrow}>
                  {selected ? "●" : "›"}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetCurrentCase}
          >
            <Text style={styles.secondaryButtonText}>
              ↻ Restart Current Investigation
            </Text>
          </TouchableOpacity>

          <Text style={styles.detectiveFooter}>
            VETRIX DETECTIVE BUREAU • Think carefully. Follow the evidence.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // -----------------------------------------
  // MEMORY MATCH
  // -----------------------------------------
  if (activeGame === "memory") {
    const allMatched = cards.every((card) => card.matched);

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <StatusBar barStyle="dark-content" />
        {renderHeader("Memory Match 🧠", "Find all matching pairs")}

        <View style={[styles.gameCard, styles.memoryGameCard]}>
          <Text style={styles.counter}>Moves: {memoryMoves}</Text>

          <View
            style={[
              styles.memoryGrid,
              compact && styles.memoryGridCompact,
            ]}
          >
            {cards.map((card, index) => {
              const revealed =
                card.matched || selectedCards.includes(index);

              return (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.memoryCard,
                    compact && styles.memoryCardCompact,
                    revealed && styles.memoryCardRevealed,
                  ]}
                  onPress={() => chooseCard(index)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.memoryEmoji,
                      compact && styles.memoryEmojiCompact,
                    ]}
                  >
                    {revealed ? card.emoji : "❔"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {allMatched && (
            <Text style={styles.successText}>
              🎉 All pairs matched! Great job!
            </Text>
          )}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={resetMemory}
          >
            <Text style={styles.primaryButtonText}>↻ Play Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // -----------------------------------------
  // TIC TAC TOE
  // -----------------------------------------
  if (activeGame === "tictactoe") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <StatusBar barStyle="dark-content" />
        {renderHeader("Tic-Tac-Toe ❌", "Two players • Take turns")}

        <View style={styles.gameCard}>
          <Text style={styles.counter}>
            {ticWinner
              ? `🎉 Player ${ticWinner} wins!`
              : ticDraw
              ? "It's a draw! 🤝"
              : `Player ${player}'s turn`}
          </Text>

          <View style={styles.ticGrid}>
            {board.map((value, index) => (
              <TouchableOpacity
                key={index}
                style={styles.ticCell}
                onPress={() => playTicTacToe(index)}
              >
                <Text
                  style={[
                    styles.ticSymbol,
                    value === "X" ? styles.xSymbol : styles.oSymbol,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={resetTicTacToe}
          >
            <Text style={styles.primaryButtonText}>↻ New Game</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            First player to get three in a row wins.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // -----------------------------------------
  // MINI LUDO
  // -----------------------------------------
  if (activeGame === "ludo") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <StatusBar barStyle="dark-content" />
        {renderHeader(
          "Mini Ludo Race 🎲",
          "Race to the finish with a friend!"
        )}

        <View style={[styles.gameCard, styles.ludoGameCard]}>
          <Text style={styles.ludoDescription}>
            Dice roll panni unga token-ah finish vara move pannunga.
            First 20 steps reach panra player wins!
          </Text>

          <View style={styles.ludoBoard}>
            <View style={styles.ludoPlayerRow}>
              <View
                style={[styles.ludoPlayerBox, styles.ludoPlayerRed]}
              >
                <Text style={styles.ludoPlayerEmoji}>🔴</Text>
                <Text style={styles.ludoPlayerLabel}>PLAYER 1</Text>
                <Text style={styles.ludoPlayerStep}>
                  {positions[0]}/20
                </Text>
              </View>

              <View style={styles.ludoFinishBox}>
                <Text style={styles.ludoFinishEmoji}>🏁</Text>
                <Text style={styles.ludoFinishLabel}>FINISH</Text>
              </View>

              <View
                style={[styles.ludoPlayerBox, styles.ludoPlayerBlue]}
              >
                <Text style={styles.ludoPlayerEmoji}>🔵</Text>
                <Text style={styles.ludoPlayerLabel}>PLAYER 2</Text>
                <Text style={styles.ludoPlayerStep}>
                  {positions[1]}/20
                </Text>
              </View>
            </View>

            <View style={styles.ludoTrack}>
              {Array.from({ length: 21 }, (_, index) => (
                <View
                  key={index}
                  style={[
                    styles.trackCell,
                    (positions[0] === index ||
                      positions[1] === index) &&
                      styles.trackCellOccupied,
                  ]}
                >
                  <Text style={styles.trackNumber}>{index}</Text>
                  <View style={styles.trackTokens}>
                    {positions[0] === index && (
                      <Text style={styles.trackToken}>🔴</Text>
                    )}
                    {positions[1] === index && (
                      <Text style={styles.trackToken}>🔵</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.counter}>
            {ludoWinner !== null
              ? `🎉 Player ${ludoWinner + 1} wins!`
              : `Player ${ludoPlayer + 1}'s turn`}
          </Text>

          <Text style={styles.diceText}>
            {dice === null ? "🎲" : `🎲 ${dice}`}
          </Text>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              ludoWinner !== null && styles.disabledButton,
            ]}
            onPress={rollDice}
            disabled={ludoWinner !== null}
          >
            <Text style={styles.primaryButtonText}>Roll Dice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={resetLudo}
          >
            <Text style={styles.secondaryButtonText}>Restart Race</Text>
          </TouchableOpacity>

          <Text style={styles.helperText}>
            Compact 2-player Ludo-style race. Classic Ludo rules are
            not included in this mini version.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // -----------------------------------------
  // GAMES HOME
  // -----------------------------------------
  const gameList = [
    {
      id: "puzzle" as const,
      emoji: "🧩",
      title: "Mini Puzzle",
      description: "Numbers arrange panni solve pannu",
      color: "#E8F1FF",
    },
    {
      id: "detective" as const,
      emoji: "🔍",
      title: "Mystery Detective",
      description: "Clues investigate panni culprit-ai kandupidi",
      color: "#E9E7FF",
    },
    {
      id: "memory" as const,
      emoji: "🧠",
      title: "Memory Match",
      description: "Same cards-ah find pannu",
      color: "#F0E9FF",
    },
    {
      id: "tictactoe" as const,
      emoji: "❌",
      title: "Tic-Tac-Toe",
      description: "Friend-oda play pannu",
      color: "#E6FAF0",
    },
    {
      id: "ludo" as const,
      emoji: "🎲",
      title: "Mini Ludo Race",
      description: "Dice roll panni finish reach pannu",
      color: "#FFF5D9",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.homeHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/home")}
          >
            <Text style={styles.backText}>‹  Home</Text>
          </TouchableOpacity>

          <Text style={styles.brand}>VETRIX PLAY</Text>
          <Text style={styles.homeTitle}>Let's Play! 🎮</Text>
          <Text style={styles.homeSubtitle}>
            Learn, relax, and have fun with mini-games.
          </Text>
        </View>

        <View style={styles.featureBanner}>
          <Text style={styles.bannerEmoji}>✨</Text>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Take a fun break</Text>
            <Text style={styles.bannerSubtitle}>
              Choose a game and challenge yourself!
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Game</Text>

        {gameList.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameListCard}
            onPress={() => openGame(game.id)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.gameIconBox,
                { backgroundColor: game.color },
              ]}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.title}</Text>
              <Text style={styles.gameDescription}>
                {game.description}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footerText}>
          VETRIX by Vetri Technology
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#530e87",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  homeHeader: {
    marginBottom: 22,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#E8F1FF",
    marginBottom: 18,
  },
  backText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "700",
  },
  brand: {
    color: BLUE,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  homeTitle: {
    color: "#172033",
    fontSize: 30,
    fontWeight: "800",
  },
  homeSubtitle: {
    color: "#69758A",
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  featureBanner: {
    backgroundColor: BLUE,
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  bannerEmoji: {
    fontSize: 34,
    marginRight: 14,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  bannerSubtitle: {
    color: "#E8F1FF",
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },
  sectionTitle: {
    color: "#172033",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  gameListCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9EEF8",
  },
  gameIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gameEmoji: {
    fontSize: 30,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 14,
  },
  gameName: {
    color: "#172033",
    fontSize: 16,
    fontWeight: "800",
  },
  gameDescription: {
    color: "#758198",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },
  arrow: {
    color: BLUE,
    fontSize: 30,
    paddingHorizontal: 5,
  },
  footerText: {
    color: "#9AA4B5",
    textAlign: "center",
    fontSize: 12,
    marginTop: 22,
  },
  gameHeader: {
    marginBottom: 20,
    paddingTop: 10,
  },
  gameTitle: {
    color: "#172033",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 2,
  },
  gameSubtitle: {
    color: "#758198",
    fontSize: 14,
    marginTop: 7,
    lineHeight: 21,
  },
  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E9EEF8",
  },
  counter: {
    textAlign: "center",
    color: "#253047",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 18,
  },
  puzzleGrid: {
    width: "100%",
    maxWidth: 280,
    alignSelf: "center",
    aspectRatio: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 20,
  },
  puzzleGridCompact: {
    maxWidth: 245,
  },
  puzzleTile: {
    width: "32%",
    flexGrow: 1,
    flexBasis: "30%",
    aspectRatio: 1,
    backgroundColor: BLUE,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTile: {
    backgroundColor: "#EDF2FA",
  },
  puzzleNumber: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },
  successText: {
    textAlign: "center",
    color: "#159957",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: BLUE,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#E8F1FF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: BLUE,
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.5,
  },
  helperText: {
    color: "#7B879B",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 14,
  },

  // MYSTERY DETECTIVE STYLES
  detectivePage: {
    backgroundColor: "#F5F6FF",
    borderRadius: 22,
    padding: 13,
    marginHorizontal: -7,
  },
  detectiveScoreBar: {
    backgroundColor: "#171A35",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  detectiveScoreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
    justifyContent: "center",
  },
  detectiveScoreEmoji: {
    fontSize: 21,
  },
  detectiveSmallLabel: {
    color: "#AEB5D3",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  detectiveScoreValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },
  caseHero: {
    backgroundColor: "#1A1D3A",
    borderRadius: 22,
    padding: 19,
    marginBottom: 16,
    overflow: "hidden",
  },
  caseTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  caseBadge: {
    color: "#A8B6FF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  caseDifficulty: {
    color: "#FFE09A",
    backgroundColor: "#3B3550",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 10,
    fontWeight: "900",
  },
  caseNumber: {
    color: "#8E9BC9",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 8,
  },
  caseTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 32,
  },
  caseLocation: {
    color: "#D4D8F0",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "700",
  },
  caseStory: {
    color: "#C1C7E1",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 16,
  },
  caseReward: {
    backgroundColor: "#292D50",
    padding: 11,
    borderRadius: 11,
    marginTop: 17,
  },
  caseRewardText: {
    color: "#FFE09A",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  caseProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E6E7F4",
    marginBottom: 21,
  },
  caseProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  caseSectionTitle: {
    color: "#202541",
    fontSize: 15,
    fontWeight: "900",
  },
  caseProgressCount: {
    color: BLUE,
    fontSize: 11,
    fontWeight: "900",
  },
  progressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: "#E9ECF8",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7668F5",
    borderRadius: 10,
  },
  caseHelper: {
    color: "#7A809B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 11,
  },
  detectiveSectionHeading: {
    color: "#202541",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 13,
  },
  clueCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E4E6F2",
    marginBottom: 11,
  },
  clueCardRevealed: {
    backgroundColor: "#FCFCFF",
    borderColor: "#C9C4FF",
  },
  clueIconBox: {
    width: 47,
    height: 47,
    borderRadius: 14,
    backgroundColor: "#EDEBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clueEmoji: {
    fontSize: 24,
  },
  clueTextBox: {
    flex: 1,
  },
  clueNumber: {
    color: "#8277E9",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  clueTitle: {
    color: "#202541",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 5,
  },
  clueDescription: {
    color: "#68708C",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },
  clueAction: {
    color: "#7467E9",
    fontSize: 9,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: 0.6,
  },
  hintButton: {
    backgroundColor: "#FFF3D6",
    borderWidth: 1,
    borderColor: "#FFE4A4",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 3,
    marginBottom: 22,
  },
  hintButtonText: {
    color: "#916000",
    fontSize: 13,
    fontWeight: "900",
  },
  hintCard: {
    backgroundColor: "#FFF5DB",
    borderRadius: 14,
    padding: 15,
    marginTop: 3,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#FFE4A4",
  },
  hintCardTitle: {
    color: "#916000",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  hintCardText: {
    color: "#745520",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  suspectSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 3,
  },
  lockedLabel: {
    color: "#969BB3",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 13,
  },
  lockedMessage: {
    backgroundColor: "#EDEEFF",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#DAD9FF",
  },
  lockedEmoji: {
    fontSize: 35,
    marginBottom: 9,
  },
  lockedTitle: {
    color: "#34345E",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  lockedDescription: {
    color: "#71749B",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  suspectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E4E6F2",
    marginBottom: 12,
  },
  suspectTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  suspectAvatar: {
    width: 51,
    height: 51,
    borderRadius: 16,
    backgroundColor: "#ECEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  suspectEmoji: {
    fontSize: 28,
  },
  suspectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  suspectName: {
    color: "#202541",
    fontSize: 16,
    fontWeight: "900",
  },
  suspectRole: {
    color: "#7B819C",
    fontSize: 11,
    marginTop: 4,
  },
  suspectSearchIcon: {
    fontSize: 21,
  },
  statementBox: {
    backgroundColor: "#F5F6FC",
    borderRadius: 12,
    padding: 12,
    marginTop: 13,
  },
  statementLabel: {
    color: "#888EAC",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  statementText: {
    color: "#505772",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    fontStyle: "italic",
  },
  accuseButton: {
    borderRadius: 12,
    backgroundColor: "#ECEBFF",
    padding: 13,
    alignItems: "center",
    marginTop: 12,
  },
  accuseButtonSelected: {
    backgroundColor: "#DCD9FF",
    borderWidth: 1,
    borderColor: "#A9A1FF",
  },
  accuseButtonText: {
    color: "#6456D9",
    fontSize: 12,
    fontWeight: "900",
  },
  accuseButtonTextSelected: {
    color: "#4335B5",
  },
  correctSuspectBadge: {
    backgroundColor: "#E0F8EB",
    borderRadius: 10,
    padding: 11,
    alignItems: "center",
    marginTop: 12,
  },
  correctSuspectText: {
    color: "#16814A",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  feedbackCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 14,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: "#E4F9EC",
    borderColor: "#B8EACB",
  },
  feedbackHint: {
    backgroundColor: "#FFF4D8",
    borderColor: "#F3DEA2",
  },
  feedbackError: {
    backgroundColor: "#FFF0EF",
    borderColor: "#F7D0CD",
  },
  feedbackTitle: {
    color: "#373A58",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  feedbackText: {
    color: "#4D5470",
    fontSize: 13,
    lineHeight: 21,
  },
  caseCompleteCard: {
    backgroundColor: "#1A1D3A",
    borderRadius: 21,
    padding: 22,
    alignItems: "center",
    marginBottom: 25,
  },
  caseCompleteEmoji: {
    fontSize: 48,
  },
  caseCompleteTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 10,
    textAlign: "center",
  },
  caseCompleteSubtitle: {
    color: "#C3C8E3",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    textAlign: "center",
  },
  nextCaseButton: {
    backgroundColor: "#7668F5",
    borderRadius: 13,
    padding: 15,
    width: "100%",
    alignItems: "center",
    marginTop: 19,
  },
  nextCaseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  replayCaseButton: {
    backgroundColor: "#292D50",
    borderRadius: 13,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  replayCaseButtonText: {
    color: "#D8D9F5",
    fontSize: 12,
    fontWeight: "800",
  },
  allCasesComplete: {
    backgroundColor: "#292D50",
    borderRadius: 13,
    padding: 14,
    width: "100%",
    marginTop: 18,
  },
  allCasesCompleteText: {
    color: "#FFE09A",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  caseSelectorHeading: {
    color: "#202541",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 13,
  },
  caseFileRow: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E6F2",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  caseFileRowSelected: {
    borderColor: "#938AFF",
    backgroundColor: "#F1F0FF",
  },
  caseFileIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#ECEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  caseFileEmoji: {
    fontSize: 23,
  },
  caseFileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  caseFileNumber: {
    color: "#8980DE",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  caseFileName: {
    color: "#202541",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  caseFileDifficulty: {
    color: "#8187A0",
    fontSize: 10,
    marginTop: 4,
  },
  caseFileArrow: {
    color: "#7467E9",
    fontSize: 20,
    fontWeight: "900",
    paddingHorizontal: 5,
  },
  detectiveFooter: {
    color: "#9B9DB8",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 16,
    marginTop: 23,
  },

  // MEMORY MATCH
  memoryGameCard: {
    paddingHorizontal: 12,
  },
  memoryGrid: {
    width: "100%",
    maxWidth: 270,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7,
    marginBottom: 18,
  },
  memoryGridCompact: {
    maxWidth: 235,
    gap: 5,
  },
  memoryCard: {
    width: "30%",
    maxWidth: 78,
    aspectRatio: 0.94,
    backgroundColor: BLUE,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BLUE,
  },
  memoryCardCompact: {
    maxWidth: 68,
    borderRadius: 9,
  },
  memoryCardRevealed: {
    backgroundColor: "#E8F1FF",
    borderColor: "#C9DDFF",
  },
  memoryEmoji: {
    fontSize: 26,
  },
  memoryEmojiCompact: {
    fontSize: 22,
  },

  // TIC TAC TOE
  ticGrid: {
    width: "100%",
    maxWidth: 290,
    aspectRatio: 1,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginBottom: 20,
  },
  ticCell: {
    width: "32%",
    flexGrow: 1,
    flexBasis: "30%",
    aspectRatio: 1,
    backgroundColor: "#E8F1FF",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  ticSymbol: {
    fontSize: 42,
    fontWeight: "900",
  },
  xSymbol: {
    color: BLUE,
  },
  oSymbol: {
    color: "#FF4757",
  },

  // MINI LUDO
  ludoGameCard: {
    paddingHorizontal: 12,
  },
  ludoDescription: {
    color: "#69758A",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  ludoBoard: {
    maxWidth: 310,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E9F4",
    marginBottom: 20,
  },
  ludoPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
    marginBottom: 12,
  },
  ludoPlayerBox: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  ludoPlayerRed: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FFD1D1",
  },
  ludoPlayerBlue: {
    backgroundColor: "#EAF2FF",
    borderColor: "#C9DDFF",
  },
  ludoFinishBox: {
    width: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  ludoPlayerEmoji: {
    fontSize: 22,
  },
  ludoPlayerLabel: {
    color: "#46536A",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 3,
  },
  ludoPlayerStep: {
    color: "#253047",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  ludoFinishEmoji: {
    fontSize: 24,
  },
  ludoFinishLabel: {
    color: "#46536A",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 3,
  },
  ludoTrack: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  trackCell: {
    width: "17%",
    maxWidth: 42,
    aspectRatio: 1,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#DCE5F4",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  trackCellOccupied: {
    backgroundColor: "#EAF2FF",
    borderColor: BLUE,
  },
  trackNumber: {
    color: "#758198",
    fontSize: 9,
    fontWeight: "700",
  },
  trackTokens: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  trackToken: {
    fontSize: 12,
  },
  diceText: {
    textAlign: "center",
    fontSize: 40,
    marginBottom: 5,
  },
});
