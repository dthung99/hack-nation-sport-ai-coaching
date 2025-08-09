// Basic type definitions for lightweight client-side RAG scaffold.
// These can evolve toward a proper SQLite + server embedding implementation later.

export type Vector = number[]; // Float32 values (we keep as number for JS simplicity)

export interface VectorItem {
  id: string;
  type: 'message' | 'mood' | 'tactic' | 'exercise' | 'summary' | string;
  ts: number; // epoch ms
  text: string; // normalized chunk text
  embedding: Vector;
  meta?: Record<string, any>;
}

export interface SimilarityResult extends VectorItem {
  score: number; // cosine similarity
}

export interface AddVectorParams {
  id?: string;
  type: VectorItem['type'];
  text: string;
  ts?: number;
  meta?: Record<string, any>;
  // Optionally provide an embedding to skip remote call
  embedding?: Vector;
}

export interface RetrievalRepositoryApi {
  addItem(params: AddVectorParams): Promise<VectorItem>;
  bulkAdd(items: AddVectorParams[]): Promise<VectorItem[]>;
  querySimilar(query: string, k?: number, minScore?: number): Promise<SimilarityResult[]>;
  prune(maxItems: number): Promise<number>; // returns number removed
  listAll(): Promise<VectorItem[]>;
  size(): number;
}
