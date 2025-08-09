import { retrievalRepo } from '@/repositories/RetrievalRepository';
import type { AddVectorParams, SimilarityResult, VectorItem } from '@/types/retrieval';
import { useCallback, useState } from 'react';

// React hook wrapper for the retrieval repository (client-side RAG scaffold)
export function useRetrieval() {
  const [lastResults, setLastResults] = useState<SimilarityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const add = useCallback(async (params: AddVectorParams): Promise<VectorItem> => {
    return retrievalRepo.addItem(params);
  }, []);

  const search = useCallback(async (query: string, k?: number, minScore?: number) => {
    setIsSearching(true);
    try {
      const res = await retrievalRepo.querySimilar(query, k, minScore);
      setLastResults(res);
      return res;
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { add, search, lastResults, isSearching, size: retrievalRepo.size };
}
