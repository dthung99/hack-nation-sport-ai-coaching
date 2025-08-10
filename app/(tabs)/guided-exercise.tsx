// app/(tabs)/guided-exercise.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function GuidedExerciseScreen() {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Breathing Exercise</ThemedText>
        <ThemedText style={styles.subtitle}>
          Follow the animation to calm your mind
        </ThemedText>
      </View>

      {/* Animation Area - Placeholder for breathing circle */}
      <View style={styles.animationContainer}>
        <View
          style={[
            styles.breathingCircle,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
        >
          <ThemedText style={styles.instructionText}>
            {isActive ? "Breathe In" : "Press Start"}
          </ThemedText>
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <ThemedText style={styles.timerText}>
          {Math.floor(countdown / 60)}:
          {(countdown % 60).toString().padStart(2, "0")}
        </ThemedText>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: Colors[colorScheme ?? "light"].tint },
          ]}
          onPress={() => setIsActive(!isActive)}
        >
          <ThemedText style={styles.buttonText}>
            {isActive ? "Stop" : "Start"}
          </ThemedText>
        </TouchableOpacity>

        {isActive && (
          <TouchableOpacity
            style={[
              styles.endButton,
              { backgroundColor: Colors[colorScheme ?? "light"].icon },
            ]}
            onPress={() => setIsActive(false)}
          >
            <ThemedText style={styles.buttonText}>End Session</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.8,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  timerContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  controlsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingBottom: 40,
    gap: 15,
  },
  controlButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: "center",
  },
  endButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
