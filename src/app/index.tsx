
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function Index() {
  const { width, height } = useWindowDimensions();

  const handleEnter = () => {
    router.push("/auth");
  };

  return (
    <LinearGradient
      colors={["#050816", "#10152F", "#17104A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { minHeight: height, width }]}
    >
      {/* Decorative background circles */}
      <View pointerEvents="none" style={styles.circleOne} />
      <View pointerEvents="none" style={styles.circleTwo} />
      <View pointerEvents="none" style={styles.circleThree} />

      {/* Main content */}
      <View style={styles.content}>
        {/* VETRIX Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoV}>V</Text>
        </View>

        <Text style={styles.logoText}>VETRIX</Text>

        <Text style={styles.brandText}>
          by Vetri Technology
        </Text>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>
            A new world awaits.
          </Text>

          <Text style={styles.taglineHighlight}>
            Learn what's next.
          </Text>

          <Text style={styles.description}>
            Learn. Practice. Connect. Play. Grow.
          </Text>
        </View>

        {/* Enter button */}
        <View style={styles.buttonContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter VETRIX"
            onPress={handleEnter}
            style={({ pressed }) => [
              styles.enterButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <LinearGradient
              colors={["#8B5CF6", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.enterText}>ENTER</Text>
              <Text style={styles.arrow}>→</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.bottomText}>
            Your learning journey starts here.
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          LEARN • PRACTICE • EVOLVE
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    paddingVertical: 40,
  },

  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 24,
    zIndex: 1,
  },

  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.5,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 15,
  },

  logoV: {
    color: "#FFFFFF",
    fontSize: 54,
    fontWeight: "800",
    letterSpacing: -5,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 7,
    textAlign: "center",
    marginTop: 18,
  },

  brandText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 7,
  },

  taglineContainer: {
    marginTop: 48,
    alignItems: "center",
  },

  tagline: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 25,
    fontWeight: "600",
    textAlign: "center",
  },

  taglineHighlight: {
    color: "#A78BFA",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },

  description: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 18,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: 48,
    alignItems: "center",
  },

  enterButton: {
    width: 220,
    height: 58,
    borderRadius: 30,
    overflow: "hidden",
  },

  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  enterText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 3,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 15,
    marginTop: -2,
  },

  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },

  bottomText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 17,
    textAlign: "center",
  },

  footer: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
  },

  footerText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    letterSpacing: 3,
    textAlign: "center",
  },

  circleOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(124,58,237,0.12)",
    top: -90,
    right: -100,
  },

  circleTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(59,130,246,0.10)",
    bottom: 40,
    left: -90,
  },

  circleThree: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(167,139,250,0.08)",
    top: "45%",
    right: -35,
  },
});
