import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "dark" | "light";

export type WallpaperName =
  | "midnight"
  | "ocean"
  | "aurora"
  | "sunset"
  | "forest"
  | "lavender";

export const THEME_COLORS = {
  purple: "#8B5CF6",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  pink: "#EC4899",
  orange: "#F97316",
  green: "#22C55E",
  red: "#EF4444",
  yellow: "#EAB308",
};

export const WALLPAPER_COLORS: Record<
  WallpaperName,
  { dark: string; light: string }
> = {
  midnight: {
    dark: "#050816",
    light: "#F5F7FF",
  },
  ocean: {
    dark: "#061A2B",
    light: "#EAF6FF",
  },
  aurora: {
    dark: "#101027",
    light: "#F2EEFF",
  },
  sunset: {
    dark: "#24101A",
    light: "#FFF1EB",
  },
  forest: {
    dark: "#071F1A",
    light: "#EAF8F0",
  },
  lavender: {
    dark: "#1A1230",
    light: "#F4EEFF",
  },
};

type ThemeContextType = {
  mode: ThemeMode;
  wallpaper: WallpaperName;
  accentColor: string;

  backgroundColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;

  setMode: (mode: ThemeMode) => void;
  setWallpaper: (wallpaper: WallpaperName) => void;
  setAccentColor: (color: string) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

type SavedTheme = {
  mode?: ThemeMode;
  wallpaper?: WallpaperName;
  accentColor?: string;
};

const STORAGE_KEY = "vetrix_theme_settings";

const DEFAULT_MODE: ThemeMode = "dark";
const DEFAULT_WALLPAPER: WallpaperName = "midnight";
const DEFAULT_ACCENT = THEME_COLORS.purple;

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(DEFAULT_MODE);

  const [wallpaper, setWallpaperState] =
    useState<WallpaperName>(DEFAULT_WALLPAPER);

  const [accentColor, setAccentColorState] =
    useState<string>(DEFAULT_ACCENT);

  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme settings
  useEffect(() => {
    let isMounted = true;

    const loadTheme = async () => {
      try {
        const savedValue = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedValue) {
          const saved: SavedTheme = JSON.parse(savedValue);

          if (!isMounted) return;

          if (
            saved.mode === "dark" ||
            saved.mode === "light"
          ) {
            setModeState(saved.mode);
          }

          if (
            saved.wallpaper &&
            Object.prototype.hasOwnProperty.call(
              WALLPAPER_COLORS,
              saved.wallpaper
            )
          ) {
            setWallpaperState(saved.wallpaper);
          }

          if (
            saved.accentColor &&
            /^#[0-9A-Fa-f]{6}$/.test(saved.accentColor)
          ) {
            setAccentColorState(saved.accentColor);
          }
        }
      } catch (error) {
        console.warn("Unable to load VETRIX theme:", error);
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save theme settings whenever they change
  useEffect(() => {
    if (!isLoaded) return;

    const saveTheme = async () => {
      try {
        const settings: SavedTheme = {
          mode,
          wallpaper,
          accentColor,
        };

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(settings)
        );
      } catch (error) {
        console.warn("Unable to save VETRIX theme:", error);
      }
    };

    saveTheme();
  }, [mode, wallpaper, accentColor, isLoaded]);

  const setMode = useCallback((value: ThemeMode) => {
    setModeState(value);
  }, []);

  const setWallpaper = useCallback(
    (value: WallpaperName) => {
      setWallpaperState(value);
    },
    []
  );

  const setAccentColor = useCallback((value: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setAccentColorState(value);
    }
  }, []);

  const isDark = mode === "dark";

  const backgroundColor =
    WALLPAPER_COLORS[wallpaper][mode];

  const cardColor = isDark ? "#111827" : "#FFFFFF";
  const textColor = isDark ? "#F9FAFB" : "#111827";
  const mutedColor = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "#273449" : "#E5E7EB";

  const contextValue = useMemo<ThemeContextType>(
    () => ({
      mode,
      wallpaper,
      accentColor,
      backgroundColor,
      cardColor,
      textColor,
      mutedColor,
      borderColor,
      setMode,
      setWallpaper,
      setAccentColor,
    }),
    [
      mode,
      wallpaper,
      accentColor,
      backgroundColor,
      cardColor,
      textColor,
      mutedColor,
      borderColor,
      setMode,
      setWallpaper,
      setAccentColor,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside a ThemeProvider"
    );
  }

  return context;
}
