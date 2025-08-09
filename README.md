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

---

## AI Coaching Architecture (Added)

This project integrates a dual-agent voice coaching system with retrieval‑augmented context.

### Agents
| Agent | Focus | Typical Duration | Style |
|-------|-------|------------------|-------|
| Ted | Inner state / mindset resets | 20–40s (or brief 60–90s briefing) | Present‑tense, sensory, non‑judgmental |
| Willis | Tactical / pressure-point planning | 60–90s plan or 30–40s pressure reset | Structured, actionable sequence |

Routing is decided client‑side (deterministic keyword + event heuristics planned). Handoffs are silent; a single chat timeline is preserved.

### Conversation Hook
`hooks/useElevenConversation.ts` wraps the ElevenLabs JavaScript SDK and exposes:
```
{ status, error, isSpeaking, canSendFeedback, start(), stop(), sendText(), sendLike(), sendDislike(), sendContext() }
```
It dynamically imports the SDK and supports public or private (signed URL) agents.

### Retrieval (RAG) Scaffold
Files:
- `types/retrieval.ts` – vector & repository types
- `services/embedding.ts` – fetches embedding from `/api/embed` or pseudo embedding fallback
- `repositories/RetrievalRepository.ts` – hybrid SQLite + in‑memory vector store (expo-sqlite). Falls back to memory if unavailable
- `hooks/useRetrieval.ts` – React hook facade (add, search)
- `utils/vectorMath.ts` – cosine helpers

SQLite table created automatically: `vector_items (id, type, ts, text, embedding, meta)`

### Persisted Vector Store
Install dependency (if not yet installed):
```bash
npx expo install expo-sqlite
```
Repository auto‑hydrates newest ≤1500 items into memory for fast similarity search. Prune example:
```ts
import { retrievalRepo } from '@/repositories/RetrievalRepository';
await retrievalRepo.prune(1500);
```

### Wiring Retrieval Into Chat Flow
1. After each finalized user message (or STT transcript) call:
```ts
await retrievalRepo.addItem({ type: 'message', text: transcript });
```
2. Before requesting an agent response:
```ts
const contexts = await retrievalRepo.querySimilar(transcript, 4, 0.18);
const ragBlock = contexts.map((c,i) => `[C${i+1}] ${c.text}`).join('\n');
// Inject ragBlock into your agent prompt / sendContext()
```
3. Optionally prune on app start:
```ts
await retrievalRepo.prune(2000);
```
4. Add mood/tactic summaries as type `summary` to keep historical signal while pruning granular events.

### Integrating With Existing Screen (`app/(tabs)/index.tsx`)
Minimal example to log retrieval results when sending a text (pseudo snippet):
```ts
import { useRetrieval } from '@/hooks/useRetrieval';
const { add, search } = useRetrieval();

async function handleUserTranscript(text: string) {
   await add({ type: 'message', text });
   const hits = await search(text, 4, 0.18);
   const ragContext = hits.map(h => h.text).join('\n');
   conversation.sendContext(`RAG:\n${ragContext}`);
   conversation.sendText(text);
}
```

### Embedding Endpoint (Server Placeholder)
Create an API route `/api/embed` (server side) that returns:
```json
{ "embedding": [0.01, -0.02, ...] }
```
Until then, a deterministic pseudo embedding is used so retrieval will still return stable (though low‑quality) similarity scores.

### Future Orchestrator (Planned)
To add dual-agent routing:
1. Implement `hooks/useCoachOrchestrator.ts` that wraps `useElevenConversation`.
2. Evaluate transcript → choose agent → optionally restart session with new agentId.
3. Query retrieval for top snippets and call `sendContext()` before `sendText()`.
4. Track handoffs; prevent loops; include shared context (goals, schedule, mood deltas) in each context update.

### Emotion / Motivation Icons (Planned)
Add a classifier function that tags assistant messages and display an emoji (e.g. 🎯 focus, 🫧 calm, 🔥 hype, ⚠️ stress).

### Safety / Crisis Mode (Planned)
Simple keyword check before routing; if triggered, bypass agents and return resource message (no handoff chaining).

### Development Notes
- For private agents: implement backend route returning signed URL → pass as `signedUrl` to `startSession`.
- Retrieval is currently synchronous in JS; if vectors exceed a few thousand, migrate to server vector DB.
- Pseudo embeddings are NOT semantically meaningful—replace early for better quality.

---

## Quick Commands
```bash
# Start dev
npx expo start

# Install SQLite for persistent retrieval
npx expo install expo-sqlite

# Prune vector store (run inside a dev script or console)
# await retrievalRepo.prune(2000)
```

---

## Roadmap Snapshot
- [x] ElevenLabs conversation hook
- [x] SQLite + in-memory hybrid retrieval scaffold
- [ ] /api/embed real embeddings
- [ ] Dual-agent orchestrator
- [ ] Guided exercise engine
- [ ] Persona selector & voice mapping
- [ ] Mood / motivation dashboard
- [ ] Safety / crisis handling

