import React from "react";
import {
  Share,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";

type ShareLearningProps = {
  title: string;
  content: string;
  buttonText?: string;
};

export default function ShareLearning({
  title,
  content,
  buttonText = "Share",
}: ShareLearningProps) {
  const handleShare = async () => {
    try {
      const message = `${title}\n\n${content}\n\nLearn more with VETRIX by Vetri Technology.`;

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert(
        "Sharing failed",
        "Please try again."
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleShare}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Share ${title}`}
    >
      <Text style={styles.buttonText}>
        ↗ {buttonText}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#126EED",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
