// Lightweight vector math utilities (no external deps) for small-scale RAG.

import type { Vector } from '@/types/retrieval';

export function dot(a: Vector, b: Vector): number {
  let s = 0; const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export function norm(a: Vector): number {
  let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

export function cosine(a: Vector, b: Vector): number {
  const d = dot(a, b);
  const na = norm(a); const nb = norm(b);
  if (!na || !nb) return 0;
  return d / (na * nb);
}

export function l2Normalize(v: Vector): Vector {
  const n = norm(v); if (!n) return v.slice();
  return v.map(x => x / n);
}
