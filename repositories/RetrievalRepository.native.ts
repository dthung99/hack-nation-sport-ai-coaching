import { getEmbedding } from '@/services/embedding';
import { l2Normalize } from '@/utils/vectorMath';
import type { AddVectorParams, RetrievalRepositoryApi, SimilarityResult, VectorItem } from '@/types/retrieval';

// Native (iOS/Android) version: uses expo-sqlite for persistence + in-memory cache.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SQLite = require('expo-sqlite');

function genId(): string { return 'vec_' + Math.random().toString(36).slice(2, 10); }

class HybridSQLiteRetrievalRepository implements RetrievalRepositoryApi {
  private items: VectorItem[] = [];
  private normalized: Float32Array[] = [];
  private db: any | null = null;
  private ready: Promise<void>;
  private maxLoad = 1500;

  constructor() { this.ready = this.init(); }

  private async init() {
    try {
      this.db = SQLite.openDatabase('coach_vectors.db');
      await this.runAsync('CREATE TABLE IF NOT EXISTS vector_items (id TEXT PRIMARY KEY NOT NULL, type TEXT, ts INTEGER, text TEXT, embedding TEXT, meta TEXT)');
      await this.hydrateFromDb();
    } catch (e) {
      console.warn('[Retrieval][native] SQLite init failed, fallback memory', e);
      this.db = null;
    }
  }

  private runAsync(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params, () => resolve(), (_: any, err: any) => { reject(err); return false; });
      });
    });
  }

  private selectAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) return Promise.resolve([]);
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: any) => {
        tx.executeSql(sql, params, (_: any, result: any) => {
          const rows = [] as T[];
          for (let i = 0; i < result.rows.length; i++) rows.push(result.rows.item(i));
          resolve(rows);
        }, (_: any, err: any) => { reject(err); return false; });
      });
    });
  }

  private async hydrateFromDb() {
    const rows = await this.selectAsync('SELECT id,type,ts,text,embedding,meta FROM vector_items ORDER BY ts DESC LIMIT ?', [this.maxLoad]);
    for (let i = rows.length - 1; i >= 0; i--) {
      const r: any = rows[i];
      let embedding: number[] = [];
      try { embedding = JSON.parse(r.embedding) as number[]; } catch { embedding = []; }
      const item: VectorItem = { id: r.id, type: r.type, ts: r.ts, text: r.text, embedding, meta: r.meta ? JSON.parse(r.meta) : undefined };
      this.items.push(item);
      this.normalized.push(new Float32Array(l2Normalize(item.embedding)));
    }
  }

  async ensureReady() { await this.ready; }
  size() { return this.items.length; }

  async addItem(params: AddVectorParams): Promise<VectorItem> {
    await this.ensureReady();
    const id = params.id || genId();
    const ts = params.ts ?? Date.now();
    const text = params.text.trim();
    const embedding = params.embedding || await getEmbedding(text);
    const item: VectorItem = { id, type: params.type, ts, text, embedding, meta: params.meta };
    if (this.db) {
      try { await this.runAsync('INSERT OR REPLACE INTO vector_items (id,type,ts,text,embedding,meta) VALUES (?,?,?,?,?,?)', [id, item.type, ts, text, JSON.stringify(embedding), item.meta ? JSON.stringify(item.meta) : null]); } catch (e) { console.warn('[Retrieval] insert failed', e); }
    }
    this.items.push(item);
    this.normalized.push(new Float32Array(l2Normalize(embedding)));
    return item;
  }

  async bulkAdd(items: AddVectorParams[]): Promise<VectorItem[]> { const out: VectorItem[] = []; for (const it of items) out.push(await this.addItem(it)); return out; }

  async querySimilar(query: string, k = 3, minScore = 0.15): Promise<SimilarityResult[]> {
    await this.ensureReady();
    if (!this.items.length) return [];
    const qEmb = l2Normalize(await getEmbedding(query));
    const scores: SimilarityResult[] = [];
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const emb = this.normalized[i];
      let s = 0; const len = Math.min(qEmb.length, emb.length);
      for (let j = 0; j < len; j++) s += qEmb[j] * emb[j];
      if (s >= minScore) scores.push({ ...item, score: s });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k);
  }

  async prune(maxItems: number): Promise<number> {
    await this.ensureReady();
    const extra = this.items.length - maxItems;
    if (extra <= 0) return 0;
    const sorted = [...this.items].sort((a, b) => a.ts - b.ts);
    const toRemove = new Set(sorted.slice(0, extra).map(i => i.id));
    this.items = this.items.filter(i => !toRemove.has(i.id));
    this.normalized = this.normalized.filter((_, idx) => !toRemove.has(sorted[idx]?.id));
    if (this.db) {
      try {
        const ids = Array.from(toRemove);
        while (ids.length) {
          const chunk = ids.splice(0, 50);
          const qMarks = chunk.map(() => '?').join(',');
          await this.runAsync(`DELETE FROM vector_items WHERE id IN (${qMarks})`, chunk);
        }
      } catch (e) { console.warn('[Retrieval] prune delete failed', e); }
    }
    return extra;
  }

  async listAll(): Promise<VectorItem[]> { await this.ensureReady(); return this.items.slice(); }
}

export const retrievalRepo: RetrievalRepositoryApi = new HybridSQLiteRetrievalRepository();
