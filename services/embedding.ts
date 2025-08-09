// Embedding service abstraction. Tries server endpoint first; falls back to deterministic pseudo-embedding.

import type { Vector } from '@/types/retrieval';

// Target dimensionality for fallback embeddings (keep small for speed)
const FALLBACK_DIM = 64;

// Deterministic pseudo-embedding: simple rolling hash projected into dim space.
function pseudoEmbedding(text: string, dim = FALLBACK_DIM): Vector {
  const out = new Array(dim).fill(0);
  let h1 = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h1 ^= text.charCodeAt(i);
    h1 = Math.imul(h1, 16777619);
    const idx = i % dim;
    out[idx] += (h1 & 0xffff) / 0xffff; // 0..1
  }
  // Mean center + unit scale
  const mean = out.reduce((a, b) => a + b, 0) / dim;
  for (let i = 0; i < dim; i++) out[i] = out[i] - mean;
  return out;
}

export async function getEmbedding(text: string): Promise<Vector> {
  try {
    const res = await fetch('/api/embed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.embedding)) return data.embedding as Vector;
    }
  } catch (_) {
    // silent fallback
  }
  return pseudoEmbedding(text);
}
