// app/(tabs)/persona-selector.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface Persona {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

const personas: Persona[] = [
  {
    id: "calm-mentor",
    name: "Calm Mentor",
    description: "Gentle, supportive guidance with mindfulness focus",
    emoji: "🧘‍♀️",
  },
  {
    id: "high-energy",
    name: "High-Energy Motivator",
    description: "Energetic, enthusiastic coaching for peak performance",
    emoji: "💪",
  },
];

export default function PersonaSelectorScreen() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const handleSave = () => {
    // TODO: Save persona choice to storage
    console.log("Selected persona:", selectedPersona);
  };

  const playPreview = (personaId: string) => {
    // TODO: Play sample audio for this persona
    console.log("Playing preview for:", personaId);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title">Voice & Persona</ThemedText>
        <ThemedText style={styles.subtitle}>
          Select your preferred coaching style
        </ThemedText>
      </View>

      {/* Persona Cards */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {personas.map((persona) => (
          <TouchableOpacity
            key={persona.id}
            style={[
              styles.personaCard,
              selectedPersona === persona.id && {
                backgroundColor: Colors[colorScheme ?? "light"].tint,
                opacity: 0.9,
              },
            ]}
            onPress={() => setSelectedPersona(persona.id)}
          >
            <View style={styles.cardHeader}>
              <ThemedText style={styles.emoji}>{persona.emoji}</ThemedText>
              <View style={styles.cardContent}>
                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    styles.personaName,
                    selectedPersona === persona.id && { color: "white" },
                  ]}
                >
                  {persona.name}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.description,
                    selectedPersona === persona.id && {
                      color: "white",
                      opacity: 0.9,
                    },
                  ]}
                >
                  {persona.description}
                </ThemedText>
              </View>
            </View>

            {/* Preview Button */}
            <TouchableOpacity
              style={[
                styles.previewButton,
                {
                  backgroundColor:
                    selectedPersona === persona.id
                      ? "rgba(255,255,255,0.2)"
                      : Colors[colorScheme ?? "light"].icon,
                },
              ]}
              onPress={() => playPreview(persona.id)}
            >
              <ThemedText
                style={[
                  styles.previewText,
                  selectedPersona === persona.id && { color: "white" },
                ]}
              >
                Preview
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: selectedPersona
                ? Colors[colorScheme ?? "light"].tint
                : Colors[colorScheme ?? "light"].icon,
              opacity: selectedPersona ? 1 : 0.5,
            },
          ]}
          onPress={handleSave}
          disabled={!selectedPersona}
        >
          <ThemedText style={styles.saveButtonText}>Save Selection</ThemedText>
        </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  personaCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  emoji: {
    fontSize: 40,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  personaName: {
    fontSize: 18,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  previewButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
  },
  previewText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
