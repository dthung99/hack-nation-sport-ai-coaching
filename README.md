# sport-ai

AI sport coaching prototype (Expo / React Native) with ElevenLabs real-time multi-agent voice handoff.

## Multi-Agent ElevenLabs Conversation

This project now supports orchestrating multiple ElevenLabs agents with contextual handoff (currently three: Inner State, Strategy, Physical Training). They can switch mid-session while preserving conversation context, and each switch is now instrumented with provenance metadata (manual, keyword, agent-initiated, explicit marker).

### Environment Variables

Create a `.env` (not committed) with:

```
EXPO_PUBLIC_AGENT_MENTOR_ID=xxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_AGENT_MOTIVATOR_ID=yyyyyyyyyyyyyyyyyyyy
```

Because these are PUBLIC agent IDs they can be exposed as `EXPO_PUBLIC_` vars (Expo automatically inlines them). If you later use PRIVATE agents you must implement a backend that returns a signed URL per session instead of embedding agent IDs.

Current fallback support: if you still have legacy names `AGENT_TED_ID` / `AGENT_WILLIS_ID` in your `.env`, the hook will pick them up (dev only). For production builds rename them to the `EXPO_PUBLIC_...` versions above so the values are embedded in the bundle.

Restart the Expo server after adding env vars.

### Hook Usage

Use the `useMultiAgentHandoff` hook (the single-agent “Chat” tab has been removed; the multi‑agent experience lives directly at the root `index` route – "My Coach Team"):

```tsx
import { useMultiAgentHandoff } from '@/hooks/useMultiAgentHandoff';

export function CoachingSession() {
   const convo = useMultiAgentHandoff();

   return (
      <View>
         <Button title={convo.status === 'connected' ? 'Stop' : 'Start'} onPress={() => convo.status === 'connected' ? convo.stop() : convo.start()} />
         <Button title="Boost Motivation" onPress={() => convo.handoffTo('motivator', 'User requested more energy')} />
         <Button title="Calm Down" onPress={() => convo.handoffTo('mentor', 'User needs calming guidance')} />
      </View>
   );
}
```

### Automatic Handoff Triggers

Each agent can declare `handoffTriggerKeywords`. When the user sends a text message containing one of those keywords, the hook will:
1. Handoff to the corresponding agent.
2. Send a summarized context + style instructions to the new agent.
3. Forward the triggering user message to the new agent.

### Manual Handoff

Call `handoffTo(agentKey, optionalReason)`.

Each handoff triggers an `onAgentSwitch` callback (if provided) with:

```ts
interface AgentSwitchEvent {
   from: string | null;
   to: string;
   reason?: string;
   metaType: 'manual' | 'auto-keyword' | 'agent-initiated' | 'explicit-marker';
   timestamp: number;
}
```

### Transcript

The hook accumulates a simple transcript (`transcript` array) with system / user / agent messages. On handoff it composes a lightweight, truncated context summary and sends it via `sendContextualUpdate` to the new agent.

### Extending to Private Agents

Add a `signedUrlEndpoint` per agent and branch in `internalStart` similarly to the single-agent `useElevenConversation` hook. Never expose private agent signed URLs client-side.

---

## Development

Install deps and run:

```
npm install
npx expo start
```

Open on web, iOS, or Android. Ensure microphone permissions are granted for real-time audio.

## Existing Single-Agent Hook

`useElevenConversation` remains available for simple single-agent sessions (legacy), but the primary UX now uses multi-agent on the main screen.

## License

MIT (prototype / hackathon).
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
