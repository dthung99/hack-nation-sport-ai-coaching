import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMultiAgentHandoff } from '@/hooks/useMultiAgentHandoff';
import React, { useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

export default function MultiAgentDemoScreen() {
  const colorScheme = useColorScheme();
  // Multi-agent setup with Ted, Willis, and Amelie
  const convo = useMultiAgentHandoff({
    debug: true,
    agents: [
      {
        key: 'ted',
        agentId: 'agent_0701k284yrmjfgksrhc5cw0wg2em', // Ted - inner state coach
        displayName: 'Ted (Inner State Coach)',
        handoffTriggerKeywords: ['calm', 'breathe', 'mindful', 'anxious', 'nervous', 'focus', 'confidence', 'inner game'],
        styleInstructions: 'You are Ted, focused on inner-state coaching: mindset, breathing, visualization, and emotional regulation. When users ask about strategy, tactics, or game plans, suggest they might benefit from Willis\'s tactical expertise. When users ask about physical training, conditioning, or fitness, suggest they might benefit from Amelie\'s physical training expertise.'
      },
      {
        key: 'willis',
        agentId: 'agent_7501k285xty6e51rz4hk4nr3g5ee', // Willis - strategy coach  
        displayName: 'Willis (Strategy Coach)',
        handoffTriggerKeywords: ['strategy', 'tactics', 'game plan', 'opponent', 'technique', 'execution', 'performance', 'winning'],
        styleInstructions: 'You are Willis, focused on tactical strategy, game plans, and performance execution. When users need emotional support or inner game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about physical training or fitness, suggest they might benefit from Amelie\'s physical training expertise.'
      },
      {
        key: 'amelie',
        agentId: 'agent_5901k29tz6hpe0xamjsfc5vxdpwr', // Amelie - physical training coach
        displayName: 'Amelie (Physical Training Coach)',
        handoffTriggerKeywords: ['training', 'fitness', 'conditioning', 'strength', 'endurance', 'workout', 'exercise', 'physical', 'stamina', 'recovery'],
        styleInstructions: 'You are Amelie, focused on physical training, conditioning, fitness, and athletic performance. When users need emotional support or mental game work, suggest they might benefit from Ted\'s mindset coaching. When users ask about tactical strategy or game plans, suggest they might benefit from Willis\'s strategic expertise.'
      }
    ],
    initialAgentKey: 'ted' // Start with Ted
  });
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    convo.sendText(input);
    setInput('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>🔧 Debug: Multi-Agent System</ThemedText>
      <ThemedText style={styles.status}>
        Development tool for testing agent handoffs and conversation flow
      </ThemedText>
      <ThemedText style={styles.status}>
        Status: {convo.status} | Current: {convo.currentAgentKey ? convo.agents.find(a => a.key === convo.currentAgentKey)?.displayName : 'None'}
      </ThemedText>
      {convo.error && <ThemedText style={styles.error}>Error: {convo.error}</ThemedText>}
      
      <ThemedText style={styles.hint}>
        Quick Debug Tests: Manual handoffs and phrase testing
      </ThemedText>

      <View style={styles.testButtons}>
        <TouchableOpacity style={[styles.testButton]} onPress={() => {
          convo.sendText("I need strategy help for my next match");
        }}>
          <ThemedText style={styles.testButtonText}>🎯 Test Strategy Trigger</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.testButton]} onPress={() => {
          convo.sendText("I'm feeling really anxious about this");
        }}>
          <ThemedText style={styles.testButtonText}>🧠 Test Mindset Trigger</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.testButton]} onPress={() => {
          convo.sendText("I need help with my fitness and conditioning");
        }}>
          <ThemedText style={styles.testButtonText}>💪 Test Training Trigger</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={() => convo.status === 'connected' ? convo.stop() : convo.start()}>
          <ThemedText style={styles.buttonText}>{convo.status === 'connected' ? 'Stop' : 'Start'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => convo.handoffTo('ted', 'Manual switch')}> 
          <ThemedText style={styles.buttonText}>To Ted</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => convo.handoffTo('willis', 'Manual switch')}> 
          <ThemedText style={styles.buttonText}>To Willis</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.secondary]} onPress={() => convo.handoffTo('amelie', 'Manual switch')}> 
          <ThemedText style={styles.buttonText}>To Amelie</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={convo.transcript.slice().reverse()}
        keyExtractor={(item) => item.id}
        style={styles.transcript}
        inverted
        renderItem={({ item }) => (
          <View style={styles.messageRow}>
            <ThemedText style={[styles.sender, item.sender === 'user' ? styles.user : (item.sender === 'agent' ? styles.agent : styles.system)]}>
              {item.sender}{item.agentKey ? `:${item.agentKey}` : ''}
            </ThemedText>
            <ThemedText style={styles.message}>{item.text}</ThemedText>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Try: 'I need strategy help' or 'I feel anxious'"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]} onPress={send}>
          <ThemedText style={styles.buttonText}>Send</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: isTablet ? 80 : 60, 
    paddingHorizontal: isTablet ? 24 : 16 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 4,
    fontSize: isTablet ? 28 : 24
  },
  status: { 
    textAlign: 'center', 
    opacity: 0.7, 
    marginBottom: 8,
    fontSize: isTablet ? 16 : 14
  },
  hint: { 
    textAlign: 'center', 
    fontSize: isTablet ? 14 : 12, 
    opacity: 0.6, 
    marginBottom: isTablet ? 16 : 12, 
    fontStyle: 'italic' 
  },
  error: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 8,
    fontSize: isTablet ? 16 : 14
  },
  row: { 
    flexDirection: isTablet ? 'row' : 'column', 
    justifyContent: 'space-between', 
    gap: isTablet ? 12 : 8, 
    marginBottom: isTablet ? 16 : 12,
    flexWrap: 'wrap'
  },
  testButtons: { 
    flexDirection: 'column', 
    gap: isTablet ? 12 : 8, 
    marginBottom: isTablet ? 16 : 12 
  },
  testButton: { 
    backgroundColor: '#e8e8e8', 
    paddingHorizontal: isTablet ? 16 : 12, 
    paddingVertical: isTablet ? 12 : 8, 
    borderRadius: isTablet ? 12 : 8 
  },
  testButtonText: { 
    color: '#333', 
    fontSize: isTablet ? 14 : 12, 
    textAlign: 'center' 
  },
  button: { 
    paddingHorizontal: isTablet ? 16 : 12, 
    paddingVertical: isTablet ? 12 : 10, 
    borderRadius: isTablet ? 15 : 12,
    flex: isTablet ? 1 : undefined,
    minWidth: isTablet ? 120 : 100
  },
  secondary: { backgroundColor: '#555' },
  buttonText: { 
    color: 'white', 
    fontWeight: '600',
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center'
  },
  transcript: { 
    flex: 1, 
    marginBottom: isTablet ? 16 : 12 
  },
  messageRow: { 
    flexDirection: 'row', 
    marginBottom: isTablet ? 8 : 6, 
    alignItems: 'flex-start',
    paddingHorizontal: isTablet ? 8 : 4,
    paddingVertical: isTablet ? 4 : 2
  },
  sender: { 
    fontWeight: 'bold', 
    marginRight: isTablet ? 10 : 6, 
    minWidth: isTablet ? 90 : 70,
    fontSize: isTablet ? 14 : 12
  },
  user: { color: '#0a7ea4' },
  agent: { color: '#6a3fb3' },
  system: { color: '#888' },
  message: { 
    flex: 1, 
    lineHeight: isTablet ? 22 : 18,
    fontSize: isTablet ? 16 : 14
  },
  inputRow: { 
    flexDirection: 'row', 
    gap: isTablet ? 12 : 8, 
    alignItems: 'center', 
    paddingBottom: isTablet ? 32 : 24 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    paddingHorizontal: isTablet ? 14 : 10, 
    paddingVertical: isTablet ? 12 : 8, 
    borderRadius: isTablet ? 12 : 10,
    fontSize: isTablet ? 16 : 14
  },
});
