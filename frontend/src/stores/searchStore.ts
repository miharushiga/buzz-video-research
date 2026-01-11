import { create } from 'zustand';
import type { Video, SearchResult } from '../types';

interface SearchState {
  // 検索結果
  keyword: string;
  videos: Video[];
  searchedAt: string | null;

  // アクション
  setSearchResult: (result: SearchResult) => void;
  clearSearchResult: () => void;
}

/**
 * 検索結果のグローバルストア
 * 検索ページと詳細ページ間でデータを共有
 */
export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  videos: [],
  searchedAt: null,

  setSearchResult: (result: SearchResult) =>
    set({
      keyword: result.keyword,
      videos: result.videos,
      searchedAt: result.searchedAt,
    }),

  clearSearchResult: () =>
    set({
      keyword: '',
      videos: [],
      searchedAt: null,
    }),
}));
