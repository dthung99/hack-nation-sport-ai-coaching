// app/(tabs)/guided-exercise.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

export default function GuidedExerciseScreen() {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [breathingPhase, setBreathingPhase] = useState<
    "inhale" | "hold" | "exhale"
  >("inhale");
  const [phaseTimer, setPhaseTimer] = useState(4);
  const colorScheme = useColorScheme();

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  // Countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !isPaused && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsActive(false);
      setIsPaused(false);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, countdown]);

  // Breathing cycle timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setPhaseTimer((prev) => {
          if (prev <= 1) {
            // Move to next phase
            setBreathingPhase((current: "inhale" | "hold" | "exhale") => {
              if (current === "inhale") return "hold";
              if (current === "hold") return "exhale";
              return "inhale";
            });
            return 4; // Reset timer for next phase
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Animation based on breathing phase
  useEffect(() => {
    if (!isActive || isPaused) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    if (breathingPhase === "inhale") {
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 4000,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    } else if (breathingPhase === "hold") {
      // Keep current scale and opacity
    } else if (breathingPhase === "exhale") {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 4000,
        useNativeDriver: true,
      }).start();
    }
  }, [breathingPhase, isActive, isPaused, scaleAnim, opacityAnim]);

  const getInstructionText = () => {
    if (!isActive) return "Press Start";
    if (isPaused) return "Paused";
    switch (breathingPhase) {
      case "inhale":
        return `Breathe In (${phaseTimer})`;
      case "hold":
        return `Hold (${phaseTimer})`;
      case "exhale":
        return `Breathe Out (${phaseTimer})`;
      default:
        return "Breathe";
    }
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    if (countdown === 0) {
      setCountdown(60); // Reset timer only if completely finished
    }
    // Don't reset breathing phase if resuming from pause
    if (!isPaused) {
      setBreathingPhase("inhale");
      setPhaseTimer(4);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleEndSession = () => {
    setIsActive(false);
    setIsPaused(false);
    setCountdown(60); // Reset timer completely
    setBreathingPhase("inhale");
    setPhaseTimer(4);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Breathing Exercise</ThemedText>
        <ThemedText style={styles.subtitle}>
          Follow the animation to calm your mind
        </ThemedText>
      </View>

      {/* Animation Area */}
      <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.breathingCircle,
            {
              backgroundColor: Colors[colorScheme ?? "light"].tint,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <ThemedText style={styles.instructionText}>
            {getInstructionText()}
          </ThemedText>
        </Animated.View>
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
        {!isActive ? (
          <TouchableOpacity
            style={[
              styles.controlButton,
              { backgroundColor: Colors[colorScheme ?? "light"].tint },
            ]}
            onPress={handleStart}
          >
            <ThemedText style={styles.buttonText}>Start</ThemedText>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: Colors[colorScheme ?? "light"].tint },
              ]}
              onPress={handlePauseResume}
            >
              <ThemedText style={styles.buttonText}>
                {isPaused ? "Resume" : "Pause"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.endButton,
                { backgroundColor: Colors[colorScheme ?? "light"].icon },
              ]}
              onPress={handleEndSession}
            >
              <ThemedText style={styles.buttonText}>End Session</ThemedText>
            </TouchableOpacity>
          </>
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
  },
  instructionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
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
