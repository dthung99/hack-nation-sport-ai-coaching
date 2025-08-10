# MindCoach AI - Mental Performance & Wellness Companion

AI-powered mental wellness coaching for athletes using ElevenLabs conversational AI with multi-agent voice handoff capabilities.

## Overview

MindCoach AI addresses the critical gap in accessible mental performance coaching for athletes. Built for the Global AI Hackathon (ElevenLabs track), this prototype provides 24/7 voice-based mental wellness support through specialized AI coaches, guided breathing exercises, and mood tracking.

### Key Features

- **Multi-Agent Voice Coaching**: Three specialized AI coaches with automatic context-aware handoffs
  - **Ted** (Inner State Coach): Mindset, breathing, visualization, emotional regulation
  - **Willis** (Strategy Coach): Tactical planning, game strategy, performance optimization
  - **Amelie** (Physical Training Coach): Fitness, conditioning, strength training
- **Guided Breathing Exercises**: Interactive animations with 4-second inhale/hold/exhale cycles
- **Intelligent Agent Handoff**: Automatic switching based on conversation keywords or manual selection
- **Mood Progress Dashboard**: Visual tracking interface (mockup implementation)

## Technical Architecture

Built with:

- **ElevenLabs Conversational AI Agents**: Real-time voice processing and natural language understanding
- **React Native + Expo**: Cross-platform mobile application framework
- **TypeScript**: Type-safe development with custom conversation management hooks
- **Custom Multi-Agent System**: Seamless handoff between specialized coaching domains

## Multi-Agent ElevenLabs Conversation

This project supports orchestrating multiple ElevenLabs agents with contextual handoff. The system intelligently switches between coaches while preserving conversation context and providing domain-specific expertise.

## Development

### Prerequisites

- Node.js 18+
- Expo CLI
- ElevenLabs account with agent IDs

### Installation

1. Clone the repository

```bash
git clone [repository-url]
cd mindcoach-ai
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npx expo start
```

### App Navigation

- **Chat Tab**: Basic conversation interface with single agent
- **Exercise Tab**: Guided breathing exercises with visual animations
- **Coach Tab**: Multi-agent selection and conversation interface
- **Progress Tab**: Mood tracking dashboard (mockup)
  \

## Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx              # Main chat interface
│   ├── guided-exercise.tsx    # Breathing exercise animations
│   ├── persona-selector.tsx   # Multi-agent coach selection
│   ├── motivation-dashboard.tsx # Mood tracking dashboard
hooks/
├── useElevenConversation.ts   # Single-agent conversation hook
└── useMultiAgentHandoff.ts    # Multi-agent orchestration hook
```

## Future Enhancements

- Real sentiment analysis for mood tracking
- Persistent conversation history storage
- Wearable device integration for biometric data
- Heart rate variability feedback for breathing exercises
- Advanced agent personality customization

## License

MIT License - This is a prototype developed for the Global AI Hackathon.

## Acknowledgments

- Built for the Global AI Hackathon (ElevenLabs Corporate Sports Analytics Track)
- Powered by ElevenLabs Conversational AI Agents
- Created with Expo and React Native

---
