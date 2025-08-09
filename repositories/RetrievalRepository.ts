// Web / default platform (no SQLite): simple in-memory retrieval repository.
// Native platforms use RetrievalRepository.native.ts with SQLite persistence.

import { getEmbedding } from '@/services/embedding';
import { l2Normalize } from '@/utils/vectorMath';
import type { AddVectorParams, RetrievalRepositoryApi, SimilarityResult, VectorItem } from '@/types/retrieval';

function genId(): string { return 'vec_' + Math.random().toString(36).slice(2, 10); }

class InMemoryRetrievalRepository implements RetrievalRepositoryApi {
  private items: VectorItem[] = [];
  private normalized: Float32Array[] = [];
  size() { return this.items.length; }
  async addItem(params: AddVectorParams): Promise<VectorItem> {
    const id = params.id || genId();
    const ts = params.ts ?? Date.now();
    const text = params.text.trim();
    const embedding = params.embedding || await getEmbedding(text);
    const item: VectorItem = { id, type: params.type, ts, text, embedding, meta: params.meta };
    this.items.push(item);
    this.normalized.push(new Float32Array(l2Normalize(embedding)));
    return item;
  }
  async bulkAdd(items: AddVectorParams[]): Promise<VectorItem[]> { const out: VectorItem[] = []; for (const it of items) out.push(await this.addItem(it)); return out; }
  async querySimilar(query: string, k = 3, minScore = 0.15): Promise<SimilarityResult[]> {
    if (!this.items.length) return [];
    const qEmb = l2Normalize(await getEmbedding(query));
    const scores: SimilarityResult[] = [];
    for (let i = 0; i < this.items.length; i++) {
      const emb = this.normalized[i];
      let s = 0; const len = Math.min(qEmb.length, emb.length);
      for (let j = 0; j < len; j++) s += qEmb[j] * emb[j];
      if (s >= minScore) scores.push({ ...this.items[i], score: s });
    }
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, k);
  }
  async prune(maxItems: number): Promise<number> {
    const extra = this.items.length - maxItems; if (extra <= 0) return 0;
    this.items.splice(0, extra); this.normalized.splice(0, extra); return extra;
  }
  async listAll(): Promise<VectorItem[]> { return this.items.slice(); }
}

export const retrievalRepo: RetrievalRepositoryApi = new InMemoryRetrievalRepository();
